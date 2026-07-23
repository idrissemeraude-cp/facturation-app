export type InvoiceStatus = 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string; // FAC-2024-001
  clientId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: 0.18;
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  logoUrl?: string;
}
