import api from "./client";

export type AttendanceRecord = {
  id: number;
  childId: number;
  checkIn: string; // ISO timestamp
  checkOut?: string | null;
};

export async function getAttendance(date: string): Promise<AttendanceRecord[]> {
  const res = await api.get<AttendanceRecord[]>(`/attendance?date=${encodeURIComponent(date)}`);
  return res.data;
}

export type CreateAttendancePayload = {
  childId: number;
  checkIn?: string;
  checkOut?: string | null;
};

export async function createAttendance(payload: CreateAttendancePayload): Promise<AttendanceRecord> {
  const res = await api.post<AttendanceRecord>(`/attendance`, payload);
  return res.data;
}

export default { getAttendance, createAttendance };
