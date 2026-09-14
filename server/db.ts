import 'dotenv/config';
import { createClient, type Client } from '@libsql/client/web';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Default fallback database (pre-seeded shared demo)
export const DEFAULT_TURSO_URL = 'https://giapha-hanzi.aws-ap-northeast-1.turso.io';
export const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkzNTQ5MTMsImlkIjoiMDFhMDlkZGQtMTkwMS03OTg3LWE5ODktMTUyOGYyNjJiNjU0Iiwia2lkIjoiLTJiMFpJc0hhbTBsUGdvNW1NRnJsT3RFeEJXMERhQ0g1eXl3b1hyR3hoZyIsInJpZCI6ImUzZDYyNDcwLTA2ODctNDA1OS1iNzA0LTI5MmZiZDMzMDFjOCJ9.ih3Snm3DXeYsdFPQhor1HgqEZM-wwy_7lVrg9ucnWOvOLy38wfA7Z80Jl9vYHBCrnb0BArXC0PUNaQOMuJ9pCA';

export const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
export const CONFIG_FILE_PATH = IS_VERCEL
  ? path.resolve('/tmp', 'turso-config.json')
  : path.resolve(process.cwd(), 'turso-config.json');

export function sanitizeTursoUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_TURSO_URL;
  let clean = rawUrl.replace(/^["']|["']$/g, '').trim();
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '').trim();
  if (clean.startsWith('libsql://')) {
    clean = clean.replace(/^libsql:\/\//, 'https://');
  } else if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (!clean.includes('.')) {
      clean = `https://${clean}.turso.io`;
    } else {
      clean = `https://${clean}`;
    }
  }
  return clean;
}

export function sanitizeTursoToken(rawToken?: string): string {
  if (!rawToken || !rawToken.trim()) return DEFAULT_TURSO_TOKEN;
  return rawToken.replace(/^["']|["']$/g, '').trim();
}

export function safelyCreateClient(rawUrl?: string, rawToken?: string): Client {
  const url = sanitizeTursoUrl(rawUrl);
  const token = sanitizeTursoToken(rawToken);
  try {
    return createClient({
      url,
      authToken: token,
    });
  } catch (err) {
    console.error(`[Turso DB] Error creating client for ${url}, fallback to demo DB:`, err);
    return createClient({
      url: DEFAULT_TURSO_URL,
      authToken: DEFAULT_TURSO_TOKEN,
    });
  }
}

function loadStoredTursoConfig(): { url: string; token: string; source: string } | null {
  try {
    const candidatePaths = [CONFIG_FILE_PATH, path.resolve(process.cwd(), 'turso-config.json')];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.databaseUrl && parsed.databaseUrl.trim()) {
          return {
            url: sanitizeTursoUrl(parsed.databaseUrl),
            token: sanitizeTursoToken(parsed.authToken),
            source: 'Cấu hình trực tiếp (turso-config.json)',
          };
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi đọc turso-config.json:', err);
  }

  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.trim()) {
    return {
      url: sanitizeTursoUrl(process.env.TURSO_DATABASE_URL),
      token: sanitizeTursoToken(process.env.TURSO_AUTH_TOKEN),
      source: 'Biến môi trường (TURSO_DATABASE_URL)',
    };
  }

  return null;
}

const initialConfig = loadStoredTursoConfig();

let currentTursoUrl = initialConfig?.url || DEFAULT_TURSO_URL;
let currentTursoToken = initialConfig?.token || DEFAULT_TURSO_TOKEN;
let currentConfigSource = initialConfig?.source || 'Mặc định hệ thống (Fallback Demo DB)';
let currentIsCustom = Boolean(initialConfig);

export function isCustomTursoConfigured(): boolean {
  return currentIsCustom;
}

export function getTursoConfigInfo() {
  const isCustom = currentIsCustom;
  const url = currentTursoUrl;
  let tokenMasked = '';
  if (currentTursoToken && currentTursoToken.length > 10) {
    tokenMasked = `${currentTursoToken.slice(0, 6)}...${currentTursoToken.slice(-4)}`;
  }

  return {
    url,
    host: getTursoHost(),
    isCustom,
    configuredSource: currentConfigSource,
    tokenMasked,
  };
}

export function getTursoHost(): string {
  try {
    const parsed = new URL(currentTursoUrl);
    return parsed.hostname;
  } catch {
    return currentTursoUrl.replace(/^https?:\/\//, '').split('/')[0];
  }
}

console.log(`[Turso DB] Connecting to: ${getTursoHost()} (${currentConfigSource})`);

// Active client instance
let activeClient: Client = safelyCreateClient(currentTursoUrl, currentTursoToken);

/**
 * Proxy wrapper so all imports of `db` continue to work and immediately forward
 * queries to the active client even after switching databases dynamically.
 */
export const db: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const val = (activeClient as any)[prop];
    if (typeof val === 'function') {
      return val.bind(activeClient);
    }
    return val;
  },
});

