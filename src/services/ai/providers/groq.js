export function streamGroq({ model, prompt, onChunk, onEnd, onError }) {
  const controller = new AbortController();
  let hasEnded = false;
  let reader = null;

  (async () => {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || "Groq API failed");
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();

          if (jsonStr === "[DONE]") {
            if (!hasEnded) {
              hasEnded = true;
              onEnd?.();
            }
            return;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;

            if (delta?.content) {
              onChunk(delta.content);
            }
          } catch (e) {
            console.warn("Parse error:", jsonStr);
          }
        }
      }

      if (!hasEnded) {
        hasEnded = true;
        onEnd?.();
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("🛑 Aborted");
        if (!hasEnded) {
          hasEnded = true;
          onEnd?.();
        }
      } else {
        onError?.(err);
      }
    } finally {
      if (reader) {
        try {
          reader.cancel();
        } catch {}
      }
    }
  })().catch(() => {});

  return controller;
}