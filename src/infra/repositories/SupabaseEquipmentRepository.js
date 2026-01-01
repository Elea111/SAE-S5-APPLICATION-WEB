import supabase from '../database/supabaseClient.js';

class SupabaseEquipmentRepository {
  constructor() {
    this.supabase = supabase; // ✅ Ajouter cette ligne pour accéder à supabase depuis le repository
  }

  async create(equipmentData) {
    const { user_id, title, description, daily_price, caution_deposit, location, condition, category, is_available } = equipmentData;

    const { data, error } = await supabase
      .from('items')
      .insert([{
        user_id,
        title,
        description,
        daily_price,
        caution_deposit,
        location,
        condition,
        category,
        is_available: is_available !== false,
        is_approved: true,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw new Error(`Equipment création : ${error.message}`);
    return data?.[0] || null;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        users:user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          rating,
          review_count
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Equipment fetch : ${error.message}`);
    
    // ✅ Mapper les données avec le nom du propriétaire
    if (data) {
      return {
        ...data,
        owner_name: data.users 
          ? `${data.users.first_name} ${data.users.last_name}`
          : 'Propriétaire inconnu',
        owner_avatar: data.users?.avatar_url
      };
    }
    return null;
  }

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Equipment fetch : ${error.message}`);
    return data || [];
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw new Error(`Equipment update : ${error.message}`);
    return data?.[0] || null;
  }

  async delete(id) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Equipment delete : ${error.message}`);
  }
}

export default SupabaseEquipmentRepository;
