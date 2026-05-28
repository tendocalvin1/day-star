import api from "./client";

export type AttendanceRecord = {
  id: number;
  child_id: number;
  babysitter_id: number | null;
  date: string;
  session_type: "full_day" | "half_day";
  check_in_time: string;
  check_out_time: string | null;
  status: "present" | "absent";
  recorded_by: number;
  child_name: string;
  parent_phone: string | null;
  special_needs: string | null;
  babysitter_first_name: string | null;
  babysitter_last_name: string | null;
};

export type DailySummary = {
  date: string;
  total_children: number;
  present: number;
  full_day: number;
  half_day: number;
  checked_out: number;
  still_in: number;
};

export type GetAttendanceResponse = {
  success: boolean;
  data: AttendanceRecord[];
  summary: DailySummary;
};

export async function getAttendance(date?: string): Promise<GetAttendanceResponse> {
  const params = date ? { date } : {};
  const res = await api.get<GetAttendanceResponse>("/attendance", { params });
  return res.data;
}

export type CheckInPayload = {
  child_id: number;
  babysitter_id?: number;
  date?: string;
  session_type: "full_day" | "half_day";
  check_in_time?: string;
};

export type CheckInResponse = {
  success: boolean;
  message: string;
  data: AttendanceRecord;
};

export async function checkIn(payload: CheckInPayload): Promise<CheckInResponse> {
  const res = await api.post<CheckInResponse>("/attendance/check-in", payload);
  return res.data;
}

export type CheckOutPayload = {
  check_out_time?: string;
};

export type CheckOutResponse = {
  success: boolean;
  message: string;
  data: AttendanceRecord;
};

export async function checkOut(id: number, payload?: CheckOutPayload): Promise<CheckOutResponse> {
  const res = await api.put<CheckOutResponse>(`/attendance/${id}/check-out`, payload);
  return res.data;
}

// Get children API
export type Child = {
  id: number;
  full_name: string;
  parent_phone: string | null;
  special_needs: string | null;
  is_active: boolean;
};

export async function getChildren(): Promise<{ success: boolean; data: Child[] }> {
  const res = await api.get("/children");
  return res.data;
}

export default { getAttendance, checkIn, checkOut, getChildren };
