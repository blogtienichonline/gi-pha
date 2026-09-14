import express, { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'node:fs';
import path from 'node:path';
import {
  db,
  initDatabase,
  verifyPassword,
  hashPassword,
  resetToPhamClanDemo,
  getTursoHost,
  isCustomTursoConfigured,
  getTursoConfigInfo,
  setTursoCredentials,
  resetTursoToDefault,
} from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'giapha_jwt_secret_token_2026';

export const apiRouter = express.Router();

// GET /api/health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Gia Phả Họ Phạm API đang hoạt động bình thường',
    host: getTursoHost(),
    isCustomTurso: isCustomTursoConfigured(),
  });
});

// Middleware to extract user from Authorization header
export interface AuthenticatedUser {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'editor' | 'viewer';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Token invalid or expired, continue as unauthenticated (viewer)
  }
  next();
}

function requireRole(roles: Array<'admin' | 'editor' | 'viewer'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập với tài khoản được cấp quyền.',
      });
    }
    next();
  };
}

apiRouter.use(authMiddleware);

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password);

    // Auto-initialize tables and default admin if not yet initialized
    try {
      await initDatabase();
    } catch (initErr) {
      console.warn('[Auth] Database init check warning:', initErr);
    }

    let result;
    try {
      result = await db.execute({
        sql: 'SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?',
        args: [cleanUsername],
      });
    } catch (queryErr: any) {
      console.error('[Auth] Query error, attempting forced table initialization:', queryErr);
      await initDatabase(true);
      result = await db.execute({
        sql: 'SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?',
        args: [cleanUsername],
      });
    }

    if (!result || result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const user = result.rows[0];
    const isMatch = verifyPassword(cleanPassword, String(user.password_hash));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    const userPayload: AuthenticatedUser = {
      id: String(user.id),
      username: String(user.username),
      full_name: String(user.full_name),
      role: String(user.role) as 'admin' | 'editor' | 'viewer',
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      token,
      user: userPayload,
      message: 'Đăng nhập thành công.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message ? `Lỗi đăng nhập (${error.message})` : 'Lỗi máy chủ khi đăng nhập.',
    });
  }
});

