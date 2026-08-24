import React, { useEffect } from 'react';
import { RotateCcw, X, CheckCircle2 } from 'lucide-react';

interface ToastUndoBannerProps {
  notification: {
    id: string;
    message: string;
    actionId: string;
  } | null;
  onUndo: (actionId: string) => void;
  onDismiss: () => void;
}

export const ToastUndoBanner: React.FC<ToastUndoBannerProps> = ({
  notification,
  onUndo,
  onDismiss
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000); // 6 seconds auto-dismiss
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-bounce-short">
      <div className="bg-[#3D2B1F] text-[#FFFBF5] p-4 rounded-2xl border-4 border-[#FFB703] shadow-[8px_8px_0px_0px_#FFB703] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-[#FFB703] text-[#3D2B1F] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-black uppercase tracking-tight truncate">
            {notification.message}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onUndo(notification.actionId)}
            className="px-3 py-1.5 bg-[#FFB703] hover:bg-white text-[#3D2B1F] font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border border-[#3D2B1F] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Desfazer</span>
          </button>

          <button
            onClick={onDismiss}
            className="p-1 text-white/80 hover:text-white cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
