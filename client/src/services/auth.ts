import api from "./api";

export interface User {
  id: string;
  email: string;
}

export async function register(email: string, password: string): Promise<User> {
  const res = await api.post("/auth/register", { email, password });
  return res.data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post("/auth/login", { email, password });
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function me(): Promise<User | null> {
  try {
    const res = await api.get("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}
