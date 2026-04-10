function promptBuilder({ agent, conversation, history, message }) {
  const MAX_HISTORY = 20;

  const trimmedHistory = history && history.slice(-MAX_HISTORY);

  let formattedHistory = "";

  if (history) {
    formattedHistory = trimmedHistory
      .map((h) => {
        if (h.role === "user") return `User: ${h.content}`;
        if (h.role === "assistant") return `Assistant: ${h.content}`;
        return "";
      })
      .join("\n");
  }

  return `
### SYSTEM ROLE ###
${agent.instruction}

### RESPONSE STYLE ###
${agent.userInstruction}

### STRICT BOUNDARY ###
- If the user asks anything outside your domain:
  Respond ONLY with: "${agent.fallbackMessage}"

### CUSTOM CONTEXT ###
${conversation.customInstruction || "None"}

### CONVERSATION HISTORY ###
${formattedHistory}

### CURRENT USER MESSAGE ###
User: ${message}

### RESPONSE ###
Assistant:
`;
}

export default promptBuilder;