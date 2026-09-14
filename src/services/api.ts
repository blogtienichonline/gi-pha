import { ClanInfo, ClanStats, Member, MemberDetail, SystemStatus, TreeNode, TursoConfigInfo, TursoTestResult, User } from '../types.ts';

const TOKEN_KEY = 'giapha_auth_token';

const DEFAULT_CLAN_FALLBACK: ClanInfo = {
  id: 'clan_default',
  name: 'Gia Tộc Họ Phạm Đại Tôn',
  ancestor_name: 'Cụ Thủy Tổ Phạm Quý Công',
  origin: 'Làng Cổ Kính Chủ, Chí Linh, Hải Dương & Hà Nội',
  temple_address: 'Từ Đường Dòng Họ Phạm, Thôn Đông',
  anniversary_lunar: 'Ngày 16 tháng Giêng (Âm lịch)',
  description: 'Gia phả Gia Tộc Họ Phạm lưu truyền công đức tổ tiên, phát huy truyền thống hiếu học, trung hiếu nghĩa tình, đoàn kết tương thân tương ái, rạng danh con cháu muôn đời.',
  logo_text: '范',
  logo_shape: 'rounded-xl',
  theme_color: 'amber',
  bg_style: 'dark',
  pattern_style: 'dongson',
  seo_title: 'Gia Tộc Họ Phạm - Cổng Thông Tin Gia Phả Điện Tử',
  seo_description: 'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ cây tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.',
  seo_keywords: 'gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn',
  og_image_url: 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
  updated_at: new Date().toISOString(),
};

