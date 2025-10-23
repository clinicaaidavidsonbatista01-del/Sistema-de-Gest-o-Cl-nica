import { MOCK_PROFESSIONALS, MOCK_PATIENTS, MOCK_APPOINTMENTS } from './mockData';
import type { Professional, Patient, Appointment } from '../types';

const KEYS = {
  PROFESSIONALS: 'clinic_professionals',
  PATIENTS: 'clinic_patients',
  APPOINTMENTS: 'clinic_appointments',
};

// --- Initialization ---
export const initializeData = () => {
  if (!localStorage.getItem(KEYS.PROFESSIONALS)) {
    localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(MOCK_PROFESSIONALS));
  }
  if (!localStorage.getItem(KEYS.PATIENTS)) {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(MOCK_PATIENTS));
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(MOCK_APPOINTMENTS));
  }
};

// --- Generic Helpers ---
const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Professionals ---
export const getProfessionals = (): Professional[] => getData<Professional>(KEYS.PROFESSIONALS);

export const addProfessional = (prof: Omit<Professional, 'id'>): Professional => {
  const professionals = getProfessionals();
  const newProfessional: Professional = { ...prof, id: `prof-${Date.now()}` };
  setData(KEYS.PROFESSIONALS, [...professionals, newProfessional]);
  return newProfessional;
};

export const deleteProfessional = (id: string): void => {
  // First, find all patients associated with this professional
  const patientsOfProfessional = getPatientsByProfessional(id);
  const patientIdsToDelete = patientsOfProfessional.map(p => p.id);
  
  // Use the existing function to delete those patients and their appointments
  if (patientIdsToDelete.length > 0) {
    deleteMultiplePatients(patientIdsToDelete);
  }

  // Finally, delete the professional
  const professionals = getProfessionals();
  setData(KEYS.PROFESSIONALS, professionals.filter(p => p.id !== id));
};

// --- Patients ---
export const getPatients = (): Patient[] => getData<Patient>(KEYS.PATIENTS);

export const getPatientsByProfessional = (professionalId: string): Patient[] => {
  return getPatients().filter(p => p.professionalId === professionalId);
};

export const addPatient = (patient: Omit<Patient, 'id'>): Patient => {
  const patients = getPatients();
  const newPatient: Patient = { ...patient, id: `pat-${Date.now()}` };
  setData(KEYS.PATIENTS, [...patients, newPatient]);
  return newPatient;
};

export const updatePatient = (updatedPatient: Patient): void => {
    const patients = getPatients();
    const index = patients.findIndex(p => p.id === updatedPatient.id);
    if (index !== -1) {
        patients[index] = updatedPatient;
        setData(KEYS.PATIENTS, patients);
    }
}

export const deleteMultiplePatients = (patientIds: string[]): void => {
  if (patientIds.length === 0) return;

  const allPatients = getPatients();
  const remainingPatients = allPatients.filter(p => !patientIds.includes(p.id));
  setData(KEYS.PATIENTS, remainingPatients);

  const allAppointments = getAppointments();
  const remainingAppointments = allAppointments.filter(a => !patientIds.includes(a.patientId));
  setData(KEYS.APPOINTMENTS, remainingAppointments);
};


// --- Appointments ---
export const getAppointments = (): Appointment[] => getData<Appointment>(KEYS.APPOINTMENTS);

export const getAppointmentsByProfessional = (professionalId: string): Appointment[] => {
  return getAppointments().filter(a => a.professionalId === professionalId);
};

export const addAppointment = (appointment: Omit<Appointment, 'id' | 'patientName'>): Appointment => {
    const appointments = getAppointments();
    const patients = getPatients();
    const patient = patients.find(p => p.id === appointment.patientId);
    if (!patient) throw new Error("Patient not found");

    const newAppointment: Appointment = { 
        ...appointment, 
        id: `app-${Date.now()}`,
        patientName: patient.name 
    };
    setData(KEYS.APPOINTMENTS, [...appointments, newAppointment]);
    return newAppointment;
};

export const updateAppointment = (updatedAppointment: Appointment): void => {
    const appointments = getAppointments();
    const patients = getPatients();
    const patient = patients.find(p => p.id === updatedAppointment.patientId);
    if (!patient) throw new Error("Patient not found");

    updatedAppointment.patientName = patient.name;

    const index = appointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
        appointments[index] = updatedAppointment;
        setData(KEYS.APPOINTMENTS, appointments);
    }
}


export const deleteAppointment = (id: string): void => {
  const appointments = getAppointments();
  setData(KEYS.APPOINTMENTS, appointments.filter(a => a.id !== id));
};