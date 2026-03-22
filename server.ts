import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Supabase Admin Client not initialized. Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // --- Custom Auth Routes ---

  // 1. Signup Route (Simplified: Auto-confirm, no verification code)
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, full_name, date_of_birth } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      // Create user and auto-confirm email
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm user
        user_metadata: {
          full_name,
          date_of_birth
        }
      });

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      const userId = userData.user.id;

      return res.json({ success: true, userId, email });

    } catch (error: any) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete Account Route
  app.post('/api/delete-account', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Server configuration error: Supabase Admin not initialized' });
    }

    try {
      // 1. Delete user from Auth (this cascades to public.users if set up, but let's be explicit)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Error deleting auth user:', authError);
        return res.status(500).json({ error: 'Failed to delete user authentication' });
      }

      // 2. Delete from public.users (if not cascaded)
      // Note: Usually handled by cascade, but good to ensure cleanup
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) {
        console.warn('Error deleting public user record (might have cascaded):', dbError);
        // Don't fail if auth deletion succeeded
      }

      return res.json({ success: true, message: 'Account permanently deleted' });
    } catch (error: any) {
      console.error('Unexpected error deleting account:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Disable HMR to prevent WebSocket errors in preview environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
