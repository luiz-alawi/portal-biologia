'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  FileText, Search, Calendar, Clock, X, 
  Microscope, Play, Download 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const PresentationModal = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => null 
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Data desconhecida';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [species, setSpecies] = useState([]);
  const [activeTab, setActiveTab] = useState('slides');
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [presentationData, setPresentationData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('CSCJUser');
    if (saved) {
        const u = JSON.parse(saved);
        setUser(u);
        
        Promise.all([
          fetch(`/api/materials?turma=${u.turma}`).then(r=>r.json()),
          fetch(`/api/species?turma=${u.turma}`).then(r=>r.json())
        ]).then(([matData, specData]) => {
          setMaterials(matData);
          setSpecies(specData);
          setTimeout(() => setLoading(false), 800);
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  const filteredMaterials = materials.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecies = species.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <AppLayout userData={user}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
        >
          <h1 className="text-3xl font-bold text-slate-800">Olá, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">
            Conteúdos para o <span className="font-bold text-emerald-600">{user.turma}</span>.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="relative w-full md:w-72 group"
        >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm"
                placeholder="Buscar conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </motion.div>
      </div>

      <div className="flex gap-6 mb-8 border-b border-slate-200">
        {['slides', 'species'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium transition-colors relative ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'slides' ? 'Slides & PDFs' : 'Catálogo de Espécies'}
            {activeTab === tab && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
                <SkeletonCard key={n} type={activeTab} />
            ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeTab === 'slides' ? (
              filteredMaterials.length > 0 ? (
                filteredMaterials.map(item => (
                  <motion.div variants={itemVariants} key={item._id}>
                    <MaterialCard 
                      data={item} 
                      onPresent={() => setPresentationData(item)} 
                    />
                  </motion.div>
                ))
              ) : (
                <EmptyState text={searchTerm ? "Nenhum resultado para sua busca." : "Nenhum slide disponível no momento."} />
              )
            ) : (
              filteredSpecies.length > 0 ? (
                filteredSpecies.map(item => (
                  <motion.div variants={itemVariants} key={item._id}>
                    <SpeciesCard data={item} onClick={() => setSelectedSpecies(item)} />
                  </motion.div>
                ))
              ) : (
                <EmptyState text={searchTerm ? "Nenhum resultado para sua busca." : "Nenhuma espécie catalogada ainda."} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {selectedSpecies && <SpeciesModal data={selectedSpecies} onClose={() => setSelectedSpecies(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {presentationData && <PresentationModal fileUrl={presentationData.link} onClose={() => setPresentationData(null)} />}
      </AnimatePresence>

    </AppLayout>
  );
}


function SkeletonCard({ type }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col animate-pulse">
        {}
        <div className={`w-full bg-slate-200 ${type === 'slides' ? 'h-4' : 'h-48'}`}></div>
        
        <div className="p-5 flex-1 flex flex-col gap-3">
             {}
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            {}
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            
            {}
            <div className="flex-1"></div>
            
            {}
            <div className="flex gap-2 mt-4">
                <div className="h-10 bg-slate-200 rounded flex-1"></div>
                {type === 'slides' && <div className="h-10 bg-slate-200 rounded flex-1"></div>}
            </div>
        </div>
    </div>
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

function MaterialCard({ data, onPresent }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl shadow-emerald-900/5 overflow-hidden border border-emerald-100 h-full flex flex-col transition-shadow"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <FileText size={24} />
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${data.turma === 'Todas' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
            {data.turma === 'Todas' ? 'Público' : `Turma ${data.turma}`}
          </span>
        </div>
        
        <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{data.title}</h3>
        
        <div className="flex items-center gap-4 text-slate-400 text-xs mb-6 mt-2">
            <span className="font-bold uppercase tracking-wide">PDF</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(data.createdAt)}</span>
        </div>
        
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button 
            onClick={onPresent}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            <Play size={16} /> Apresentar
          </button>
          
          <a 
            href={data.link} 
            download
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            <Download size={16} /> Baixar
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function SpeciesCard({ data, onClick }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick} 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl shadow-emerald-900/5 overflow-hidden border border-emerald-100 h-full flex flex-col transition-shadow group cursor-pointer"
    >
      <div className="h-48 overflow-hidden relative bg-slate-200">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
          src={data.imageUrl} 
          alt={data.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=Sem+Imagem"; }}
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <span className={`text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm text-white ${data.turma === 'Todas' ? 'bg-blue-600/90' : 'bg-emerald-600/90'}`}>
              {data.turma === 'Todas' ? 'Geral' : data.turma}
            </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">Ver Detalhes</span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800 text-xl leading-tight">{data.name}</h3>
        <p className="text-emerald-600 italic text-sm mb-4 font-serif">{data.scientificName}</p>
        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-1 mb-4">{data.description}</p>
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            <span>Postado em {formatDate(data.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4"><Search size={32} className="text-slate-300" /></div>
      <p className="font-medium text-slate-500">{text}</p>
    </div>
  );
}