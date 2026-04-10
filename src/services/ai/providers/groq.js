export async function streamGroq({ prompt, onChunk, onEnd }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const jsonStr = line.replace("data: ", "").trim();

      if (jsonStr === "[DONE]") {
        onEnd && onEnd();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const token = parsed.choices?.[0]?.delta?.content;

        if (token) {
          onChunk(token);
        }
      } catch {}
    }
  }
}