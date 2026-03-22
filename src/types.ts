export interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  link: string;
  category: string;
  is_public: boolean;
  code: string;
  created_at: string;
}

export interface UserSignup {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  date_of_birth?: string;
  phone_number?: string;
  domain_of_interest?: string;
  education_level?: string;
  join_reasons?: string[];
  profile_completed?: boolean;
  tools_preferences?: string[];
  bio?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Stats {
  totalTools: number;
  publicTools: number;
  privateTools: number;
}
