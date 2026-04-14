function resolveModel(modelKey) {
  switch (modelKey) {
    case "fast":
      return {
        provider: "groq",
        model_id: "llama-3.1-8b-instant",
      };

    case "smart":
      return {
        provider: "groq",
        model_id: "llama-3.3-70b-versatile",
      };

    case "powerful":
      return {
        provider: "gemini",
        model_id: "gemini-1.5-flash",
      };

    case "logic":
      return {
        provider: "openrouter",
        model_id: "z-ai/glm-4.5-air:free"
      };

    case "conversational":
      return {
        provider: "openrouter",
        model_id: "arcee-ai/trinity-large-preview:free",
      };

    default:
      return {
        provider: "groq",
        model_id: "llama-3.1-8b-instant",
      };
  }
}

export default resolveModel;