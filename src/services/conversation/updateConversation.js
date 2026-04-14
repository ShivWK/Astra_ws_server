import { ConversationModel } from "../../models/conversation.model.js";

async function updateConversation(id) {
    const updatedConversation =  await ConversationModel.findByIdAndUpdate(id, {
        updatedAt: Date.now()
    })

    if (updatedConversation) return true;
    return false;
}

export default updateConversation;