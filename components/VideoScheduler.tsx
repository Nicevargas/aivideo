
import React, { useState } from 'react';
import { VideoItem, ScheduledPost, UserProfile } from '../types';

interface VideoSchedulerProps {
  myVideos: VideoItem[];
  user: UserProfile;
}

const VideoScheduler: React.FC<VideoSchedulerProps> = ({ myVideos, user }) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      videoId: 'v-001',
      videoTitle: 'Cyberpunk Vertical',
      thumbnail: 'https://picsum.photos/seed/cyber/400/711',
      platform: 'instagram',
      scheduledAt: '2023-11-20T18:00',
      caption: 'Incrível cidade futurista! #cyberpunk #ia',
      status: 'pending'
    }
  ]);

  const [isScheduling, setIsScheduling] = useState(false);
  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({
    platform: 'instagram',
    scheduledAt: '',
    caption: ''
  });

  // O agendador só está ativo para usuários com nível de acesso 3 (Premium/Reels Engine)
  const isSchedulerAllowed = user.acesso_prof_usuario === 3;

  const handleAddSchedule = () => {
    if (!newPost.videoId || !newPost.scheduledAt) return;
    
    const video = myVideos.find(v => v.id === newPost.videoId);
    if (!video) return;

    const post: ScheduledPost = {
      id: Date.now().toString(),
      videoId: video.id,
      videoTitle: video.title,
      thumbnail: video.thumbnail,
      platform: newPost.platform as any,
      scheduledAt: newPost.scheduledAt as string,
      caption: newPost.caption || '',
      status: 'pending'
    };

    setScheduledPosts([post, ...scheduledPosts]);
    setIsScheduling(false);
    setNewPost({ platform: 'instagram', scheduledAt: '', caption: '' });
  };

  const handleOpenScheduling = () => {
    if (!isSchedulerAllowed) {
      alert("Recurso exclusivo para assinantes Premium. Verifique o status do seu perfil.");
      return;
    }
    setIsScheduling(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white">Agendador de <span className="gradient-text">Postagens</span></h2>
          <p className="text-slate-400">Programe seus Reels automaticamente para as redes sociais.</p>
        </div>
        <button 
          onClick={handleOpenScheduling}
          disabled={!isSchedulerAllowed}
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg ${
            isSchedulerAllowed 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isSchedulerAllowed ? (
            <>
              <i className="fa-solid fa-calendar-plus"></i>
              Novo Agendamento
            </>
          ) : (
            <>
              <i className="fa-solid fa-lock"></i>
              Recurso Bloqueado
            </>
          )}
        </button>
      </div>

      {!isSchedulerAllowed && (
        <div className="glass p-6 rounded-2xl border-yellow-500/20 bg-yellow-500/5 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">Upgrade Necessário</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              O agendamento automático de vídeos é um recurso exclusivo do plano <span className="text-white font-bold">Premium</span>. Complete seu cadastro ou adquira créditos para liberar esta funcionalidade.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Agendados */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Próximas Postagens</h3>
          
          {scheduledPosts.length === 0 ? (
            <div className="glass p-12 rounded-[2.5rem] border-slate-800 text-center space-y-4">
              <i className="fa-solid fa-calendar-day text-4xl text-slate-800"></i>
              <p className="text-slate-500 font-medium">Nenhuma postagem programada ainda.</p>
            </div>
          ) : (
            scheduledPosts.map(post => (
              <div key={post.id} className="glass p-4 rounded-3xl border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-all">
                <div className="w-16 h-24 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                  <img src={post.thumbnail} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{post.videoTitle}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1">
                      <i className="fa-solid fa-clock"></i>
                      {new Date(post.scheduledAt).toLocaleString()}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      post.platform === 'instagram' ? 'bg-pink-500/10 text-pink-500' :
                      post.platform === 'tiktok' ? 'bg-slate-100 text-slate-900' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {post.platform}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 truncate italic">"{post.caption}"</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                    {post.status === 'pending' ? 'Pendente' : 'Concluído'}
                  </span>
                  <button className="text-slate-600 hover:text-red-400 transition-colors">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumo/Status */}
        <div className="space-y-6">
           <div className="glass p-6 rounded-[2rem] border-slate-800">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-indigo-400"></i>
                Visão Geral
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="text-2xl font-black text-white">{scheduledPosts.length}</span>
                    <p className="text-[9px] text-slate-500 font-black uppercase">Programados</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="text-2xl font-black text-emerald-400">0</span>
                    <p className="text-[9px] text-slate-500 font-black uppercase">Postados</p>
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-[2rem] border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-yellow-400"></i>
                Dica Pro
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Postar Reels entre as <span className="text-white font-bold">18:00 e 21:00</span> costuma gerar 30% mais engajamento no Brasil.
              </p>
           </div>
        </div>
      </div>

      {/* MODAL DE NOVO AGENDAMENTO */}
      {isScheduling && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass w-full max-w-lg p-8 rounded-[3rem] border-slate-800 space-y-6 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white">Novo Agendamento</h3>
              <button onClick={() => setIsScheduling(false)} className="text-slate-500 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Escolha o Vídeo</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  value={newPost.videoId}
                  onChange={e => setNewPost({...newPost, videoId: e.target.value})}
                >
                  <option value="">Selecione um vídeo da sua biblioteca...</option>
                  {myVideos.map(v => (
                    <option key={v.id} value={v.id}>{v.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">2. Plataforma</label>
                <div className="grid grid-cols-3 gap-3">
                  {['instagram', 'tiktok', 'youtube'].map(plat => (
                    <button 
                      key={plat}
                      onClick={() => setNewPost({...newPost, platform: plat as any})}
                      className={`py-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                        newPost.platform === plat 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. Horário</label>
                <input 
                  type="datetime-local"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                  value={newPost.scheduledAt}
                  onChange={e => setNewPost({...newPost, scheduledAt: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">4. Legenda</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none h-24 resize-none"
                  placeholder="Escreva a legenda e hashtags..."
                  value={newPost.caption}
                  onChange={e => setNewPost({...newPost, caption: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleAddSchedule}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
            >
              Programar Reels
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoScheduler;
