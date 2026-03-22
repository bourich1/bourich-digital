import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import { Tool } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTools(data || []);
      } catch (err) {
        console.warn('Failed to fetch tools from Supabase, using fallback data:', err);
        setTools([
          {
            id: '1',
            name: 'AI Image Generator',
            description: 'Create stunning images from text descriptions using advanced AI models.',
            category: 'AI',
            image_url: 'https://picsum.photos/seed/ai/400/300',
            link: '#',
            is_public: true,
            code: 'TOOL-AI1',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Design System Builder',
            description: 'Build and manage your design tokens and components in one place.',
            category: 'Design',
            image_url: 'https://picsum.photos/seed/design/400/300',
            link: '#',
            is_public: true,
            code: 'TOOL-DS1',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Code Snippet Manager',
            description: 'Save, organize, and share your most used code snippets.',
            category: 'Web Coding',
            image_url: 'https://picsum.photos/seed/code/400/300',
            link: '#',
            is_public: true,
            code: 'TOOL-CD1',
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const categories = ['All', ...Array.from(new Set(tools.map(t => t.category)))];

  const filteredTools = tools.filter(tool => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      (tool.name?.toLowerCase() || '').includes(searchLower) || 
      (tool.code?.toLowerCase() || '').includes(searchLower) ||
      (tool.description?.toLowerCase() || '').includes(searchLower);
    const matchesCategory = category === 'All' || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300"
    >
      {/* Hero-like Title Section with Mouse Tracking */}
      <section 
        onMouseMove={handleMouseMove}
        className="relative pt-32 pb-20 bg-zinc-950 overflow-hidden group border-b border-zinc-800"
      >
        <div 
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234, 88, 12, 0.15), transparent 40%)`
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6"
          >
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Tools</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto font-light"
          >
            Explore our complete collection of utilities, resources, and AI models designed to supercharge your workflow.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    category === cat 
                      ? "bg-orange-600 text-white shadow-md" 
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
            {filteredTools.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-500">
                No tools found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
