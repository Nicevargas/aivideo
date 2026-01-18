
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (updatedData: Partial<UserProfile>, file?: File) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    display_name: user.display_name || '',
    phone: user.phone || '',
    taxId: user.taxId || '',
    avatar_url: user.avatar_url || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (showSuccess) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Imagem muito grande. Escolha uma foto menor que 2MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate(formData, selectedFile);
      setShowSuccess(true);
      // Aguarda 2 segundos para o usuário ver a mensagem de sucesso antes de fechar
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      alert(`Erro ao atualizar perfil: ${error.message || "Tente novamente mais tarde."}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-slate-800 space-y-6 animate-in zoom-in duration-300 relative overflow-hidden">
        
        {/* Camada de Sucesso */}
        {showSuccess && (
          <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 animate-bounce">
              <i className="fa-solid fa-check text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Perfil Atualizado!</h3>
            <p className="text-slate-400 text-sm">Suas alterações foram salvas com sucesso em nosso sistema.</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-3 pb-2">
          <div 
            onClick={handleImageClick}
            className="group relative w-24 h-24 rounded-full overflow-hidden cursor-pointer ring-4 ring-indigo-600/30 hover:ring-indigo-500 transition-all shadow-xl shadow-indigo-500/20 bg-slate-800 flex items-center justify-center"
          >
            {formData.avatar_url ? (
              <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
            ) : (
              <i className="fa-solid fa-user text-3xl text-slate-500 group-hover:opacity-50 transition-opacity"></i>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <i className="fa-solid fa-camera text-white text-xl"></i>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2">Toque na imagem para alterar</p>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">{user.id.startsWith('mock-') ? 'Conta Demo' : 'Usuário Registrado'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome de Exibição</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              value={formData.display_name}
              onChange={e => setFormData({ ...formData, display_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Telefone / WhatsApp</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">CPF / CNPJ</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
              value={formData.taxId}
              onChange={e => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="000.000.000-00"
            />
          </div>

          <button
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-save text-sm"></i> Salvar Alterações</>}
          </button>
        </form>

        <button 
          onClick={() => window.location.reload()}
          className="w-full text-center text-xs text-red-400 hover:text-red-300 transition-colors font-medium mt-2"
        >
          Sair da Conta (Logout)
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
