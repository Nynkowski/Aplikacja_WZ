export type LoginRequest = {
  username: string;
  password: string;
};

export type UserRole = "admin" | "user" | string;

export type LoginResponse = {
  message: string;
  id: number;
  username: string;
  role: UserRole;
};
