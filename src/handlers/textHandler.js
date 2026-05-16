import { ConversationModel } from "../models/conversation.model.js";
import { UserModel } from "../models/user.model.js";
import { UserAgentsModel } from "../models/userAgent.model.js";
import streamAi from "../services/ai/streamAi.js";
import updateConversation from "../services/conversation/updateConversation.js";
import getHistory from "../services/message/getHistory.js";
import { saveMessage } from "../services/message/saveMessage.js";
import { saveResponse } from "../services/message/saveResponse.js";
import { finalizeUsage } from "../services/tokens/finalizeUsage.js";
import { reserveTokens } from "../services/tokens/reserveTokens.js";

const textHandler = async (data, userId, ws) => {
    const { message, conversationId } = data;

    const estimatedTokens = Math.max(100, message.length / 4 + 300);
    const reservedUser = await reserveTokens(userId, estimatedTokens)

    if (!reservedUser) {
        ws.send(JSON.stringify({
            type: "error",
            message: "Insufficient tokens"
        }));

        return;
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation || conversation.userId.toString() !== reservedUser._id.toString()) {
        ws.send(JSON.stringify({
            type: "error",
            message: "Invalid conversation"
        }))

        return;
    }

    await saveMessage({
        conversationId,
        role: "user",
        content: message,
    })

    const agent = await UserAgentsModel.findById(conversation.agentId)
    const history = await getHistory({ conversationId, limit: 10 })
    let fullResponse = "";
    let isAborted = false;
    let isFinalized = false;

    const finalize = async (tokenUsed = 0) => {
        if (isFinalized) return;

        isFinalized = true;

        await finalizeUsage(
            tokenUsed,
            estimatedTokens,
            reservedUser
        )
    }

    ws.send(JSON.stringify({
        type: "ai_start"
    }))

    const controller = streamAi({
        conversation,
        history: history || [],
        message,
        agent,
        userName: ws.user.name,

        onChunk: (chunk) => {
            fullResponse += chunk;

            ws.send(JSON.stringify({
                type: "ai_stream",
                chunk
            }))
        },

        onEnd: async () => {
            if (!isAborted) {
                await saveResponse(fullResponse, conversationId)
                await updateConversation(conversationId);
            }

            if (reservedUser.role !== "admin" && fullResponse.length > 0 && !isFinalized) {
                const tokenUsed = Math.ceil(fullResponse.length / 4);
                await finalize(tokenUsed);

                ws.send(JSON.stringify({
                    type: "usage",
                    tokensUsed: tokenUsed
                }));
            }

            ws.send(JSON.stringify({ type: "ai_end" }))
        },

        onError: async (err) => {
            isAborted = true;

            ws.send(JSON.stringify({
                type: "error",
                message: err.message
            }));

            await finalize(0);
        }
    })

    ws.controller = {
        abort: async () => {
            controller.abort();
            isAborted = true;

            if (fullResponse.length > 0 && reservedUser.role !== "admin" && !isFinalized) {
                const tokenUsed = Math.ceil(fullResponse.length / 4);
                await finalize(tokenUsed);

                await saveResponse(fullResponse, conversationId)

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