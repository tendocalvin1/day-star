import api from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name?: string;
  email: string;
};

export type LoginResponse = {
  user: User;
};

export type MeResponse = User | null;

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
