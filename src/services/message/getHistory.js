import { MessagesModel } from "../../models/message.model.js"

const getHistory = async ({conversationId, limit = 10}) => {
    const history = await MessagesModel.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit);

    if (!history) return false;
    return history.reverse();
}

export default getHistory;