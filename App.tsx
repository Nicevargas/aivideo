
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import VideoCard from './components/VideoCard';
import VideoModal from './components/VideoModal';
import CreditStore from './components/CreditStore';
import CreateVideo from './components/CreateVideo';
import VideoLibrary from './components/VideoLibrary';
import ProfileModal from './components/ProfileModal';
import VideoScheduler from './components/VideoScheduler';
import { ViewType, VideoItem, UserProfile } from './types';
import { INITIAL_DATABASE, MOCK_USERS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [view, setView] = useState<ViewType>('gallery');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    taxId: ''
  });

  const [dbVideos, setDbVideos] = useState<VideoItem[]>(INITIAL_DATABASE);
  const [selectedItem, setSelectedItem] = useState<VideoItem | null>(null);
  const [myVideos, setMyVideos] = useState<VideoItem[]>([]);

  // Função para buscar créditos atualizados diretamente da tabela profiles
  const refreshUserCredits = useCallback(async () => {
    if (!user || user.id.startsWith('mock-')) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (data && !error) {
        setUser(prev => prev ? { ...prev, credits: data.credits } : null);
      }
    } catch (err) {
      console.error("Erro ao sincronizar créditos da tabela profiles:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        if (!isSupabaseConfigured) {
          setLoadingSession(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user);
        } else {
          setLoadingSession(false);
        }
      } catch (e) {
        setLoadingSession(false);
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user);
        if (event === 'SIGNED_IN') setView('gallery');
      } else {
        if (user && !user.id.startsWith('mock-')) {
          setUser(null);
        }
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitoramento em tempo real do saldo de créditos na tabela profiles
  useEffect(() => {
    if (!user || user.id.startsWith('mock-') || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`credits_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && typeof payload.new.credits === 'number') {
            console.log("Saldo atualizado via Realtime (profiles):", payload.new.credits);
            setUser(prev => prev ? { ...prev, credits: payload.new.credits } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Força atualização de créditos ao mudar de aba para garantir precisão
  useEffect(() => {
    if (view !== 'auth' && user) refreshUserCredits();
  }, [view, user?.id, refreshUserCredits]);

  const fetchProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        const displayName = authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Usuário';
        const profileData = {
          id: authUser.id,
          display_name: displayName,
          credits: 50,
          acesso_prof_usuario: 3,
        };

        const { data: upsertedData } = await supabase
          .from('profiles')
          .upsert([profileData])
          .select()
          .single();

        if (upsertedData) {
          setUser({
            id: upsertedData.id,
            display_name: upsertedData.display_name,
            email: authUser.email,
            credits: upsertedData.credits,
            acesso_prof_usuario: 3,
            phone: upsertedData.phone || '',
            taxId: upsertedData.tax_id || '',
            avatar_url: upsertedData.avatar_url || ''
          });
        }
      } else {
        setUser({
          id: data.id,
          display_name: data.display_name,
          email: authUser.email,
          credits: data.credits ?? 0,
          acesso_prof_usuario: data.acesso_prof_usuario,
          phone: data.phone || '',
          taxId: data.tax_id || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil da tabela profiles:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const input = authForm.email.trim();
    
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.${input},email.eq.${input.toLowerCase()},phone.eq.${input}`)
        .maybeSingle();

      if (existingProfile && (existingProfile.display_name === 'Eunice' || existingProfile.display_name === 'Osmar')) {
        setUser({
          ...existingProfile,
          email: existingProfile.email || `${existingProfile.display_name.toLowerCase()}@demo.com`
        });
        setView('gallery');
        setIsSubmitting(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: authForm.email.toLowerCase(),
        password: authForm.password,
      });

      if (authError) {
        const mockUser = MOCK_USERS.find(u => 
          u.display_name.toLowerCase() === input.toLowerCase() || 
          u.phone === input
        );

        if (mockUser) {
          setUser({ ...mockUser, credits: 500, email: `${mockUser.display_name.toLowerCase()}@demo.com` });
          setView('gallery');
        } else {
          throw authError;
        }
      }
    } catch (err: any) {
      alert(`Erro de Acesso: ${err.message || "Credenciais não encontradas."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (name: string) => {
    setIsSubmitting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('display_name', name)
        .maybeSingle();

      if (profile) {
        setUser({
          ...profile,
          email: profile.email || `${name.toLowerCase()}@demo.com`
        });
      } else {
        const mock = MOCK_USERS.find(u => u.display_name === name);
        if (mock) setUser({ ...mock, credits: 500, email: `${name.toLowerCase()}@demo.com` });
      }
      setView('gallery');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email.toLowerCase(),
        password: authForm.password,
        options: {
          data: {
            display_name: authForm.name,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        alert('Cadastro realizado! Verifique seu e-mail.');
        setAuthMode('login');
      } else if (data.session) {
        setView('gallery');
      }
    } catch (err: any) {
      alert(`Erro ao cadastrar: ${err.message || "Tente novamente mais tarde."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>, file?: File) => {
    if (!user) return;
    try {
      if (!user.id.startsWith('mock-')) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: updatedData.display_name,
            phone: updatedData.phone,
            tax_id: updatedData.taxId,
            avatar_url: updatedData.avatar_url
          })
          .eq('id', user.id);
        if (error) throw error;
      }
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      throw err;
    }
  };

  const handlePurchase = (type: 'common' | 'exclusive') => {
    if (!user || !selectedItem) return;
    const cost = type === 'exclusive' ? selectedItem.creditsExclusive : selectedItem.creditsCommon;
    
    if (user.credits >= cost) {
      const newCredits = user.credits - cost;
      setUser({ ...user, credits: newCredits });
      setMyVideos(prev => [...prev, { ...selectedItem, id: `${selectedItem.id}-copy-${Date.now()}` }]);
      
      if (!user.id.startsWith('mock-')) {
        supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id).then();
      }
      
      alert('Vídeo desbloqueado com sucesso!');
      setSelectedItem(null);
    } else {
      alert('Saldo insuficiente.');
      setView('buy-credits');
      setSelectedItem(null);
    }
  };

  const handleVideoGenerated = (newVideo: VideoItem) => {
    setMyVideos(prev => [newVideo, ...prev]);
    if (user) {
      const newCredits = user.credits - 50;
      setUser({ ...user, credits: newCredits });
      if (!user.id.startsWith('mock-')) {
        supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id).then();
      }
    }
    setView('my-videos');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Sincronizando dados...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass w-full max-w-md p-8 rounded-3xl space-y-8 border-indigo-500/20">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20 mb-4">
              <i className="fa-solid fa-lock-open text-3xl text-white"></i>
            </div>
            <h2 className="text-3xl font-bold text-white">IA-Video Hub</h2>
            <p className="text-slate-400 text-sm">Entre com seu identificador cadastrado</p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Nome Completo"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                value={authForm.name}
                onChange={e => setAuthForm({...authForm, name: e.target.value})}
                required
              />
            )}
            <input
              type="text"
              placeholder="E-mail, Nome ou Telefone"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            {(authMode === 'register' || (authMode === 'login' && authForm.email.toLowerCase() !== 'eunice' && authForm.email.toLowerCase() !== 'osmar')) && (
               <input
                type="password"
                placeholder="Senha"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
                required
              />
            )}
            <button
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : (authMode === 'login' ? 'Entrar Agora' : 'Criar Conta')}
            </button>
          </form>

          {authMode === 'login' && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleDemoLogin('Eunice')} disabled={isSubmitting} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                Eunice
              </button>
              <button onClick={() => handleDemoLogin('Osmar')} disabled={isSubmitting} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2">
                Osmar
              </button>
            </div>
          )}

          <div className="text-center">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-slate-400 text-sm hover:text-white transition-colors">
              {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já possui conta? Faça o login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      credits={user.credits} 
      user={user}
      onProfileClick={() => setIsProfileModalOpen(true)}
    >
      {view === 'gallery' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Explorar Galeria</h2>
            <p className="text-slate-400">Vídeos profissionais prontos para uso</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {dbVideos.map(video => (
              <VideoCard key={video.id} video={video} onSelect={setSelectedItem} />
            ))}
          </div>
        </div>
      )}

      {view === 'create' && <CreateVideo onVideoGenerated={handleVideoGenerated} user={user} />}
      {view === 'my-videos' && <VideoLibrary videos={myVideos} onSelect={setSelectedItem} />}
      {view === 'scheduler' && <VideoScheduler myVideos={myVideos} user={user} />}
      {view === 'buy-credits' && <CreditStore user={user} onPaymentSuccess={refreshUserCredits} />}

      {selectedItem && (
        <VideoModal 
          video={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onPurchase={handlePurchase}
          userCredits={user.credits}
          isOwned={myVideos.some(v => v.id.startsWith(selectedItem.id))}
          user={user}
          onSchedule={() => {
            setView('scheduler');
            setSelectedItem(null);
          }}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal 
          user={user} 
          onClose={() => setIsProfileModalOpen(false)} 
          onUpdate={handleUpdateProfile} 
        />
      )}
    </Layout>
  );
};

export default App;
