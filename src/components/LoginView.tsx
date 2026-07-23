import React, { useState } from 'react';
import { Lock, User, KeyRound, LogIn, AlertCircle } from 'lucide-react';
import { CookieLogo } from './CookieLogo';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // Check login credentials:
    // Login: "Enzo" or "Enzo Brandão" or "Enzo Brandao" (E and B uppercase)
    // Password: "Brandão123" or "Brandão 1 2 3" or "Brandão 123" or "Brandao123"
    const validUsernames = ['Enzo', 'Enzo Brandão', 'Enzo Brandao'];
    const validPasswords = ['Brandão123', 'Brandão 1 2 3', 'Brandão 123', 'Brandao123', 'Brandao 1 2 3', 'Brandao 123'];

    const isUserValid = validUsernames.some(u => u === cleanUser || u.toLowerCase() === cleanUser.toLowerCase());
    const isPassValid = validPasswords.some(p => p === cleanPass || p.toLowerCase() === cleanPass.toLowerCase());

    if (isUserValid && isPassValid) {
      onLoginSuccess(cleanUser);
    } else {
      setErrorMsg('Login ou senha incorretos! Verifique os dados digitados.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col justify-center items-center p-4 select-none">
      <div className="max-w-md w-full bg-[#F7EFE5] border-4 border-[#3D2B1F] rounded-[2.5rem] p-8 shadow-[10px_10px_0px_0px_#3D2B1F] space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-3 bg-white border-4 border-[#3D2B1F] rounded-2xl shadow-[4px_4px_0px_0px_#3D2B1F] animate-bounce">
            <CookieLogo size={56} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase text-[#3D2B1F] tracking-tight">
              COOKIES<span className="text-[#99582A]">.</span>
            </h1>
            <p className="text-xs font-black uppercase tracking-wider text-[#99582A] mt-1">
              Sistema de Gestão de Vendas na Escola
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-400 text-[#3D2B1F] border-2 border-[#3D2B1F] p-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#3D2B1F] animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-[#3D2B1F]">
              Usuário / Login
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#99582A]">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="Digite seu usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border-3 border-[#3D2B1F] rounded-xl font-black text-sm text-[#3D2B1F] placeholder-[#99582A]/50 outline-none focus:ring-2 focus:ring-[#FFB703] shadow-[3px_3px_0px_0px_#3D2B1F]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-black uppercase text-[#3D2B1F]">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#99582A]">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3.5 bg-white border-3 border-[#3D2B1F] rounded-xl font-black text-sm text-[#3D2B1F] placeholder-[#99582A]/50 outline-none focus:ring-2 focus:ring-[#FFB703] shadow-[3px_3px_0px_0px_#3D2B1F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-black uppercase text-[#99582A] hover:text-[#3D2B1F] cursor-pointer"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-[#FFB703] hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] font-black uppercase tracking-wider text-sm rounded-xl border-3 border-[#3D2B1F] shadow-[4px_4px_0px_0px_#3D2B1F] transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mt-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Entrar no Sistema</span>
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-[10px] font-black uppercase text-center text-[#99582A]">
          🍪 Controle seu estoque, vendas e lucro com facilidade
        </p>
      </div>
    </div>
  );
};
