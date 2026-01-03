import supabase from '../database/supabaseClient.js';

class SupabaseEquipmentRepository {
  constructor() {
    this.supabase = supabase; // ✅ Ajouter cette ligne pour accéder à supabase depuis le repository
  }

  async create(equipmentData) {
    try {
      // ✅ S'assurer que tous les champs sont correctement mappés
      const payload = {
        user_id: equipmentData.user_id,
        title: equipmentData.title,
        description: equipmentData.description,
        daily_price: equipmentData.daily_price,
        caution_deposit: equipmentData.caution_deposit,
        location: equipmentData.location,
        condition: equipmentData.condition,
        category_id: equipmentData.category_id, // ✅ Utiliser category_id, PAS category
        is_available: equipmentData.is_available !== false
      };

      console.log('📦 SupabaseEquipmentRepository.create payload:', payload);

      const { data, error } = await supabase
        .from('items')
        .insert([payload])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error(`Supabase: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert');
      }

      console.log('✅ Equipment created:', data[0].id);
      return data[0];
    } catch (err) {
      console.error('❌ Equipment create error:', err.message);
      throw err;
    }
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
