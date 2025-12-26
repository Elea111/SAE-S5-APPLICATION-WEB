import supabase from '../database/supabaseClient.js';

class SupabaseUserRepository {
  async create(userData) {
    try {
      // Ajouter password_hash si absent
      const payload = {
        ...userData,
        password_hash: userData.password_hash || 'temp_hash'
      };

      const { data, error } = await supabase
        .from('users')
        .insert([payload])
        .select();

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseUserRepository.create error:', err.message);
      throw err;
    }
  }

  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabaseUserRepository.findById error:', err.message);
      return null;
    }
  }

  async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('SupabaseUserRepository.findByEmail error:', err.message);
      return null;
    }
  }

  async findByCredentials(email, password) {
    // Alias pour findByEmail (utilisé par LoginUser)
    return await this.findByEmail(email);
  }

  async update(id, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (err) {
      console.error('SupabaseUserRepository.update error:', err.message);
      throw err;
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('SupabaseUserRepository.delete error:', err.message);
      return false;
    }
  }
}

export default new SupabaseUserRepository();