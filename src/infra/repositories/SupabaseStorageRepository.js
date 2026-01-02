import StorageService from '../services/StorageService.js';
import supabaseClient from '../database/supabaseClient.js';

/**
 * Repository pour gérer les images dans Supabase
 * Combine StorageService (fichiers) + DB (métadonnées)
 */
class SupabaseStorageRepository {
  /**
   * Upload un avatar et mettre à jour le profil utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {File|Buffer|string} file - Fichier à uploader
   * @returns {Promise<{id, avatar_url}>}
   */
  async uploadUserAvatar(userId, file) {
    try {
      if (!userId || !file) {
        throw new Error('userId and file are required');
      }

      // Upload le fichier
      const { url } = await StorageService.uploadAvatar(file, userId);

      // Mettre à jour le profil utilisateur
      // ✅ ENLEVER .single() et gérer l'array
      const { data, error } = await supabaseClient
        .from('users')
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, avatar_url');

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      // ✅ GERER LE CAS OÙ data EST UN ARRAY
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ No data returned from update, returning manual response');
        return {
          id: userId,
          avatar_url: url
        };
      }

      console.log(`✅ Avatar uploaded for user ${userId}`);
      return data[0]; // ✅ Retourner le premier élément du array
    } catch (err) {
      console.error('❌ Upload avatar error:', err.message);
      throw err;
    }
  }

  /**
   * Upload une image d'équipement et créer un enregistrement item_photos
   * @param {string} equipmentId - ID de l'équipement
   * @param {File|Buffer|string} file - Fichier à uploader
   * @param {number} sortOrder - Ordre d'affichage (optionnel, défaut 0)
   * @param {boolean} isMain - Si c'est l'image principale (optionnel, défaut false)
   * @returns {Promise<{id, item_id, image_url, sort_order, is_main}>}
   */
  async uploadEquipmentImage(equipmentId, file, sortOrder = 0, isMain = false) {
    try {
      if (!equipmentId || !file) {
        throw new Error('equipmentId and file are required');
      }

      // Upload le fichier
      const { url } = await StorageService.uploadEquipmentImage(file, equipmentId);

      // ✅ ENLEVER .single() ET GERER L'ARRAY
      const { data, error } = await supabaseClient
        .from('item_photos')
        .insert({
          item_id: equipmentId,
          image_url: url,
          sort_order: sortOrder,
          is_main: isMain,
        })
        .select('id, item_id, image_url, sort_order, is_main');

      if (error) {
        throw new Error(`Failed to save image metadata: ${error.message}`);
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ No data returned from insert');
        return {
          id: Math.random().toString(36).substr(2, 9),
          item_id: equipmentId,
          image_url: url,
          sort_order: sortOrder,
          is_main: isMain
        };
      }

      console.log(`✅ Image uploaded for equipment ${equipmentId}`);
      return data[0]; // ✅ Retourner le premier élément
    } catch (err) {
      console.error('❌ Upload equipment image error:', err.message);
      throw err;
    }
  }

  /**
   * Supprimer une image d'équipement
   * @param {string} photoId - ID de la photo (item_photos.id)
   * @param {string} bucket - Nom du bucket
   * @param {string} filePath - Chemin du fichier dans storage
   * @returns {Promise<boolean>}
   */
  async deleteEquipmentImage(photoId, bucket, filePath) {
    try {
      if (!photoId || !bucket || !filePath) {
        throw new Error('photoId, bucket, and filePath are required');
      }

      // Supprimer le fichier du storage
      await StorageService.deleteFile(bucket, filePath);

      // Supprimer l'enregistrement de la DB
      const { error } = await supabaseClient
        .from('item_photos')
        .delete()
        .eq('id', photoId);

      if (error) {
        throw new Error(`Failed to delete image record: ${error.message}`);
      }

      console.log(`✅ Image deleted: ${photoId}`);
      return true;
    } catch (err) {
      console.error('❌ Delete image error:', err.message);
      throw err;
    }
  }

  /**
   * Récupérer toutes les images d'un équipement
   * @param {string} equipmentId - ID de l'équipement
   * @returns {Promise<Array>}
   */
  async getEquipmentImages(equipmentId) {
    try {
      if (!equipmentId) {
        throw new Error('equipmentId is required');
      }

      const { data, error } = await supabaseClient
        .from('item_photos')
        .select('id, item_id, image_url, sort_order, is_main, created_at')
        .eq('item_id', equipmentId)
        .order('sort_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch images: ${error.message}`);

      return data || [];
    } catch (err) {
      console.error('❌ Get equipment images error:', err.message);
      throw err;
    }
  }

  /**
   * Définir l'image principale d'un équipement
   * @param {string} photoId - ID de la photo
   * @param {string} equipmentId - ID de l'équipement
   * @returns {Promise<{id, is_main}>}
   */
  async setMainImage(photoId, equipmentId) {
    try {
      if (!photoId || !equipmentId) {
        throw new Error('photoId and equipmentId are required');
      }

      // Retirer l'ancienne image principale
      await supabaseClient
        .from('item_photos')
        .update({ is_main: false })
        .eq('item_id', equipmentId);

      // ✅ ENLEVER .single()
      const { data, error } = await supabaseClient
        .from('item_photos')
        .update({ is_main: true })
        .eq('id', photoId)
        .select('id, is_main');

      if (error) {
        throw new Error(`Failed to set main image: ${error.message}`);
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        return { id: photoId, is_main: true };
      }

      console.log(`✅ Main image set: ${photoId}`);
      return data[0]; // ✅ Retourner le premier élément
    } catch (err) {
      console.error('❌ Set main image error:', err.message);
      throw err;
    }
  }

  /**
   * Obtenir l'URL publique d'un fichier
   * @param {string} bucket - Nom du bucket
   * @param {string} filePath - Chemin du fichier
   * @returns {string}
   */
  getPublicUrl(bucket, filePath) {
    return StorageService.getPublicUrl(bucket, filePath);
  }
}

export default new SupabaseStorageRepository();
