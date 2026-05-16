function promptBuilder({ agent, conversation, history, message, userName }) {
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

### IDENTITY ###
- Your name: ${agent.name}
- User name: ${userName || "Unknown"}

### PERSONALIZATION ###
- Use the user's name naturally only when it improves the conversation.
- Do not overuse the user's name in every response.
- Use your own name only if asked or when it fits naturally.

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