// POST /api/auth/register (Tạo tài khoản mới tức thì không cần xác thực phức tạp)
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, full_name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản phải có ít nhất 3 ký tự.' });
    }
    if (cleanPassword.length < 3) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 3 ký tự.' });
    }

    // Check if username already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [cleanUsername],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này đã tồn tại trong hệ thống. Vui lòng chọn tài khoản khác hoặc chuyển sang Đăng nhập.',
      });
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const displayName = full_name && String(full_name).trim() ? String(full_name).trim() : cleanUsername;
    const passwordHash = hashPassword(cleanPassword);
    const createdAt = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, full_name, role, created_at)
            VALUES (?, ?, ?, ?, 'viewer', ?)`,
      args: [userId, cleanUsername, passwordHash, displayName, createdAt],
    });

    const userPayload: AuthenticatedUser = {
      id: userId,
      username: cleanUsername,
      full_name: displayName,
      role: 'viewer',
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '30d' });

    return res.json({
      success: true,
      token,
      user: userPayload,
      message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với Gia Phả.',
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký tài khoản.' });
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({ success: true, user: null, role: 'viewer' });
  }
  return res.json({ success: true, user: req.user, role: req.user.role });
});

// PUT /api/auth/profile (Update current user's profile)
apiRouter.put('/auth/profile', requireRole(['admin', 'editor', 'viewer']), async (req: Request, res: Response) => {
  try {
    const { full_name } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên không được để trống.' });
    }
    const userId = req.user!.id;
    await db.execute({
      sql: 'UPDATE users SET full_name = ? WHERE id = ?',
      args: [full_name.trim(), userId],
    });
    return res.json({ success: true, message: 'Cập nhật thông tin tài khoản thành công.' });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thông tin.' });
  }
});

// PUT /api/auth/change-password (Change own password)
apiRouter.put('/auth/change-password', requireRole(['admin', 'editor', 'viewer']), async (req: Request, res: Response) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền mật khẩu cũ và mật khẩu mới.' });
    }
    if (new_password.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự.' });
    }

    const userId = req.user!.id;
    const userRes = await db.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const isMatch = verifyPassword(old_password, String(userRes.rows[0].password_hash));
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
    }

    const newHash = hashPassword(new_password.trim());
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [newHash, userId],
    });

    return res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi đổi mật khẩu.' });
  }
});

// -------------------------------------------------------------
// CLAN INFO ENDPOINTS
// -------------------------------------------------------------

// GET /api/clan
apiRouter.get('/clan', async (_req: Request, res: Response) => {
  try {
    const result = await db.execute('SELECT * FROM clan_info LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          id: 'clan_default',
          name: 'Gia Phả Đại Tộc',
          ancestor_name: 'Cụ Thủy Tổ',
          origin: '',
          temple_address: '',
          anniversary_lunar: '',
          description: '',
        },
      });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Fetch clan error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải thông tin dòng họ.' });
  }
});

// PUT /api/clan (Admin only - updates clan info, logo, theme, and styling)
apiRouter.put('/clan', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const {
      name, ancestor_name, origin, temple_address, anniversary_lunar, description,
      logo_url, logo_text, logo_shape, theme_color, bg_style, pattern_style,
      seo_title, seo_description, seo_keywords, og_image_url
    } = req.body;
    const now = new Date().toISOString();

    const existing = await db.execute('SELECT * FROM clan_info LIMIT 1');
    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO clan_info (id, name, ancestor_name, origin, temple_address, anniversary_lunar, description, logo_url, logo_text, logo_shape, theme_color, bg_style, pattern_style, seo_title, seo_description, seo_keywords, og_image_url, updated_at)
              VALUES ('clan_default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          name ?? 'Gia Phả Đại Tộc',
          ancestor_name ?? '',
          origin ?? '',
          temple_address ?? '',
          anniversary_lunar ?? '',
          description ?? '',
          logo_url ?? null,
          logo_text ?? '氏',
          logo_shape ?? 'rounded-xl',
          theme_color ?? 'amber',
          bg_style ?? 'dark',
          pattern_style ?? 'dongson',
          seo_title ?? 'Remix Quản Lý Gia Phả - Gia Tộc Họ Phạm',
          seo_description ?? 'Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF truyền thống.',
          seo_keywords ?? 'gia phả, họ phạm, gia tộc họ phạm, phả hệ, đại tôn',
          og_image_url ?? 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
          now,
        ],
      });
    } else {
      const clan = existing.rows[0];
      const clanId = String(clan.id);
      await db.execute({
        sql: `UPDATE clan_info SET
                name = ?,
                ancestor_name = ?,
                origin = ?,
                temple_address = ?,
                anniversary_lunar = ?,
                description = ?,
                logo_url = ?,
                logo_text = ?,
                logo_shape = ?,
                theme_color = ?,
                bg_style = ?,
                pattern_style = ?,
                seo_title = ?,
                seo_description = ?,
                seo_keywords = ?,
                og_image_url = ?,
                updated_at = ?
              WHERE id = ?`,
        args: [
          name !== undefined ? name : clan.name,
          ancestor_name !== undefined ? ancestor_name : clan.ancestor_name,
          origin !== undefined ? origin : clan.origin,
          temple_address !== undefined ? temple_address : clan.temple_address,
          anniversary_lunar !== undefined ? anniversary_lunar : clan.anniversary_lunar,
          description !== undefined ? description : clan.description,
          logo_url !== undefined ? logo_url : clan.logo_url,
          logo_text !== undefined ? logo_text : (clan.logo_text || '氏'),
          logo_shape !== undefined ? logo_shape : (clan.logo_shape || 'rounded-xl'),
          theme_color !== undefined ? theme_color : (clan.theme_color || 'amber'),
          bg_style !== undefined ? bg_style : (clan.bg_style || 'dark'),
          pattern_style !== undefined ? pattern_style : (clan.pattern_style || 'dongson'),
          seo_title !== undefined ? seo_title : (clan.seo_title || 'Remix Quản Lý Gia Phả - Gia Tộc Họ Phạm'),
          seo_description !== undefined ? seo_description : (clan.seo_description || 'Cổng thông tin gia phả điện tử Gia Tộc Họ Phạm với sơ đồ phả hệ tương tác, lưu giữ công đức tổ tiên, bảo mật dòng tộc và xuất bản PDF truyền thống.'),
          seo_keywords !== undefined ? seo_keywords : (clan.seo_keywords || 'gia phả, họ phạm, gia tộc họ phạm, phả hệ, đại tôn'),
          og_image_url !== undefined ? og_image_url : (clan.og_image_url || 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png'),
          now,
          clanId,
        ],
      });
    }

    // Fetch updated clan
    const updated = await db.execute('SELECT * FROM clan_info LIMIT 1');
    return res.json({ success: true, message: 'Cập nhật thông tin và giao diện dòng họ thành công.', data: updated.rows[0] });
  } catch (error) {
    console.error('Update clan error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thông tin dòng họ.' });
  }
});

// -------------------------------------------------------------
// MEMBERS ENDPOINTS (CRUD & SEARCH)
// -------------------------------------------------------------

// GET /api/members (with fast search & filters)
apiRouter.get('/members', async (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const generation = req.query.generation ? Number(req.query.generation) : null;
    const gender = req.query.gender ? String(req.query.gender) : null;
    const isAlive = req.query.is_alive !== undefined && req.query.is_alive !== '' ? Number(req.query.is_alive) : null;
    const branch = req.query.branch ? String(req.query.branch) : null;

    let sql = 'SELECT * FROM members WHERE 1=1';
    const args: any[] = [];

    if (q) {
      // Check if q is a 4-digit number (year)
      const isYear = /^\d{4}$/.test(q);
      if (isYear) {
        sql += ' AND (birth_year = ? OR full_name LIKE ? OR occupation LIKE ? OR address LIKE ?)';
        args.push(Number(q), `%${q}%`, `%${q}%`, `%${q}%`);
      } else {
        sql += ' AND (full_name LIKE ? OR birth_year LIKE ? OR occupation LIKE ? OR address LIKE ? OR spouse_name LIKE ?)';
        args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      }
    }

    if (generation) {
      sql += ' AND generation = ?';
      args.push(generation);
    }

    if (gender) {
      sql += ' AND gender = ?';
      args.push(gender);
    }

    if (isAlive !== null) {
      sql += ' AND is_alive = ?';
      args.push(isAlive);
    }

    if (branch) {
      sql += ' AND branch = ?';
      args.push(branch);
    }

    sql += ' ORDER BY generation ASC, birth_order ASC, birth_year ASC';

    const result = await db.execute({ sql, args });
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('List members error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách thành viên.' });
  }
});

// GET /api/members/:id (single member with parent & children details)
apiRouter.get('/members/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM members WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin thành viên.' });
    }

    const member = result.rows[0];

    // Fetch parents
    let parent = null;
    if (member.parent_id) {
      const parentRes = await db.execute({
        sql: 'SELECT id, full_name, gender, birth_year, is_alive FROM members WHERE id = ?',
        args: [member.parent_id],
      });
      if (parentRes.rows.length > 0) {
        parent = parentRes.rows[0];
      }
    }

    // Fetch children
    const childrenRes = await db.execute({
      sql: 'SELECT id, full_name, gender, birth_year, is_alive, avatar_url, birth_order FROM members WHERE parent_id = ? ORDER BY birth_order ASC, birth_year ASC',
      args: [id],
    });

    // Fetch siblings (brothers/sisters with same parent_id)
    let siblings: any[] = [];
    if (member.parent_id) {
      const sibRes = await db.execute({
        sql: 'SELECT id, full_name, gender, birth_year, is_alive, birth_order FROM members WHERE parent_id = ? AND id != ? ORDER BY birth_order ASC',
        args: [member.parent_id, id],
      });
      siblings = sibRes.rows;
    }

    return res.json({
      success: true,
      data: {
        ...member,
        parent,
        children: childrenRes.rows,
        siblings,
      },
    });
  } catch (error) {
    console.error('Get member detail error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin chi tiết.' });
  }
});

// POST /api/members (Add new member - Admin or Editor)
apiRouter.post('/members', requireRole(['admin', 'editor']), async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      gender = 'male',
      birth_date,
      birth_year,
      is_alive = 1,
      death_date,
      burial_place,
      occupation,
      address,
      avatar_url,
      generation,
      parent_id,
      mother_id,
      spouse_name,
      birth_order = 1,
      branch,
      phone,
      bio,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên là bắt buộc.' });
    }

    // Determine birth_year if not given but birth_date is given
    let calculatedYear = birth_year ? Number(birth_year) : null;
    if (!calculatedYear && birth_date) {
      const match = String(birth_date).match(/\b(19\d\d|20\d\d)\b/);
      if (match) calculatedYear = parseInt(match[1], 10);
    }

    // Determine generation: if parent_id is provided, generation MUST strictly be parent.generation + 1
    let gen = generation ? Number(generation) : 1;
    const orderNum = Number(birth_order) || 1;

    if (parent_id) {
      const pRes = await db.execute({
        sql: 'SELECT generation, branch, full_name FROM members WHERE id = ?',
        args: [parent_id],
      });
      if (pRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin cha/mẹ được chọn.' });
      }
      gen = Number(pRes.rows[0].generation) + 1;

      // Check duplicate birth_order for this parent
      const dupCheck = await db.execute({
        sql: 'SELECT id, full_name, birth_order FROM members WHERE parent_id = ? AND birth_order = ?',
        args: [parent_id, orderNum],
      });
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cha/Mẹ (${pRes.rows[0].full_name}) đã có con thứ ${orderNum} (${dupCheck.rows[0].full_name}). Vui lòng chọn số thứ tự con khác.`,
        });
      }
    } else {
      // If no parent_id: generation cannot skip (e.g. cannot be gen 6 if gen 5 does not exist)
      if (gen > 1) {
        const prevGenCheck = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM members WHERE generation = ?',
          args: [gen - 1],
        });
        if (Number(prevGenCheck.rows[0]?.count || 0) === 0) {
          return res.status(400).json({
            success: false,
            message: `Không thể thêm thành viên Đời thứ ${gen} khi Đời thứ ${gen - 1} chưa có ai trong gia phả. Các thế hệ phải liên tục, không được nhảy cóc.`,
          });
        }
      }
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO members (
        id, full_name, gender, birth_date, birth_year, is_alive, death_date, burial_place,
        occupation, address, avatar_url, generation, parent_id, mother_id, spouse_name,
        birth_order, branch, phone, bio, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        full_name.trim(),
        gender,
        birth_date || null,
        calculatedYear,
        Number(is_alive),
        death_date || null,
        burial_place || null,
        occupation || null,
        address || null,
        avatar_url || null,
        gen,
        parent_id || null,
        mother_id || null,
        spouse_name || null,
        Number(birth_order) || 1,
        branch || null,
        phone || null,
        bio || null,
        now,
        now,
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm thành viên thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi lưu thông tin thành viên.' });
  }
});

