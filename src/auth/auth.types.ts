export type AuthUser = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};
