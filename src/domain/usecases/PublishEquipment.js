export async function PublishEquipment(equipmentData, equipmentRepository = null, photosRepository = null) {
    if (!equipmentData) {
        throw new Error("Données d'équipement requises");
    }

    const { 
      title, 
      description, 
      daily_price, 
      caution_deposit, 
      location, 
      condition, 
      user_id, 
      category, // ✅ Recevoir 'category'
      images = [] 
    } = equipmentData;

    // ✅ VALIDATION
    if (!title || !title.trim()) {
        throw new Error("Le titre est requis");
    }
    if (!daily_price || parseFloat(daily_price) <= 0) {
        throw new Error("Le prix journalier est requis et doit être positif");
    }

    // ✅ CONSTRUCTION PAYLOAD - MAPPER category → category_id
    const payload = {
        user_id,
        title: title.trim(),
        description: description || '',
        daily_price: parseFloat(daily_price),
        caution_deposit: caution_deposit ? parseFloat(caution_deposit) : null,
        location: location || '',
        condition: condition || 'bon',
        category_id: category || null, // ✅ Mapper à category_id
        is_available: true,
        created_at: new Date().toISOString(),
    };

    console.log('📦 PublishEquipment payload:', payload);

    // ✅ UTILISER LE REPOSITORY
    if (equipmentRepository && typeof equipmentRepository.create === 'function') {
        try {
            const created = await equipmentRepository.create(payload);
            
            // ✅ UPLOADER LES IMAGES SI PRESENTES
            if (images && images.length > 0 && photosRepository) {
                for (let i = 0; i < images.length; i++) {
                    const imageData = images[i];
                    
                    // Si c'est un data URL (base64), le convertir
                    if (imageData.startsWith('data:')) {
                        try {
                            await photosRepository.create({
                                item_id: created.id,
                                image_url: imageData, // Ou envoyer à Supabase Storage
                                sort_order: i,
                                is_main: i === 0
                            });
                        } catch (imgErr) {
                            console.warn(`Erreur upload image ${i}:`, imgErr);
                        }
                    }
                }
            }
            
            return {
                id: created.id,
                title: created.title,
                daily_price: created.daily_price,
                location: created.location,
                ...created
            };
        } catch (err) {
            console.error('PublishEquipment error:', err);
            throw new Error(`Erreur création équipement: ${err.message}`);
        }
    }

    throw new Error("Repository équipement non disponible");
}
