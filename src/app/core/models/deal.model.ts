export type DealStage = 'lead' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
}

export interface DealFormValue {
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  description: string;
  assignedTo: string;
}

export const DEAL_STAGES: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
];
