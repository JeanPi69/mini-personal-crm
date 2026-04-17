export interface Note {
  id: string;
  content: string;
  contactId: string;
  createdAt: string;
  createdBy: string;
}

export interface NoteFormValue {
  content: string;
  contactId: string;
  createdBy: string;
}
