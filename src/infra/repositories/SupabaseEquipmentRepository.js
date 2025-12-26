import supabase from '../database/supabaseClient.js';

class SupabaseEquipmentRepository {
  async create(equipmentData) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([equipmentData])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseEquipmentRepository.create error:', err.message);
      throw err;
    }
  }

  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabaseEquipmentRepository.findById error:', err.message);
      return null;
    }
  }

  async findByUserId(userId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseEquipmentRepository.findByUserId error:', err.message);
      return [];
    }
  }

  async search(filters = {}) {
    try {
      let query = supabase.from('items').select('*');

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.title) {
        query = query.ilike('title', `%${filters.title}%`);
      }
      if (filters.is_available !== undefined) {
        query = query.eq('is_available', filters.is_available);
      }
      if (filters.min_price) {
        query = query.gte('daily_price', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('daily_price', filters.max_price);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('SupabaseEquipmentRepository.search error:', err.message);
      return [];
    }
  }

  async update(id, equipmentData) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(equipmentData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseEquipmentRepository.update error:', err.message);
      throw err;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('SupabaseEquipmentRepository.delete error:', err.message);
      return false;
    }
  }
}

export default new SupabaseEquipmentRepository();
