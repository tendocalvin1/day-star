import api from "./client";

export type Child = {
  id: number;
  full_name: string;
  date_of_birth: string;
  parent_phone: string | null;
  special_needs: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GetChildrenResponse = {
  success: boolean;
  data: Child[];
};

export async function getChildren(): Promise<GetChildrenResponse> {
  const res = await api.get<GetChildrenResponse>("/children");
  return res.data;
}

export default { getChildren };