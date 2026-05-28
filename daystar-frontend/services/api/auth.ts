import api from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  role: "manager" | "babysitter";
  babysitter_id: number | null;
  is_active: boolean;
  profile?: any;
};

export type LoginResponse = {
  success: boolean;
  token: string;
  user: User;
};

export type MeResponse = {
  success: boolean;
  user: User;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function me(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
}

export default { login, logout, me };
