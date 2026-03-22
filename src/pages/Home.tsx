import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Instagram, Facebook,Linkedin, Mail, Phone, Heart, Zap, Code, Globe, ArrowRight,Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '@/components/ParticleBackground';
import ToolCard from '@/components/ToolCard';
import { Tool } from '@/types';
import { supabase } from '@/supabaseClient';

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setFeaturedTools(data || []);
      } catch (err) {
        console.warn('Failed to fetch tools, using fallback:', err);
        setFeaturedTools([
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
        setLoadingTools(false);
      }
    };

    fetchFeaturedTools();
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300"
    >
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
           <ParticleBackground />
           {/* Overlay gradient for better text readability */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>The Future of Digital Tools</span>
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-6">
              Bourich <motion.span 
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_auto]"
              >
                Digital
              </motion.span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Discover the best digital tools for AI, Design, Coding, and Creativity. 
              Curated for professionals, accessible to everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-orange-600 text-white rounded-full font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 w-full sm:w-auto"
                >
                  Explore Tools
                </motion.button>
              </Link>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#about" 
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto inline-block"
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-24 bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">Featured Tools</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Discover some of our most popular utilities.</p>
            </div>
            <Link to="/tools" className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors">
              Show More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingTools ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 sm:hidden flex justify-center">
            <Link to="/tools" className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-900 dark:text-white font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Show More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section id="about" className="relative py-32 bg-zinc-950 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_100%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Beyond Ordinary <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Tools</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              Bourich Digital is a curated platform where I share the most powerful AI tools, design resources, and coding utilities. My goal is to help creators, developers, and professionals streamline their workflows and unlock new creative possibilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "AI Powered", desc: "Discover cutting-edge artificial intelligence tools to automate and enhance your work." },
              { icon: Code, title: "Developer Focused", desc: "Resources and utilities specifically chosen to improve developer productivity." },
              { icon: Globe, title: "Accessible to All", desc: "A clean, intuitive interface making advanced tools easy to find and use." }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="group relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-orange-500/50 hover:to-orange-500/10 transition-colors duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full p-8 rounded-[23px] bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
                  {/* Hover Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-orange-500/20 group-hover:border-orange-500/50 transition-all duration-500">
                      <feature.icon className="w-7 h-7 text-zinc-400 group-hover:text-orange-400 transition-colors duration-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-amber-400 transition-all duration-500">{feature.title}</h3>
                    <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-500">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section className="py-24 bg-zinc-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6 w-fit">
                  Meet the Creator
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
                  Hi, I'm Anouar Bourich
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  I'm a passionate developer and digital creator. I built Bourich Digital to solve my own problem: keeping track of the amazing tools emerging every day. Now, I share this curated collection with the world to help others build faster and create better.
                </p>
                <div className="flex gap-4">
                  <a href="https://www.instagram.com/bourich_digital/" target="_blank" className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-orange-600 hover:text-white transition-colors text-zinc-600 dark:text-zinc-400">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="" target='_blank' className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-orange-600 hover:text-white transition-colors text-zinc-600 dark:text-zinc-400">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://github.com/bourich1/" target='_blank' className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-orange-600 hover:text-white transition-colors text-zinc-600 dark:text-zinc-400">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                <img 
                  src="/mee.png" 
                  alt="Anouar Bourich" 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo-digital-white.png" alt="Bourich Digital" className="h-10 w-auto" />
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Empowering creators and developers with the best digital tools and resources.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <span>+212 647-262-361</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>bourichanouar@gmail.com</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/bourich_digital/" target='_blank' className="p-3 bg-zinc-800 rounded-full hover:bg-orange-600 transition-colors group">
                  <Instagram className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </a>
                <a href="https://github.com/bourich1/" target='_blank' className="p-3 bg-zinc-800 rounded-full hover:bg-orange-600 transition-colors group">
                  <Github className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </a>
                <a href="#" target='_blank' className="p-3 bg-zinc-800 rounded-full hover:bg-orange-600 transition-colors group">
                  <Facebook className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Bourich Digital. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>by Bourich Digital Team</span>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