/**
 * Safe fetch wrapper that handles non-JSON responses (such as Vercel 404 "The page could not be found")
 * and prevents JSON parse syntax errors.
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const text = await res.text();

  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    const preview = text.slice(0, 100).replace(/\s+/g, ' ');
    throw new Error(
      `Máy chủ phản hồi không phải JSON [Mã ${res.status}]: ${preview || res.statusText || 'Trang không tồn tại'}. Vui lòng kiểm tra Vercel Serverless Function và cấu hình vercel.json.`
    );
  }

  if (!res.ok) {
    throw new Error(data?.message || `Yêu cầu thất bại (${res.status}): ${res.statusText}`);
  }

  return data;
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    try {
      const data = await fetchJson<{ success: boolean; token?: string; user?: User; message?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
    }
  },

  async register(username: string, password: string, fullName?: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    try {
      const data = await fetchJson<{ success: boolean; token?: string; user?: User; message?: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, full_name: fullName }),
        }
      );
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Lỗi kết nối máy chủ' };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const data = await fetchJson<{ success: boolean; user?: User }>('/api/auth/me', {
        headers: this.getHeaders(),
      });
      if (data.success && data.user) {
        return data.user;
      }
      this.removeToken();
      return null;
    } catch {
      return null;
    }
  },

  async getClanInfo(): Promise<ClanInfo> {
    try {
      const json = await fetchJson<{ success: boolean; data: ClanInfo }>('/api/clan', {
        headers: this.getHeaders(),
      });
      return json.data || DEFAULT_CLAN_FALLBACK;
    } catch (err) {
      console.warn('Could not fetch clan info, using fallback:', err);
      return DEFAULT_CLAN_FALLBACK;
    }
  },

  async updateClanInfo(info: Partial<ClanInfo>): Promise<{ success: boolean; message?: string }> {
    return fetchJson('/api/clan', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(info),
    });
  },

  async getMembers(filters?: {
    q?: string;
    generation?: number;
    gender?: string;
    is_alive?: number;
    branch?: string;
  }): Promise<Member[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.q) params.set('q', filters.q);
      if (filters?.generation) params.set('generation', String(filters.generation));
      if (filters?.gender) params.set('gender', filters.gender);
      if (filters?.is_alive !== undefined) params.set('is_alive', String(filters.is_alive));
      if (filters?.branch) params.set('branch', filters.branch);

      const json = await fetchJson<{ success: boolean; data: Member[] }>(
        `/api/members?${params.toString()}`,
        { headers: this.getHeaders() }
      );
      return json.data || [];
    } catch (err) {
      console.warn('Could not fetch members, returning empty list:', err);
      return [];
    }
  },

  async getMember(id: string): Promise<MemberDetail> {
    const json = await fetchJson<{ success: boolean; data: MemberDetail; message?: string }>(
      `/api/members/${id}`,
      { headers: this.getHeaders() }
    );
    if (!json.success) throw new Error(json.message || 'Lỗi khi tải thông tin');
    return json.data;
  },

  async createMember(data: Partial<Member>): Promise<{ success: boolean; message?: string; data?: { id: string } }> {
    return fetchJson('/api/members', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async updateMember(id: string, data: Partial<Member>): Promise<{ success: boolean; message?: string }> {
    return fetchJson(`/api/members/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteMember(id: string): Promise<{ success: boolean; message?: string }> {
    return fetchJson(`/api/members/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  },

  async bulkAddMembers(members: Partial<Member>[]): Promise<{ success: boolean; count: number; message?: string; ids?: string[] }> {
    return fetchJson('/api/members/bulk-add', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ members }),
    });
  },

  async bulkDeleteMembers(ids: string[], unlinkChildren: boolean = true): Promise<{ success: boolean; count: number; message?: string }> {
    return fetchJson('/api/members/bulk-delete', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids, unlinkChildren }),
    });
  },

  async resetClanDemoPham(): Promise<{ success: boolean; message?: string; clan: ClanInfo }> {
    return fetchJson('/api/clan/reset-demo-pham', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async getTree(): Promise<{ roots: TreeNode[]; total: number; flat: Member[] }> {
    try {
      const json = await fetchJson<{ success: boolean; roots: TreeNode[]; total: number; flat: Member[] }>(
        '/api/tree',
        { headers: this.getHeaders() }
      );
      return {
        roots: json.roots || [],
        total: json.total || 0,
        flat: json.flat || [],
      };
    } catch (err) {
      console.warn('Could not fetch tree, using fallback:', err);
      return { roots: [], total: 0, flat: [] };
    }
  },

  async getStats(): Promise<ClanStats> {
    try {
      const json = await fetchJson<{ success: boolean; stats: ClanStats }>('/api/stats', {
        headers: this.getHeaders(),
      });
      return json.stats || {
        totalMembers: 0,
        aliveMembers: 0,
        deceasedMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        totalGenerations: 1,
        branches: [],
      };
    } catch (err) {
      console.warn('Could not fetch stats, using fallback:', err);
      return {
        totalMembers: 0,
        aliveMembers: 0,
        deceasedMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        totalGenerations: 1,
        branches: [],
      };
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const json = await fetchJson<{ success: boolean; users: User[] }>('/api/users', {
        headers: this.getHeaders(),
      });
      return json.users || [];
    } catch (err) {
      console.warn('Could not fetch users:', err);
      return [];
    }
  },

  async createUser(data: { username: string; password: string; full_name: string; role: string }): Promise<{ success: boolean; message?: string }> {
    return fetchJson('/api/users', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: { full_name?: string; role?: string; password?: string }): Promise<{ success: boolean; message?: string }> {
    return fetchJson(`/api/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    return fetchJson(`/api/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  },

  async getSystemStatus(): Promise<SystemStatus> {
    return fetchJson('/api/system/status', { headers: this.getHeaders() });
  },

  async getTursoConfig(): Promise<{ success: boolean; data: TursoConfigInfo }> {
    return fetchJson('/api/system/turso-config', { headers: this.getHeaders() });
  },

  async updateTursoConfig(payload: {
    databaseUrl: string;
    authToken: string;
    seedSampleData?: boolean;
  }): Promise<{ success: boolean; message: string; host: string; latencyMs: number; seeded?: boolean }> {
    return fetchJson('/api/system/turso-config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
  },

  async resetTursoDefault(): Promise<{ success: boolean; message: string; host: string }> {
    return fetchJson('/api/system/reset-turso-default', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async seedTursoDatabase(): Promise<{ success: boolean; message: string; host: string; membersCount: number }> {
    return fetchJson('/api/system/seed-turso', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },

  async testTursoDatabase(): Promise<TursoTestResult> {
    return fetchJson('/api/system/test-turso', {
      method: 'POST',
      headers: this.getHeaders(),
    });
  },
};

