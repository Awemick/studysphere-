// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.7.1/+esm';

const supabaseUrl = 'https://pklaygtgyryexuyykvtf.supabase.co';
const supabaseAnonKey = 'sb_publishable_9Md4POoW2KwD-RgFZRy8XQ_UuWu-wjE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User API
export const userAPI = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  },
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();
    if (error) throw error;
    return data[0];
  }
};

// Notes & Flashcards
export const notesAPI = {
  async uploadNote(file) {
    const { data, error } = await supabase.storage
      .from('notes')
      .upload(`user_notes/${file.name}`, file);
    if (error) return console.error(error);
    await supabase.from('notes_metadata').insert([{ file_name: file.name, path: data.path }]);
  },
  async getNotes() {
    const { data, error } = await supabase.storage.from('notes').list('user_notes');
    if (error) throw error;
    return data;
  }
};
