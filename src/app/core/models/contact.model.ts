export type ContactStatus = 'active' | 'prospect' | 'inactive';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  createdAt: string;
  assignedTo: string;
}

export interface ContactFormValue {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  assignedTo: string;
}
