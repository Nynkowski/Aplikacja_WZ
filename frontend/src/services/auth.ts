import type { LoginRequest, LoginResponse } from "../types/auth";
import { api } from "./api";

export async function login(payload: LoginRequest) {
  const response = await api.post<LoginResponse>("/login", payload);

  return response.data;
}