// PUT /api/members/:id (Update member - Admin or Editor)
apiRouter.put('/members/:id', requireRole(['admin', 'editor']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      gender,
      birth_date,
      birth_year,
      is_alive,
      death_date,
      burial_place,
      occupation,
      address,
      avatar_url,
      generation,
      parent_id,
      mother_id,
      spouse_name,
      birth_order,
      branch,
      phone,
      bio,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên là bắt buộc.' });
    }

    if (parent_id && parent_id === id) {
      return res.status(400).json({ success: false, message: 'Thành viên không thể tự làm cha/mẹ của chính mình.' });
    }

    let calculatedYear = birth_year ? Number(birth_year) : null;
    if (!calculatedYear && birth_date) {
      const match = String(birth_date).match(/\b(19\d\d|20\d\d)\b/);
      if (match) calculatedYear = parseInt(match[1], 10);
    }

    let gen = generation ? Number(generation) : 1;
    const orderNum = Number(birth_order) || 1;

    if (parent_id) {
      const pRes = await db.execute({
        sql: 'SELECT generation, branch, full_name FROM members WHERE id = ?',
        args: [parent_id],
      });
      if (pRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy thông tin cha/mẹ được chọn.' });
      }
      gen = Number(pRes.rows[0].generation) + 1;

      // Check duplicate birth_order for other children of this parent
      const dupCheck = await db.execute({
        sql: 'SELECT id, full_name, birth_order FROM members WHERE parent_id = ? AND id != ? AND birth_order = ?',
        args: [parent_id, id, orderNum],
      });
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cha/Mẹ (${pRes.rows[0].full_name}) đã có con thứ ${orderNum} (${dupCheck.rows[0].full_name}). Không thể chọn trùng thứ tự con.`,
        });
      }
    } else {
      // If no parent_id: generation cannot skip (e.g. cannot jump to gen 6 if gen 5 does not exist)
      if (gen > 1) {
        const prevGenCheck = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM members WHERE generation = ? AND id != ?',
          args: [gen - 1, id],
        });
        if (Number(prevGenCheck.rows[0]?.count || 0) === 0) {
          return res.status(400).json({
            success: false,
            message: `Không thể chọn Đời thứ ${gen} khi Đời thứ ${gen - 1} chưa có thành viên nào khác trong gia phả. Các thế hệ phải liên tục, không được nhảy cóc.`,
          });
        }
      }
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE members SET
        full_name = ?, gender = ?, birth_date = ?, birth_year = ?, is_alive = ?, death_date = ?,
        burial_place = ?, occupation = ?, address = ?, avatar_url = ?, generation = ?,
        parent_id = ?, mother_id = ?, spouse_name = ?, birth_order = ?, branch = ?,
        phone = ?, bio = ?, updated_at = ?
        WHERE id = ?`,
      args: [
        full_name.trim(),
        gender,
        birth_date || null,
        calculatedYear,
        Number(is_alive),
        death_date || null,
        burial_place || null,
        occupation || null,
        address || null,
        avatar_url || null,
        gen,
        parent_id || null,
        mother_id || null,
        spouse_name || null,
        orderNum,
        branch || null,
        phone || null,
        bio || null,
        now,
        id,
      ],
    });

    return res.json({ success: true, message: 'Cập nhật thành viên thành công.' });
  } catch (error) {
    console.error('Update member error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thông tin thành viên.' });
  }
});

