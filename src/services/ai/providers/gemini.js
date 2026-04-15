export function streamGemini({
    model = "gemini-1.5-flash",
    systemInstruction,
    history = [],
    prompt,
    onChunk,
    onEnd,
    onError
}) {
    const controller = new AbortController();
    let reader = null;
    let hasEnded = false;

    (async () => {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

        try {
            const contents = [...history, { role: "user", parts: [{ text: prompt }] }];
            const bodyPayload = { contents };

            if (systemInstruction) {
                bodyPayload.system_instruction = {
                    parts: [{ text: systemInstruction }]
                };
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyPayload),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Gemini API failed with status ${response.status}`;
                try {
                    const errJson = JSON.parse(errorText);
                    errorMessage = errJson?.error?.message || errorMessage;
                } catch {
                    errorMessage += `: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const messages = buffer.split(/\r?\n\r?\n/);

                buffer = messages.pop() || "";

                for (const message of messages) {
                    const trimmedMessage = message.trim();
                    if (!trimmedMessage.startsWith("data: ")) continue;

                    const jsonString = trimmedMessage.replace(/^data:\s*/, "");

                    if (!jsonString) continue;

                    if (jsonString === "[DONE]") {
                        if (!hasEnded) {
                            hasEnded = true;
                            onEnd?.();
                        }
                        return;
                    }

                    try {
                        const parsed = JSON.parse(jsonString);
                        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;

                        if (text) {
                            onChunk(text);
                        }
                    } catch (err) {
                        console.warn("Skipping unparseable chunk:", jsonString);
                    }
                }
            }

            if (!hasEnded) {
                hasEnded = true;
                onEnd?.();
            }

        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                console.log("🛑 Stream Aborted");
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
                } catch { }
            }
        }
    })();

    return controller;
}