import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  role: 'admin' | 'user' | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      setSession(session);
      if (session?.user) fetchUserRole(session.user.id);
    }).catch(err => {
      console.error('Failed to fetch session:', err);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        const userRole = data.role as 'admin' | 'user';
        if (userRole !== 'admin') {
          await supabase.auth.signOut();
          setRole(null);
          setSession(null);
        } else {
          setRole(userRole);
        }
      } else if (error) {
        console.error('Error fetching user role:', error);
      }
    } catch (err) {
      console.error('Failed to fetch user role:', err);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    } finally {
      setRole(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, role, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
