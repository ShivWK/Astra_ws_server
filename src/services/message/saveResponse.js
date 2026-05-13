import { saveMessage } from "./saveMessage.js";

export async function saveResponse(fullResponse, conversationId) {
    const finalResponse = fullResponse.trim() || "Something went wrong. Please try again.";

    await saveMessage({
        conversationId,
        role: "assistant",
        content: finalResponse,
    })
}