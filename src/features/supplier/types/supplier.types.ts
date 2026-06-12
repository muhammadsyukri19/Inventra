export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
