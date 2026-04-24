import { ConversationModel } from "../models/conversation.model.js";
import { UserModel } from "../models/user.model.js";
import { UserAgentsModel } from "../models/userAgent.model.js";
import streamAi from "../services/ai/streamAi.js";
import updateConversation from "../services/conversation/updateConversation.js";
import getHistory from "../services/message/getHistory.js";
import { saveMessage } from "../services/message/saveMessage.js";

const textHandler = async (data, ws) => {
    const { message, conversationId } = data;

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation || conversation.userId.toString() !== ws.user._id.toString()) {
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
    let isCharged = false;

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

                await saveMessage({
                    conversationId,
                    role: "assistant",
                    content: finalResponse,
                })

                await updateConversation(conversationId);
            }

            if (ws.user.role !== "admin" && fullResponse.length > 0 && !isCharged) {
                isCharged = true;

                const tokenUsed = Math.ceil(fullResponse.length / 4);

                await UserModel.findByIdAndUpdate(ws.user._id, {
                    $inc: { token: -tokenUsed }
                });

                ws.send(JSON.stringify({
                    type: "usage",
                    tokensUsed: tokenUsed
                }));
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
        abort: async () => {
            isAborted = true;
            controller.abort();

            if (fullResponse.length > 0 && ws.user.role !== "admin" && !isCharged) {
                isCharged = true;

                const tokenUsed = Math.ceil(fullResponse.length / 4);
                await UserModel.findByIdAndUpdate(ws.user._id, {
                    $inc: { token: -tokenUsed }
                });

                ws.user.token -= tokenUsed;

                ws.send(JSON.stringify({
                    type: "usage",
                    tokensUsed: tokenUsed
                }));
            }

            ws.send(JSON.stringify({ type: "ai_end" }));
        }
    };
}


export default textHandler;