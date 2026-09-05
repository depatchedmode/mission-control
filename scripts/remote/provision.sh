#!/bin/sh
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
command -v limactl >/dev/null || { echo 'Install Lima with brew install lima first.' >&2; exit 1; }
for vm in pardner-remote-a pardner-remote-b; do
  if limactl list --format '{{.Name}}' | grep -qx "$vm"; then
    limactl start --tty=false "$vm"
  else
    limactl start --name="$vm" --vm-type=vz --cpus=2 --memory=2 --disk=12 --plain --tty=false template:ubuntu-24.04
  fi
  limactl shell --workdir=/tmp "$vm" bash -s < "$script_dir/install-node.sh"
done
