
import React, { useState } from 'react';
import { VideoProductionService } from '../services/videoService';
import { VideoCategory, UserProfile, VideoItem } from '../types';
import { COST_PUBLIC, COST_PRIVATE } from '../constants';

interface CreateVideoProps {
  onVideoGenerated: (video: VideoItem) => void;
  user: UserProfile;
}

const CreateVideo: React.FC<CreateVideoProps> = ({ onVideoGenerated, user }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<VideoCategory>('motivational');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCost = isPublic ? COST_PUBLIC : COST_PRIVATE;

  const handleRequestProduction = async () => {
    if (!prompt.trim()) return;
    if (user.credits < currentCost) {
      alert(`Saldo insuficiente. Você precisa de ${currentCost} créditos para esta produção.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const service = VideoProductionService.getInstance();
      const success = await service.requestProduction(prompt, category, user.id, isPublic);
      
      if (success) {
        const newVideo: VideoItem = {
          id: `prod-${Date.now()}`,
          title: `Criação: ${prompt.slice(0, 15)}...`,
          thumbnail: 'https://picsum.photos/seed/production/400/711',
          videoUrl: service.getPlaceholderVideo(category),
          author: user.display_name,
          ownerId: user.id,
          isPublic: isPublic,
          creditsCommon: COST_PUBLIC,
          creditsExclusive: COST_PRIVATE,
          isExclusiveSold: !isPublic,
          createdAt: Date.now(),
          category: category,
          tags: ['IA', category, isPublic ? 'Público' : 'Exclusivo']
        };

        alert('Sua solicitação foi aceita! O vídeo será gerado automaticamente e aparecerá na sua biblioteca em instantes.');
        onVideoGenerated(newVideo);
        setPrompt('');
      }
    } catch (error) {
      alert('Erro ao iniciar produção. Tente novamente em alguns segundos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold text-white">Gerar <span className="gradient-text">Vídeo Original</span></h2>
        <p className="text-slate-400">Descreva sua ideia e nossa tecnologia cuidará do resto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 glass p-8 rounded-[2.5rem] border-slate-800 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">O que você quer criar?</label>
            <textarea 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-white text-lg focus:border-indigo-500 outline-none transition-all min-h-[150px] placeholder:text-slate-600"
              placeholder="Descreva a cena detalhadamente para uma melhor geração..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">Estilo do Vídeo</label>
            <div className="grid grid-cols-3 gap-4">
              {(['timelapse', 'animated_character', 'motivational'] as VideoCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  disabled={isSubmitting}
                  className={`py-4 rounded-2xl text-xs font-bold uppercase transition-all border ${
                    category === cat 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cat === 'timelapse' ? 'Timelapse' : cat === 'animated_character' ? 'Animação' : 'Motivacional'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest">Visibilidade e Custo</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsPublic(true)}
                disabled={isSubmitting}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                  isPublic 
                    ? 'bg-emerald-600/20 border-emerald-500 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase">
                  <i className="fa-solid fa-globe"></i>
                  Público
                </div>
                <span className="text-[10px] opacity-70">Disponível na Galeria</span>
                <span className="text-xs font-black mt-1 text-emerald-400">{COST_PUBLIC} Créditos</span>
              </button>

              <button
                onClick={() => setIsPublic(false)}
                disabled={isSubmitting}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                  !isPublic 
                    ? 'bg-purple-600/20 border-purple-500 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs uppercase">
                  <i className="fa-solid fa-lock"></i>
                  Privado
                </div>
                <span className="text-[10px] opacity-70">Apenas para você</span>
                <span className="text-xs font-black mt-1 text-purple-400">{COST_PRIVATE} Créditos</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handleRequestProduction}
            disabled={isSubmitting || !prompt.trim()}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl ${
              isSubmitting || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] shadow-indigo-600/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-gear fa-spin"></i>
                Iniciando Geração...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Solicitar Produção (-{currentCost} créditos)
              </>
            )}
          </button>
        </div>

        <div className="glass p-8 rounded-[2rem] border-slate-800 space-y-6">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <i className="fa-solid fa-bolt text-yellow-400"></i>
            Como funciona?
          </h3>
          <ul className="space-y-5 text-xs text-slate-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">1</span>
              <p>Sua ideia é enviada para nossa fila de processamento inteligente.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">2</span>
              <p>O vídeo será <span className="text-indigo-300 font-bold">gerado automaticamente</span> por nossa tecnologia.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">3</span>
              <p>Ao escolher <span className="text-emerald-400 font-bold">Público</span>, o custo é menor pois o vídeo entra na galeria geral.</p>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">4</span>
              <p>Ao escolher <span className="text-purple-400 font-bold">Privado</span>, o vídeo é exclusivo e ninguém mais poderá usá-lo.</p>
            </li>
          </ul>
          
          <div className="pt-6 border-t border-slate-800">
             <div className="bg-indigo-600/10 p-4 rounded-xl border border-indigo-500/20">
                <p className="text-[10px] text-indigo-200 leading-relaxed font-medium italic">
                  "Utilizamos processamento externo de alta performance para garantir resultados cinematográficos em cada solicitação."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideo;
