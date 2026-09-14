export interface Member {
  id: string;
  full_name: string;
  gender: 'male' | 'female' | 'other';
  birth_date?: string | null;
  birth_year?: number | null;
  is_alive: number; // 1: alive, 0: deceased
  death_date?: string | null;
  burial_place?: string | null;
  occupation?: string | null;
  address?: string | null;
  avatar_url?: string | null;
  generation: number;
  parent_id?: string | null;
  mother_id?: string | null;
  spouse_name?: string | null;
  birth_order?: number;
  branch?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MemberDetail extends Member {
  parent?: Member | null;
  children?: Member[];
  siblings?: Member[];
}

export interface TreeNode extends Member {
  children: TreeNode[];
}

export interface ClanInfo {
  id: string;
  name: string;
  ancestor_name?: string;
  origin?: string;
  temple_address?: string;
  anniversary_lunar?: string;
  description?: string;
  updated_at?: string;
  logo_url?: string | null;
  logo_text?: string;
  logo_shape?: 'rounded-xl' | 'rounded-full' | 'rounded-3xl' | 'rounded-none' | string;
  theme_color?: 'amber' | 'ruby' | 'emerald' | 'sapphire' | 'amethyst' | 'bronze' | string;
  bg_style?: 'dark' | 'warm-dark' | 'light' | string;
  pattern_style?: 'dongson' | 'lotus' | 'minimal' | 'none' | string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at?: string;
}

export interface ClanStats {
  totalMembers: number;
  aliveMembers: number;
  deceasedMembers: number;
  maleMembers: number;
  femaleMembers: number;
  totalGenerations: number;
  branches: string[];
}

export interface SystemStatus {
  status: 'healthy' | 'error';
  database: {
    provider: string;
    connected: boolean;
    latencyMs: number;
    host?: string;
    isCustomTurso?: boolean;
    configuredSource?: string;
  };
  stats: {
    membersCount: number;
    usersCount: number;
  };
  serverTime: string;
}

export interface TursoTestResult {
  success: boolean;
  message: string;
  host: string;
  isCustomTurso: boolean;
  readCount: number;
  writeSuccess: boolean;
  cleanupSuccess: boolean;
  latencyMs: number;
  testedAt: string;
}

export interface TursoConfigInfo {
  url: string;
  host: string;
  isCustom: boolean;
  configuredSource: string;
  tokenMasked: string;
}
