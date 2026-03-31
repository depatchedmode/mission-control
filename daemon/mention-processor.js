export function buildMentionMessage(mention) {
  return `📬 @${mention.from_agent} mentioned you on ${mention.taskId}: "${mention.content.substring(0, 100)}..."`
}

export async function processPendingMentions({
  pendingMentions,
  doc,
  wakeAgent,
  markDelivered,
  log = () => {},
}) {
  let processed = 0

  for (const mention of pendingMentions) {
    const agent = doc.agents[mention.to_agent]

    if (!agent) {
      log(`⚠️ No agent registered for @${mention.to_agent}`)
      continue
    }

    const message = buildMentionMessage(mention)
    const success = await wakeAgent(mention.to_agent, message)

    if (success) {
      await markDelivered(mention.id)
      processed++
      log(`✅ Processed mention ${mention.id} for @${mention.to_agent}`)
    }
  }

  return processed
}
