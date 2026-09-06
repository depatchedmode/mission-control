#!/usr/bin/env python3
"""Review a real Claude handoff and transfer its artifact from VM B to VM A."""
import argparse
import hashlib
import json
from pathlib import Path
import shlex
import time
import sys
sys.dont_write_bytecode = True
from rehearse import VMS, guest, write_json

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('run_directory', type=Path)
args = parser.parse_args()
folder = args.run_directory.resolve()
result = json.loads((folder / 'result.json').read_text())
remote = result['remoteDirectory']
assert remote.endswith('/' + result['runId'])
a, b = VMS
home = guest(a, 'printf %s "$HOME"').strip()


def cli(vm, *arguments):
    command = [home + '/.local/node/bin/node', remote + '/repo/bin/pardner.js',
               '--data', remote + '/data', '--actor', 'codex', '--json', *arguments]
    value = json.loads(guest(vm, shlex.join(command)))
    assert value['success'], value
    return value


context = cli(a, 'show', result['agentTaskId'])
assert context['task']['assignee'] == 'codex' and context['task']['status'] == 'review', 'Claude handoff is pending'
assert not context['conflicts']
handoffs = [h for h in context['history'] if h['type'] == 'task.handoff' and h['actorId'] == 'claude']
assert len(handoffs) == 1 and handoffs[0]['payload']['to'] == 'codex'
assert len(handoffs[0]['result']['mentionIds']) == 1
assert any(c['actorId'] == 'claude' and c['timestamp'] < handoffs[0]['timestamp'] for c in context['comments'])
challenge = json.loads(guest(a, f'cat {shlex.quote(remote)}/challenge.json'))
response_text = guest(b, f'cat {shlex.quote(remote)}/claude-response.json')
response = json.loads(response_text)
expected = {'runId': result['runId'], 'nonce': challenge['nonce'], 'actor': 'claude',
            'cwd': remote + '/repo', 'machineId': result['machines'][1]['machineId'],
            **result['replicas'][1]}
for key, value in expected.items():
    assert response.get(key) == value, (key, response.get(key), value)
# A second explicit SSH transfer proves the artifact is usable on the receiving VM.
guest(a, f'cat > {shlex.quote(remote)}/received-claude-response.json', input=response_text)
digest = hashlib.sha256(response_text.encode()).hexdigest()
assert guest(a, f'sha256sum {shlex.quote(remote)}/received-claude-response.json').split()[0] == digest
review = {'result': 'pass', 'reviewer': 'codex', 'responseSha256': digest,
          'handoffOperationId': handoffs[0]['operationId'], 'taskId': result['agentTaskId']}
message = f'Codex verified the VM B response, nonce, machine/replica identities, and attributed handoff. Transferred artifact to VM A via SSH; SHA256 {digest}. Remote scoped agent round trip passes.'
cli(a, 'comment', result['agentTaskId'], message, '--operation-id', 'codex-remote-review')
deadline = time.monotonic() + 10
while time.monotonic() < deadline:
    contexts = [cli(vm, 'show', result['agentTaskId']) for vm in VMS]
    if contexts[0]['heads'] == contexts[1]['heads'] and all(any(c['content'] == message for c in x['comments']) for x in contexts):
        break
    time.sleep(.1)
else:
    raise AssertionError('Review did not converge within 10 seconds')
for vm, context in zip(VMS, contexts):
    write_json(folder / f'{vm}-agent-context.json', context)
write_json(folder / 'agent-review.json', review)
result['realAgents'] = 'pass'
write_json(folder / 'result.json', result)
print(json.dumps(review, indent=2))
