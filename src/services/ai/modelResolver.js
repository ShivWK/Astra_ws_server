function resolveModel(modelKey) {
  switch (modelKey) {
    case "fast":
      return { provider: "groq", model_id: "llama_id3-8b-8192" };

    case "smart":
      return { provider: "groq", model_id: "llama3-70b-8192" };

    case "powerful":
      return { provider: "openrouter", model_id: "google/gemma-3-27b-it:free" };

    case "logic":
      return { provider: "openrouter", model_id: "qwen/qwen3.6-plus:free" };

    case "conversational":
      return { provider: "openrouter", model_id: "arcee-ai/trinity-large-preview:free" };

    default:
      return { provider: "groq", model_id: "llama3-8b-8192" };
  }
}

export default resolveModel;