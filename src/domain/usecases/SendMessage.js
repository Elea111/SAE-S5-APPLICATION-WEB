export async function SendMessage(messageData, messageRepository = null) {
    if (!messageData || !messageData.senderId || !messageData.receiverId || !messageData.content) {
        throw new Error("Données de message incomplètes");
    }
    if (!messageData.created_at) {
        messageData.created_at = new Date().toISOString();
    }
    if (messageRepository && typeof messageRepository.create === 'function') {
        return await messageRepository.create(messageData);
    }
    throw new Error("Aucun repository de message fourni");
}
