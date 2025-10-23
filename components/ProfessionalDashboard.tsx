
import React, { useState, useMemo, useEffect } from 'react';
import type { Professional, Patient, Appointment } from '../types';
import { 
    getPatientsByProfessional, 
    getAppointmentsByProfessional,
    addPatient,
    updatePatient,
    deleteMultiplePatients,
    addAppointment,
    updateAppointment,
    deleteAppointment,
} from '../services/dataService';
import { CalendarIcon, UsersIcon, PlusIcon, PrintIcon, TrashIcon, PencilIcon, LogoutIcon, DownloadIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';

interface ProfessionalDashboardProps {
  professional: Professional;
  onLogout: () => void;
  showInstallButton: boolean;
  onInstall: () => void;
}

const BLANK_PATIENT: Omit<Patient, 'id' | 'professionalId'> = { name: '', email: '', phone: '' };
const BLANK_APPOINTMENT: Omit<Appointment, 'id' | 'professionalId' | 'patientName'> = { patientId: '', date: new Date().toISOString().split('T')[0], time: '09:00', notes: '', sessionValue: 0 };

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ professional, onLogout, showInstallButton, onInstall }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'patients'>('schedule');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientFormData, setPatientFormData] = useState<Omit<Patient, 'id' | 'professionalId'>>(BLANK_PATIENT);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentFormData, setAppointmentFormData] = useState<Omit<Appointment, 'id' | 'professionalId' | 'patientName'>>(BLANK_APPOINTMENT);

  const [isPatientConfirmOpen, setIsPatientConfirmOpen] = useState(false);
  const [patientIdsToDelete, setPatientIdsToDelete] = useState<string[]>([]);
  
  const [isAppointmentConfirmOpen, setIsAppointmentConfirmOpen] = useState(false);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState<string | null>(null);
  
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  
  // State for sorting and filtering
  const [appointmentDateFilter, setAppointmentDateFilter] = useState({ start: '', end: '' });
  const [appointmentSort, setAppointmentSort] = useState<{key: keyof Appointment | 'patientName', order: 'asc' | 'desc'}>({ key: 'time', order: 'asc' });
  const [patientSort, setPatientSort] = useState<{key: keyof Patient, order: 'asc' | 'desc'}>({ key: 'name', order: 'asc' });

  // State for filter panel visibility
  const [isAppointmentFilterVisible, setIsAppointmentFilterVisible] = useState(false);
  const [isPatientFilterVisible, setIsPatientFilterVisible] = useState(false);


  useEffect(() => {
    loadData();
  }, [professional.id]);

  const loadData = () => {
    setAppointments(getAppointmentsByProfessional(professional.id));
    setPatients(getPatientsByProfessional(professional.id));
  };

  const handlePrint = () => { window.print(); };

  const handleOpenPatientModal = (patient: Patient | null = null) => {
    if (patient) {
        setEditingPatient(patient);
        setPatientFormData({ name: patient.name, email: patient.email, phone: patient.phone });
    } else {
        setEditingPatient(null);
        setPatientFormData(BLANK_PATIENT);
    }
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = () => {
    if (!patientFormData.name.trim()) return;
    if (editingPatient) {
        updatePatient({ ...editingPatient, ...patientFormData });
    } else {
        addPatient({ ...patientFormData, professionalId: professional.id });
    }
    loadData();
    setIsPatientModalOpen(false);
  };

  const handleDeletePatient = (id: string) => {
    setPatientIdsToDelete([id]);
    setIsPatientConfirmOpen(true);
  };

  const handleTogglePatientSelection = (patientId: string) => {
    const newSelection = new Set(selectedPatientIds);
    if (newSelection.has(patientId)) {
      newSelection.delete(patientId);
    } else {
      newSelection.add(patientId);
    }
    setSelectedPatientIds(newSelection);
  };

  const handleDeleteSelected = () => {
    if (selectedPatientIds.size === 0) return;
    setPatientIdsToDelete(Array.from(selectedPatientIds));
    setIsPatientConfirmOpen(true);
  };

  const confirmDeletePatients = () => {
    if (patientIdsToDelete.length > 0) {
      deleteMultiplePatients(patientIdsToDelete);
      loadData();
      setSelectedPatientIds(new Set());
    }
    setIsPatientConfirmOpen(false);
    setPatientIdsToDelete([]);
  };

  const handleOpenAppointmentModal = (appointment: Appointment | null = null) => {
    if (appointment) {
        setEditingAppointment(appointment);
        setAppointmentFormData({ patientId: appointment.patientId, date: appointment.date, time: appointment.time, notes: appointment.notes, sessionValue: appointment.sessionValue || 0 });
    } else {
        setEditingAppointment(null);
        const firstPatientId = patients.length > 0 ? patients[0].id : '';
        setAppointmentFormData({...BLANK_APPOINTMENT, patientId: firstPatientId });
    }
    setIsAppointmentModalOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!appointmentFormData.patientId) {
        alert("Por favor, selecione um paciente.");
        return;
    }
    const dataToSave = {
        ...appointmentFormData,
        sessionValue: Number(appointmentFormData.sessionValue) || 0
    };
    if (editingAppointment) {
        updateAppointment({ ...editingAppointment, ...dataToSave });
    } else {
        addAppointment({ ...dataToSave, professionalId: professional.id });
    }
    loadData();
    setIsAppointmentModalOpen(false);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointmentIdToDelete(id);
    setIsAppointmentConfirmOpen(true);
  };

  const confirmDeleteAppointment = () => {
    if (appointmentIdToDelete) {
        deleteAppointment(appointmentIdToDelete);
        loadData();
    }
    setIsAppointmentConfirmOpen(false);
    setAppointmentIdToDelete(null);
  };
  
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
        const lowercasedTerm = appointmentSearchTerm.toLowerCase();
        const matchesTerm = appointmentSearchTerm.trim() === '' || 
            app.patientName.toLowerCase().includes(lowercasedTerm) ||
            app.notes.toLowerCase().includes(lowercasedTerm);

        const matchesDate = 
            (!appointmentDateFilter.start || app.date >= appointmentDateFilter.start) &&
            (!appointmentDateFilter.end || app.date <= appointmentDateFilter.end);
        
        return matchesTerm && matchesDate;
    });
  }, [appointments, appointmentSearchTerm, appointmentDateFilter]);

  const sortedAppointments = useMemo(() => 
    [...filteredAppointments].sort((a, b) => {
        const key = appointmentSort.key;
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        const comparison = String(valA).localeCompare(String(valB), 'pt-BR');

        return appointmentSort.order === 'asc' ? comparison : -comparison;
    }),
  [filteredAppointments, appointmentSort]);

  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) {
        return patients;
    }
    const lowercasedTerm = patientSearchTerm.toLowerCase();
    return patients.filter(p => p.name.toLowerCase().includes(lowercasedTerm));
  }, [patients, patientSearchTerm]);

  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
        const key = patientSort.key;
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        const comparison = String(valA).localeCompare(String(valB), 'pt-BR', { sensitivity: 'base' });
        
        return patientSort.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredPatients, patientSort]);

  const allFilteredPatientsSelected = useMemo(() => {
    const filteredIds = new Set(filteredPatients.map(p => p.id));
    if (filteredIds.size === 0) return false;
    for (const id of filteredIds) {
        if (!selectedPatientIds.has(id)) {
            return false;
        }
    }
    return true;
  }, [filteredPatients, selectedPatientIds]);

  const handleToggleSelectAll = () => {
    const filteredIds = new Set(filteredPatients.map(p => p.id));
    const newSelection = new Set(selectedPatientIds);

    if (allFilteredPatientsSelected) {
        for (const id of filteredIds) { newSelection.delete(id); }
    } else {
        for (const id of filteredIds) { newSelection.add(id); }
    }
    setSelectedPatientIds(newSelection);
  };


  const confirmationMessage = useMemo(() => {
    const count = patientIdsToDelete.length;
    const baseText = "Seus agendamentos também serão removidos permanentemente.";
    if (count > 1) {
        return <>Tem certeza que deseja remover <strong>{count} pacientes</strong> selecionados? {baseText}</>;
    }
    return <>Tem certeza que deseja remover este paciente? {baseText}</>;
  }, [patientIdsToDelete]);


  const ScheduleView = () => (
    <div className="printable-content">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 shrink-0">Minha Agenda</h2>
        <div className="flex items-center gap-4 no-print">
            <button onClick={() => setIsAppointmentFilterVisible(!isAppointmentFilterVisible)} className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors">
                Filtrar & Ordenar
                <ArrowDownIcon className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isAppointmentFilterVisible ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => handleOpenAppointmentModal()} className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5" /> Agendar
            </button>
        </div>
      </div>
       {isAppointmentFilterVisible && (
        <div className="flex flex-col xl:flex-row items-end gap-4 mb-4 bg-gray-50 p-4 rounded-lg border no-print">
            <div className="relative w-full sm:w-auto flex-grow xl:flex-grow-0">
                 <label htmlFor="appointment-search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <span className="absolute bottom-2.5 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    id="appointment-search"
                    type="text"
                    placeholder="Paciente ou nota..."
                    value={appointmentSearchTerm}
                    onChange={e => setAppointmentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex-grow">
                <label className="text-sm font-medium text-gray-700">Filtrar por data</label>
                <div className="flex items-center gap-2 mt-1">
                    <input type="date" aria-label="Data de início" value={appointmentDateFilter.start} onChange={e => setAppointmentDateFilter(f => ({...f, start: e.target.value}))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <span className="text-gray-500">até</span>
                    <input type="date" aria-label="Data de fim" value={appointmentDateFilter.end} onChange={e => setAppointmentDateFilter(f => ({...f, end: e.target.value}))} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
            </div>
            <div className="flex-grow">
                <label htmlFor="appointment-sort" className="text-sm font-medium text-gray-700">Ordenar por</label>
                <div className="flex items-center gap-2 mt-1">
                    <select id="appointment-sort" value={appointmentSort.key} onChange={e => setAppointmentSort(s => ({...s, key: e.target.value as any}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="time">Hora</option>
                        <option value="patientName">Nome do Paciente</option>
                    </select>
                    <button onClick={() => setAppointmentSort(s => ({...s, order: s.order === 'asc' ? 'desc' : 'asc'}))} className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100">
                        {appointmentSort.order === 'asc' ? <ArrowUpIcon className="h-5 w-5 text-gray-600" /> : <ArrowDownIcon className="h-5 w-5 text-gray-600" />}
                    </button>
                </div>
            </div>
            <button onClick={() => { setAppointmentDateFilter({ start: '', end: '' }); setAppointmentSearchTerm(''); setAppointmentSort({key: 'time', order: 'asc'})}} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm self-end h-[42px]">Limpar</button>
        </div>
       )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {sortedAppointments.length > 0 ? (
          <ul className="space-y-4">
            {sortedAppointments.map(app => (
              <li key={app.id} className="p-4 border rounded-md flex justify-between items-center bg-gray-50 hover:bg-gray-100">
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-600">{app.time}</p>
                      <p className="text-gray-700">{app.patientName}</p>
                    </div>
                     {app.sessionValue && app.sessionValue > 0 && (
                      <p className="font-semibold text-green-600">{app.sessionValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{app.notes}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 no-print">
                   <span className="text-sm font-medium text-gray-600 hidden sm:block">{app.date}</span>
                   <button onClick={() => handleOpenAppointmentModal(app)} className="p-2 text-gray-500 hover:text-blue-600"><PencilIcon className="h-5 w-5" /></button>
                   <button onClick={() => handleDeleteAppointment(app.id)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="h-5 w-5" /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">Nenhum agendamento encontrado para os filtros selecionados.</p>
        )}
      </div>
    </div>
  );

  const PatientsView = () => (
     <div className="printable-content">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 shrink-0">Meus Pacientes</h2>
        <div className="flex items-center gap-4 no-print">
            <button onClick={() => setIsPatientFilterVisible(!isPatientFilterVisible)} className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors">
                Filtrar & Ordenar
                <ArrowDownIcon className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isPatientFilterVisible ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => handleOpenPatientModal()} className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5" /> Adicionar
            </button>
        </div>
      </div>
      {isPatientFilterVisible && (
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-4 bg-gray-50 p-4 rounded-lg border no-print">
              <div className="relative w-full sm:w-64">
                   <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-1">Buscar por nome</label>
                  <span className="absolute bottom-2.5 left-0 flex items-center pl-3">
                      <SearchIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                      id="patient-search"
                      type="text"
                      placeholder="Buscar por nome..."
                      value={patientSearchTerm}
                      onChange={e => setPatientSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
              <div className="flex-grow">
                  <label htmlFor="patient-sort" className="text-sm font-medium text-gray-700">Ordenar por</label>
                  <div className="flex items-center gap-2 mt-1">
                      <select id="patient-sort" value={patientSort.key} onChange={e => setPatientSort(s => ({...s, key: e.target.value as any}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="name">Nome</option>
                          <option value="email">Email</option>
                          <option value="phone">Telefone</option>
                      </select>
                      <button onClick={() => setPatientSort(s => ({...s, order: s.order === 'asc' ? 'desc' : 'asc'}))} className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100">
                          {patientSort.order === 'asc' ? <ArrowUpIcon className="h-5 w-5 text-gray-600" /> : <ArrowDownIcon className="h-5 w-5 text-gray-600" />}
                      </button>
                  </div>
              </div>
              <button onClick={() => { setPatientSearchTerm(''); setPatientSort({key: 'name', order: 'asc'})}} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm self-end h-[42px]">Limpar</button>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
         {sortedPatients.length > 0 && (
            <div className="p-2 border-b flex justify-between items-center bg-gray-50 rounded-t-md">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="select-all-patients"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onChange={handleToggleSelectAll}
                        checked={allFilteredPatientsSelected}
                        aria-labelledby="select-all-label"
                    />
                    <label id="select-all-label" htmlFor="select-all-patients" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                        {allFilteredPatientsSelected ? 'Desmarcar Todos' : `Marcar ${filteredPatients.length} visíveis`}
                    </label>
                </div>
                {selectedPatientIds.size > 0 && (
                    <button 
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-red-700 transition-colors text-sm font-medium no-print">
                        <TrashIcon className="h-4 w-4" /> 
                        Excluir ({selectedPatientIds.size})
                    </button>
                )}
            </div>
         )}

         {sortedPatients.length > 0 ? (
             sortedPatients.map(patient => (
                <div key={patient.id} className="p-4 border-b last:border-b-0 flex items-center hover:bg-gray-50">
                    <input 
                        type="checkbox"
                        aria-label={`Selecionar ${patient.name}`}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedPatientIds.has(patient.id)}
                        onChange={() => handleTogglePatientSelection(patient.id)}
                    />
                    <div className="ml-4 flex-grow flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{patient.name}</p>
                            <p className="text-sm text-gray-600">{patient.email} | {patient.phone}</p>
                        </div>
                        <div className="flex items-center gap-4 no-print">
                            <button onClick={() => handleOpenPatientModal(patient)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 font-medium">
                                <PencilIcon className="h-4 w-4" />
                                Editar
                            </button>
                            <button onClick={() => handleDeletePatient(patient.id)} className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 font-medium">
                                <TrashIcon className="h-4 w-4" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
             ))
         ) : (
             <p className="text-gray-500 text-center py-4">Nenhum paciente encontrado.</p>
         )}
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        <aside className="w-64 bg-white shadow-md flex flex-col no-print">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Clínica Bem-Estar</h1>
            <p className="text-sm text-gray-500 mt-2">Área do Profissional</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center p-3 rounded-lg text-left ${activeTab === 'schedule' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <CalendarIcon className="h-5 w-5 mr-3" /> Agenda
            </button>
            <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center p-3 rounded-lg text-left ${activeTab === 'patients' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <UsersIcon className="h-5 w-5 mr-3" /> Pacientes
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <header className="flex justify-between items-center mb-8 no-print">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">Olá, {professional.name.split(' ')[0]} {professional.name.split(' ')[1]}!</h1>
                  <p className="text-gray-600">Sua especialidade: {professional.specialty}</p>
              </div>
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

          {activeTab === 'schedule' ? <ScheduleView /> : <PatientsView />}
        </main>
      </div>

      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} title={editingPatient ? "Editar Paciente" : "Adicionar Paciente"}>
          <div className="space-y-4">
              <InputField label="Nome" id="patName" value={patientFormData.name} onChange={e => setPatientFormData({...patientFormData, name: e.target.value})} />
              <InputField label="Email" id="patEmail" type="email" value={patientFormData.email} onChange={e => setPatientFormData({...patientFormData, email: e.target.value})} />
              <InputField label="Telefone" id="patPhone" type="tel" value={patientFormData.phone} onChange={e => setPatientFormData({...patientFormData, phone: e.target.value})} />
              <div className="flex justify-end pt-4"><button onClick={handleSavePatient} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Salvar</button></div>
          </div>
      </Modal>

      <Modal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} title={editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}>
          <div className="space-y-4">
              <div>
                  <label htmlFor="appPatient" className="block text-sm font-medium text-gray-700">Paciente</label>
                  <select id="appPatient" value={appointmentFormData.patientId} onChange={e => setAppointmentFormData({...appointmentFormData, patientId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option value="" disabled>{patients.length === 0 ? "Adicione um paciente primeiro" : "Selecione..."}</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>
              <InputField label="Data" id="appDate" type="date" value={appointmentFormData.date} onChange={e => setAppointmentFormData({...appointmentFormData, date: e.target.value})} />
              <InputField label="Hora" id="appTime" type="time" value={appointmentFormData.time} onChange={e => setAppointmentFormData({...appointmentFormData, time: e.target.value})} />
              <InputField label="Valor da Sessão (R$)" id="appValue" type="number" placeholder="0.00" value={appointmentFormData.sessionValue} onChange={e => setAppointmentFormData({...appointmentFormData, sessionValue: parseFloat(e.target.value)})} />
              <TextAreaField label="Notas" id="appNotes" value={appointmentFormData.notes} onChange={e => setAppointmentFormData({...appointmentFormData, notes: e.target.value})} />
              <div className="flex justify-end pt-4"><button onClick={handleSaveAppointment} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">Salvar</button></div>
          </div>
      </Modal>
      
      <ConfirmationModal
        isOpen={isPatientConfirmOpen}
        onClose={() => setIsPatientConfirmOpen(false)}
        onConfirm={confirmDeletePatients}
        title="Confirmar Exclusão"
        message={confirmationMessage}
        confirmButtonText={patientIdsToDelete.length > 1 ? `Excluir ${patientIdsToDelete.length} Pacientes` : 'Excluir Paciente'}
      />

      <ConfirmationModal
        isOpen={isAppointmentConfirmOpen}
        onClose={() => setIsAppointmentConfirmOpen(false)}
        onConfirm={confirmDeleteAppointment}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmButtonText="Sim, Cancelar"
      />

      <style>{`@media print { body { background-color: white; } .no-print { display: none; } main { padding: 0; } .printable-content { box-shadow: none; border: 1px solid #ccc; } }`}</style>
    </>
  );
};

const InputField = ({ label, id, ...props }: {label: string, id: string, [key: string]: any}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={id} {...props} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const TextAreaField = ({ label, id, ...props }: {label: string, id: string, [key: string]: any}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea id={id} {...props} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

export default ProfessionalDashboard;
