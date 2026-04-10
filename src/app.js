import 'dotenv/config';

import { WebSocketServer } from "ws";
import textHandler from "./handlers/textHandler.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
    await connectDB();
    const wss = new WebSocketServer({ port: process.env.PORT });

    wss.on("connection", (ws) => {
        console.log('🟢 Client connected');

        ws.send(JSON.stringify({
            type: "connected"
        }))

        ws.on("message", async (msg) => {
            try {
                const parsed = JSON.parse(msg.toString());
                console.log("parsed data", parsed)

                if (parsed.type === "text_message") {
                    await textHandler(parsed, ws)
                }

                if (parsed.type === "stop") {
                    ws.controller?.abort();

                    ws.send(JSON.stringify({
                        type: 'stopped'
                    }))
                }
            } catch (err) {
                console.error(err)
            }
        })

        ws.on("error", (err) => {
            console.log("WebSocket error occurred", err);
            ws.controller?.abort();
        })

        ws.on("close", () => {
            console.log("🔴 Client disconnected");
            ws.controller?.abort();
        })
    })

    console.log("🚀 WS Server running on 8080");
}

startServer()

//  testing
// const ws = new WebSocket("ws://localhost:8080");
// ws.onopen = () => {
//   console.log("✅ Connected to WS");
// };

// ws.onmessage = (event) => {
//   console.log("📩 Server:", event.data);
// };

// ws.onerror = (err) => {
//   console.error("❌ Error:", err);
// };

// ws.onclose = () => {
//   console.log("🔴 Disconnected");
// };

// () => {
//   console.log("🔴 Disconnected");
// }
// VM359:3 ✅ Connected to WS
// ws.send(JSON.stringify({
//   type: "text_message",
//   message: "Hello, take my interview",
//   conversationId: '69d65f873eab605cddba16e2'
// }));