// DELETE /api/members/:id (Admin only)
apiRouter.delete('/members/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if member has children
    const childrenCheck = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM members WHERE parent_id = ?',
      args: [id],
    });

    const childCount = Number(childrenCheck.rows[0]?.count || 0);
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa thành viên này vì còn ${childCount} người con phụ thuộc. Vui lòng chuyển hoặc xóa con trước.`,
      });
    }

    await db.execute({
      sql: 'DELETE FROM members WHERE id = ?',
      args: [id],
    });

    return res.json({ success: true, message: 'Đã xóa thành viên khỏi gia phả.' });
  } catch (error) {
    console.error('Delete member error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa thành viên.' });
  }
});

// POST /api/members/bulk-add (Add multiple members at once - Admin or Editor)
apiRouter.post('/members/bulk-add', requireRole(['admin', 'editor']), async (req: Request, res: Response) => {
  try {
    const { members = [] } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách thành viên cần thêm không được để trống.' });
    }

    let addedCount = 0;
    const now = new Date().toISOString();
    const createdIds: string[] = [];

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const fullName = m.full_name?.trim();
      if (!fullName) continue;

      let calculatedYear = m.birth_year ? Number(m.birth_year) : null;
      if (!calculatedYear && m.birth_date) {
        const match = String(m.birth_date).match(/\b(19\d\d|20\d\d)\b/);
        if (match) calculatedYear = parseInt(match[1], 10);
      }

      const gen = m.generation ? Number(m.generation) : 1;
      const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${i}`;

      await db.execute({
        sql: `INSERT INTO members (
          id, full_name, gender, birth_date, birth_year, is_alive, death_date, burial_place,
          occupation, address, avatar_url, generation, parent_id, mother_id, spouse_name,
          birth_order, branch, phone, bio, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          fullName,
          m.gender === 'female' ? 'female' : 'male',
          m.birth_date || null,
          calculatedYear,
          m.is_alive !== undefined ? Number(m.is_alive) : 1,
          m.death_date || null,
          m.burial_place || null,
          m.occupation || null,
          m.address || null,
          m.avatar_url || null,
          gen,
          m.parent_id || null,
          m.mother_id || null,
          m.spouse_name || null,
          Number(m.birth_order) || (i + 1),
          m.branch || null,
          m.phone || null,
          m.bio || null,
          now,
          now,
        ],
      });

      createdIds.push(id);
      addedCount++;
    }

    return res.status(201).json({
      success: true,
      count: addedCount,
      message: `Đã thêm thành công ${addedCount} thành viên vào gia phả.`,
      ids: createdIds,
    });
  } catch (error) {
    console.error('Bulk add members error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi thêm thành viên hàng loạt.' });
  }
});

// POST /api/members/bulk-delete (Delete multiple members - Admin only)
apiRouter.post('/members/bulk-delete', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { ids = [], unlinkChildren = true } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một thành viên để xóa.' });
    }

    // If unlinkChildren is true, any children whose parents are in `ids` will have parent_id set to NULL
    if (unlinkChildren) {
      for (const id of ids) {
        await db.execute({
          sql: 'UPDATE members SET parent_id = NULL WHERE parent_id = ?',
          args: [id],
        });
      }
    } else {
      // Check if any member being deleted has child that is NOT in `ids`
      for (const id of ids) {
        const check = await db.execute({
          sql: 'SELECT COUNT(*) as count FROM members WHERE parent_id = ?',
          args: [id],
        });
        const count = Number(check.rows[0]?.count || 0);
        if (count > 0) {
          return res.status(400).json({
            success: false,
            message: 'Một số thành viên được chọn còn người con phụ thuộc. Hãy tích chọn gỡ liên kết con hoặc xóa con trước.',
          });
        }
      }
    }

    // Delete all selected members
    let deletedCount = 0;
    for (const id of ids) {
      await db.execute({
        sql: 'DELETE FROM members WHERE id = ?',
        args: [id],
      });
      deletedCount++;
    }

    return res.json({
      success: true,
      count: deletedCount,
      message: `Đã xóa thành công ${deletedCount} thành viên khỏi gia phả.`,
    });
  } catch (error) {
    console.error('Bulk delete members error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa thành viên hàng loạt.' });
  }
});

// POST /api/clan/reset-demo-pham (Admin only: Resets entire tree & clan info to Họ Phạm)
apiRouter.post('/clan/reset-demo-pham', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    await resetToPhamClanDemo();
    const updatedClan = await db.execute('SELECT * FROM clan_info LIMIT 1');
    return res.json({
      success: true,
      message: 'Đã thiết lập lại toàn bộ dữ liệu mẫu Gia Tộc Họ Phạm thành công (4 thế hệ chuẩn).',
      clan: updatedClan.rows[0],
    });
  } catch (error) {
    console.error('Reset to Pham clan error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi đặt lại dữ liệu Họ Phạm.' });
  }
});

// -------------------------------------------------------------
// TREE HIERARCHY ENDPOINT
// -------------------------------------------------------------

// GET /api/tree (Structured tree for visualization & mobile apps)
apiRouter.get('/tree', async (_req: Request, res: Response) => {
  try {
    const membersRes = await db.execute(
      'SELECT id, full_name, gender, birth_date, birth_year, is_alive, death_date, occupation, address, avatar_url, generation, parent_id, spouse_name, birth_order, branch FROM members ORDER BY generation ASC, birth_order ASC, birth_year ASC'
    );

    const members = membersRes.rows;

    // Build hierarchical tree
    const memberMap: Record<string, any> = {};
    members.forEach((m) => {
      memberMap[String(m.id)] = {
        ...m,
        children: [],
      };
    });

    const rootNodes: any[] = [];
    members.forEach((m) => {
      const node = memberMap[String(m.id)];
      if (m.parent_id && memberMap[String(m.parent_id)]) {
        memberMap[String(m.parent_id)].children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return res.json({
      success: true,
      roots: rootNodes,
      total: members.length,
      flat: members,
    });
  } catch (error) {
    console.error('Tree error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi dựng cây gia phả.' });
  }
});

// -------------------------------------------------------------
// STATS ENDPOINT
// -------------------------------------------------------------

// GET /api/stats
apiRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalRes = await db.execute('SELECT COUNT(*) as count FROM members');
    const aliveRes = await db.execute('SELECT COUNT(*) as count FROM members WHERE is_alive = 1');
    const deceasedRes = await db.execute('SELECT COUNT(*) as count FROM members WHERE is_alive = 0');
    const maleRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE gender = 'male'");
    const femaleRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE gender = 'female'");
    const genMaxRes = await db.execute('SELECT MAX(generation) as maxGen FROM members');
    const branchRes = await db.execute("SELECT DISTINCT branch FROM members WHERE branch IS NOT NULL AND branch != ''");

    return res.json({
      success: true,
      stats: {
        totalMembers: Number(totalRes.rows[0]?.count || 0),
        aliveMembers: Number(aliveRes.rows[0]?.count || 0),
        deceasedMembers: Number(deceasedRes.rows[0]?.count || 0),
        maleMembers: Number(maleRes.rows[0]?.count || 0),
        femaleMembers: Number(femaleRes.rows[0]?.count || 0),
        totalGenerations: Number(genMaxRes.rows[0]?.maxGen || 1),
        branches: branchRes.rows.map((b) => b.branch),
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải thống kê.' });
  }
});

// -------------------------------------------------------------
// ANNIVERSARIES & MEMORIAL CALENDAR ENDPOINT (Mobile push notifications & calendar)
// -------------------------------------------------------------

// GET /api/anniversaries
apiRouter.get('/anniversaries', async (_req: Request, res: Response) => {
  try {
    const clanRes = await db.execute('SELECT name, anniversary_lunar, temple_address FROM clan_info LIMIT 1');
    const clan: any = clanRes.rows[0] || {};

    const deceasedRes = await db.execute({
      sql: `SELECT id, full_name, gender, generation, birth_year, death_date, burial_place, spouse_name, branch
            FROM members
            WHERE is_alive = 0 OR death_date IS NOT NULL
            ORDER BY generation ASC, death_date ASC`,
    });

    return res.json({
      success: true,
      clan: {
        name: clan.name || 'Gia Tộc Họ Phạm',
        anniversary_lunar: clan.anniversary_lunar || 'Ngày 10 tháng 3 Âm lịch',
        temple_address: clan.temple_address || '',
      },
      total: deceasedRes.rows.length,
      anniversaries: deceasedRes.rows,
    });
  } catch (error) {
    console.error('Anniversaries error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách ngày giỗ.' });
  }
});

// -------------------------------------------------------------
// GENERATIONS SUMMARY ENDPOINT
// -------------------------------------------------------------

// GET /api/generations
apiRouter.get('/generations', async (_req: Request, res: Response) => {
  try {
    const result = await db.execute(`
      SELECT
        generation,
        COUNT(*) as total_members,
        SUM(CASE WHEN is_alive = 1 THEN 1 ELSE 0 END) as alive_count,
        SUM(CASE WHEN is_alive = 0 THEN 1 ELSE 0 END) as deceased_count,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female_count
      FROM members
      GROUP BY generation
      ORDER BY generation ASC
    `);

    return res.json({
      success: true,
      total_generations: result.rows.length,
      generations: result.rows.map((row) => ({
        generation: Number(row.generation),
        total_members: Number(row.total_members),
        alive_count: Number(row.alive_count),
        deceased_count: Number(row.deceased_count),
        male_count: Number(row.male_count),
        female_count: Number(row.female_count),
      })),
    });
  } catch (error) {
    console.error('Generations summary error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách thế hệ.' });
  }
});

// -------------------------------------------------------------
// USER MANAGEMENT (Admin only)
// -------------------------------------------------------------

// GET /api/users
apiRouter.get('/users', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const result = await db.execute('SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at ASC');
    return res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách tài khoản.' });
  }
});

// POST /api/users (Add user)
apiRouter.post('/users', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { username, password, full_name, role = 'editor' } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin tài khoản.' });
    }

    const userHash = hashPassword(password);
    const id = `user_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: 'INSERT INTO users (id, username, password_hash, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, username.trim().toLowerCase(), userHash, full_name.trim(), role, now],
    });

    return res.status(201).json({ success: true, message: 'Tạo tài khoản thành công.' });
  } catch (error: any) {
    if (String(error.message).includes('UNIQUE constraint')) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã tồn tại.' });
    }
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản.' });
  }
});

