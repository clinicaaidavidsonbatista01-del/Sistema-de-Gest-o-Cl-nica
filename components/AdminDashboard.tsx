
import React, { useState, useMemo, useEffect } from 'react';
import type { Professional } from '../types';
import { getProfessionals, addProfessional, deleteProfessional } from '../services/dataService';
import { UsersIcon, DollarSignIcon, PlusIcon, TrashIcon, PrintIcon, LogoutIcon, DownloadIcon } from './icons';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface AdminDashboardProps {
  onLogout: () => void;
  showInstallButton: boolean;
  onInstall: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, showInstallButton, onInstall }) => {
  const [activeTab, setActiveTab] = useState<'professionals' | 'financials'>('professionals');
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProfName, setNewProfName] = useState('');
  const [newProfSpecialty, setNewProfSpecialty] = useState('');
  
  const [totalBilled, setTotalBilled] = useState<number>(10000);
  const [clinicPercentage, setClinicPercentage] = useState<number>(20);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProfessionals();
  }, []);
  
  const loadProfessionals = () => {
      setProfessionals(getProfessionals());
  };

  const clinicShare = useMemo(() => {
    return (totalBilled * clinicPercentage) / 100;
  }, [totalBilled, clinicPercentage]);
  
  const handleAddProfessional = () => {
      if(newProfName.trim() && newProfSpecialty.trim()){
          addProfessional({ name: newProfName, specialty: newProfSpecialty });
          loadProfessionals();
          setNewProfName('');
          setNewProfSpecialty('');
          setIsModalOpen(false);
      }
  };
  
  const handleRemoveProfessional = (id: string) => {
    setProfessionalToDelete(id);
    setIsConfirmModalOpen(true);
  }

  const confirmDeleteProfessional = () => {
    if (professionalToDelete) {
        deleteProfessional(professionalToDelete);
        loadProfessionals();
    }
    setIsConfirmModalOpen(false);
    setProfessionalToDelete(null);
  }

  const handlePrint = () => {
    window.print();
  };

  const ProfessionalsView = () => (
    <div className="printable-content">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Profissionais</h2>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors no-print">
            <PlusIcon className="h-5 w-5" /> Adicionar
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
         {professionals.map(prof => (
            <div key={prof.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{prof.name}</p>
                <p className="text-sm text-gray-600">{prof.specialty}</p>
              </div>
              <button onClick={() => handleRemoveProfessional(prof.id)} className="p-2 text-red-500 hover:text-red-700 no-print" aria-label={`Remover ${prof.name}`}>
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );

  const FinancialsView = () => (
    <div className="printable-content">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Financeiro</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cálculo de Repasse para Clínica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="totalBilled" className="block text-sm font-medium text-gray-700">Total Faturado pelo Profissional (R$)</label>
            <input 
              type="number" 
              id="totalBilled"
              value={totalBilled}
              onChange={(e) => setTotalBilled(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="clinicPercentage" className="block text-sm font-medium text-gray-700">Porcentagem da Clínica (%)</label>
            <input 
              type="number" 
              id="clinicPercentage"
              value={clinicPercentage}
              onChange={(e) => setClinicPercentage(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700">Valor a ser pago à clínica:</p>
          <p className="text-3xl font-bold text-blue-600">
            {clinicShare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col no-print">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">Clínica Bem-Estar</h1>
          <p className="text-sm text-gray-500 mt-2">Área do Administrador</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('professionals')} className={`w-full flex items-center p-3 rounded-lg text-left ${activeTab === 'professionals' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <UsersIcon className="h-5 w-5 mr-3" /> Profissionais
          </button>
          <button onClick={() => setActiveTab('financials')} className={`w-full flex items-center p-3 rounded-lg text-left ${activeTab === 'financials' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <DollarSignIcon className="h-5 w-5 mr-3" /> Financeiro
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8 no-print">
            <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>
            <div className="flex items-center gap-4">
                {showInstallButton && (
                  <button onClick={onInstall} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors">
                      <DownloadIcon className="h-5 w-5" />
                      Instalar App
                  </button>
                )}
                <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <PrintIcon className="h-5 w-5" />
                    Imprimir
                </button>
                <button onClick={onLogout} title="Sair do sistema" className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors">
                    <LogoutIcon className="h-5 w-5" />
                    Sair
                </button>
            </div>
        </header>
        
        {activeTab === 'professionals' ? <ProfessionalsView /> : <FinancialsView />}
      </main>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Profissional">
        <div className="space-y-4">
            <div>
                <label htmlFor="profName" className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" id="profName" value={newProfName} onChange={(e) => setNewProfName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="profSpecialty" className="block text-sm font-medium text-gray-700">Especialidade</label>
                <input type="text" id="profSpecialty" value={newProfSpecialty} onChange={(e) => setNewProfSpecialty(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex justify-end pt-4">
                <button onClick={handleAddProfessional} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Salvar</button>
            </div>
        </div>
      </Modal>

      <ConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteProfessional}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja remover este profissional? Todos os pacientes e agendamentos associados a ele também serão excluídos permanentemente."
        confirmButtonText="Excluir Profissional"
      />

       <style>{`
        @media print {
          body {
            background-color: white;
          }
          .no-print {
            display: none;
          }
          main {
            padding: 0;
          }
          .printable-content {
            box-shadow: none;
            border: 1px solid #ccc;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;