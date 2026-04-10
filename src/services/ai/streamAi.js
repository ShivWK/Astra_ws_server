import resolveModel from "./modelResolver.js"
import promptBuilder from "./promptBuilder.js";
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

    const prompt = promptBuilder({
        agent,
        conversation,
        history,
        message
    })

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
            prompt,
            onChunk,
            onEnd: () => { },
        })
    }
}

export default streamAi;