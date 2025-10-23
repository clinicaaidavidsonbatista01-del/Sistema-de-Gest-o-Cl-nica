
import React, { useState } from 'react';
import type { Professional } from '../types';
import { UserRole } from '../types';
import { DownloadIcon } from './icons';

interface LoginScreenProps {
  professionals: Professional[];
  onLogin: (role: UserRole, professional?: Professional) => void;
  showInstallButton: boolean;
  onInstall: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ professionals, onLogin, showInstallButton, onInstall }) => {
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>(professionals[0]?.id || '');

  const handleProfessionalLogin = () => {
    const professional = professionals.find(p => p.id === selectedProfessionalId);
    if (professional) {
      onLogin(UserRole.PROFESSIONAL, professional);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {showInstallButton && (
        <div className="absolute top-4 right-4">
          <button
            onClick={onInstall}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            <DownloadIcon className="h-5 w-5" />
            Instalar App
          </button>
        </div>
      )}
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Acessar o Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Selecione seu perfil de acesso
          </p>
        </div>
        <div className="space-y-6">
          {/* Admin Login */}
          <div>
            <button
              onClick={() => onLogin(UserRole.ADMIN)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar como Administrador
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OU</span>
            </div>
          </div>

          {/* Professional Login */}
          <div>
            <label htmlFor="professional-select" className="block text-sm font-medium text-gray-700 mb-2">
              Acessar como Profissional
            </label>
            <select
              id="professional-select"
              value={selectedProfessionalId}
              onChange={(e) => setSelectedProfessionalId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
            <button
              onClick={handleProfessionalLogin}
              disabled={!selectedProfessionalId}
              className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              Entrar como Profissional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;