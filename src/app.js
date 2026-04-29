import 'dotenv/config';

import { WebSocketServer } from "ws";
import textHandler from "./handlers/textHandler.js";
import { connectDB } from "./config/db.js";
import jwt from "jsonwebtoken";
import { UserModel } from './models/user.model.js';

const startServer = async () => {
    await connectDB();
    const wss = new WebSocketServer({ port: process.env.PORT });

    wss.on("connection", async (ws, req) => {
        console.log('🟢 Client connected');

        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get("token");

            if (!token) {
                throw new Error("Token is required");
            }

            const decoded = jwt.verify(token, process.env.SECRETE_KEY);

            if (!decoded || !decoded.id) {
                throw new Error("Invalid token");
            }

            if (decoded.exp * 1000 < Date.now()) {
                throw new Error("Token expired");
            }

            const user = await UserModel.findById(decoded.id);

            if (!user) {
                throw new Error("User not found");
            }

            if (user.role !== "admin" && user.token <= 0) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Insufficient tokens"
                }));
                
                return;
            }

            ws.user = {
                _id: user._id,
                role: user.role,
                token: user.token
            };
        } catch (err) {
            console.error("Invalid URL:", err);
            ws.send(JSON.stringify({
                type: "error",
                message: `Connection closed: ${err.message}`
            }))
            ws.close();
            return;
        }

        ws.send(JSON.stringify({
            type: "connected"
        }))

        ws.on("message", async (msg) => {
            try {
                const parsed = JSON.parse(msg.toString());

                if (parsed.type === "text_message") {
                    await textHandler(parsed, ws);
                }

                if (parsed.type === "stop") {
                    ws.controller?.abort();
                    ws.send(JSON.stringify({ type: 'stopped' }));
                }

                return;
            } catch {
                 console.log("Invalid message:", err.message);
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

    console.log(`🚀 WS Server running on ${process.env.PORT}`);
}

startServer();