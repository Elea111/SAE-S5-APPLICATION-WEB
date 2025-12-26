import dotenv from 'dotenv';
dotenv.config(); // Charge les variables du fichier .env

// Fix indispensable pour les tests Node.js / Jest
import fetch from 'cross-fetch';
global.fetch = fetch

//import 'isomorphic-fetch';

import supabase from '../../infra/database/supabaseClient.js';


describe('Supabase Connection', () => {
  test('Should connect to Supabase and fetch users table', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });


  test('Vérification technique des clés', () => {
  console.log("URL utilisée:", process.env.SUPABASE_URL);
  console.log("Key utilisée:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "PRÉSENTE" : "ABSENTE");
  expect(process.env.SUPABASE_URL).toBeDefined();
});

/*
  test('Should handle table that does not exist gracefully', async () => {
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);

    // Cette table n'existe pas, donc error doit être non-null
    expect(error).toBeDefined();
    expect(error.message).toContain('relation "public.nonexistent_table" does not exist');
  });*/

  test('Should insert and fetch a user', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert({
        email: testEmail,
        password_hash: 'hashed_password_123',
        first_name: 'Test',
        last_name: 'User',
        is_pro: false
      })
      .select();

    expect(insertError).toBeNull();
    expect(inserted).toBeDefined();
    expect(inserted.length).toBe(1);
    expect(inserted[0].email).toBe(testEmail);

    // Cleanup
    await supabase.from('users').delete().eq('email', testEmail);
  });

  test('Should verify Supabase credentials are loaded', () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(process.env.SUPABASE_URL).not.toBe('');
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).not.toBe('');
  });
});