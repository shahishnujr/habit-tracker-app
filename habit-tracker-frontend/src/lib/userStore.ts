// lib/userStore.ts

type User = { email: string; password: string };
const users: User[] = [];

export function registerUser(email: string, password: string): boolean {
  if (users.find((u) => u.email === email)) return false;
  users.push({ email, password });
  return true;
}

export function authenticateUser(email: string, password: string): boolean {
  return users.some((u) => u.email === email && u.password === password);
}
