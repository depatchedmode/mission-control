// TYPE GUARDS
export const isRepoMessage = (message) => isSyncMessage(message) ||
    isEphemeralMessage(message) ||
    isRequestMessage(message) ||
    isDocumentUnavailableMessage(message) ||
    isRemoteSubscriptionControlMessage(message) ||
    isRemoteHeadsChanged(message);
// prettier-ignore
export const isDocumentUnavailableMessage = (msg) => msg.type === "doc-unavailable";
export const isRequestMessage = (msg) => msg.type === "request";
export const isSyncMessage = (msg) => msg.type === "sync";
export const isEphemeralMessage = (msg) => msg.type === "ephemeral";
// prettier-ignore
export const isRemoteSubscriptionControlMessage = (msg) => msg.type === "remote-subscription-change";
export const isRemoteHeadsChanged = (msg) => msg.type === "remote-heads-changed";
