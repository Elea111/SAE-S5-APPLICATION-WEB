import { supabaseClient } from '../supabaseClient';

export class EquipmentRepository {
  async create(equipmentData) {
    try {
      // ✅ S'assurer que category_id est mappé correctement
      const payload = {
        user_id: equipmentData.user_id,
        title: equipmentData.title,
        description: equipmentData.description,
        daily_price: equipmentData.daily_price,
        caution_deposit: equipmentData.caution_deposit,
        location: equipmentData.location,
        condition: equipmentData.condition,
        category_id: equipmentData.category_id, // ← Clé correcte
        is_available: equipmentData.is_available !== false
      };

      console.log('📦 EquipmentRepository.create payload:', payload);

      const { data, error } = await supabaseClient
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

  // ...existing methods...
}