
import type { Professional, Patient, Appointment } from '../types';

export const MOCK_PROFESSIONALS: Professional[] = [
  { id: 'prof-1', name: 'Dr. Ana Silva', specialty: 'Cardiologia' },
  { id: 'prof-2', name: 'Dr. Bruno Costa', specialty: 'Dermatologia' },
  { id: 'prof-3', name: 'Dr. Carla Martins', specialty: 'Psicologia' },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: 'pat-1', name: 'João Pereira', phone: '11 98765-4321', email: 'joao.p@example.com', professionalId: 'prof-1' },
  { id: 'pat-2', name: 'Maria Oliveira', phone: '21 91234-5678', email: 'maria.o@example.com', professionalId: 'prof-1' },
  { id: 'pat-3', name: 'Pedro Santos', phone: '31 95555-4444', email: 'pedro.s@example.com', professionalId: 'prof-2' },
  { id: 'pat-4', name: 'Lucia Fernandes', phone: '41 94321-8765', email: 'lucia.f@example.com', professionalId: 'prof-3' },
  { id: 'pat-5', name: 'Ricardo Alves', phone: '51 98888-7777', email: 'ricardo.a@example.com', professionalId: 'prof-3' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'app-1', patientId: 'pat-1', patientName: 'João Pereira', professionalId: 'prof-1', date: new Date().toISOString().split('T')[0], time: '09:00', notes: 'Consulta de rotina', sessionValue: 200 },
  { id: 'app-2', patientId: 'pat-2', patientName: 'Maria Oliveira', professionalId: 'prof-1', date: new Date().toISOString().split('T')[0], time: '10:00', notes: 'Retorno', sessionValue: 150 },
  { id: 'app-3', patientId: 'pat-3', patientName: 'Pedro Santos', professionalId: 'prof-2', date: new Date().toISOString().split('T')[0], time: '14:00', notes: 'Primeira consulta', sessionValue: 250 },
  { id: 'app-4', patientId: 'pat-4', patientName: 'Lucia Fernandes', professionalId: 'prof-3', date: new Date().toISOString().split('T')[0], time: '11:00', notes: 'Sessão de terapia', sessionValue: 180 },
];