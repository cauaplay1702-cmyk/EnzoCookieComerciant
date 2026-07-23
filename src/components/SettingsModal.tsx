import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Settings, X, QrCode, Save, RotateCcw, Download } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onUpdateSettings,
  onResetAllData
}) => {
  const [sellerName, setSellerName] = useState(settings.sellerName || '');
  const [schoolName, setSchoolName] = useState(settings.schoolName || '');
  const [pixKey, setPixKey] = useState(settings.pixKey || '');
  const [pixKeyType, setPixKeyType] = useState<AppSettings['pixKeyType']>(settings.pixKeyType || 'email');
  const [customReceiptMessage, setCustomReceiptMessage] = useState(settings.customReceiptMessage || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      sellerName: sellerName.trim(),
      schoolName: schoolName.trim(),
      pixKey: pixKey.trim(),
      pixKeyType,
      customReceiptMessage: customReceiptMessage.trim()
    });
    onClose();
  };

  const handleConfirmReset = () => {
    if (confirm('Atenção: Tem certeza que deseja resetar todos os dados e restaurar os cookies padrão de exemplo?')) {
      onResetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#3D2B1F]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#FFFBF5] rounded-[2rem] max-w-lg w-full p-6 space-y-5 shadow-[12px_12px_0px_0px_#3D2B1F] border-4 border-[#3D2B1F]">
        <div className="flex items-center justify-between pb-3 border-b-4 border-[#3D2B1F]">
          <h3 className="text-xl font-black text-[#3D2B1F] uppercase flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#99582A]" />
            <span>Configurações</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#3D2B1F] hover:text-red-600 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-bold">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">Seu Nome / Vendedor</label>
              <input
                type="text"
                placeholder="Ex: Pedro Santos"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
              />
            </div>

            <div>
              <label className="block font-black text-[#3D2B1F] uppercase mb-1">Nome da Escola</label>
              <input
                type="text"
                placeholder="Ex: Colégio Castro Alves"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
              />
            </div>
          </div>

          <div className="bg-[#FFB703] border-4 border-[#3D2B1F] p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-[#3D2B1F] font-black uppercase">
              <QrCode className="w-5 h-5 text-[#3D2B1F]" />
              <span>Chave Pix do Negócio</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-[11px] font-black text-[#3D2B1F] uppercase mb-1">Tipo</label>
                <select
                  value={pixKeyType}
                  onChange={e => setPixKeyType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-black uppercase outline-none"
                >
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF</option>
                  <option value="telefone">Celular</option>
                  <option value="aleatoria">Aleatória</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-black text-[#3D2B1F] uppercase mb-1">Chave Pix</label>
                <input
                  type="text"
                  placeholder="Ex: pedrocookies@email.com"
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#3D2B1F] bg-white font-mono font-black outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-black text-[#3D2B1F] uppercase mb-1">Mensagem do Comprovante</label>
            <input
              type="text"
              placeholder="Ex: Obrigado pelo apoio! Bons estudos 🍪"
              value={customReceiptMessage}
              onChange={e => setCustomReceiptMessage(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-[#3D2B1F] bg-white font-black outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t-2 border-[#3D2B1F]">
            <button
              type="button"
              onClick={handleConfirmReset}
              className="py-2.5 px-3 text-red-600 hover:bg-red-100 border-2 border-transparent hover:border-red-600 rounded-xl font-black text-xs uppercase flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resetar Dados</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl font-black uppercase bg-[#F7EFE5] border-2 border-[#3D2B1F] text-[#3D2B1F] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl font-black uppercase bg-[#FFB703] border-2 border-[#3D2B1F] shadow-[3px_3px_0px_0px_#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
