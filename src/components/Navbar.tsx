import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { isAuthenticated, role } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-digital-white.png" alt="Bourich Digital" className="h-10 w-auto" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400",
                  isActive('/') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                Home
              </Link>
              <Link 
                to="/tools" 
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400",
                  isActive('/tools') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                Tools
              </Link>

              {isAuthenticated && (
                <>
                  {role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={cn(
                        "text-sm font-medium transition-colors flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400",
                        isActive('/admin') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3 bg-white dark:bg-zinc-900">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block text-base font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400",
                    isActive('/') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  Home
                </Link>
                <Link 
                  to="/tools" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block text-base font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400",
                    isActive('/tools') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  Tools
                </Link>
                {isAuthenticated && (
                  <>
                    {role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block text-base font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400",
                          isActive('/admin') ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
