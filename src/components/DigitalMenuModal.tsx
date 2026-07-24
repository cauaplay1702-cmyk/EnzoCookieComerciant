import React, { useState } from 'react';
import { QrCode, Copy, Check, Share2, Sparkles, X, Smartphone, Cookie, Trophy } from 'lucide-react';
import { CookieProduct, AppSettings } from '../types';

interface DigitalMenuModalProps {
  products: CookieProduct[];
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMenuModal: React.FC<DigitalMenuModalProps> = ({
  products,
  settings,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);

  if (!isOpen) return null;

  const activeProducts = products.filter(p => p.active);

  const getMenuWhatsAppText = () => {
    const schoolStr = settings.schoolName ? `📍 *${settings.schoolName}*\n` : '';
    const sellerStr = settings.sellerName ? `👤 Vendedor: *${settings.sellerName}*\n` : '';
    
    const productList = activeProducts.length > 0
      ? activeProducts.map(p => {
          let stockTag = '';
          if (p.stockQuantity <= 0) stockTag = ' ❌ *(ESGOTADO)*';
          else if (p.stockQuantity <= 5) stockTag = ' ⚠️ *(ÚLTIMAS UNIDADES!)*';
          
          return `${p.emoji} *${p.name}* - R$ ${p.salePrice.toFixed(2)}${p.description ? `\n   _${p.description}_` : ''}${stockTag}`;
        }).join('\n\n')
      : '🍪 *Novos sabores sendo preparados!*';

    const pixStr = settings.pixKey ? `\n\n📲 *Chave Pix para Reserva:*\n\`${settings.pixKey}\` (${settings.pixKeyType.toUpperCase()})` : '';

    return `🍪 *CARDÁPIO DE COOKIES DO RECREIO* 🍪
${schoolStr}${sellerStr}
✨ *SABORES DE HOJE:*

${productList}

🎉 *PROMOÇÃO DO DIA:*
• Leve 2 Cookies e ganhe desconto no combo!

${pixStr}

⚡ *Garanta o seu nas 3 Primeiras Aulas, 3 Aulas Finais ou na Saída!* 🚀`;
  };

  const handleCopyMenu = () => {
    navigator.clipboard.writeText(getMenuWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getMenuWhatsAppText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className={`fixed inset-0 bg-[#3D2B1F]/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 z-50 animate-fadeIn`}>
      <div className={`bg-[#FFFBF5] border-4 border-[#3D2B1F] shadow-[12px_12px_0px_0px_#3D2B1F] w-full transition-all overflow-hidden flex flex-col ${
        fullScreenMode ? 'max-w-4xl h-[92vh] rounded-[2.5rem]' : 'max-w-2xl max-h-[90vh] rounded-[2rem]'
      }`}>
        
        {/* Modal Top Header */}
        <div className="bg-[#FFB703] border-b-4 border-[#3D2B1F] p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F]">
              <Cookie className="w-6 h-6 text-[#3D2B1F]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#3D2B1F] flex items-center gap-2">
                Cardápio do Dia
                <span className="text-[10px] bg-[#3D2B1F] text-white px-2 py-0.5 rounded-full uppercase">
                  Vitrine
                </span>
              </h3>
              <p className="text-xs font-bold text-[#3D2B1F]/80 uppercase">
                {settings.schoolName || 'Escola'} • {settings.sellerName || 'Vendedor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullScreenMode(!fullScreenMode)}
              className="p-2 bg-white hover:bg-[#F7EFE5] text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-xl font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#3D2B1F] cursor-pointer"
              title="Alternar Modo Vitrine na Tela"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">{fullScreenMode ? 'Reduzir' : 'Modo Tela Cheia'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-red-100 hover:bg-red-500 hover:text-white border-2 border-[#3D2B1F] rounded-xl text-[#3D2B1F] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="bg-[#F7EFE5] border-b-2 border-[#3D2B1F] p-3 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 text-[#3D2B1F] font-black uppercase">
            <Sparkles className="w-4 h-4 text-[#FFB703]" />
            <span>Compartilhar nas Redes / Grupos da Escola:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMenu}
              className="px-3 py-2 bg-white hover:bg-[#FFB703] border-2 border-[#3D2B1F] rounded-xl font-black uppercase text-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto WhatsApp'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 bg-[#25D366] hover:bg-emerald-600 text-white border-2 border-[#3D2B1F] rounded-xl font-black uppercase shadow-[2px_2px_0px_0px_#3D2B1F] flex items-center gap-1.5 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Scrollable Products Menu Card Grid */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          {activeProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-white rounded-2xl border-2 border-dashed border-[#3D2B1F] p-6">
              <span className="text-5xl">🍪</span>
              <p className="font-black text-lg text-[#3D2B1F] uppercase">Nenhum cookie disponível no cardápio</p>
              <p className="text-xs font-bold text-[#99582A]">Cadastre novos sabores no Estoque para exibir no cardápio!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProducts.map(product => {
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

                return (
                  <div
                    key={product.id}
                    className={`relative p-4 rounded-2xl border-4 border-[#3D2B1F] transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-gray-100 opacity-60'
                        : 'bg-white shadow-[4px_4px_0px_0px_#3D2B1F] hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{product.emoji || '🍪'}</span>
                        <span className="px-2.5 py-1 bg-[#F7EFE5] border-2 border-[#3D2B1F] rounded-xl text-[10px] font-black uppercase text-[#3D2B1F]">
                          {product.category}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-black text-lg text-[#3D2B1F] uppercase tracking-tight line-clamp-1">
                        {product.name}
                      </h4>

                      {/* Description */}
                      {product.description && (
                        <p className="text-xs font-semibold text-[#99582A] mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t-2 border-[#3D2B1F] flex items-center justify-between">
                      {/* Price */}
                      <div className="bg-[#FFB703] border-2 border-[#3D2B1F] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#3D2B1F]">
                        <span className="text-sm font-black text-[#3D2B1F]">
                          R$ {product.salePrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Stock Status Tag */}
                      <div>
                        {isOutOfStock ? (
                          <span className="px-2 py-1 bg-red-500 text-white font-black text-[10px] uppercase rounded-lg border border-[#3D2B1F]">
                            Esgotado
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 bg-amber-400 text-[#3D2B1F] font-black text-[10px] uppercase rounded-lg border border-[#3D2B1F] animate-pulse">
                            Restam {product.stockQuantity}!
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-200 text-emerald-950 font-black text-[10px] uppercase rounded-lg border border-[#3D2B1F]">
                            Disponível ({product.stockQuantity})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pix Key Info Footer Box */}
          {settings.pixKey && (
            <div className="bg-[#FFB703] border-4 border-[#3D2B1F] p-4 rounded-2xl shadow-[4px_4px_0px_0px_#3D2B1F] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl border-2 border-[#3D2B1F]">
                  <QrCode className="w-6 h-6 text-[#3D2B1F]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#3D2B1F]/80 block">Pagamento Direto via Pix:</span>
                  <span className="text-sm font-mono font-black text-[#3D2B1F] select-all">
                    {settings.pixKey}
                  </span>
                  <span className="text-[10px] font-bold text-[#3D2B1F] block uppercase">
                    Tipo: {settings.pixKeyType.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(settings.pixKey);
                  alert('Chave Pix copiada para a área de transferência!');
                }}
                className="px-4 py-2 bg-white hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black uppercase text-xs rounded-xl border-2 border-[#3D2B1F] shadow-[2px_2px_0px_0px_#3D2B1F] cursor-pointer transition-colors shrink-0"
              >
                Copiar Chave Pix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
