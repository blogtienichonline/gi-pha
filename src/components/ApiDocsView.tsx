import React, { useState } from 'react';
import {
  Code2,
  Copy,
  CheckCheck,
  Play,
  Key,
  Shield,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Smartphone,
  Layers,
  Database,
  Calendar,
  Users,
  RefreshCw,
  Server,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { User, ClanInfo } from '../types.ts';

interface ApiDocsViewProps {
  currentUser: User | null;
  clan: ClanInfo | null;
}

interface EndpointParam {
  name: string;
  in: 'path' | 'query' | 'body' | 'header';
  type: string;
  required: boolean;
  description: string;
  default?: string;
  example?: string;
}

interface ApiEndpoint {
  id: string;
  category: 'auth' | 'clan' | 'members' | 'tree' | 'anniversaries' | 'stats' | 'system';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  authRequired: boolean;
  allowedRoles?: string[];
  mobileNote: string;
  params?: EndpointParam[];
  requestBodyExample?: Record<string, any>;
  responseExample: Record<string, any>;
  errorExamples?: { code: number; message: string }[];
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // --- AUTH ---
  {
    id: 'auth-login',
    category: 'auth',
    method: 'POST',
    path: '/api/auth/login',
    title: 'Đăng nhập tài khoản',
    description: 'Xác thực tài khoản và mật khẩu của người dùng, trả về JWT Token và thông tin phân quyền.',
    authRequired: false,
    mobileNote: 'Lưu token vào Flutter Secure Storage, React Native Keychain hoặc iOS Keychain / Android EncryptedSharedPreferences để tự động đính kèm vào các request sau.',
    params: [
      { name: 'username', in: 'body', type: 'string', required: true, description: 'Tên đăng nhập', example: 'ducphi' },
      { name: 'password', in: 'body', type: 'string', required: true, description: 'Mật khẩu', example: '123456' },
    ],
    requestBodyExample: {
      username: 'ducphi',
      password: 'mypassword123',
    },
    responseExample: {
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'user_admin_01',
        username: 'ducphi',
        full_name: 'Phạm Văn Đức (Quản Trị)',
        role: 'admin',
      },
      message: 'Đăng nhập thành công! Chào mừng bạn.',
    },
    errorExamples: [
      { code: 400, message: 'Vui lòng điền tên đăng nhập và mật khẩu.' },
      { code: 401, message: 'Sai tên đăng nhập hoặc mật khẩu.' },
    ],
  },
  {
    id: 'auth-register',
    category: 'auth',
    method: 'POST',
    path: '/api/auth/register',
    title: 'Đăng ký tài khoản thành viên',
    description: 'Tạo mới tài khoản thành viên trong gia tộc với vai trò mặc định là người xem (viewer).',
    authRequired: false,
    mobileNote: 'Sau khi đăng ký thành công, server trả về sẵn JWT Token nên app có thể đăng nhập tự động ngay lập tức mà không cần màn hình login lại.',
    params: [
      { name: 'username', in: 'body', type: 'string', required: true, description: 'Tên đăng nhập (tối thiểu 3 ký tự)', example: 'phamminh' },
      { name: 'password', in: 'body', type: 'string', required: true, description: 'Mật khẩu (tối thiểu 3 ký tự)', example: 'matkhau123' },
      { name: 'full_name', in: 'body', type: 'string', required: true, description: 'Họ và tên đầy đủ', example: 'Phạm Minh Anh' },
    ],
    requestBodyExample: {
      username: 'phamminh',
      password: 'matkhau123',
      full_name: 'Phạm Minh Anh',
    },
    responseExample: {
      success: true,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 'user_1710000000000',
        username: 'phamminh',
        full_name: 'Phạm Minh Anh',
        role: 'viewer',
      },
      message: 'Đăng ký tài khoản thành công! Chào mừng bạn đến với Gia Phả.',
    },
    errorExamples: [
      { code: 400, message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.' },
    ],
  },
  {
    id: 'auth-me',
    category: 'auth',
    method: 'GET',
    path: '/api/auth/me',
    title: 'Kiểm tra phiên đăng nhập hiện tại',
    description: 'Xác minh JWT Token trong Header, trả về thông tin tài khoản hiện hành và quyền thao tác.',
    authRequired: false,
    mobileNote: 'Gọi API này khi mở app (Splash Screen) để kiểm tra xem Token đã lưu còn hạn hợp lệ hay cần chuyển về màn hình đăng nhập.',
    responseExample: {
      success: true,
      user: {
        id: 'user_admin_01',
        username: 'ducphi',
        full_name: 'Phạm Văn Đức',
        role: 'admin',
      },
      role: 'admin',
    },
  },
  {
    id: 'auth-profile',
    category: 'auth',
    method: 'PUT',
    path: '/api/auth/profile',
    title: 'Cập nhật họ tên cá nhân',
    description: 'Cho phép người dùng đã đăng nhập tự thay đổi thông tin hiển thị của bản thân.',
    authRequired: true,
    allowedRoles: ['admin', 'editor', 'viewer'],
    mobileNote: 'Tích hợp vào màn hình Cài đặt cá nhân / Tài khoản của tôi trên mobile.',
    params: [
      { name: 'full_name', in: 'body', type: 'string', required: true, description: 'Họ tên mới', example: 'Phạm Hoàng Minh' },
    ],
    requestBodyExample: {
      full_name: 'Phạm Hoàng Minh',
    },
    responseExample: {
      success: true,
      message: 'Cập nhật thông tin tài khoản thành công.',
    },
  },
  {
    id: 'auth-change-password',
    category: 'auth',
    method: 'PUT',
    path: '/api/auth/change-password',
    title: 'Đổi mật khẩu tài khoản',
    description: 'Xác thực mật khẩu cũ và cập nhật mật khẩu mới cho người dùng hiện tại.',
    authRequired: true,
    allowedRoles: ['admin', 'editor', 'viewer'],
    mobileNote: 'Mobile app nên xác thực khớp mật khẩu mới trước khi gửi payload lên server.',
    params: [
      { name: 'old_password', in: 'body', type: 'string', required: true, description: 'Mật khẩu hiện tại', example: '123456' },
      { name: 'new_password', in: 'body', type: 'string', required: true, description: 'Mật khẩu mới (>= 3 ký tự)', example: 'newpass2026' },
    ],
    requestBodyExample: {
      old_password: '123456',
      new_password: 'newpass2026',
    },
    responseExample: {
      success: true,
      message: 'Đổi mật khẩu thành công.',
    },
    errorExamples: [
      { code: 400, message: 'Mật khẩu hiện tại không chính xác.' },
    ],
  },

  // --- CLAN ---
  {
    id: 'clan-get',
    category: 'clan',
    method: 'GET',
    path: '/api/clan',
    title: 'Lấy thông tin Gia Tộc & Từ Đường',
    description: 'Lấy thông tin tổng thể về dòng họ: tên đại tộc, thủy tổ, địa chỉ nhà thờ tổ, ngày giỗ tổ âm lịch, huấn từ gia phong và cấu hình màu sắc thương hiệu.',
    authRequired: false,
    mobileNote: 'Mobile app có thể cache thông tin này trong bộ nhớ để render Header, Banner và cấu hình Theme màu sắc cho ứng dụng.',
    responseExample: {
      success: true,
      clan: {
        id: 'clan_default',
        name: 'Gia Tộc Họ Phạm',
        ancestor_name: 'Thủy Tổ Phạm Bá Đạt',
        origin: 'Nam Trực, Nam Định',
        temple_address: 'Từ Đường Họ Phạm, Thôn Thượng, Xã Hồng Quang, Huyện Nam Trực, Tỉnh Nam Định',
        anniversary_lunar: 'Ngày 10 tháng 3 Âm lịch (Giỗ Tổ Đại Tộc)',
        description: 'Ẩm thủy tư nguyên - Vạn đại trường tồn. Con cháu phụng thờ tiên tổ, gìn giữ gia phong, đùm bọc yêu thương.',
        theme_color: 'amber',
        bg_style: 'dark',
        pattern_style: 'dongson',
        logo_text: 'PHẠM TỘC',
        logo_url: 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
      },
    },
  },
  {
    id: 'clan-update',
    category: 'clan',
    method: 'PUT',
    path: '/api/clan',
    title: 'Cập nhật thông tin gia tộc (Admin)',
    description: 'Chỉnh sửa các trường thông tin chung của dòng họ, ngày giỗ tổ, địa chỉ từ đường và tôn chỉ.',
    authRequired: true,
    allowedRoles: ['admin'],
    mobileNote: 'Chỉ hiển thị cho người dùng có quyền Admin trong trang Cài Đặt Đại Tộc.',
    requestBodyExample: {
      name: 'Gia Tộc Họ Phạm',
      ancestor_name: 'Thủy Tổ Phạm Bá Đạt',
      origin: 'Nam Trực, Nam Định',
      temple_address: 'Từ Đường Họ Phạm, Xã Hồng Quang, Tỉnh Nam Định',
      anniversary_lunar: 'Ngày 10 tháng 3 Âm lịch',
      description: 'Ẩm thủy tư nguyên - Vạn đại trường tồn...',
      theme_color: 'amber',
      bg_style: 'dark',
    },
    responseExample: {
      success: true,
      message: 'Cập nhật thông tin gia tộc thành công.',
    },
  },

  // --- TREE ---
  {
    id: 'tree-get',
    category: 'tree',
    method: 'GET',
    path: '/api/tree',
    title: 'Cấu trúc Cây Gia Phả phân cấp lồng nhau',
    description: 'Trả về toàn bộ cây phả hệ dưới dạng danh sách gốc (roots) với các con cái (children) đệ quy lồng nhau, cùng danh sách phẳng (flat) hỗ trợ tìm kiếm.',
    authRequired: false,
    mobileNote: 'Đây là API cốt lõi để vẽ Interactive Family Tree Canvas trên Flutter (GraphView) hoặc React Native (react-flow / d3-hierarchy / custom SVG Canvas).',
    responseExample: {
      success: true,
      total: 42,
      roots: [
        {
          id: '1',
          full_name: 'Phạm Bá Đạt',
          gender: 'male',
          generation: 1,
          birth_year: 1910,
          is_alive: 0,
          death_date: '1985-04-15',
          spouse_name: 'Nguyễn Thị Sen',
          children: [
            {
              id: '2',
              full_name: 'Phạm Văn Hùng',
              gender: 'male',
              generation: 2,
              parent_id: '1',
              children: [],
            },
          ],
        },
      ],
      flat: [
        { id: '1', full_name: 'Phạm Bá Đạt', generation: 1 },
        { id: '2', full_name: 'Phạm Văn Hùng', generation: 2 },
      ],
    },
  },

  // --- MEMBERS ---
  {
    id: 'members-list',
    category: 'members',
    method: 'GET',
    path: '/api/members',
    title: 'Tra cứu & Lọc danh sách thành viên',
    description: 'Tìm kiếm thành viên siêu tốc theo từ khóa (họ tên, năm sinh) và các bộ lọc: thế hệ, giới tính, trạng thái còn sống/đã mất, chi nhánh.',
    authRequired: false,
    mobileNote: 'Hỗ trợ tính năng Instant Search (gõ đến đâu tìm đến đó) và Infinite Scroll / Pull-to-Refresh trên điện thoại.',
    params: [
      { name: 'q', in: 'query', type: 'string', required: false, description: 'Từ khóa tìm kiếm (họ tên hoặc năm sinh, ví dụ: 1975, Phạm)', example: 'Phạm' },
      { name: 'generation', in: 'query', type: 'number', required: false, description: 'Lọc theo đời/thế hệ (ví dụ: 1, 2, 3)', example: '2' },
      { name: 'gender', in: 'query', type: 'string', required: false, description: 'Giới tính (male hoặc female)', example: 'male' },
      { name: 'is_alive', in: 'query', type: 'number', required: false, description: 'Còn sống (1) hoặc đã mất (0)', example: '1' },
      { name: 'branch', in: 'query', type: 'string', required: false, description: 'Chi nhánh dòng họ (Chi Trưởng, Chi Hai...)', example: 'Chi Trưởng' },
    ],
    responseExample: {
      success: true,
      total: 35,
      members: [
        {
          id: 'mem_1',
          full_name: 'Phạm Văn Hùng',
          gender: 'male',
          generation: 2,
          birth_year: 1940,
          is_alive: 1,
          occupation: 'Kỹ sư Cầu đường (Nghỉ hưu)',
          address: 'Hà Nội',
          phone: '0912345678',
          spouse_name: 'Trần Thị Mai',
          parent_id: '1',
          birth_order: 1,
          branch: 'Chi Trưởng',
        },
      ],
    },
  },
  {
    id: 'members-detail',
    category: 'members',
    method: 'GET',
    path: '/api/members/:id',
    title: 'Hồ sơ chi tiết & Quan hệ 3 thế hệ',
    description: 'Truy xuất toàn bộ hồ sơ một thành viên cụ thể kèm theo quan hệ ruột thịt 3 đời: Cha/mẹ (parent), danh sách các con (children), anh chị em cùng cha (siblings).',
    authRequired: false,
    mobileNote: 'Dùng cho màn hình Member Profile BottomSheet hoặc Detail Screen với các nút bấm chạm để điều hướng nhanh sang cha mẹ hoặc con cái.',
    params: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Mã định danh thành viên', example: '2' },
    ],
    responseExample: {
      success: true,
      member: {
        id: '2',
        full_name: 'Phạm Văn Hùng',
        gender: 'male',
        generation: 2,
        birth_year: 1940,
        birth_date: '1940-06-15',
        is_alive: 1,
        occupation: 'Kỹ sư',
        phone: '0912345678',
        address: 'Hà Nội',
        spouse_name: 'Trần Thị Mai',
        parent_id: '1',
        bio: 'Nguyên cán bộ ngành giao thông vận tải, có nhiều công lao xây dựng từ đường họ Phạm.',
        parent: {
          id: '1',
          full_name: 'Phạm Bá Đạt',
          generation: 1,
          birth_year: 1910,
        },
        children: [
          { id: '5', full_name: 'Phạm Minh Tuấn', generation: 3, birth_year: 1970, birth_order: 1 },
          { id: '6', full_name: 'Phạm Thị Lan', generation: 3, birth_year: 1975, birth_order: 2 },
        ],
        siblings: [
          { id: '3', full_name: 'Phạm Thị Hương', generation: 2, birth_year: 1945 },
          { id: '4', full_name: 'Phạm Văn Dũng', generation: 2, birth_year: 1948 },
        ],
      },
    },
  },
  {
    id: 'members-create',
    category: 'members',
    method: 'POST',
    path: '/api/members',
    title: 'Thêm mới thành viên vào gia phả',
    description: 'Thêm một thành viên mới. Hệ thống tự động kiểm tra tính hợp lệ: thế hệ con phải đúng bằng thế hệ cha + 1, không được trùng thứ tự con trong cùng một người cha.',
    authRequired: true,
    allowedRoles: ['admin', 'editor'],
    mobileNote: 'Yêu cầu Bearer Token của tài khoản Admin hoặc Editor. Hiển thị form thêm thành viên mượt mà với gợi ý danh sách cha mẹ.',
    params: [
      { name: 'full_name', in: 'body', type: 'string', required: true, description: 'Họ và tên đầy đủ', example: 'Phạm Quốc Bảo' },
      { name: 'gender', in: 'body', type: 'string', required: true, description: 'Giới tính (male | female)', example: 'male' },
      { name: 'generation', in: 'body', type: 'number', required: true, description: 'Thế hệ (đời thứ)', example: '4' },
      { name: 'parent_id', in: 'body', type: 'string', required: false, description: 'Mã định danh cha/mẹ', example: '5' },
      { name: 'birth_order', in: 'body', type: 'number', required: false, description: 'Con thứ mấy trong nhà (1, 2, 3...)', example: '1' },
      { name: 'birth_year', in: 'body', type: 'number', required: false, description: 'Năm sinh', example: '2005' },
      { name: 'is_alive', in: 'body', type: 'number', required: true, description: 'Còn sống (1) hoặc đã mất (0)', example: '1' },
      { name: 'phone', in: 'body', type: 'string', required: false, description: 'Số điện thoại', example: '0988776655' },
    ],
    requestBodyExample: {
      full_name: 'Phạm Quốc Bảo',
      gender: 'male',
      generation: 4,
      parent_id: '5',
      birth_order: 1,
      birth_year: 2005,
      is_alive: 1,
      phone: '0988776655',
      occupation: 'Sinh viên',
      address: 'Hà Nội',
      branch: 'Chi Trưởng',
    },
    responseExample: {
      success: true,
      message: 'Thêm thành viên mới thành công.',
      member: {
        id: 'mem_17100000000',
        full_name: 'Phạm Quốc Bảo',
        generation: 4,
      },
    },
    errorExamples: [
      { code: 400, message: 'Thế hệ của con (4) phải lớn hơn thế hệ của cha (3) đúng 1 bậc.' },
      { code: 400, message: 'Người cha này đã có con thứ 1. Vui lòng chọn thứ tự con khác.' },
    ],
  },
  {
    id: 'members-update',
    category: 'members',
    method: 'PUT',
    path: '/api/members/:id',
    title: 'Cập nhật thông tin thành viên',
    description: 'Chỉnh sửa toàn bộ thông tin cá nhân, ngày sinh, ngày mất, phần mộ, tiểu sử, số điện thoại của một thành viên.',
    authRequired: true,
    allowedRoles: ['admin', 'editor'],
    mobileNote: 'Có thể dùng để cập nhật ảnh đại diện sau khi upload ảnh lên CDN hoặc server.',
    params: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Mã định danh thành viên', example: '2' },
    ],
    requestBodyExample: {
      full_name: 'Phạm Văn Hùng',
      occupation: 'Kỹ sư Cầu đường (Nghỉ hưu)',
      phone: '0912345678',
      address: 'Phố cổ Hà Nội',
      bio: 'Đóng góp nhiều công sức xây dựng từ đường họ.',
    },
    responseExample: {
      success: true,
      message: 'Cập nhật thông tin thành viên thành công.',
    },
  },
  {
    id: 'members-delete',
    category: 'members',
    method: 'DELETE',
    path: '/api/members/:id',
    title: 'Xóa thành viên khỏi gia phả',
    description: 'Xóa một thành viên. Nếu thành viên đó đã có con cái trong cây gia phả, server sẽ chặn xóa để bảo đảm toàn vẹn phả hệ.',
    authRequired: true,
    allowedRoles: ['admin', 'editor'],
    mobileNote: 'Mobile app nên hiển thị hộp thoại xác nhận (AlertDialog) cảnh báo rõ trước khi gọi API xóa.',
    params: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Mã định danh thành viên', example: '99' },
    ],
    responseExample: {
      success: true,
      message: 'Đã xóa thành viên khỏi gia phả thành công.',
    },
    errorExamples: [
      { code: 400, message: 'Không thể xóa thành viên này vì đang có 2 con trong gia phả. Hãy xóa hoặc gán lại cha mẹ cho các con trước.' },
    ],
  },

  // --- ANNIVERSARIES & MEMORIAL CALENDAR ---
  {
    id: 'anniversaries-list',
    category: 'anniversaries',
    method: 'GET',
    path: '/api/anniversaries',
    title: 'Lịch Ngày Giỗ & Tưởng Niệm Tổ Tiên',
    description: 'Trả về thông tin ngày Giỗ Tổ chung của dòng họ và danh sách tất cả các cụ đã khuất với ngày mất, ngày giỗ, nơi an táng và tên vợ/chồng.',
    authRequired: false,
    mobileNote: 'Cực kỳ quan trọng cho Mobile: Dùng để lập Lịch Gia Tộc (Calendar View) và lên lịch thông báo cục bộ (Local Push Notification) trước 1 ngày và đúng ngày giỗ.',
    responseExample: {
      success: true,
      clan: {
        name: 'Gia Tộc Họ Phạm',
        anniversary_lunar: 'Ngày 10 tháng 3 Âm lịch',
        temple_address: 'Từ Đường Họ Phạm, Hồng Quang, Nam Trực, Nam Định',
      },
      total: 12,
      anniversaries: [
        {
          id: '1',
          full_name: 'Phạm Bá Đạt',
          gender: 'male',
          generation: 1,
          birth_year: 1910,
          death_date: '1985-04-15 (Tức 26/02 Âm lịch)',
          burial_place: 'Khu lăng mộ Tổ họ Phạm, Nam Trực',
          spouse_name: 'Nguyễn Thị Sen',
          branch: 'Chi Trưởng',
        },
        {
          id: '8',
          full_name: 'Phạm Văn Hậu',
          gender: 'male',
          generation: 3,
          birth_year: 1968,
          death_date: '2020-11-02 (Tức 17/09 Âm lịch)',
          burial_place: 'Nghĩa trang quê nhà',
          spouse_name: 'Lê Thị Thu',
          branch: 'Chi Trưởng',
        },
      ],
    },
  },

  // --- STATS & GENERATIONS ---
  {
    id: 'stats-get',
    category: 'stats',
    method: 'GET',
    path: '/api/stats',
    title: 'Thống kê tổng quan nhân khẩu',
    description: 'Thống kê các chỉ số cốt lõi: tổng số thành viên, số nam, số nữ, số người còn sống/đã mất, tổng số thế hệ (đời) và các chi nhánh.',
    authRequired: false,
    mobileNote: 'Render màn hình Dashboard thống kê với các thẻ KPI Card và biểu đồ tròn tỉ lệ nam/nữ.',
    responseExample: {
      success: true,
      stats: {
        totalMembers: 42,
        aliveMembers: 30,
        deceasedMembers: 12,
        maleMembers: 24,
        femaleMembers: 18,
        totalGenerations: 4,
        branches: ['Chi Trưởng', 'Chi Hai', 'Chi Ba'],
      },
    },
  },
  {
    id: 'generations-get',
    category: 'stats',
    method: 'GET',
    path: '/api/generations',
    title: 'Thống kê chi tiết theo từng thế hệ (đời)',
    description: 'Phân tích nhân khẩu học chia nhỏ theo từng thế hệ từ Đời 1 đến Đời N (số lượng, tỉ lệ nam/nữ, tỉ lệ còn sống/đã mất).',
    authRequired: false,
    mobileNote: 'Dùng để vẽ biểu đồ cột phân bố thế hệ hoặc tạo Tab lọc nhanh theo đời trên mobile.',
    responseExample: {
      success: true,
      total_generations: 4,
      generations: [
        { generation: 1, total_members: 1, alive_count: 0, deceased_count: 1, male_count: 1, female_count: 0 },
        { generation: 2, total_members: 4, alive_count: 2, deceased_count: 2, male_count: 3, female_count: 1 },
        { generation: 3, total_members: 15, alive_count: 12, deceased_count: 3, male_count: 8, female_count: 7 },
        { generation: 4, total_members: 22, alive_count: 22, deceased_count: 0, male_count: 12, female_count: 10 },
      ],
    },
  },

  // --- SYSTEM ---
  {
    id: 'system-status',
    category: 'system',
    method: 'GET',
    path: '/api/system/status',
    title: 'Kiểm tra trạng thái máy chủ & Cloud Database',
    description: 'Đo độ trễ kết nối database (latency ms), kiểm tra tình trạng hoạt động của máy chủ (dành cho Admin).',
    authRequired: true,
    allowedRoles: ['admin'],
    mobileNote: 'Dùng cho màn hình Admin Diagnostics trên ứng dụng di động.',
    responseExample: {
      success: true,
      status: 'healthy',
      database: {
        provider: 'Cloud Database (Turso libSQL)',
        connected: true,
        latencyMs: 18,
      },
      stats: {
        membersCount: 42,
        usersCount: 3,
      },
      serverTime: '2026-09-14T07:45:00.000Z',
    },
  },
];

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ currentUser, clan }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(API_ENDPOINTS[0].id);
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<'curl' | 'dart' | 'react-native' | 'swift' | 'kotlin'>('dart');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live tester state
  const [authToken, setAuthToken] = useState<string>(() => {
    return localStorage.getItem('giapha_auth_token') || '';
  });
  const [testerParams, setTesterParams] = useState<Record<string, string>>({});
  const [testerBody, setTesterBody] = useState<string>('');
  const [testerLoading, setTesterLoading] = useState<boolean>(false);
  const [testerResponse, setTesterResponse] = useState<{
    status: number;
    statusText: string;
    timeMs: number;
    data: any;
  } | null>(null);

  const selectedEndpoint = API_ENDPOINTS.find((ep) => ep.id === selectedEndpointId) || API_ENDPOINTS[0];

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpointId(endpoint.id);
    setTesterResponse(null);
    if (endpoint.requestBodyExample) {
      setTesterBody(JSON.stringify(endpoint.requestBodyExample, null, 2));
    } else {
      setTesterBody('');
    }
    const defaultParams: Record<string, string> = {};
    endpoint.params?.forEach((p) => {
      if (p.in !== 'body' && p.example) {
        defaultParams[p.name] = p.example;
      }
    });
    setTesterParams(defaultParams);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run real live test
  const handleExecuteLiveTest = async () => {
    setTesterLoading(true);
    setTesterResponse(null);
    const startTime = performance.now();

    try {
      let resolvedPath = selectedEndpoint.path;
      // Replace path parameters (e.g. :id)
      selectedEndpoint.params?.forEach((p) => {
        if (p.in === 'path') {
          const val = testerParams[p.name] || p.example || '1';
          resolvedPath = resolvedPath.replace(`:${p.name}`, encodeURIComponent(val));
        }
      });

      // Build query params
      const queryParts: string[] = [];
      selectedEndpoint.params?.forEach((p) => {
        if (p.in === 'query') {
          const val = testerParams[p.name];
          if (val && val.trim()) {
            queryParts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(val.trim())}`);
          }
        }
      });

      if (queryParts.length > 0) {
        resolvedPath += `?${queryParts.join('&')}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken.trim()) {
        headers['Authorization'] = `Bearer ${authToken.trim()}`;
      }

      const fetchOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (['POST', 'PUT'].includes(selectedEndpoint.method) && testerBody.trim()) {
        fetchOptions.body = testerBody.trim();
      }

      const res = await fetch(resolvedPath, fetchOptions);
      const latency = Math.round(performance.now() - startTime);

      let responseData: any;
      try {
        responseData = await res.json();
      } catch {
        responseData = await res.text();
      }

      setTesterResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: latency,
        data: responseData,
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      setTesterResponse({
        status: 0,
        statusText: 'Network Error / Client Exception',
        timeMs: latency,
        data: { error: err.message || 'Không thể kết nối máy chủ' },
      });
    } finally {
      setTesterLoading(false);
    }
  };

  // Filter endpoints
  const filteredEndpoints = API_ENDPOINTS.filter((ep) => {
    const matchesCat = activeCategory === 'all' || ep.category === activeCategory;
    const matchesQuery =
      !searchQuery ||
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Code snippet generator
  const generateSnippet = (ep: ApiEndpoint, lang: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://genealogy.domain.vn';
    let fullUrl = `${baseUrl}${ep.path}`;
    if (ep.params) {
      ep.params.forEach((p) => {
        if (p.in === 'path') {
          fullUrl = fullUrl.replace(`:${p.name}`, p.example || '1');
        }
      });
    }

    if (lang === 'curl') {
      const authHeader = ep.authRequired ? ` \\\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"` : '';
      if (['POST', 'PUT'].includes(ep.method)) {
        const bodyStr = JSON.stringify(ep.requestBodyExample || {}, null, 2);
        return `curl -X ${ep.method} "${fullUrl}" \\\n  -H "Content-Type: application/json"${authHeader} \\\n  -d '${bodyStr}'`;
      }
      return `curl -X ${ep.method} "${fullUrl}"${authHeader ? ` \\\n  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"` : ''}`;
    }

    if (lang === 'dart') {
      return `// Flutter / Dart (http package)
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> callApi() async {
  final url = Uri.parse('${fullUrl}');
  final headers = {
    'Content-Type': 'application/json',${ep.authRequired ? "\n    'Authorization': 'Bearer \$jwtToken'," : ''}
  };

  ${
    ['POST', 'PUT'].includes(ep.method)
      ? `final response = await http.${ep.method.toLowerCase()}(
    url,
    headers: headers,
    body: jsonEncode(${JSON.stringify(ep.requestBodyExample || {}, null, 2)}),
  );`
      : `final response = await http.${ep.method.toLowerCase()}(url, headers: headers);`
  }

  if (response.statusCode >= 200 && response.statusCode < 300) {
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    print('Success: \$data');
  } else {
    print('Error \${response.statusCode}: \${response.body}');
  }
}`;
    }

    if (lang === 'react-native') {
      return `// React Native / TypeScript
async function fetchApi() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',${ep.authRequired ? "\n    'Authorization': `Bearer \${jwtToken}`," : ''}
  };

  const response = await fetch('${fullUrl}', {
    method: '${ep.method}',
    headers,${
      ['POST', 'PUT'].includes(ep.method)
        ? `\n    body: JSON.stringify(${JSON.stringify(ep.requestBodyExample || {}, null, 2)}),`
        : ''
    }
  });

  const data = await response.json();
  if (response.ok) {
    console.log('Success:', data);
    return data;
  } else {
    throw new Error(data.message || 'API request failed');
  }
}`;
    }

    if (lang === 'swift') {
      return `// iOS Swift (URLSession)
import Foundation

func requestApi() async throws {
    guard let url = URL(string: "${fullUrl}") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "${ep.method}"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")${
      ep.authRequired
        ? '\n    request.setValue("Bearer \\(jwtToken)", forHTTPHeaderField: "Authorization")'
        : ''
    }
    ${
      ['POST', 'PUT'].includes(ep.method)
        ? `let payload = ${JSON.stringify(ep.requestBodyExample || {}, null, 2)}
    request.httpBody = try? JSONSerialization.data(withJSONObject: payload)`
        : ''
    }
    let (data, response) = try await URLSession.shared.data(for: request)
    if let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) {
        let json = try JSONSerialization.jsonObject(with: data)
        print("Success: \\(json)")
    }
}`;
    }

    if (lang === 'kotlin') {
      return `// Android Kotlin (OkHttp / Retrofit)
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

fun executeRequest() {
    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    ${
      ['POST', 'PUT'].includes(ep.method)
        ? `val body = """${JSON.stringify(ep.requestBodyExample || {}, null, 2)}""".toRequestBody(mediaType)`
        : ''
    }
    val request = Request.Builder()
        .url("${fullUrl}")${
          ['POST', 'PUT'].includes(ep.method)
            ? `\n        .${ep.method.toLowerCase()}(body)`
            : `\n        .${ep.method.toLowerCase()}()`
        }${
          ep.authRequired
            ? '\n        .addHeader("Authorization", "Bearer \$jwtToken")'
            : ''
        }
        .build()

    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            println("Success: \${response.body?.string()}")
        }
    }
}`;
    }

    return '';
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'POST':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'PUT':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'DELETE':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="flex-1 w-full bg-stone-950 text-stone-100 flex flex-col min-h-screen">
      {/* Top Banner */}
      <div className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur px-4 sm:px-8 py-6">
        <div className="max-w-[1750px] mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>REST API JSON Specification • v1.2</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                Tài Liệu API & Hướng Dẫn Tích Hợp Mobile
              </h1>
              <p className="text-xs sm:text-sm text-stone-400 max-w-3xl">
                Cung cấp đầy đủ các chuẩn REST API JSON để kết nối ứng dụng di động (Flutter, React Native, iOS Swift, Android Kotlin) vào hệ thống cơ sở dữ liệu gia tộc {clan?.name || 'Gia Tộc Họ Phạm'}.
              </p>
            </div>

            {/* Live Environment Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-stone-400">Trạng thái:</span>
                <span className="font-semibold text-emerald-400">Sẵn sàng (200 OK)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2 text-xs">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-stone-400">Database:</span>
                <span className="font-semibold text-stone-200">Cloud libSQL</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2 text-xs">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-stone-400">Độ trễ:</span>
                <span className="font-semibold text-emerald-400 font-mono">~15ms</span>
              </div>
            </div>
          </div>

          {/* Quick Token Tester Bar */}
          <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-stone-300 font-medium shrink-0">Authorization Token:</span>
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Nhập JWT Token để thử nghiệm các API yêu cầu xác thực..."
                className="w-full sm:w-96 px-3 py-1.5 bg-stone-950 border border-stone-700 rounded-lg text-xs font-mono text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <button
                  onClick={() => {
                    const token = localStorage.getItem('giapha_auth_token') || '';
                    setAuthToken(token);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium cursor-pointer transition-colors"
                >
                  Dùng Token hiện tại ({currentUser.role})
                </button>
              ) : (
                <span className="text-[11px] text-stone-500">
                  (Chưa đăng nhập web - có thể dùng API <code>/api/auth/login</code> để lấy token)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-[1750px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Endpoints Navigator (4 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm API (tên, đường dẫn)..."
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'auth', label: 'Xác thực' },
              { id: 'clan', label: 'Dòng họ' },
              { id: 'tree', label: 'Cây phả hệ' },
              { id: 'members', label: 'Thành viên' },
              { id: 'anniversaries', label: 'Lịch giỗ' },
              { id: 'stats', label: 'Thống kê' },
              { id: 'system', label: 'Hệ thống' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredEndpoints.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 bg-stone-900/50 rounded-xl border border-stone-800">
                Không tìm thấy API nào khớp với từ khóa tìm kiếm.
              </div>
            ) : (
              filteredEndpoints.map((ep) => {
                const isSelected = ep.id === selectedEndpoint.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEndpoint(ep)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/80 shadow-md'
                        : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase shrink-0 ${getMethodBadgeClass(
                            ep.method
                          )}`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-[11px] font-mono text-stone-200 truncate">{ep.path}</code>
                      </div>
                      {ep.authRequired && (
                        <Shield className="w-3 h-3 text-amber-400 shrink-0" title="Yêu cầu Token" />
                      )}
                    </div>
                    <div className="text-xs text-stone-300 font-medium truncate">{ep.title}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Endpoint Details & Interactive Tester (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Header Card for Selected Endpoint */}
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase ${getMethodBadgeClass(
                    selectedEndpoint.method
                  )}`}
                >
                  {selectedEndpoint.method}
                </span>
                <code className="text-sm sm:text-base font-mono font-bold text-stone-100">
                  {selectedEndpoint.path}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedEndpoint.path, 'path-copy')}
                  className="p-1 rounded text-stone-400 hover:text-amber-400 cursor-pointer transition-colors"
                  title="Sao chép đường dẫn"
                >
                  {copiedId === 'path-copy' ? (
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Auth Badge */}
              <div className="flex items-center gap-2">
                {selectedEndpoint.authRequired ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Yêu cầu Token ({selectedEndpoint.allowedRoles?.join(', ') || 'Đã đăng nhập'})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Public (Không cần Token)
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-stone-100">{selectedEndpoint.title}</h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Mobile developer note */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý cho Ứng dụng Di động (Mobile App):</strong> {selectedEndpoint.mobileNote}
              </div>
            </div>
          </div>

          {/* Interactive Live API Tester (Playground) */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Thử Nghiệm Trực Tiếp (Live API Tester)</span>
              </div>
              <button
                onClick={handleExecuteLiveTest}
                disabled={testerLoading}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                {testerLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                <span>{testerLoading ? 'Đang gửi request...' : 'Gửi Request Ngay'}</span>
              </button>
            </div>

            {/* Parameters table if exists */}
            {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-300 block">Tham số (Parameters):</span>
                <div className="overflow-x-auto rounded-xl border border-stone-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
                      <tr>
                        <th className="p-2.5">Tên</th>
                        <th className="p-2.5">Vị trí</th>
                        <th className="p-2.5">Kiểu</th>
                        <th className="p-2.5">Bắt buộc</th>
                        <th className="p-2.5">Mô tả</th>
                        <th className="p-2.5">Giá trị thử nghiệm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 bg-stone-900/40">
                      {selectedEndpoint.params.map((param) => (
                        <tr key={param.name}>
                          <td className="p-2.5 font-mono text-amber-300 font-semibold">{param.name}</td>
                          <td className="p-2.5 text-stone-400">{param.in}</td>
                          <td className="p-2.5 font-mono text-blue-300">{param.type}</td>
                          <td className="p-2.5">
                            {param.required ? (
                              <span className="text-rose-400 font-semibold">Có</span>
                            ) : (
                              <span className="text-stone-500">Không</span>
                            )}
                          </td>
                          <td className="p-2.5 text-stone-300">{param.description}</td>
                          <td className="p-2.5">
                            {param.in !== 'body' ? (
                              <input
                                type="text"
                                value={testerParams[param.name] ?? (param.example || '')}
                                onChange={(e) =>
                                  setTesterParams({ ...testerParams, [param.name]: e.target.value })
                                }
                                className="px-2 py-1 bg-stone-950 border border-stone-700 rounded text-xs text-stone-100 font-mono w-32 sm:w-44 focus:outline-none focus:border-amber-500"
                              />
                            ) : (
                              <span className="text-stone-500 text-[11px]">(Nhập tại Request Body bên dưới)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Request Body Editor (if POST or PUT) */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">
                    Request Body (JSON Payload):
                  </span>
                  <button
                    onClick={() => {
                      if (selectedEndpoint.requestBodyExample) {
                        setTesterBody(JSON.stringify(selectedEndpoint.requestBodyExample, null, 2));
                      }
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Khôi phục mẫu mặc định
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={testerBody}
                  onChange={(e) => setTesterBody(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-stone-950 border border-stone-800 rounded-xl text-emerald-400 focus:outline-none focus:border-amber-500 resize-y"
                  placeholder="{\n  // JSON Payload\n}"
                />
              </div>
            )}

            {/* Real Response Window */}
            {testerResponse && (
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-stone-400">Kết quả phản hồi từ máy chủ:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        testerResponse.status >= 200 && testerResponse.status < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      Status: {testerResponse.status} {testerResponse.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 font-mono">
                      Thời gian: {testerResponse.timeMs} ms
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(testerResponse.data, null, 2), 'resp-copy')}
                      className="p-1 text-stone-400 hover:text-amber-400 cursor-pointer"
                      title="Sao chép kết quả"
                    >
                      {copiedId === 'resp-copy' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <pre className="text-xs font-mono text-stone-200 bg-stone-900/70 p-3 rounded-lg overflow-x-auto max-h-80 leading-relaxed">
                  {JSON.stringify(testerResponse.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Code Snippets for Multiple Languages */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                Mã Nguồn Mẫu (Code Snippet Generator):
              </span>

              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'curl', label: 'cURL' },
                  { id: 'dart', label: 'Flutter (Dart)' },
                  { id: 'react-native', label: 'React Native (TS)' },
                  { id: 'swift', label: 'iOS (Swift)' },
                  { id: 'kotlin', label: 'Android (Kotlin)' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedSnippetLang(lang.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      selectedSnippetLang === lang.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="text-xs font-mono text-stone-200 bg-stone-950 p-4 rounded-xl border border-stone-800 overflow-x-auto leading-relaxed">
                {generateSnippet(selectedEndpoint, selectedSnippetLang)}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(generateSnippet(selectedEndpoint, selectedSnippetLang), 'snippet-copy')
                }
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer shadow transition-colors flex items-center gap-1.5 text-[11px]"
              >
                {copiedId === 'snippet-copy' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Schema & Example */}
          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                Mẫu Phản Hồi Chuẩn Thành Công (200 OK Response Schema):
              </span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(selectedEndpoint.responseExample, null, 2), 'schema-copy')
                }
                className="p-1 text-stone-400 hover:text-amber-400 cursor-pointer"
                title="Sao chép JSON mẫu"
              >
                {copiedId === 'schema-copy' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <pre className="text-xs font-mono text-emerald-400/90 bg-stone-950 p-4 rounded-xl border border-stone-800 overflow-x-auto max-h-72 leading-relaxed">
              {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
            </pre>
          </div>

          {/* Mobile Integration Architecture Guidelines */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-900/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cẩm Nang Kiến Trúc Tích Hợp Mobile (Best Practices)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="font-semibold text-stone-200 block">1. Lưu Trữ Token An Toàn</span>
                <p className="text-stone-400 leading-relaxed">
                  Không lưu JWT Token vào LocalStorage thường hoặc SharedPreferences không mã hóa. Hãy sử dụng <code>Flutter Secure Storage</code> hoặc <code>React Native Keychain</code> để bảo vệ token chống rò rỉ.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="font-semibold text-stone-200 block">2. Caching & Chế Độ Ngoại Tuyến (Offline)</span>
                <p className="text-stone-400 leading-relaxed">
                  Cây phả hệ và danh sách thành viên ít khi thay đổi theo từng giây. Ứng dụng nên lưu cache cục bộ bằng SQLite / Isar / WatermelonDB để người dùng có thể tra cứu gia phả ngay cả khi mất sóng 4G/Wifi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="font-semibold text-stone-200 block">3. Nhắc Lịch Giỗ Tổ & Ngày Mất</span>
                <p className="text-stone-400 leading-relaxed">
                  Gọi API <code>GET /api/anniversaries</code> định kỳ và đăng ký thông báo cục bộ (Local Notification) trước 1 ngày lúc 18h00 để nhắc nhở con cháu chuẩn bị cỗ bàn, hương hoa chu đáo.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="font-semibold text-stone-200 block">4. Kiểm Tra Toàn Vẹn Cây Phả Hệ</span>
                <p className="text-stone-400 leading-relaxed">
                  Khi tạo mới thành viên, luôn tính toán <code>generation = parent.generation + 1</code>. Nếu là thủy tổ (không có cha mẹ), đặt <code>generation = 1</code> và <code>parent_id = null</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
