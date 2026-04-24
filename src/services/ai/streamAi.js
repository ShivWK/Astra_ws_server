import { TEXT_MODEL_FALLBACK_MAP } from "../../utils/constant.js";
import { geminiPromptBuilder } from "./geminiPromptBuidler.js";
import resolveModel from "./modelResolver.js"
import promptBuilder from "./promptBuilder.js";
import { runProvider } from "./providers/providerRunnner.js";

function isRetryableError(err) {
    const msg = err?.message?.toLowerCase() || "";

    return (
        msg.includes("quota") ||
        msg.includes("rate") ||
        msg.includes("timeout") ||
        msg.includes("500") ||
        msg.includes("503")
    );
}

const streamAi = ({
    conversation,
    history,
    message,
    onChunk: sender,
    onError,
    onEnd,
    agent,
}) => {
    const primaryModelKey = conversation.currentAgentModel;

    const fallbackKeys = [
        primaryModelKey,
        ...(TEXT_MODEL_FALLBACK_MAP[primaryModelKey] || [])
    ];

    let attempts = 0;
    let currentController = null;
    let hasStartedStreaming = false;

    const tryNext = () => {

        if (attempts >= fallbackKeys.length) {
            onError?.(new Error("All models failed. Please try after sometime."));
            return;
        }

        const currentModelKey = fallbackKeys[attempts];
        attempts++;

        const model = resolveModel(currentModelKey);

        let prompt = null;
        let systemInstruction = null;
        let historyData = null;


        if (model.provider === "gemini") {
            const geminiData = geminiPromptBuilder(agent, history, conversation);
            systemInstruction = geminiData.systemInstruction;
            historyData = geminiData.historyData;
        } else {
            prompt = promptBuilder({
                agent,
                conversation,
                history,
                message
            })
        }

        currentController = runProvider({
            model,
            prompt,
            systemInstruction,
            history: historyData || [],
            message,

            onChunk: (chunk) => {
                hasStartedStreaming = true;
                sender(chunk)
            },

            onEnd,

            onError: (err) => {
                console.log(`❌ ${currentModelKey} failed:`, err.message);

                if (!isRetryableError(err) || hasStartedStreaming) {
                    console.log(`🚫 Not retrying due to error type or because streaming has already started.`);
                    onError?.(err);
                    return;
                }

                console.log(`🔁 Falling back from ${currentModelKey}`);
                tryNext();
            }
        })
    }

    tryNext()
    return currentController;
}

export default streamAi;