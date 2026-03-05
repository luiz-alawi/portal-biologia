'use client';

import { useState } from 'react';
import { Leaf, BookOpen, LogOut, FileText, Microscope, Users, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children, userData }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error("Erro ao deslogar do servidor", e);
    }

    localStorage.removeItem('CSCJUser');
    
    router.push('/login');
    router.refresh();
  };

  const handleNavigation = (path) => {
    if (pathname === path) return;
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { name: 'Área de Estudo', icon: <BookOpen size={20} />, path: userData?.role === 'admin' ? '/admin/library' : '/' },
  ];

  if (userData?.role === 'admin') {
    menuItems.push(
      { name: 'Gerenciar Acessos', icon: <Users size={20} />, path: '/admin/users' },
      { name: 'Postar Slide', icon: <FileText size={20} />, path: '/admin/upload-slide' },
      { name: 'Postar Espécie', icon: <Microscope size={20} />, path: '/admin/upload-species' }
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.99 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-x-hidden">
      
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-emerald-700 font-bold text-xl">
            <Leaf className="w-6 h-6" /> Biologia
          </div>
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900 truncate">{userData?.name || 'Usuário'}</p>
            <p className="text-xs text-emerald-600 uppercase tracking-wider font-bold mt-1">
              {userData?.role === 'admin' ? 'Professor' : userData?.turma}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition-colors relative ${
                pathname === item.path 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
              }`}
            >
              {pathname === item.path && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
              )}
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
          <Leaf className="w-6 h-6" /> Biologia
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-slate-600 hover:text-emerald-600 p-2 rounded-md hover:bg-emerald-50 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[65px] left-0 w-full bg-white border-b border-slate-200 shadow-xl z-20 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="font-bold text-slate-800">{userData?.name}</p>
              <p className="text-xs font-bold text-emerald-600 uppercase mt-1">
                {userData?.role === 'admin' ? 'Professor' : userData?.turma}
              </p>
            </div>

            <nav className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium mb-1 transition-colors ${
                    pathname === item.path 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.icon} {item.name}
                </button>
              ))}
              
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">
                  <LogOut size={20} /> Sair
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname} 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}