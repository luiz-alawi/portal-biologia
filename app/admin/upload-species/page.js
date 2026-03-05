'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { upload } from '@vercel/blob/client';
import { Microscope, Loader2, UploadCloud, Plus } from 'lucide-react';
import { TURMAS } from '@/utils/turmas';

export default function UploadSpecies() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [description, setDescription] = useState('');
  const [targetTurma, setTargetTurma] = useState('Todas');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('CSCJUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert("Preencha o nome e escolha uma imagem.");
      return;
    }
    
    setLoading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      const res = await fetch('/api/species', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          scientificName,
          imageUrl: newBlob.url,
          description,
          turma: targetTurma,
          authorId: user._id
        })
      });

      if (res.ok) {
        alert("Espécie catalogada com sucesso!");
        setTitle('');
        setScientificName('');
        setDescription('');
        setFile(null);
      } else {
        alert("Erro ao salvar no banco de dados.");
      }

    } catch (err) {
      console.error(err);
      alert("Erro no upload: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout userData={user}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Catalogar Nova Espécie</h1>
          <p className="text-slate-500">Adicione fotos e informações sobre animais e plantas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {}
          <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-emerald-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800">
              <Microscope className="text-emerald-600"/> Dados da Espécie
            </h2>
            
            <form onSubmit={handlePublish}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome Popular</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Onça Pintada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Visível para</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    value={targetTurma}
                    onChange={e => setTargetTurma(e.target.value)}
                  >
                    <option value="Todas">Todas as Turmas</option>
                    {}
                    {TURMAS.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome Científico</label>
                <input 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all italic"
                  value={scientificName}
                  onChange={e => setScientificName(e.target.value)}
                  placeholder="Ex: Panthera onca"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrição e Curiosidades</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all h-32 resize-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva o habitat, alimentação, características..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Foto da Espécie</label>
                <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${loading ? 'bg-slate-50 border-slate-300' : 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50'}`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFile(e.target.files[0])}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {loading ? (
                      <Loader2 className="animate-spin text-emerald-600" size={32}/>
                    ) : (
                      <UploadCloud className="text-emerald-500" size={32}/>
                    )}
                    <span className="text-sm font-medium text-emerald-900">
                      {file ? file.name : "Clique para selecionar a imagem"}
                    </span>
                    <span className="text-xs text-slate-500">Suporta JPG, PNG, GIF</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={loading || !file}
                className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition ${loading || !file ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'}`}
              >
                {loading ? 'Enviando...' : <><Plus size={20}/> Catalogar Espécie</>}
              </button>
            </form>
          </div>

          {}
          <div className="md:col-span-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pré-visualização</p>
            <div className="bg-white rounded-xl shadow-lg shadow-emerald-900/5 overflow-hidden border border-emerald-100 h-fit">
              <div className="h-48 overflow-hidden relative bg-slate-200">
                <img 
                  src={file ? URL.createObjectURL(file) : "https://via.placeholder.com/400x300?text=Sem+Imagem"} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="text-white text-[10px] font-bold bg-emerald-600/90 backdrop-blur-sm px-2 py-1 rounded">
                    {targetTurma}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 text-xl leading-tight mb-1">{title || "Nome da Espécie"}</h3>
                <p className="text-emerald-600 italic text-sm mb-4 font-serif">{scientificName || "Nome Científico"}</p>
                <p className="text-slate-500 text-sm line-clamp-4">
                  {description || "A descrição da espécie aparecerá aqui..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}