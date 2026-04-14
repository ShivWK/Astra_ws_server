import { ConversationModel } from "../../models/conversation.model";

async function updateConversation(id) {
    const updatedConversation =  await ConversationModel.findByIdAndUpdate(id, {
        updatedAt: Date.now()
    })

    if (updatedConversation) return true;
    return false;
}

export default updateConversation;