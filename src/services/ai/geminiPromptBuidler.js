export function geminiPromptBuilder(agent, history, conversation, userName) {
    const firstName = userName.split(" ")[0];
    const systemInstruction = `### SYSTEM ROLE ###
${agent.instruction}

### RESPONSE STYLE ###
${agent.userInstruction}

### IDENTITY ###
- Your name: ${agent.name}
- User name: ${firstName || "Unknown"}

### PERSONALIZATION ###
- Use the user's name only naturally only when it improves the conversation experience.
- Do not overuse the user's name in every response.
- Use your own name only if the user asks for it or it fits naturally.

### STRICT BOUNDARY ###
- If the user asks anything outside your domain:
  Respond ONLY with: "${agent.fallbackMessage}"

### CUSTOM CONTEXT ###
${conversation?.customInstruction || "None"}`;

    let historyData = [];

    if (history) {
        historyData = history?.map(data => ({
            role: data.role === "assistant" ? "model" : "user",
            parts: [{ text: data.content }]
        }))
    }

    return {
        systemInstruction,
        historyData
    }
}