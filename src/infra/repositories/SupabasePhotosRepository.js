import supabase from '../database/supabaseClient.js';

class SupabasePhotosRepository {
  async create(photoData) {
    const { item_id, image_url, sort_order = 0, is_main = false } = photoData;

    const { data, error } = await supabase
      .from('item_photos')
      .insert([{
        item_id,
        image_url,
        sort_order,
        is_main,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw new Error(`Photo création : ${error.message}`);
    return data?.[0] || null;
  }

  async findByItemId(itemId) {
    const { data, error } = await supabase
      .from('item_photos')
      .select('*')
      .eq('item_id', itemId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`Photos fetch : ${error.message}`);
    return data || [];
  }

  async delete(photoId) {
    const { error } = await supabase
      .from('item_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw new Error(`Photo suppression : ${error.message}`);
  }
}

export default SupabasePhotosRepository;
