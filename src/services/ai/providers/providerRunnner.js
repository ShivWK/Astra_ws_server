import { streamGemini } from "./gemini.js";
import { streamGroq } from "./groq.js";
import { streamOpenRouter } from "./openrouter.js";

export function runProvider({
    model,
    prompt,
    systemInstruction,
    history,
    message,
    onChunk,
    onEnd,
    onError
}) {
    if (model.provider === "openrouter") {
        return streamOpenRouter({
            model: model.model_id,
            prompt,
            onChunk,
            onEnd,
            onError
        });
    }

    if (model.provider === "groq") {
        return streamGroq({
            model: model.model_id,
            prompt,
            onChunk,
            onEnd,
            onError
        });
    }

    if (model.provider === "gemini") {
        return streamGemini({
            model: model.model_id,
            systemInstruction,
            history,
            prompt: message,
            onChunk,
            onEnd,
            onError
        });
    }
}