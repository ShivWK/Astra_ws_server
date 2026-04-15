export function geminiPromptBuilder(agent, history, conversation) {
    const systemInstruction = `### SYSTEM ROLE ###
${agent.instruction}

### RESPONSE STYLE ###
${agent.userInstruction}

### STRICT BOUNDARY ###
- If the user asks anything outside your domain:
  Respond ONLY with: "${agent.fallbackMessage}"

### CUSTOM CONTEXT ###
${conversation?.customInstruction || "None"}`;

    const historyData = history?.map(data => ({
        role: data.role === "assistant" ? "model" : "user",
        parts: [{ text: data.content }]
    }))

    return {
        systemInstruction,
        historyData
    }
}