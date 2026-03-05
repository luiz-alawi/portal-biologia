'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Trash2, FileText, Eye, Microscope, Search, Calendar, Clock, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TURMAS } from '@/utils/turmas';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const PresentationModal = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => null
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit'
  });
};

export default function AdminLibrary() {
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [species, setSpecies] = useState([]);
  
  const [filterTurma, setFilterTurma] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [presentationData, setPresentationData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('CSCJUser');
    if (!saved) {
      router.push('/'); 
      return;
    }

    try {
      const u = JSON.parse(saved);
      if (u.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(u);
      fetchData();
    } catch (e) {
      localStorage.removeItem('CSCJUser');
      router.push('/');
    }
  }, []); 

  const fetchData = async () => {
    try {
      const [mat, spec] = await Promise.all([
        fetch('/api/materials?turma=STAFF').then(r => r.json()), 
        fetch('/api/species?turma=STAFF').then(r => r.json())
      ]);
      setMaterials(mat || []);
      setSpecies(spec || []);
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error("Erro dados", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, type, fileUrl) => {
    if(!confirm("Tem certeza? Isso apagará o arquivo permanentemente.")) return;
    
    try {
      const res = await fetch('/api/content/delete', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id, type, fileUrl })
      });
      
      if (res.ok) {
        fetchData(); 
      } else {
        alert("Erro ao excluir");
      }
    } catch (error) {
      alert("Erro de conexão");
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesTurma = filterTurma === 'Todas' || m.turma === filterTurma || m.turma === 'Todas';
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTurma && matchesSearch;
  });

  const filteredSpecies = species.filter(s => {
    const matchesTurma = filterTurma === 'Todas' || s.turma === filterTurma || s.turma === 'Todas';
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTurma && matchesSearch;
  });

  if (!user) return null;

  return (
    <AppLayout userData={user}>
      <motion.header 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Biblioteca Geral</h1>
          <p className="text-slate-500">Gerencie todos os arquivos do sistema.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                    placeholder="Buscar arquivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <select 
              value={filterTurma} 
              onChange={e => setFilterTurma(e.target.value)}
              className="py-2 px-3 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <option value="Todas">Todas as Turmas</option>
              {TURMAS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
        </div>
      </motion.header>

      {loading ? (
        <div className="space-y-8">
            <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-slate-200 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
            <div className="animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-64 bg-slate-200 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800 border-b pb-2 border-emerald-100">
                  <FileText className="text-emerald-600"/> Slides / PDFs ({filteredMaterials.length})
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {filteredMaterials.length > 0 ? filteredMaterials.map(m => (
                    <motion.div 
                      key={m._id} 
                      layout
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                      className="p-4 border-b border-slate-50 last:border-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-3 rounded-lg text-red-500 shrink-0">
                                <FileText size={20}/>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{m.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${m.turma === 'Todas' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {m.turma === 'Todas' ? 'Público' : m.turma}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar size={12}/> {formatDate(m.createdAt)}
                                  </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <button 
                            onClick={() => setPresentationData(m)}
                            className="text-emerald-600 p-2 hover:bg-emerald-50 rounded transition-colors flex items-center gap-1 font-bold text-sm" 
                            title="Apresentar Slide"
                          >
                              <Play size={18}/> <span className="sm:hidden">Abrir</span>
                          </button>
                          <div className="w-px bg-slate-200 mx-1 hidden sm:block"></div>
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 p-2 hover:bg-blue-50 rounded transition-colors" title="Baixar / Visualizar Link Direto">
                              <Eye size={18}/>
                          </a>
                          <button onClick={() => handleDelete(m._id, 'material', m.link)} className="text-red-500 p-2 hover:bg-red-50 rounded transition-colors" title="Excluir Permanentemente">
                              <Trash2 size={18}/>
                          </button>
                        </div>
                    </motion.div>
                    )) : (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                           <Search size={24} className="opacity-50"/>
                           {searchTerm ? "Nenhum slide encontrado com esse nome." : "Nenhum slide disponível nesta categoria."}
                        </div>
                    )}
                  </AnimatePresence>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-800 border-b pb-2 border-emerald-100">
                  <Microscope className="text-emerald-600"/> Espécies ({filteredSpecies.length})
              </h2>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                layout
              >
                  <AnimatePresence mode="popLayout">
                    {filteredSpecies.map(s => (
                    <motion.div 
                      key={s._id} 
                      layout
                      onClick={() => setSelectedSpecies(s)} 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 relative group hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                            <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                              <Clock size={10}/> {formatDate(s.createdAt)}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/90 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">Ver Detalhes</span>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-slate-800 leading-tight">{s.name}</h3>
                        <p className="text-xs text-emerald-600 italic truncate mb-2">{s.scientificName}</p>
                        
                        <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${s.turma === 'Todas' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {s.turma === 'Todas' ? 'Geral' : s.turma}
                            </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s._id, 'species', s.imageUrl);
                          }}
                          className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 z-10"
                          title="Excluir Espécie"
                        >
                          <Trash2 size={16}/>
                        </button>
                    </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredSpecies.length === 0 && (
                      <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
                          <Search size={24} className="opacity-50"/>
                          {searchTerm ? "Nenhuma espécie encontrada com esse nome." : "Nenhuma espécie encontrada."}
                      </div>
                  )}
              </motion.div>
            </section>
        </div>
      )}

      <AnimatePresence>
        {selectedSpecies && (
          <SpeciesModal 
            data={selectedSpecies} 
            onClose={() => setSelectedSpecies(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {presentationData && (
          <PresentationModal 
            fileUrl={presentationData.link} 
            onClose={() => setPresentationData(null)}
          />
        )}
      </AnimatePresence>

    </AppLayout>
  );
}

function SpeciesModal({ data, onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()} 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="w-full md:w-1/2 bg-slate-100 relative h-64 md:h-auto">
          <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
             <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm text-white ${data.turma === 'Todas' ? 'bg-blue-600/90' : 'bg-emerald-600/90'}`}>
                {data.turma === 'Todas' ? 'Geral' : data.turma}
             </span>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col h-full overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800 leading-tight mb-1">{data.name}</h2>
            <p className="text-xl text-emerald-600 italic font-serif flex items-center gap-2">
              <Microscope size={18}/> {data.scientificName}
            </p>
          </div>
          <div className="prose prose-slate flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição & Curiosidades</h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-justify">{data.description}</p>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2"><Calendar size={14} /> Postado em {formatDate(data.createdAt)}</div>
            <span>ID: {data._id.slice(-6)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}