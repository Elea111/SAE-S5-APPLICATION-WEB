import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

class StorageService {
  /**
   * Upload un avatar utilisateur
   * @param {File|Buffer} file - Fichier à uploader
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{path: string, url: string}>}
   */
  async uploadAvatar(file, userId) {
    try {
      if (!userId) throw new Error('userId is required');
      if (!file) throw new Error('file is required');

      // Générer un nom unique pour éviter les collisions
      const timestamp = Date.now();
      const fileExtension = this._getFileExtension(file);
      const fileName = `${userId}-${timestamp}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      // Déterminer le contenu à uploader
      const fileContent = Buffer.isBuffer(file) ? file : await file.arrayBuffer();

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileContent, {
          cacheControl: '3600',
          upsert: false,
          contentType: this._getContentType(fileExtension),
        });

      if (error) {
        console.error('❌ Supabase storage error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // ✅ VERIFIER QUE data EXISTE ET CONTIENT path
      if (!data || !data.path) {
        throw new Error('Supabase returned no data with path');
      }

      // Générer l'URL publique
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log(`✅ Avatar uploaded: ${data.path} -> ${publicData.publicUrl}`);

      return {
        path: data.path,
        url: publicData.publicUrl,
        fileName,
      };
    } catch (err) {
      console.error('❌ Avatar upload error:', err.message);
      throw err;
    }
  }

  /**
   * Upload une image d'équipement
   * @param {File|Buffer} file - Fichier à uploader
   * @param {string} equipmentId - ID de l'équipement
   * @returns {Promise<{path: string, url: string}>}
   */
  async uploadEquipmentImage(file, equipmentId) {
    try {
      if (!equipmentId) throw new Error('equipmentId is required');
      if (!file) throw new Error('file is required');

      // Générer un nom unique
      const timestamp = Date.now();
      const fileExtension = this._getFileExtension(file);
      const fileName = `${equipmentId}-${timestamp}.${fileExtension}`;
      const filePath = `${equipmentId}/${fileName}`;

      // Déterminer le contenu
      const fileContent = Buffer.isBuffer(file) ? file : await file.arrayBuffer();

      // Upload
      const { data, error } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, fileContent, {
          cacheControl: '3600',
          upsert: false,
          contentType: this._getContentType(fileExtension),
        });

      if (error) {
        console.error('❌ Supabase storage error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // ✅ VERIFIER QUE data EXISTE
      if (!data || !data.path) {
        throw new Error('Supabase returned no data with path');
      }

      // URL publique
      const { data: publicData } = supabase.storage
        .from('equipment-images')
        .getPublicUrl(data.path);

      console.log(`✅ Equipment image uploaded: ${data.path} -> ${publicData.publicUrl}`);

      return {
        path: data.path,
        url: publicData.publicUrl,
        fileName,
      };
    } catch (err) {
      console.error('❌ Equipment image upload error:', err.message);
      throw err;
    }
  }

  /**
   * Supprimer un fichier
   * @param {string} bucket - Nom du bucket ('avatars' ou 'equipment-images')
   * @param {string} filePath - Chemin du fichier
   * @returns {Promise<boolean>}
   */
  async deleteFile(bucket, filePath) {
    try {
      if (!bucket || !filePath) {
        throw new Error('bucket and filePath are required');
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.warn(`⚠️  Delete warning: ${error.message}`);
        return false;
      }

      console.log(`✅ File deleted: ${bucket}/${filePath}`);
      return true;
    } catch (err) {
      console.error('❌ Delete error:', err.message);
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
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Lister tous les fichiers d'un dossier
   * @param {string} bucket - Nom du bucket
   * @param {string} folderPath - Chemin du dossier (ex: userId ou equipmentId)
   * @returns {Promise<Array>}
   */
  async listFiles(bucket, folderPath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw new Error(`List failed: ${error.message}`);

      return data || [];
    } catch (err) {
      console.error('❌ List files error:', err.message);
      throw err;
    }
  }

  /**
   * Utilitaire : Obtenir l'extension de fichier
   * @private
   */
  _getFileExtension(file) {
    if (typeof file === 'string') {
      // Data URL
      const match = file.match(/data:([^;]+);base64/);
      if (match) {
        const mimeType = match[1];
        return this._getMimeExtension(mimeType);
      }
      return 'jpg';
    }

    // File object
    if (file.name) {
      return file.name.split('.').pop().toLowerCase();
    }

    // Buffer
    return 'jpg';
  }

  /**
   * Utilitaire : Obtenir le type MIME
   * @private
   */
  _getContentType(extension) {
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };

    return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Utilitaire : Convertir extension MIME en extension fichier
   * @private
   */
  _getMimeExtension(mimeType) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };

    return extensions[mimeType] || 'jpg';
  }
}

export default new StorageService();