/**
 * Dynamically switch and persist a custom Turso database configuration
 */
export async function setTursoCredentials(
  rawUrl: string,
  rawToken: string,
  persist: boolean = true
): Promise<{ success: boolean; host: string; latencyMs: number; message: string }> {
  const cleanUrl = sanitizeTursoUrl(rawUrl);
  const cleanToken = sanitizeTursoToken(rawToken);

  const startTime = Date.now();
  // 1. Create a test client to verify connection
  const testClient = createClient({
    url: cleanUrl,
    authToken: cleanToken,
  });

  try {
    await testClient.execute('SELECT 1');
  } catch (probeErr: any) {
    throw new Error(`Không thể kết nối vào máy chủ Turso: ${probeErr?.message || 'Sai URL hoặc Auth Token'}`);
  }

  const latencyMs = Date.now() - startTime;

  // 2. Switch active client
  activeClient = testClient;
  currentTursoUrl = cleanUrl;
  currentTursoToken = cleanToken;
  currentIsCustom = true;
  currentConfigSource = 'Cấu hình trực tiếp (turso-config.json)';

  // 3. Persist configuration
  if (persist) {
    try {
      fs.writeFileSync(
        CONFIG_FILE_PATH,
        JSON.stringify(
          {
            databaseUrl: rawUrl.trim(),
            authToken: rawToken.trim(),
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (fsErr) {
      console.warn('Could not write turso-config.json:', fsErr);
    }
  }

  // 4. Re-initialize tables on the new database
  isInitialized = false;
  await initDatabase(true);

  return {
    success: true,
    host: getTursoHost(),
    latencyMs,
    message: `Đã kết nối trực tiếp vào Turso (${getTursoHost()}) thành công!`,
  };
}

/**
 * Reset Turso connection to system default
 */
export async function resetTursoToDefault(): Promise<{ success: boolean; host: string }> {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      fs.unlinkSync(CONFIG_FILE_PATH);
    }
  } catch (err) {
    console.warn('Could not remove turso-config.json:', err);
  }

  currentTursoUrl = DEFAULT_TURSO_URL;
  currentTursoToken = DEFAULT_TURSO_TOKEN;
  currentIsCustom = false;
  currentConfigSource = 'Mặc định hệ thống (Fallback Demo DB)';

  activeClient = safelyCreateClient(currentTursoUrl, currentTursoToken);

  isInitialized = false;
  await initDatabase(true);

  return {
    success: true,
    host: getTursoHost(),
  };
}

export function hashPassword(password: string, salt: string = 'giapha_salt_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  return hashPassword(password) === storedHash;
}

let isInitialized = false;

// Initialize tables and default admin
export async function initDatabase(force: boolean = false) {
  if (isInitialized && !force) return;
  try {
    // Fast check: if clan_info already exists and not forced, skip heavy initialization
    if (!force) {
      try {
        const quick = await db.execute('SELECT id FROM clan_info LIMIT 1');
        if (quick.rows.length > 0) {
          isInitialized = true;
          return;
        }
      } catch (_) {
        // Table does not exist yet, proceed with full creation
      }
    }

    // 1. Create essential tables in one batch
    await db.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS clan_info (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ancestor_name TEXT,
        origin TEXT,
        temple_address TEXT,
        anniversary_lunar TEXT,
        description TEXT,
        logo_url TEXT,
        logo_text TEXT DEFAULT '氏',
        logo_shape TEXT DEFAULT 'rounded-xl',
        theme_color TEXT DEFAULT 'amber',
        bg_style TEXT DEFAULT 'dark',
        pattern_style TEXT DEFAULT 'dongson',
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'male',
        birth_date TEXT,
        birth_year INTEGER,
        is_alive INTEGER NOT NULL DEFAULT 1,
        death_date TEXT,
        burial_place TEXT,
        occupation TEXT,
        address TEXT,
        avatar_url TEXT,
        generation INTEGER NOT NULL DEFAULT 1,
        parent_id TEXT,
        mother_id TEXT,
        spouse_name TEXT,
        birth_order INTEGER DEFAULT 1,
        branch TEXT,
        phone TEXT,
        bio TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    ]);

    // Ensure columns exist on older tables
    const migrations = [
      'ALTER TABLE clan_info ADD COLUMN logo_url TEXT',
      "ALTER TABLE clan_info ADD COLUMN logo_text TEXT DEFAULT '氏'",
      "ALTER TABLE clan_info ADD COLUMN logo_shape TEXT DEFAULT 'rounded-xl'",
      "ALTER TABLE clan_info ADD COLUMN theme_color TEXT DEFAULT 'amber'",
      "ALTER TABLE clan_info ADD COLUMN bg_style TEXT DEFAULT 'dark'",
      "ALTER TABLE clan_info ADD COLUMN pattern_style TEXT DEFAULT 'dongson'",
      "ALTER TABLE clan_info ADD COLUMN seo_title TEXT",
      "ALTER TABLE clan_info ADD COLUMN seo_description TEXT",
      "ALTER TABLE clan_info ADD COLUMN seo_keywords TEXT",
      "ALTER TABLE clan_info ADD COLUMN og_image_url TEXT DEFAULT 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png'",
    ];
    for (const sql of migrations) {
      try {
        await db.execute(sql);
      } catch (_) {}
    }

    // Ensure default admin: ducphi / ducphi@2048
    const adminCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: ['ducphi'],
    });

    if (adminCheck.rows.length === 0) {
      const adminHash = hashPassword('ducphi@2048');
      await db.execute({
        sql: `INSERT INTO users (id, username, password_hash, full_name, role, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: ['user_admin_01', 'ducphi', adminHash, 'Quản Trị Viên Phạm Đức Phi', 'admin', new Date().toISOString()],
      });
      console.log('Default admin account "ducphi" created successfully.');
    } else {
      // Ensure admin full_name is Họ Phạm
      await db.execute({
        sql: "UPDATE users SET full_name = 'Quản Trị Viên Phạm Đức Phi' WHERE username = 'ducphi'",
      });
    }

    // Ensure clan info exists and is Họ Phạm
    const clanCheck = await db.execute('SELECT id FROM clan_info LIMIT 1');
    if (clanCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO clan_info (
          id, name, ancestor_name, origin, temple_address, anniversary_lunar,
          description, logo_text, logo_shape, theme_color, bg_style, pattern_style,
          seo_title, seo_description, seo_keywords, og_image_url, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'clan_default',
          'Gia Tộc Họ Phạm Đại Tôn',
          'Cụ Thủy Tổ Phạm Quý Công',
          'Làng Cổ Kính Chủ, Chí Linh, Hải Dương & Hà Nội',
          'Từ Đường Dòng Họ Phạm, Thôn Đông',
          'Ngày 16 tháng Giêng (Âm lịch)',
          'Gia phả Gia Tộc Họ Phạm lưu truyền công đức tổ tiên, phát huy truyền thống hiếu học, trung hiếu nghĩa tình, đoàn kết tương thân tương ái, rạng danh con cháu muôn đời.',
          '范',
          'rounded-xl',
          'amber',
          'dark',
          'dongson',
          'Gia Tộc Họ Phạm - Cổng Thông Tin Gia Phả Điện Tử',
          'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ cây tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.',
          'gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn',
          'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
          new Date().toISOString(),
        ],
      });
    }

    // Migration: Update any existing demo records containing 'Nguyễn' to 'Phạm'
    try {
      await db.execute("UPDATE clan_info SET name = 'Gia Tộc Họ Phạm Đại Tôn', ancestor_name = 'Cụ Thủy Tổ Phạm Quý Công', temple_address = REPLACE(temple_address, 'Nguyễn', 'Phạm'), description = REPLACE(description, 'Nguyễn', 'Phạm') WHERE name LIKE '%Nguyễn%' OR description LIKE '%Nguyễn%'");
      await db.execute("UPDATE members SET full_name = REPLACE(full_name, 'Nguyễn ', 'Phạm ') WHERE full_name LIKE 'Nguyễn %'");
      await db.execute("UPDATE members SET bio = REPLACE(bio, 'Nguyễn ', 'Phạm ') WHERE bio LIKE '%Nguyễn %'");
      await db.execute("UPDATE members SET full_name = 'Phạm Văn Phúc' WHERE id = 'mem_gen1_01'");
      await db.execute("UPDATE members SET full_name = 'Phạm Văn Thành' WHERE id = 'mem_gen2_01'");
      await db.execute("UPDATE members SET full_name = 'Phạm Thị Hoa' WHERE id = 'mem_gen2_02'");
      await db.execute("UPDATE members SET full_name = 'Phạm Văn Dũng' WHERE id = 'mem_gen2_03'");
      await db.execute("UPDATE members SET full_name = 'Phạm Đức Phi' WHERE id = 'mem_gen3_01'");
      await db.execute("UPDATE members SET full_name = 'Phạm Thanh Hà' WHERE id = 'mem_gen3_02'");
      await db.execute("UPDATE members SET full_name = 'Phạm Văn Tuấn' WHERE id = 'mem_gen3_03'");
      await db.execute("UPDATE members SET full_name = 'Phạm Minh Khang' WHERE id = 'mem_gen4_01'");
      await db.execute("UPDATE members SET full_name = 'Phạm Bảo An' WHERE id = 'mem_gen4_02'");
      await db.execute("UPDATE members SET full_name = 'Phạm Tuấn Kiệt' WHERE id = 'mem_gen4_03'");
    } catch (migErr) {
      console.warn('Migration warning:', migErr);
    }

    // Seed realistic 4-generation family tree if members table is empty
    const membersCount = await db.execute('SELECT COUNT(*) as count FROM members');
    const count = Number(membersCount.rows[0]?.count || 0);

    if (count === 0) {
      console.log('Seeding initial genealogical tree data for Họ Phạm...');
      await seedSampleMembers();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function resetToPhamClanDemo() {
  const now = new Date().toISOString();
  // Clear members
  await db.execute('DELETE FROM members');

  // Update clan info to Họ Phạm
  const clanCheck = await db.execute('SELECT id FROM clan_info LIMIT 1');
  if (clanCheck.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO clan_info (
        id, name, ancestor_name, origin, temple_address, anniversary_lunar,
        description, logo_text, logo_shape, theme_color, bg_style, pattern_style,
        seo_title, seo_description, seo_keywords, og_image_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'clan_default',
        'Gia Tộc Họ Phạm Đại Tôn',
        'Cụ Thủy Tổ Phạm Quý Công',
        'Làng Cổ Kính Chủ, Chí Linh, Hải Dương & Hà Nội',
        'Từ Đường Dòng Họ Phạm, Thôn Đông',
        'Ngày 16 tháng Giêng (Âm lịch)',
        'Gia phả Gia Tộc Họ Phạm lưu truyền công đức tổ tiên, phát huy truyền thống hiếu học, trung hiếu nghĩa tình, đoàn kết tương thân tương ái, rạng danh con cháu muôn đời.',
        '范',
        'rounded-xl',
        'amber',
        'dark',
        'dongson',
        'Gia Tộc Họ Phạm - Cổng Thông Tin Gia Phả Điện Tử',
        'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ cây tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.',
        'gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn',
        'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
        now,
      ],
    });
  } else {
    await db.execute({
      sql: `UPDATE clan_info SET
        name = 'Gia Tộc Họ Phạm Đại Tôn',
        ancestor_name = 'Cụ Thủy Tổ Phạm Quý Công',
        origin = 'Làng Cổ Kính Chủ, Chí Linh, Hải Dương & Hà Nội',
        temple_address = 'Từ Đường Dòng Họ Phạm, Thôn Đông',
        anniversary_lunar = 'Ngày 16 tháng Giêng (Âm lịch)',
        description = 'Gia phả Gia Tộc Họ Phạm lưu truyền công đức tổ tiên, phát huy truyền thống hiếu học, trung hiếu nghĩa tình, đoàn kết tương thân tương ái, rạng danh con cháu muôn đời.',
        logo_text = '范',
        seo_title = 'Gia Tộc Họ Phạm - Cổng Thông Tin Gia Phả Điện Tử',
        seo_description = 'Hệ thống quản lý gia phả dòng họ trực tuyến với sơ đồ cây tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF.',
        seo_keywords = 'gia phả, họ phạm, gia tộc họ phạm, gia phả điện tử, cây phả hệ, đại tôn',
        og_image_url = 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
        updated_at = ?`,
      args: [now],
    });
  }

  // Seed pristine Họ Phạm sample tree
  await seedSampleMembers();
}

async function seedSampleMembers() {
  const now = new Date().toISOString();
  const sampleMembers = [
    // Đời 1: Cụ Thủy Tổ
    {
      id: 'mem_gen1_01',
      full_name: 'Phạm Văn Phúc',
      gender: 'male',
      birth_date: '1920-03-15',
      birth_year: 1920,
      is_alive: 0,
      death_date: '1995-10-20',
      burial_place: 'Nghĩa trang Dòng họ Phạm, Khu Lăng Mộ Tổ',
      occupation: 'Nhà Nho & Lương y',
      address: 'Từ Đường Họ Phạm, Thôn Đông',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      generation: 1,
      parent_id: null,
      mother_id: null,
      spouse_name: 'Trần Thị Hiền (1923 - 2002)',
      birth_order: 1,
      branch: 'Trưởng Tộc',
      phone: '',
      bio: 'Cụ Thủy tổ có công khai khẩn, mở mang từ đường dòng họ Phạm, lương y nhân từ cứu giúp bà con dân làng. Đức độ cao dày, con cháu muôn đời ghi nhớ công ơn.',
    },

    // Đời 2: Các con của Cụ Phúc
    {
      id: 'mem_gen2_01',
      full_name: 'Phạm Văn Thành',
      gender: 'male',
      birth_date: '1945-06-12',
      birth_year: 1945,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Kỹ sư Thủy lợi (Đã nghỉ hưu)',
      address: 'Số 18 Hoàng Hoa Thám, Ba Đình, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      generation: 2,
      parent_id: 'mem_gen1_01',
      mother_id: null,
      spouse_name: 'Lê Thị Mai (1948)',
      birth_order: 1,
      branch: 'Chi Trưởng',
      phone: '0912345678',
      bio: 'Trưởng chi đời thứ hai của gia tộc Họ Phạm, tích cực kết nối bà con họ tộc và chủ trì tu bổ từ đường.',
    },
    {
      id: 'mem_gen2_02',
      full_name: 'Phạm Thị Hoa',
      gender: 'female',
      birth_date: '1948-09-24',
      birth_year: 1948,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Giáo viên Nhân dân',
      address: 'Quận Cầu Giấy, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      generation: 2,
      parent_id: 'mem_gen1_01',
      mother_id: null,
      spouse_name: 'Nguyễn Quốc Hùng (1946)',
      birth_order: 2,
      branch: 'Chi Hai',
      phone: '0987654321',
      bio: 'Cô giáo dạy văn mẫu mực, được tặng thưởng Huân chương vì sự nghiệp giáo dục.',
    },
    {
      id: 'mem_gen2_03',
      full_name: 'Phạm Văn Dũng',
      gender: 'male',
      birth_date: '1952-11-05',
      birth_year: 1952,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Sĩ quan Quân đội (Đại tá phục viên)',
      address: 'Hải Châu, TP Đà Nẵng',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      generation: 2,
      parent_id: 'mem_gen1_01',
      mother_id: null,
      spouse_name: 'Hoàng Minh Châu (1955)',
      birth_order: 3,
      branch: 'Chi Ba',
      phone: '0905123456',
      bio: 'Chiến sĩ tham gia chiến trường giải phóng miền Nam, sau chuyển ngành về công tác tại Đà Nẵng.',
    },

    // Đời 3: Con của cụ Thành
    {
      id: 'mem_gen3_01',
      full_name: 'Phạm Đức Phi',
      gender: 'male',
      birth_date: '1975-04-18',
      birth_year: 1975,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Chuyên gia Công nghệ Thông tin & Quản trị',
      address: 'Cầu Giấy, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      generation: 3,
      parent_id: 'mem_gen2_01',
      mother_id: null,
      spouse_name: 'Vũ Thu Trang (1978)',
      birth_order: 1,
      branch: 'Chi Trưởng',
      phone: '0913888999',
      bio: 'Người phụ trách số hóa gia phả điện tử cho Gia Tộc Họ Phạm, kết nối con cháu trên toàn cầu.',
    },
    {
      id: 'mem_gen3_02',
      full_name: 'Phạm Thanh Hà',
      gender: 'female',
      birth_date: '1980-08-30',
      birth_year: 1980,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Bác sĩ Tim mạch - Bệnh viện Bạch Mai',
      address: 'Đống Đa, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      generation: 3,
      parent_id: 'mem_gen2_01',
      mother_id: null,
      spouse_name: 'Đặng Quốc Toàn (1977)',
      birth_order: 2,
      branch: 'Chi Trưởng',
      phone: '0982334455',
      bio: 'Bác sĩ chuyên khoa II, nhiều cống hiến trong điều trị và chăm sóc sức khỏe cộng đồng.',
    },

    // Con của cụ Dũng
    {
      id: 'mem_gen3_03',
      full_name: 'Phạm Văn Tuấn',
      gender: 'male',
      birth_date: '1982-01-15',
      birth_year: 1982,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Doanh nhân - Kiến trúc sư',
      address: 'Sơn Trà, TP Đà Nẵng',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      generation: 3,
      parent_id: 'mem_gen2_03',
      mother_id: null,
      spouse_name: 'Ngô Mỹ Linh (1985)',
      birth_order: 1,
      branch: 'Chi Ba',
      phone: '0905888777',
      bio: 'Chủ doanh nghiệp kiến trúc, tài trợ nhiều công trình khuyến học cho con cháu Họ Phạm.',
    },

    // Đời 4: Con của Phạm Đức Phi
    {
      id: 'mem_gen4_01',
      full_name: 'Phạm Minh Khang',
      gender: 'male',
      birth_date: '2005-10-10',
      birth_year: 2005,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Sinh viên ĐH Bách Khoa Hà Nội',
      address: 'Cầu Giấy, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      generation: 4,
      parent_id: 'mem_gen3_01',
      mother_id: null,
      spouse_name: '',
      birth_order: 1,
      branch: 'Chi Trưởng',
      phone: '0961223344',
      bio: 'Đạt giải Nhì Olympic Tin học toàn quốc, tích cực tham gia công tác thanh niên dòng họ.',
    },
    {
      id: 'mem_gen4_02',
      full_name: 'Phạm Bảo An',
      gender: 'female',
      birth_date: '2010-05-22',
      birth_year: 2010,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Học sinh THCS Chuyên Hà Nội - Amsterdam',
      address: 'Cầu Giấy, Hà Nội',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      generation: 4,
      parent_id: 'mem_gen3_01',
      mother_id: null,
      spouse_name: '',
      birth_order: 2,
      branch: 'Chi Trưởng',
      phone: '',
      bio: 'Học sinh giỏi toàn diện, đạt giải vẽ thiếu nhi quốc tế.',
    },
    // Con của Phạm Văn Tuấn
    {
      id: 'mem_gen4_03',
      full_name: 'Phạm Tuấn Kiệt',
      gender: 'male',
      birth_date: '2014-07-08',
      birth_year: 2014,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: 'Học sinh Tiểu học',
      address: 'Sơn Trà, TP Đà Nẵng',
      avatar_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80',
      generation: 4,
      parent_id: 'mem_gen3_03',
      mother_id: null,
      spouse_name: '',
      birth_order: 1,
      branch: 'Chi Ba',
      phone: '',
      bio: 'Cháu đích tôn chi ba đời thứ 4, chăm ngoan hiếu thảo.',
    }
  ];

  for (const m of sampleMembers) {
    await db.execute({
      sql: `INSERT INTO members (
        id, full_name, gender, birth_date, birth_year, is_alive, death_date, burial_place,
        occupation, address, avatar_url, generation, parent_id, mother_id, spouse_name,
        birth_order, branch, phone, bio, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        m.id,
        m.full_name,
        m.gender,
        m.birth_date,
        m.birth_year,
        m.is_alive,
        m.death_date,
        m.burial_place,
        m.occupation,
        m.address,
        m.avatar_url,
        m.generation,
        m.parent_id,
        m.mother_id,
        m.spouse_name,
        m.birth_order,
        m.branch,
        m.phone,
        m.bio,
        now,
        now,
      ],
    });
  }
  console.log('Sample members seeded successfully.');
}
