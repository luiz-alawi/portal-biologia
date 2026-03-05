'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Users, UserPlus, Trash2, Key, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TURMAS } from '@/utils/turmas';

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', username: '', turma: TURMAS[0] });
  const [createdUserCreds, setCreatedUserCreds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('CSCJUser');
    if (saved) {
      setUser(JSON.parse(saved));
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username) return;

    const roleToAssign = newUser.turma === 'STAFF' ? 'admin' : 'student';

    const payload = {
      ...newUser,
      role: roleToAssign
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setCreatedUserCreds(data);
        setNewUser({ name: '', username: '', turma: TURMAS[0] });
        loadUsers();
      } else {
        alert(data.error || "Erro ao criar usuário");
      }
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este usuário? O acesso será revogado imediatamente.')) return;
    
    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (error) {
      alert("Erro ao deletar");
    }
  };

  if (!user) return null;

  return (
    <AppLayout userData={user}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Acessos</h1>
        <p className="text-slate-500">Crie contas para alunos e professores.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 h-fit">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-800">
            <UserPlus className="text-emerald-600"/> Novo Usuário
          </h2>
          <form onSubmit={handleCreateUser}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
                required
                placeholder="Ex: Maria da Silva"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-1">Usuário (Login)</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                required
                placeholder="Ex: mariasilva"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-1">Turma / Cargo</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={newUser.turma}
                onChange={e => setNewUser({...newUser, turma: e.target.value})}
              >
                <optgroup label="Alunos">
                  {TURMAS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </optgroup>
                <optgroup label="Administração">
                  <option value="STAFF">Professor (Admin)</option>
                </optgroup>
              </select>
            </div>
            <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
              Gerar Acesso
            </button>
          </form>
        </div>

        {}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-slate-700">
              <Users size={20}/> Usuários Cadastrados ({usersList.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Usuário</th>
                  <th className="px-6 py-3">Turma</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-6 py-3 font-mono text-slate-500">{u.username}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.turma === 'STAFF' ? 'PROFESSOR' : u.turma}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleDelete(u._id)} 
                        className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                        title="Remover acesso"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {usersList.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400">Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {createdUserCreds && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl border-4 border-emerald-500"
            >
              <div className="text-center mb-6">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Key className="text-emerald-600 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900">Acesso Criado!</h3>
                <p className="text-sm text-slate-500 mt-2">Tire uma foto ou anote para entregar ao usuário.</p>
              </div>
              
              <div className="bg-slate-100 p-5 rounded-xl mb-6 space-y-3 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Usuário</span>
                  <span className="font-mono font-bold text-slate-800 text-lg">{createdUserCreds.username}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Senha</span>
                  <span className="font-mono font-bold text-emerald-600 text-3xl tracking-wider">{createdUserCreds.generatedPassword}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Cargo</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${createdUserCreds.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {createdUserCreds.role === 'admin' ? 'PROFESSOR' : 'ALUNO'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setCreatedUserCreds(null)} 
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
              >
                <Check size={20} /> Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}