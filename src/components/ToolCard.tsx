import React from 'react';
import { motion } from 'motion/react';
import { Tool } from '@/types';
import { ExternalLink, Lock, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(tool.code);
    toast.success(`Copied code: ${tool.code}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -10, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 transform perspective-1000"
    >
      <div className="aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        <img 
          src={tool.image_url} 
          alt={tool.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md text-white rounded-md border border-white/10">
            {tool.category}
          </span>
          {!tool.is_public && (
            <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-red-500/80 backdrop-blur-md text-white rounded-md flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
        </div>
      </div>

      <div className="p-5 relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {tool.name}
          </h3>
        </div>
        
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 h-10">
          {tool.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button 
            onClick={copyCode}
            className="text-sm font-mono font-medium text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2 transition-all bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer active:scale-95"
            title="Click to copy code"
          >
            {tool.code} <Copy className="w-4 h-4" />
          </button>

          <a 
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline"
          >
            Visit Tool <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolCard;
