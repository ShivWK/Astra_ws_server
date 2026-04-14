import { ConversationModel } from "../models/conversation.model.js";
import { UserAgentsModel } from "../models/userAgent.model.js";
import streamAi from "../services/ai/streamAi.js";
import updateConversation from "../services/conversation/updateConversation.js";
import getHistory from "../services/message/getHistory.js";
import { saveMessage } from "../services/message/saveMessage.js";

const textHandler = async (data, ws) => {
    const { message, conversationId } = data;

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
        ws.send(JSON.stringify({
            type: "error",
            message: "Invalid conversation"
        }))

        return;
    }

    const agent = await UserAgentsModel.findById(conversation.agentId)

    await saveMessage({
        conversationId,
        role: "user",
        content: message,
    })

    const history = await getHistory({ conversationId, limit: 10 })
    let fullResponse = "";
    let isAborted = false;

    ws.send(JSON.stringify({
        type: "ai_start"
    }))

    const controller = streamAi({
        conversation,
        history: history ? history : "",
        message,
        agent,

        onChunk: (chunk) => {
            fullResponse += chunk;

            ws.send(JSON.stringify({
                type: "ai_stream",
                chunk
            }))
        },

        onEnd: async () => {
            if (!isAborted) {
                const finalResponse = fullResponse.trim() ||
                    "Something went wrong. Please try again.";

                console.log("Saving AI response:", fullResponse);

                await saveMessage({
                    conversationId,
                    role: "assistant",
                    content: finalResponse,
                })

                await updateConversation(conversationId);
            }


            ws.send(JSON.stringify({ type: "ai_end" }))
        },

        onError: (err) => {
            isAborted = true;

            ws.send(JSON.stringify({
                type: "error",
                message: err.message
            }));
        }
    })

    ws.controller = {
        abort: () => {
            isAborted = true;
            controller.abort();
        }

        // throws error that file:///C:/Users/user/Desktop/Astra_WS_Server/src/handlers/textHandler.js:83
        // controller.abort();
        // TypeError: controller.abort is not a function
    };
}


export default textHandler;