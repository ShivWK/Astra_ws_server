import { MessagesModel } from "../../models/message.model.js";

export const saveMessage = async ({ conversationId, role, content }) => {
    const msg = await MessagesModel.create({
        conversationId,
        role,
        content
    })

    return msg;
}