// PUT /api/users/:id
apiRouter.put('/users/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, role, password } = req.body;

    if (password && password.trim()) {
      const hash = hashPassword(password.trim());
      await db.execute({
        sql: 'UPDATE users SET full_name = ?, role = ?, password_hash = ? WHERE id = ?',
        args: [full_name, role, hash, id],
      });
    } else {
      await db.execute({
        sql: 'UPDATE users SET full_name = ?, role = ? WHERE id = ?',
        args: [full_name, role, id],
      });
    }

    return res.json({ success: true, message: 'Cập nhật tài khoản thành công.' });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tài khoản.' });
  }
});

// DELETE /api/users/:id
apiRouter.delete('/users/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Protect default admin from deletion
    const userRes = await db.execute({ sql: 'SELECT username FROM users WHERE id = ?', args: [id] });
    if (userRes.rows.length > 0 && String(userRes.rows[0].username) === 'ducphi') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản quản trị viên chính ducphi.' });
    }

    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    return res.json({ success: true, message: 'Đã xóa tài khoản.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khi xóa tài khoản.' });
  }
});

// -------------------------------------------------------------
// SYSTEM STATUS (Admin only - NEVER reveals secrets or file paths)
// -------------------------------------------------------------
apiRouter.get('/system/status', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await db.execute('SELECT 1');
    const latency = Date.now() - startTime;

    const memberCountRes = await db.execute('SELECT COUNT(*) as count FROM members');
    const userCountRes = await db.execute('SELECT COUNT(*) as count FROM users');
    const isCustom = isCustomTursoConfigured();

    return res.json({
      success: true,
      status: 'healthy',
      database: {
        provider: 'Cloud Database (Turso libSQL)',
        connected: true,
        latencyMs: latency,
        host: getTursoHost(),
        isCustomTurso: isCustom,
        configuredSource: isCustom
          ? 'Cơ sở dữ liệu Turso riêng của bạn'
          : 'Mặc định hệ thống (Fallback Demo DB)',
      },
      stats: {
        membersCount: Number(memberCountRes.rows[0]?.count || 0),
        usersCount: Number(userCountRes.rows[0]?.count || 0),
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Không thể kết nối cơ sở dữ liệu Turso.',
    });
  }
});

