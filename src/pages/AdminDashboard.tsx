import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tool, Stats } from '@/types';
import { Plus, Trash2, Edit2, LayoutGrid, BarChart3, Search, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/supabaseClient';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAuthenticated) {
        navigate('/admin/login');
        return;
      }

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (roleError && roleError.code !== 'PGRST116') {
            console.error('Error fetching user role:', roleError);
          }
          
          if (userData?.role !== 'admin') {
            navigate('/'); // Redirect non-admins to home
            return;
          }
        }
        
        fetchData();
      } catch (err) {
        console.error('Failed to check admin status:', err);
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      // Fetch Tools
      const { data: toolsData, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (toolsData) {
        setTools(toolsData);
        setStats({
          totalTools: toolsData.length,
          publicTools: toolsData.filter(t => t.is_public).length,
          privateTools: toolsData.filter(t => !t.is_public).length
        });
      }
    } catch (err) {
      console.warn('Failed to fetch admin data:', err);
      // Set empty state to avoid crashing
      setTools([]);
      setStats({
        totalTools: 0,
        publicTools: 0,
        privateTools: 0
      });
    }
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteConfirmationId) return;
    
    const id = deleteConfirmationId;
    setDeletingId(id);
    setDeleteConfirmationId(null); // Close modal
    
    console.log('Attempting to delete tool with ID:', id);
    
    try {
      const { error, data } = await supabase.from('tools').delete().eq('id', id).select();
      
      if (error) {
        console.error('Supabase delete error:', error);
        toast.error('Failed to delete tool: ' + error.message);
        return;
      }

      console.log('Delete successful, data:', data);
      
      if (!data || data.length === 0) {
        toast.error('Tool was not found or could not be deleted. Check permissions.');
      } else {
        // Optimistic update
        setTools(prev => prev.filter(t => t.id !== id));
        toast.success('Tool deleted successfully');
      }
    } catch (err: any) {
      console.error('Unexpected error during delete:', err);
      toast.error('An unexpected error occurred: ' + (err.message || String(err)));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTool = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const toolData = {
      name: formData.get('name'),
      description: formData.get('description'),
      image_url: formData.get('image_url'),
      link: formData.get('link'),
      category: formData.get('category'),
      is_public: formData.get('is_public') === 'on',
      code: formData.get('code') || `TOOL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };

    console.log('Saving tool data:', toolData);

    try {
      if (editingTool) {
        console.log('Updating tool with ID:', editingTool.id);
        const { error, data } = await supabase.from('tools').update(toolData).eq('id', editingTool.id).select();
        if (error) throw error;
        console.log('Update successful:', data);
        toast.success('Tool updated successfully');
      } else {
        console.log('Inserting new tool');
        const { error, data } = await supabase.from('tools').insert([toolData]).select();
        if (error) throw error;
        console.log('Insert successful:', data);
        toast.success('Tool created successfully');
      }

      setIsModalOpen(false);
      setEditingTool(null);
      await fetchData();
    } catch (err: any) {
      console.error('Error saving tool:', err);
      toast.error('Failed to save tool: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total Tools</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalTools}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Public Tools</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.publicTools}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Private Tools</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.privateTools}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingTool(null); setIsModalOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Tool
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase">Image</th>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase">Name</th>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase">Category</th>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase">Code</th>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase">Status</th>
                      <th className="p-4 text-xs font-medium text-zinc-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {tools.map(tool => (
                      <tr key={tool.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                          <img src={tool.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-100" />
                        </td>
                        <td className="p-4 font-medium text-zinc-900 dark:text-white">{tool.name}</td>
                        <td className="p-4 text-zinc-600 dark:text-zinc-400">{tool.category}</td>
                        <td className="p-4 font-mono text-xs text-zinc-500">{tool.code}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tool.is_public 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {tool.is_public ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingTool(tool); setIsModalOpen(true); }}
                              className="p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTool(tool.id)}
                              disabled={deletingId === tool.id}
                              className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingId === tool.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmationId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Delete Tool?</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                    Are you sure you want to delete this tool? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setDeleteConfirmationId(null)}
                      className="flex-1 px-4 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {editingTool ? 'Edit Tool' : 'Add New Tool'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSaveTool} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input name="name" defaultValue={editingTool?.name} required className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" defaultValue={editingTool?.description} required className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input name="image_url" defaultValue={editingTool?.image_url} required className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select name="category" defaultValue={editingTool?.category || 'AI'} className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="AI">AI</option>
                        <option value="Design">Design</option>
                        <option value="Video">Video</option>
                        <option value="Creativity">Creativity</option>
                        <option value="Audio">Audio</option>
                        <option value="Image">Image</option>
                        <option value="Web Coding">Web Coding</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Code (Optional)</label>
                      <input name="code" defaultValue={editingTool?.code} placeholder="Auto-generated if empty" className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link</label>
                    <input name="link" defaultValue={editingTool?.link} required className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" name="is_public" id="is_public" defaultChecked={editingTool?.is_public ?? true} className="w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500" />
                    <label htmlFor="is_public" className="text-sm font-medium">Make Public</label>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Save Tool</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
