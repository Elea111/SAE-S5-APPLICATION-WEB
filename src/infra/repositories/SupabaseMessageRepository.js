import supabase from '../database/supabaseClient.js';

class SupabaseMessageRepository {
  async create(messageData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseMessageRepository.create error:', err.message);
      throw err;
    }
  }

  async findByConversation(userId1, userId2) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseMessageRepository.findByConversation error:', err.message);
      return [];
    }
  }

  async findByReceiverId(receiverId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', receiverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseMessageRepository.findByReceiverId error:', err.message);
      return [];
    }
  }

  async markAsRead(messageId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseMessageRepository.markAsRead error:', err.message);
      throw err;
    }
  }
}

export default SupabaseMessageRepository;
