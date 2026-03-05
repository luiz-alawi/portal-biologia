'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { upload } from '@vercel/blob/client';
import { FileText, Loader2, UploadCloud, Plus, Check } from 'lucide-react';
import { TURMAS } from '@/utils/turmas';

export default function UploadSlide() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
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
      alert("Preencha o título e escolha um arquivo PDF.");
      return;
    }
    
    setLoading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          link: newBlob.url,
          turma: targetTurma,
          type: 'pdf',
          authorId: user._id
        })
      });

      if (res.ok) {
        alert("Material publicado com sucesso!");
        setTitle('');
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
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Publicar Material de Aula</h1>
          <p className="text-slate-500">Envie slides e PDFs para os alunos baixarem.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-emerald-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-800">
                <FileText className="text-emerald-600"/> Dados do Arquivo
              </h2>
              
              <form onSubmit={handlePublish}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Título da Aula</label>
                    <input 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="Ex: Aula 01 - Citologia"
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

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Arquivo PDF</label>
                  <div className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors group cursor-pointer ${loading ? 'bg-slate-50 border-slate-300' : 'bg-emerald-50/30 border-emerald-300 hover:bg-emerald-50'}`}>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={e => setFile(e.target.files[0])}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-3">
                      {loading ? (
                        <Loader2 className="animate-spin text-emerald-600" size={40}/>
                      ) : (
                        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                           <UploadCloud size={32}/>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="block text-sm font-bold text-emerald-900">
                          {file ? file.name : "Clique para selecionar o PDF"}
                        </span>
                        {!file && (
                           <span className="block text-xs text-slate-400">Suporta arquivos PDF (Vercel Blob)</span>
                        )}
                        {file && !loading && (
                           <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                             <Check size={12}/> Arquivo carregado
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={loading || !file}
                  className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition shadow-lg ${loading || !file ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
                >
                  {loading ? 'Enviando...' : <><Plus size={20}/> Publicar Material</>}
                </button>
              </form>
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-3 ml-1">Pré-visualização do Aluno</h3>
              
              <div className="bg-white rounded-xl shadow-xl shadow-emerald-900/5 overflow-hidden border border-emerald-100 h-full group select-none pointer-events-none">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl">
                      <FileText size={28} />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      {targetTurma === 'Todas' ? 'Geral' : targetTurma}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-xl mb-2 leading-tight">
                        {title || 'Título da Aula'}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-6">
                        PDF / Documento
                    </p>
                  </div>
                  
                  <div className="mt-auto w-full text-center py-3 rounded-lg border border-slate-200 text-slate-600 font-medium bg-slate-50">
                    Baixar / Visualizar
                  </div>
                </div>
              </div>
              
              <p className="text-center text-xs text-slate-400 mt-4">
                  É assim que o card aparecerá na Área de Estudo.
              </p>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}