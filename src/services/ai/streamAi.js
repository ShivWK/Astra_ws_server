import { geminiPromptBuilder } from "./geminiPromptBuidler.js";
import resolveModel from "./modelResolver.js"
import promptBuilder from "./promptBuilder.js";
import { streamGemini } from "./providers/gemini.js";
import { streamGroq } from "./providers/groq.js";
import { streamOpenRouter } from "./providers/openrouter.js";

const streamAi = ({
    conversation,
    history,
    message,
    onChunk,
    onError,
    onEnd,
    agent
}) => {
    const model = resolveModel(conversation.currentAgentModel);
    let prompt = null;

    if (model.provider !== "gemini") {
        prompt = promptBuilder({
            agent,
            conversation,
            history,
            message
        })
    }

    console.log("History", history)
    // console.log("Using model:", model, "and prompt:", prompt);

    if (model.provider === "openrouter") {
        return streamOpenRouter({
            model: model.model_id,
            prompt,
            onChunk,
            onEnd,
            onError
        })
    }

    if (model.provider === "groq") {
        return streamGroq({
            model: model.model_id,
            prompt,
            onChunk,
            onError,
            onEnd,
        })
    }

    if (model.provider === "gemini") {
        const { systemInstruction, historyData } = geminiPromptBuilder(agent, history, conversation);

        return streamGemini({
            model: model.model_id,
            systemInstruction,
            history: historyData || [],
            prompt: message,
            onChunk,
            onError,
            onEnd,
        })
    }
}

export default streamAi;