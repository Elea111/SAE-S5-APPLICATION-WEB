import supabase from '../database/supabaseClient.js';

class SupabaseReviewRepository {
  async create(reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseReviewRepository.create error:', err.message);
      throw err;
    }
  }

  async findByTargetUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users!author_id(id, first_name, last_name, avatar_url)')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseReviewRepository.findByTargetUserId error:', err.message);
      return [];
    }
  }

  async findByBookingId(bookingId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseReviewRepository.findByBookingId error:', err.message);
      return [];
    }
  }
}

export default SupabaseReviewRepository;