// -------------------------------------------------------------
// GET TURSO CONFIGURATION INFO (Admin only)
// -------------------------------------------------------------
apiRouter.get('/system/turso-config', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const info = getTursoConfigInfo();
    return res.json({
      success: true,
      data: info,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi lấy thông tin cấu hình Turso',
    });
  }
});

// -------------------------------------------------------------
// CONFIGURE DIRECT TURSO CONNECTION (Admin only)
// -------------------------------------------------------------
apiRouter.post('/system/turso-config', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const { databaseUrl, authToken, seedSampleData } = req.body;

    if (!databaseUrl || typeof databaseUrl !== 'string' || !databaseUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp URL cơ sở dữ liệu Turso (ví dụ: libsql://ten-db.turso.io).',
      });
    }

    if (!authToken || typeof authToken !== 'string' || !authToken.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp Auth Token của Turso (tạo bằng lệnh `turso db tokens create`).',
      });
    }

    // Connect & test
    const connectResult = await setTursoCredentials(databaseUrl, authToken, true);

    // Optionally seed sample genealogical tree if requested
    if (seedSampleData) {
      await resetToPhamClanDemo();
    }

    return res.json({
      success: true,
      message: connectResult.message,
      host: connectResult.host,
      latencyMs: connectResult.latencyMs,
      seeded: Boolean(seedSampleData),
    });
  } catch (err: any) {
    console.error('Error configuring Turso:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Lỗi khi kết nối vào cơ sở dữ liệu Turso. Vui lòng kiểm tra lại URL và Token.',
    });
  }
});

