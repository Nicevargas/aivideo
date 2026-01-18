
import React, { useState } from 'react';
import { VideoItem, UserProfile } from '../types';

interface VideoModalProps {
  video: VideoItem;
  onClose: () => void;
  onPurchase: (type: 'common' | 'exclusive') => void;
  userCredits: number;
  isOwned?: boolean;
  user: UserProfile;
  onSchedule: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose, onPurchase, userCredits, isOwned, user, onSchedule }) => {
  const [purchaseType, setPurchaseType] = useState<'common' | 'exclusive' | null>(null);

  const price = purchaseType === 'exclusive' ? video.creditsExclusive : video.creditsCommon;
  const canAfford = userCredits >= price;
  
  // Vídeos públicos são gratuitos para download
  const isFree = video.isPublic;
  const canDownloadNow = isOwned || isFree;
  
  // Verifica se o usuário tem permissão para usar o agendador (Premium = 3)
  const isSchedulerAllowed = user.acesso_prof_usuario === 3;

  const handleDownload = async () => {
    if (!video.videoUrl) return;
    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title.replace(/\s+/g, '_')}_IA_Video.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed', error);
      alert('Erro ao baixar o vídeo. Tente abrir em uma nova aba.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="glass w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="w-full bg-black aspect-[9/16] max-h-[60vh] flex items-center justify-center overflow-hidden rounded-t-2xl">
          <video 
            src={video.videoUrl} 
            controls 
            autoPlay 
            loop 
            className="h-full w-auto object-contain"
          />
        </div>

        <div className="p-6 flex flex-col bg-slate-900">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">{video.title}</h2>
            <div className="flex items-center gap-2">
               <p className="text-sm text-slate-400">Criado por @{video.author}</p>
               {isFree && (
                 <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest">Público</span>
               )}
            </div>
          </div>

          {canDownloadNow ? (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-emerald-500"></i>
                <p className="text-emerald-400 text-sm font-medium">
                  {isFree ? 'Este vídeo é público e gratuito!' : 'Você já possui este vídeo!'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <i className="fa-solid fa-download"></i>
                  Baixar Vídeo
                </button>
                
                <button 
                  onClick={onSchedule}
                  disabled={!isSchedulerAllowed}
                  className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isSchedulerAllowed 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                  title={isSchedulerAllowed ? "Programar postagem" : "Recurso disponível apenas para assinantes Premium"}
                >
                  <i className={`fa-solid ${isSchedulerAllowed ? 'fa-calendar-check' : 'fa-lock'}`}></i>
                  {isSchedulerAllowed ? 'Programar' : 'Bloqueado'}
                </button>
              </div>
              
              {!isSchedulerAllowed && (
                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
                  Agendamento requer plano Premium
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {video.tags?.map(tag => (
                    <span key={tag} className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded">#{tag}</span>
                  ))}
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Licenciamento Reels:</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPurchaseType('common')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${purchaseType === 'common' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-800/50'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-sm text-white text-center">Uso Social</span>
                        <div className="flex items-center gap-1 text-blue-400">
                          <i className="fa-solid fa-coins text-xs"></i>
                          <span className="font-bold">{video.creditsCommon}</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => !video.isExclusiveSold && setPurchaseType('exclusive')}
                      className={`p-3 rounded-xl border transition-all ${video.isExclusiveSold ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'} ${purchaseType === 'exclusive' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-800/50'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-sm text-white text-center">Exclusivo</span>
                        <div className="flex items-center gap-1 text-purple-400">
                          <i className="fa-solid fa-coins text-xs"></i>
                          <span className="font-bold">{video.creditsExclusive}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800">
                {purchaseType && (
                  <div className="mb-4 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Saldo: <b className="text-white font-mono">{userCredits}</b></span>
                    <span className={`${canAfford ? 'text-green-400' : 'text-red-400'} font-bold`}>Total: -{price} créditos</span>
                  </div>
                )}
                
                <button 
                  disabled={!purchaseType || !canAfford}
                  onClick={() => purchaseType && onPurchase(purchaseType)}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                    !purchaseType 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : !canAfford
                    ? 'bg-red-900/50 text-red-400 cursor-not-allowed'
                    : purchaseType === 'exclusive'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-blue-600 text-white'
                  }`}
                >
                  {!purchaseType ? 'Escolha um plano' : !canAfford ? 'Saldo insuficiente' : 'Liberar e Baixar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
