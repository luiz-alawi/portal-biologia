'use client';
import { useState, useEffect } from 'react';
import { Microscope, X, Loader2, User, Lock, Leaf, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('CSCJUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        router.push(user.role === 'admin' ? '/admin/library' : '/');
      } catch (e) {
        localStorage.removeItem('CSCJUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('CSCJUser', JSON.stringify(data));
      router.push(data.role === 'admin' ? '/admin/library' : '/');
      
    } catch (err) {
      setError(err.message);
      setIsLoggingIn(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans">
      
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 z-0" />
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
      
      <div className="absolute inset-0 opacity-[0.03] z-0" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20">
          
          <div className="pt-10 pb-6 px-8 text-center relative">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-50/80 to-transparent -z-10" />
            
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 transform rotate-3"
            >
              <Microscope className="text-white w-10 h-10" strokeWidth={1.5} />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-slate-500 text-sm mt-2">Portal de Biologia</p>
          </div>

          <div className="px-8 pb-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2 border border-red-100 shadow-sm"
              >
                <X size={16}/> {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Usuário</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    disabled={isLoggingIn}
                    placeholder="Seu nome de usuário"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input 
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    disabled={isLoggingIn}
                    placeholder="Sua senha de acesso"
                  />
                </div>
              </div>
              
              <div className="pt-2 space-y-4">
                <button 
                  disabled={isLoggingIn}
                  className={`group w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 relative overflow-hidden
                    ${isLoggingIn 
                      ? 'bg-slate-800 cursor-not-allowed opacity-80' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Verificando...
                    </>
                  ) : (
                    <>
                      Entrar na Plataforma <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors hover:underline decoration-emerald-300 underline-offset-4"
                >
                  Como receber acesso?
                </button>
              </div>

            </form>
          </div>

          <div className="py-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
               <Leaf size={12} className="text-emerald-500"/> Área Restrita para Alunos e Administradores
             </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showHelpModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowHelpModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                  <HelpCircle size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">Precisa de Acesso?</h3>
                
                <p className="text-slate-600 leading-relaxed mb-6">
                  Para obter seu login e senha, entre em contato diretamente com o <strong className="text-emerald-700">Professor Guilherme Santos</strong>.
                </p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full mb-6">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Nota</p>
                  <p className="text-sm text-slate-700">
                    O acesso é restrito aos alunos das turmas autorizadas e equipe do colégio.
                  </p>
                </div>

                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}