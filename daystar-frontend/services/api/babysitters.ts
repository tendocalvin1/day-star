import api from "./client";

export type Babysitter = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  nin: string;
  date_of_birth: string;
  skills: string[];
  availability: string[];
  years_experience: number;
  location: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  is_active: boolean;
  created_at: string;
  user_account?: {
    id: number;
    email: string;
  };
};

export type GetBabysittersQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type GetBabysittersResponse = {
  success: boolean;
  data: Babysitter[];
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type CreateBabysitterPayload = {
  first_name: string;
  last_name: string;
  phone: string;
  nin: string;
  date_of_birth: string;
  skills?: string[];
  availability?: string[];
  years_experience?: number;
  location?: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  create_account?: boolean;
  account_email?: string;
  account_password?: string;
};

export type UpdateBabysitterPayload = Partial<Omit<CreateBabysitterPayload, "create_account" | "account_email" | "account_password">>;

export async function getBabysitters(query?: GetBabysittersQuery): Promise<GetBabysittersResponse> {
  const res = await api.get<GetBabysittersResponse>("/babysitters", { params: query });
  return res.data;
}

export async function getBabysitterById(id: number): Promise<{ success: boolean; data: Babysitter }> {
  const res = await api.get(`/babysitters/${id}`);
  return res.data;
}

export async function createBabysitter(payload: CreateBabysitterPayload): Promise<{
  success: boolean;
  message: string;
  data: Babysitter;
}> {
  const res = await api.post("/babysitters", payload);
  return res.data;
}

export async function updateBabysitter(id: number, payload: UpdateBabysitterPayload): Promise<{
  success: boolean;
  message: string;
  data: Babysitter;
}> {
  const res = await api.put(`/babysitters/${id}`, payload);
  return res.data;
}

export async function deleteBabysitter(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await api.delete(`/babysitters/${id}`);
  return res.data;
}

export default {
  getBabysitters,
  getBabysitterById,
  createBabysitter,
  updateBabysitter,
  deleteBabysitter,
};
