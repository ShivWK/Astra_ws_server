export function streamOpenRouter({ model, prompt, onChunk, onError, onEnd }) {
  const controller = new AbortController();
  let reader = null;
  let hasEnded = false;

  (async () => {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
        throw new Error(err?.error?.message || "OpenRouter API failed");
      }

      reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf("\n");
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (!line || line.startsWith(":")) continue;

          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              if (!hasEnded) {
                hasEnded = true;
                onEnd?.();
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) onChunk(content);
            } catch { }
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
          await reader.cancel();
        } catch { }
      }
    }
  })().catch(() => { }) // sallow unhandled rejection

  return controller;
}