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

startServer();


// https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAGEXynJ9W02cgOShHgLQ2etN1FdmgJWlw