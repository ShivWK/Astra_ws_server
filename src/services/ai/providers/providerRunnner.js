import { streamGemini } from "./gemini";
import { streamGroq } from "./groq";
import { streamOpenRouter } from "./openrouter";

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