import api from "./client";

export type Child = {
  id: number;
  full_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  session_type: "half_day" | "full_day";
  special_needs: string | null;
  is_active: boolean;
  created_at: string;
  age: string;
};

export type ChildWithAttendance = Child & {
  recent_attendance: Array<{
    id: number;
    child_id: number;
    babysitter_id: number | null;
    date: string;
    session_type: "half_day" | "full_day";
    check_in_time: string;
    check_out_time: string | null;
    status: string;
    recorded_by: number;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
  }>;
};

export type GetChildrenQuery = {
  search?: string;
  session_type?: "half_day" | "full_day";
  is_active?: "true" | "false" | "all";
  page?: number;
  limit?: number;
};

export type GetChildrenResponse = {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: Child[];
};

export type CreateChildPayload = {
  full_name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string | null;
  session_type: "half_day" | "full_day";
  special_needs?: string | null;
};

export type UpdateChildPayload = Partial<CreateChildPayload>;

export async function getChildren(
  query?: GetChildrenQuery
): Promise<GetChildrenResponse> {
  const res = await api.get<GetChildrenResponse>("/children", { params: query });
  return res.data;
}

export async function getChildById(id: number): Promise<{
  success: boolean;
  data: ChildWithAttendance;
}> {
  const res = await api.get(`/children/${id}`);
  return res.data;
}

export async function createChild(
  payload: CreateChildPayload
): Promise<{
  success: boolean;
  message: string;
  data: Child;
}> {
  const res = await api.post("/children", payload);
  return res.data;
}

export async function updateChild(
  id: number,
  payload: UpdateChildPayload
): Promise<{
  success: boolean;
  message: string;
  data: Child;
}> {
  const res = await api.put(`/children/${id}`, payload);
  return res.data;
}

export async function deleteChild(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await api.delete(`/children/${id}`);
  return res.data;
}

export async function getNotCheckedIn(date?: string): Promise<{
  success: boolean;
  count: number;
  data: Child[];
}> {
  const res = await api.get("/children/not-checked-in", {
    params: date ? { date } : {},
  });
  return res.data;
}

export default {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild,
  getNotCheckedIn,
};