
import React, { useState, useEffect } from 'react';
import { CreditPackage, PaymentResponse, UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface CreditStoreProps {
  user: UserProfile;
  onPaymentSuccess: () => void;
}

const CreditStore: React.FC<CreditStoreProps> = ({ user, onPaymentSuccess }) => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('tipo_acesso', 3)
        .order('price', { ascending: true });

      if (error) throw error;
      
      const mappedPackages = (data || []).map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        credits: Number(pkg.credits) || 0,
        popular: pkg.popular,
        bestValue: pkg.best_value
      }));

      setPackages(mappedPackages);
      
      const initialQuantities: Record<string, number> = {};
      mappedPackages.forEach(pkg => {
        initialQuantities[pkg.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    const qty = quantities[pkg.id] || 1;
    setLoadingPurchase(pkg.id);
    
    try {
      const valorTotal = pkg.price * qty;
      const quantidadeTotal = pkg.credits * qty;

      const response = await fetch('https://n8n-n8n.6wqa93.easypanel.host/webhook/pgtosite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: user.display_name,
          email: user.email,
          doc: user.taxId || '',
          valor: valorTotal,
          quantidade: quantidadeTotal,
          descrição: pkg.name,
          telefone: user.phone || '',
          id_user: user.id
        })
      });

      if (!response.ok) throw new Error('Erro ao processar pagamento');
      
      const data = await response.json();
      setPaymentData(data);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar cobrança. Tente novamente mais tarde.');
    } finally {
      setLoadingPurchase(null);
    }
  };

  const copyToClipboard = () => {
    if (paymentData?.qrcode) {
      navigator.clipboard.writeText(paymentData.qrcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingPackages) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Buscando melhores ofertas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
          <i className="fa-solid fa-shield-check"></i>
          Ambiente 100% Seguro
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white">
          Turbine seus <span className="gradient-text">Créditos</span>
        </h2>
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-slate-400 text-lg">
            Selecione a quantidade de pacotes Pro e continue gerando vídeos incríveis.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-check-circle"></i>
              Sem Mensalidades
            </span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-check-circle"></i>
              Pagamento Único
            </span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-check-circle"></i>
              Uso Vitalício
            </span>
          </div>
        </div>
      </div>

      {!paymentData ? (
        packages.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const qty = quantities[pkg.id] || 1;
                const totalPrice = pkg.price * qty;

                return (
                  <div 
                    key={pkg.id}
                    className={`relative glass p-8 rounded-[3rem] flex flex-col items-center text-center space-y-10 border-2 transition-all duration-300 hover:translate-y-[-8px] shadow-2xl ${
                      pkg.popular ? 'border-indigo-500 bg-indigo-500/10 shadow-indigo-500/20' : 
                      pkg.bestValue ? 'border-pink-500 bg-pink-500/10 shadow-pink-500/20' : 
                      'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-slate-950">
                        🔥 Mais Popular
                      </div>
                    )}
                    {pkg.bestValue && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-slate-950">
                        💎 Melhor Valor
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-white">{pkg.name}</h3>
                    </div>

                    <div className="flex flex-col items-center gap-3 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 w-full">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Quantidade de Pacotes</span>
                      <div className="flex items-center gap-8">
                        <button 
                          onClick={() => updateQuantity(pkg.id, -1)}
                          className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all bg-slate-800/50"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="text-3xl font-black text-white min-w-[30px]">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(pkg.id, 1)}
                          className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all bg-slate-800/50"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

                    <div className="space-y-6 w-full">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Investimento Total</span>
                        <span className="text-5xl font-black text-white tracking-tighter">
                          R$ {totalPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-1">
                          <i className="fa-solid fa-calendar-xmark text-[8px]"></i>
                          Pagamento Único
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handlePurchase(pkg)}
                        disabled={!!loadingPurchase}
                        className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                          pkg.popular ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30' : 
                          pkg.bestValue ? 'bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/30' : 
                          'bg-slate-700 hover:bg-slate-600 shadow-lg'
                        }`}
                      >
                        {loadingPurchase === pkg.id ? (
                          <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                        ) : (
                          <>
                            <i className="fa-brands fa-pix text-lg"></i>
                            Gerar PIX
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banner de Garantia */}
            <div className="glass p-10 rounded-[3rem] border-slate-800 flex flex-col md:flex-row items-center gap-8 text-center md:text-left bg-indigo-500/5">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-lock-keyhole text-3xl text-indigo-400"></i>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">Compra Segura & Transparente</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Os créditos comprados nesta página <span className="text-white font-bold">serão cobrados apenas uma única vez</span>. Não trabalhamos com assinaturas recorrentes automáticas. Você compra, usa e, se precisar de mais, volta aqui quando quiser. Seus dados e sua privacidade são nossa prioridade.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[150px]">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase">
                  <i className="fa-solid fa-shield-halved text-indigo-500"></i>
                  SSL Criptografado
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase">
                  <i className="fa-brands fa-pix text-indigo-500"></i>
                  Liberação Imediata
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-[2.5rem] border-slate-800">
            <i className="fa-solid fa-store-slash text-4xl text-slate-700 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-400">Nenhum pacote Pro disponível no momento.</h3>
            <p className="text-slate-500 text-sm mt-2">Tente atualizar a página ou volte em instantes.</p>
            <button onClick={fetchPackages} className="mt-6 text-indigo-400 font-bold hover:underline">
              Tentar novamente
            </button>
          </div>
        )
      ) : (
        <div className="max-w-md mx-auto glass p-10 rounded-[3.5rem] border-2 border-indigo-500/50 text-center space-y-8 animate-in zoom-in duration-500 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <i className="fa-brands fa-pix text-3xl text-indigo-400"></i>
            </div>
            <h3 className="text-3xl font-black text-white">Quase lá!</h3>
            <p className="text-sm text-slate-400 leading-relaxed px-4">
              Efetue o pagamento via PIX para que seus créditos sejam liberados automaticamente pelo sistema. <br/>
              <span className="text-indigo-300 font-bold italic">Lembre-se: Cobrança única, sem recorrência.</span>
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white p-5 rounded-[2rem] mx-auto w-fit">
              <img src={paymentData.img_qrcode} alt="QR Code PIX" className="w-56 h-56" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col p-5 bg-slate-900/80 rounded-3xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Total a Pagar</span>
              <span className="text-3xl font-black text-green-400 tracking-tighter">
                R$ {paymentData.valor.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <button 
              onClick={copyToClipboard}
              className={`w-full py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 ${
                copied ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <i className={`fa-solid ${copied ? 'fa-check-double scale-125' : 'fa-copy'}`}></i>
              {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setPaymentData(null)}
              className="text-xs text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest"
            >
              Voltar aos pacotes
            </button>
            
            <div className="pt-6 border-t border-slate-800/50">
              <div className="flex items-center justify-center gap-3">
                <div className="relative w-2 h-2">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Aguardando Confirmação</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditStore;
