export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  enabled: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
}