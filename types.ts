
export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  professionalId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  date: string;
  time: string;
  notes: string;
  sessionValue?: number;
}

export interface Professional {
  id:string;
  name: string;
  specialty: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL'
}

export type LoggedInUser = {
  role: UserRole;
  professional?: Professional;
}