// -------------------------------------------------------------
// RESET TO DEFAULT TURSO DATABASE (Admin only)
// -------------------------------------------------------------
apiRouter.post('/system/reset-turso-default', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const resetResult = await resetTursoToDefault();
    return res.json({
      success: true,
      message: 'Đã chuyển về kết nối cơ sở dữ liệu Turso mặc định của hệ thống.',
      host: resetResult.host,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi khôi phục Turso mặc định.',
    });
  }
});

// -------------------------------------------------------------
// SEED INITIAL PHAM CLAN TREE TO CONNECTED TURSO (Admin only)
// -------------------------------------------------------------
apiRouter.post('/system/seed-turso', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    await resetToPhamClanDemo();
    const countRes = await db.execute('SELECT COUNT(*) as count FROM members');
    return res.json({
      success: true,
      message: 'Đã nạp thành công cây phả hệ Họ Phạm vào cơ sở dữ liệu Turso đang kết nối!',
      host: getTursoHost(),
      membersCount: Number(countRes.rows[0]?.count || 0),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi nạp dữ liệu mẫu vào Turso.',
    });
  }
});

// -------------------------------------------------------------
// LIVE TURSO READ & WRITE DIAGNOSTIC TEST (Admin only)
// -------------------------------------------------------------
apiRouter.post('/system/test-turso', requireRole(['admin']), async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    // 1. Ping
    await db.execute('SELECT 1');

    // 2. Read test
    const countRes = await db.execute('SELECT COUNT(*) as count FROM members');
    const readCount = Number(countRes.rows[0]?.count || 0);

    // 3. Write test
    await db.execute(`
      CREATE TABLE IF NOT EXISTS _turso_diagnostics (
        id TEXT PRIMARY KEY,
        tested_at TEXT NOT NULL,
        host TEXT NOT NULL
      )
    `);

    const testId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();
    await db.execute({
      sql: 'INSERT INTO _turso_diagnostics (id, tested_at, host) VALUES (?, ?, ?)',
      args: [testId, nowIso, getTursoHost()],
    });

    // 4. Read back & verify
    const verifyRes = await db.execute({
      sql: 'SELECT id, tested_at FROM _turso_diagnostics WHERE id = ?',
      args: [testId],
    });
    const writeSuccess = verifyRes.rows.length > 0;

    // 5. Cleanup
    await db.execute({
      sql: 'DELETE FROM _turso_diagnostics WHERE id = ?',
      args: [testId],
    });

    const latencyMs = Date.now() - startTime;

    return res.json({
      success: true,
      message: 'Kiểm tra đọc và ghi vào Turso thành công 100%!',
      host: getTursoHost(),
      isCustomTurso: isCustomTursoConfigured(),
      readCount,
      writeSuccess,
      cleanupSuccess: true,
      latencyMs,
      testedAt: nowIso,
    });
  } catch (error: any) {
    console.error('Turso diagnostic test error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Lỗi khi kiểm tra đọc/ghi Turso.',
      host: getTursoHost(),
      isCustomTurso: isCustomTursoConfigured(),
    });
  }
});

// -------------------------------------------------------------
// VIETNAMESE FONTS FOR ACCENTED PDF EXPORT
// -------------------------------------------------------------
let cachedFontPayload: { regular: string; bold: string } | null = null;

apiRouter.get('/fonts/vietnamese', (_req: Request, res: Response) => {
  try {
    if (cachedFontPayload) {
      return res.json({ success: true, fonts: cachedFontPayload });
    }

    const regPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
    const boldPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf');

    if (fs.existsSync(regPath) && fs.existsSync(boldPath)) {
      const regBuf = fs.readFileSync(regPath);
      const boldBuf = fs.readFileSync(boldPath);
      cachedFontPayload = {
        regular: regBuf.toString('base64'),
        bold: boldBuf.toString('base64'),
      };
      return res.json({ success: true, fonts: cachedFontPayload });
    }

    return res.status(404).json({ success: false, message: 'Font files not found on server' });
  } catch (err: any) {
    console.error('Error serving Vietnamese fonts:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

