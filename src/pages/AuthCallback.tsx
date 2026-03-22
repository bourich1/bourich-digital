import React, { useEffect } from 'react';
import { supabase } from '@/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a session immediately
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        notifyAndClose();
        return;
      }

      // If not, listen for the SIGNED_IN event which Supabase fires after processing the hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          notifyAndClose();
        }
      });

      return () => subscription.unsubscribe();
    };

    handleCallback();
  }, [navigate]);

  const notifyAndClose = () => {
    if (window.opener) {
      // Send message to parent window
      window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, '*');
      window.close();
    } else {
      // Fallback if not a popup
      navigate('/bourich-ai');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center p-8">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Authenticating...</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
