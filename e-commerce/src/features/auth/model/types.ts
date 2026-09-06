export interface RegisterFormData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}
