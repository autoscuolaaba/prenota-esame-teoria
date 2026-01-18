import { supabase } from './supabaseService';
import type { User, Session } from '@supabase/supabase-js';

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout after max attempts
};

interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

// Rate limiting state (persisted in localStorage for client-side protection)
const getRateLimitState = (): RateLimitState => {
  const stored = localStorage.getItem('auth_rate_limit');
  if (!stored) {
    return { attempts: 0, firstAttempt: 0, lockedUntil: null };
  }
  return JSON.parse(stored);
};

const setRateLimitState = (state: RateLimitState) => {
  localStorage.setItem('auth_rate_limit', JSON.stringify(state));
};

const checkRateLimit = (): { allowed: boolean; waitTime?: number } => {
  const state = getRateLimitState();
  const now = Date.now();

  // Check if currently locked out
  if (state.lockedUntil && now < state.lockedUntil) {
    return {
      allowed: false,
      waitTime: Math.ceil((state.lockedUntil - now) / 1000 / 60)
    };
  }

  // Reset if window has passed
  if (state.firstAttempt && now - state.firstAttempt > RATE_LIMIT.windowMs) {
    setRateLimitState({ attempts: 0, firstAttempt: 0, lockedUntil: null });
    return { allowed: true };
  }

  // Check if max attempts reached
  if (state.attempts >= RATE_LIMIT.maxAttempts) {
    const lockedUntil = now + RATE_LIMIT.lockoutMs;
    setRateLimitState({ ...state, lockedUntil });
    return {
      allowed: false,
      waitTime: Math.ceil(RATE_LIMIT.lockoutMs / 1000 / 60)
    };
  }

  return { allowed: true };
};

const recordAttempt = (success: boolean) => {
  if (success) {
    // Reset on successful login
    setRateLimitState({ attempts: 0, firstAttempt: 0, lockedUntil: null });
    return;
  }

  const state = getRateLimitState();
  const now = Date.now();

  setRateLimitState({
    attempts: state.attempts + 1,
    firstAttempt: state.firstAttempt || now,
    lockedUntil: state.lockedUntil,
  });
};

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  rateLimited?: boolean;
  waitTime?: number;
}

export const AuthService = {
  /**
   * Sign in with email and password
   * Uses Supabase Auth for secure server-side authentication
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    // Check rate limit first
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        rateLimited: true,
        waitTime: rateCheck.waitTime,
        error: `Troppi tentativi. Riprova tra ${rateCheck.waitTime} minuti.`,
      };
    }

    if (!supabase) {
      return {
        success: false,
        error: 'Servizio non configurato. Contatta l\'amministratore.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        recordAttempt(false);

        // Map Supabase errors to user-friendly messages
        let errorMessage = 'Credenziali non valide';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o password non corretti';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email non confermata. Controlla la tua casella di posta.';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      recordAttempt(true);

      return {
        success: true,
        user: data.user ?? undefined,
        session: data.session ?? undefined,
      };
    } catch (err) {
      recordAttempt(false);
      return {
        success: false,
        error: 'Errore di connessione. Riprova più tardi.',
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: false, error: 'Servizio non configurato' };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Errore durante il logout' };
    }
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    if (!supabase) {
      return { session: null, user: null };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return {
        session,
        user: session?.user ?? null
      };
    } catch {
      return { session: null, user: null };
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );

    return { unsubscribe: () => subscription.unsubscribe() };
  },

  /**
   * Check if Supabase Auth is configured
   */
  isConfigured(): boolean {
    return supabase !== null;
  },

  /**
   * Get remaining login attempts
   */
  getRemainingAttempts(): number {
    const state = getRateLimitState();
    return Math.max(0, RATE_LIMIT.maxAttempts - state.attempts);
  },
};
