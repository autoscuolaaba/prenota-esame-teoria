import { createClient } from '@supabase/supabase-js';
import { Prenotazione, PrenotazioneStato } from '../types';

// NOTE: In a real deployment, these should be environment variables.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if valid URL to prevent "Invalid supabaseUrl" error
const isValidUrl = (url: string | undefined) => {
  try {
    return url && new URL(url);
  } catch (_) {
    return false;
  }
};

const isConfigured = isValidUrl(SUPABASE_URL) && SUPABASE_ANON_KEY;

export const supabase = isConfigured 
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) 
  : null;

// Mock implementation for demo purposes when Supabase is not configured
const MockService = {
  async create(data: Omit<Prenotazione, 'id' | 'created_at' | 'stato' | 'updated_at'>) {
    console.warn("Using Mock Service (Supabase not configured)");
    const newBooking: Prenotazione = {
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      stato: PrenotazioneStato.NUOVO,
      ...data
    };
    
    // Persist to localStorage for demo
    const existing = JSON.parse(localStorage.getItem('mock_prenotazioni') || '[]');
    localStorage.setItem('mock_prenotazioni', JSON.stringify([newBooking, ...existing]));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: newBooking, error: null };
  },

  async getAll() {
    console.warn("Using Mock Service (Supabase not configured)");
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = JSON.parse(localStorage.getItem('mock_prenotazioni') || '[]');
    return { data, error: null };
  },

  async updateStato(id: string, stato: PrenotazioneStato) {
    const existing = JSON.parse(localStorage.getItem('mock_prenotazioni') || '[]');
    const updated = existing.map((p: Prenotazione) => p.id === id ? { ...p, stato } : p);
    localStorage.setItem('mock_prenotazioni', JSON.stringify(updated));
    return { data: null, error: null };
  },

  async delete(id: string) {
    const existing = JSON.parse(localStorage.getItem('mock_prenotazioni') || '[]');
    const filtered = existing.filter((p: Prenotazione) => p.id !== id);
    localStorage.setItem('mock_prenotazioni', JSON.stringify(filtered));
    return { data: null, error: null };
  }
};

const RealService = {
  async create(data: Omit<Prenotazione, 'id' | 'created_at' | 'stato' | 'updated_at'>) {
    if (!supabase) return { error: { message: "Supabase client not initialized" } };
    return await supabase.from('prenotazioni').insert([{ ...data, stato: PrenotazioneStato.NUOVO }]);
  },

  async getAll() {
    if (!supabase) return { error: { message: "Supabase client not initialized" } };
    return await supabase
      .from('prenotazioni')
      .select('*')
      .order('created_at', { ascending: false });
  },

  async updateStato(id: string, stato: PrenotazioneStato) {
    if (!supabase) return { error: { message: "Supabase client not initialized" } };
    return await supabase
      .from('prenotazioni')
      .update({ stato })
      .eq('id', id);
  },

  async delete(id: string) {
    if (!supabase) return { error: { message: "Supabase client not initialized" } };
    return await supabase
      .from('prenotazioni')
      .delete()
      .eq('id', id);
  }
};

export const PrenotazioneService = isConfigured ? RealService : MockService;