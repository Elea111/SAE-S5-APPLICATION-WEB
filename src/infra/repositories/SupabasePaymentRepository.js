import supabase from '../database/supabaseClient.js';

class SupabasePaymentRepository {
  async create(paymentData) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabasePaymentRepository.create error:', err.message);
      throw err;
    }
  }

  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabasePaymentRepository.findById error:', err.message);
      return null;
    }
  }

  async findByBookingId(bookingId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabasePaymentRepository.findByBookingId error:', err.message);
      return null;
    }
  }

  async findByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabasePaymentRepository.findByUserId error:', err.message);
      return [];
    }
  }

  async update(id, paymentData) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabasePaymentRepository.update error:', err.message);
      throw err;
    }
  }
}

export default new SupabasePaymentRepository();
