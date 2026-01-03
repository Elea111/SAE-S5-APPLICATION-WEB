import supabase from '../database/supabaseClient.js';

class SupabaseBookingRepository {
  async create(bookingData) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseBookingRepository.create error:', err.message);
      throw err;
    }
  }

  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabaseBookingRepository.findById error:', err.message);
      return null;
    }
  }

  async findByBorrowerId(borrowerId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('borrower_id', borrowerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseBookingRepository.findByBorrowerId error:', err.message);
      return [];
    }
  }

  async findByItemId(itemId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('item_id', itemId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseBookingRepository.findByItemId error:', err.message);
      return [];
    }
  }

  // ✅ NOUVELLE MÉTHODE: Vérifier les réservations chevauchantes
  async findConflictingBookings(itemId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('item_id', itemId)
        // Statut "cancelled" ne compte pas comme un conflit
        .neq('status', 'cancelled')
        // Les dates se chevauchent si: start < endDate ET end > startDate
        .lt('start_date', endDate)
        .gt('end_date', startDate);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseBookingRepository.findConflictingBookings error:', err.message);
      return [];
    }
  }

  async update(id, bookingData) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseBookingRepository.update error:', err.message);
      throw err;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('SupabaseBookingRepository.delete error:', err.message);
      return false;
    }
  }
}

export default SupabaseBookingRepository;
