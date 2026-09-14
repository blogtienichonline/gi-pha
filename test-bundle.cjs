var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/entry-serverless.ts
var entry_serverless_exports = {};
__export(entry_serverless_exports, {
  default: () => entry_serverless_default
});
module.exports = __toCommonJS(entry_serverless_exports);
var import_config2 = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);

// server/api.ts
var import_express = __toESM(require("express"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_node_fs2 = __toESM(require("node:fs"), 1);
var import_node_path2 = __toESM(require("node:path"), 1);

// server/db.ts
var import_config = require("dotenv/config");
var import_web = require("@libsql/client/web");
var import_node_crypto = __toESM(require("node:crypto"), 1);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var DEFAULT_TURSO_URL = "https://giapha-hanzi.aws-ap-northeast-1.turso.io";
var DEFAULT_TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkzNTQ5MTMsImlkIjoiMDFhMDlkZGQtMTkwMS03OTg3LWE5ODktMTUyOGYyNjJiNjU0Iiwia2lkIjoiLTJiMFpJc0hhbTBsUGdvNW1NRnJsT3RFeEJXMERhQ0g1eXl3b1hyR3hoZyIsInJpZCI6ImUzZDYyNDcwLTA2ODctNDA1OS1iNzA0LTI5MmZiZDMzMDFjOCJ9.ih3Snm3DXeYsdFPQhor1HgqEZM-wwy_7lVrg9ucnWOvOLy38wfA7Z80Jl9vYHBCrnb0BArXC0PUNaQOMuJ9pCA";
var IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var CONFIG_FILE_PATH = IS_VERCEL ? import_node_path.default.resolve("/tmp", "turso-config.json") : import_node_path.default.resolve(process.cwd(), "turso-config.json");
function sanitizeTursoUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_TURSO_URL;
  let clean = rawUrl.replace(/^["']|["']$/g, "").trim();
  clean = clean.replace(/\/+$/, "").trim();
  if (clean.startsWith("libsql://")) {
    clean = clean.replace(/^libsql:\/\//, "https://");
  } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    if (!clean.includes(".")) {
      clean = `https://${clean}.turso.io`;
    } else {
      clean = `https://${clean}`;
    }
  }
  return clean;
}
function sanitizeTursoToken(rawToken) {
  if (!rawToken || !rawToken.trim()) return DEFAULT_TURSO_TOKEN;
  return rawToken.replace(/^["']|["']$/g, "").trim();
}
function safelyCreateClient(rawUrl, rawToken) {
  const url = sanitizeTursoUrl(rawUrl);
  const token = sanitizeTursoToken(rawToken);
  try {
    return (0, import_web.createClient)({
      url,
      authToken: token
    });
  } catch (err) {
    console.error(`[Turso DB] Error creating client for ${url}, fallback to demo DB:`, err);
    return (0, import_web.createClient)({
      url: DEFAULT_TURSO_URL,
      authToken: DEFAULT_TURSO_TOKEN
    });
  }
}
function loadStoredTursoConfig() {
  try {
    const candidatePaths = [CONFIG_FILE_PATH, import_node_path.default.resolve(process.cwd(), "turso-config.json")];
    for (const p of candidatePaths) {
      if (import_node_fs.default.existsSync(p)) {
        const raw = import_node_fs.default.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.databaseUrl && parsed.databaseUrl.trim()) {
          return {
            url: sanitizeTursoUrl(parsed.databaseUrl),
            token: sanitizeTursoToken(parsed.authToken),
            source: "C\u1EA5u h\xECnh tr\u1EF1c ti\u1EBFp (turso-config.json)"
          };
        }
      }
    }
  } catch (err) {
    console.error("L\u1ED7i khi \u0111\u1ECDc turso-config.json:", err);
  }
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.trim()) {
    return {
      url: sanitizeTursoUrl(process.env.TURSO_DATABASE_URL),
      token: sanitizeTursoToken(process.env.TURSO_AUTH_TOKEN),
      source: "Bi\u1EBFn m\xF4i tr\u01B0\u1EDDng (TURSO_DATABASE_URL)"
    };
  }
  return null;
}
var initialConfig = loadStoredTursoConfig();
var currentTursoUrl = initialConfig?.url || DEFAULT_TURSO_URL;
var currentTursoToken = initialConfig?.token || DEFAULT_TURSO_TOKEN;
var currentConfigSource = initialConfig?.source || "M\u1EB7c \u0111\u1ECBnh h\u1EC7 th\u1ED1ng (Fallback Demo DB)";
var currentIsCustom = Boolean(initialConfig);
function isCustomTursoConfigured() {
  return currentIsCustom;
}
function getTursoConfigInfo() {
  const isCustom = currentIsCustom;
  const url = currentTursoUrl;
  let tokenMasked = "";
  if (currentTursoToken && currentTursoToken.length > 10) {
    tokenMasked = `${currentTursoToken.slice(0, 6)}...${currentTursoToken.slice(-4)}`;
  }
  return {
    url,
    host: getTursoHost(),
    isCustom,
    configuredSource: currentConfigSource,
    tokenMasked
  };
}
function getTursoHost() {
  try {
    const parsed = new URL(currentTursoUrl);
    return parsed.hostname;
  } catch {
    return currentTursoUrl.replace(/^https?:\/\//, "").split("/")[0];
  }
}
console.log(`[Turso DB] Connecting to: ${getTursoHost()} (${currentConfigSource})`);
var activeClient = safelyCreateClient(currentTursoUrl, currentTursoToken);
var db = new Proxy({}, {
  get(_target, prop) {
    const val = activeClient[prop];
    if (typeof val === "function") {
      return val.bind(activeClient);
    }
    return val;
  }
});
async function setTursoCredentials(rawUrl, rawToken, persist = true) {
  const cleanUrl = sanitizeTursoUrl(rawUrl);
  const cleanToken = sanitizeTursoToken(rawToken);
  const startTime = Date.now();
  const testClient = (0, import_web.createClient)({
    url: cleanUrl,
    authToken: cleanToken
  });
  try {
    await testClient.execute("SELECT 1");
  } catch (probeErr) {
    throw new Error(`Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i v\xE0o m\xE1y ch\u1EE7 Turso: ${probeErr?.message || "Sai URL ho\u1EB7c Auth Token"}`);
  }
  const latencyMs = Date.now() - startTime;
  activeClient = testClient;
  currentTursoUrl = cleanUrl;
  currentTursoToken = cleanToken;
  currentIsCustom = true;
  currentConfigSource = "C\u1EA5u h\xECnh tr\u1EF1c ti\u1EBFp (turso-config.json)";
  if (persist) {
    try {
      import_node_fs.default.writeFileSync(
        CONFIG_FILE_PATH,
        JSON.stringify(
          {
            databaseUrl: rawUrl.trim(),
            authToken: rawToken.trim(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (fsErr) {
      console.warn("Could not write turso-config.json:", fsErr);
    }
  }
  isInitialized = false;
  await initDatabase(true);
  return {
    success: true,
    host: getTursoHost(),
    latencyMs,
    message: `\u0110\xE3 k\u1EBFt n\u1ED1i tr\u1EF1c ti\u1EBFp v\xE0o Turso (${getTursoHost()}) th\xE0nh c\xF4ng!`
  };
}
async function resetTursoToDefault() {
  try {
    if (import_node_fs.default.existsSync(CONFIG_FILE_PATH)) {
      import_node_fs.default.unlinkSync(CONFIG_FILE_PATH);
    }
  } catch (err) {
    console.warn("Could not remove turso-config.json:", err);
  }
  currentTursoUrl = DEFAULT_TURSO_URL;
  currentTursoToken = DEFAULT_TURSO_TOKEN;
  currentIsCustom = false;
  currentConfigSource = "M\u1EB7c \u0111\u1ECBnh h\u1EC7 th\u1ED1ng (Fallback Demo DB)";
  activeClient = safelyCreateClient(currentTursoUrl, currentTursoToken);
  isInitialized = false;
  await initDatabase(true);
  return {
    success: true,
    host: getTursoHost()
  };
}
function hashPassword(password, salt = "giapha_salt_2026") {
  return import_node_crypto.default.pbkdf2Sync(password, salt, 1e3, 32, "sha256").toString("hex");
}
function verifyPassword(password, storedHash) {
  return hashPassword(password) === storedHash;
}
var isInitialized = false;
async function initDatabase(force = false) {
  if (isInitialized && !force) return;
  try {
    if (!force) {
      try {
        const quick = await db.execute("SELECT id FROM clan_info LIMIT 1");
        if (quick.rows.length > 0) {
          isInitialized = true;
          return;
        }
      } catch (_) {
      }
    }
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
        logo_text TEXT DEFAULT '\u6C0F',
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
    const migrations = [
      "ALTER TABLE clan_info ADD COLUMN logo_url TEXT",
      "ALTER TABLE clan_info ADD COLUMN logo_text TEXT DEFAULT '\u6C0F'",
      "ALTER TABLE clan_info ADD COLUMN logo_shape TEXT DEFAULT 'rounded-xl'",
      "ALTER TABLE clan_info ADD COLUMN theme_color TEXT DEFAULT 'amber'",
      "ALTER TABLE clan_info ADD COLUMN bg_style TEXT DEFAULT 'dark'",
      "ALTER TABLE clan_info ADD COLUMN pattern_style TEXT DEFAULT 'dongson'",
      "ALTER TABLE clan_info ADD COLUMN seo_title TEXT",
      "ALTER TABLE clan_info ADD COLUMN seo_description TEXT",
      "ALTER TABLE clan_info ADD COLUMN seo_keywords TEXT",
      "ALTER TABLE clan_info ADD COLUMN og_image_url TEXT DEFAULT 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png'"
    ];
    for (const sql of migrations) {
      try {
        await db.execute(sql);
      } catch (_) {
      }
    }
    const adminCheck = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: ["ducphi"]
    });
    if (adminCheck.rows.length === 0) {
      const adminHash = hashPassword("ducphi@2048");
      await db.execute({
        sql: `INSERT INTO users (id, username, password_hash, full_name, role, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: ["user_admin_01", "ducphi", adminHash, "Qu\u1EA3n Tr\u1ECB Vi\xEAn Ph\u1EA1m \u0110\u1EE9c Phi", "admin", (/* @__PURE__ */ new Date()).toISOString()]
      });
      console.log('Default admin account "ducphi" created successfully.');
    } else {
      await db.execute({
        sql: "UPDATE users SET full_name = 'Qu\u1EA3n Tr\u1ECB Vi\xEAn Ph\u1EA1m \u0110\u1EE9c Phi' WHERE username = 'ducphi'"
      });
    }
    const clanCheck = await db.execute("SELECT id FROM clan_info LIMIT 1");
    if (clanCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO clan_info (
          id, name, ancestor_name, origin, temple_address, anniversary_lunar,
          description, logo_text, logo_shape, theme_color, bg_style, pattern_style,
          seo_title, seo_description, seo_keywords, og_image_url, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          "clan_default",
          "Gia T\u1ED9c H\u1ECD Ph\u1EA1m \u0110\u1EA1i T\xF4n",
          "C\u1EE5 Th\u1EE7y T\u1ED5 Ph\u1EA1m Qu\xFD C\xF4ng",
          "L\xE0ng C\u1ED5 K\xEDnh Ch\u1EE7, Ch\xED Linh, H\u1EA3i D\u01B0\u01A1ng & H\xE0 N\u1ED9i",
          "T\u1EEB \u0110\u01B0\u1EDDng D\xF2ng H\u1ECD Ph\u1EA1m, Th\xF4n \u0110\xF4ng",
          "Ng\xE0y 16 th\xE1ng Gi\xEAng (\xC2m l\u1ECBch)",
          "Gia ph\u1EA3 Gia T\u1ED9c H\u1ECD Ph\u1EA1m l\u01B0u truy\u1EC1n c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, ph\xE1t huy truy\u1EC1n th\u1ED1ng hi\u1EBFu h\u1ECDc, trung hi\u1EBFu ngh\u0129a t\xECnh, \u0111o\xE0n k\u1EBFt t\u01B0\u01A1ng th\xE2n t\u01B0\u01A1ng \xE1i, r\u1EA1ng danh con ch\xE1u mu\xF4n \u0111\u1EDDi.",
          "\u8303",
          "rounded-xl",
          "amber",
          "dark",
          "dongson",
          "Gia T\u1ED9c H\u1ECD Ph\u1EA1m - C\u1ED5ng Th\xF4ng Tin Gia Ph\u1EA3 \u0110i\u1EC7n T\u1EED",
          "H\u1EC7 th\u1ED1ng qu\u1EA3n l\xFD gia ph\u1EA3 d\xF2ng h\u1ECD tr\u1EF1c tuy\u1EBFn v\u1EDBi s\u01A1 \u0111\u1ED3 c\xE2y t\u01B0\u01A1ng t\xE1c, l\u01B0u gi\u1EEF c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, b\u1EA3o m\u1EADt d\xF2ng t\u1ED9c v\xE0 xu\u1EA5t b\u1EA3n PDF.",
          "gia ph\u1EA3, h\u1ECD ph\u1EA1m, gia t\u1ED9c h\u1ECD ph\u1EA1m, gia ph\u1EA3 \u0111i\u1EC7n t\u1EED, c\xE2y ph\u1EA3 h\u1EC7, \u0111\u1EA1i t\xF4n",
          "https://cdn.upanhlaylink.com/i/NVk3RyLC.png",
          (/* @__PURE__ */ new Date()).toISOString()
        ]
      });
    }
    try {
      await db.execute("UPDATE clan_info SET name = 'Gia T\u1ED9c H\u1ECD Ph\u1EA1m \u0110\u1EA1i T\xF4n', ancestor_name = 'C\u1EE5 Th\u1EE7y T\u1ED5 Ph\u1EA1m Qu\xFD C\xF4ng', temple_address = REPLACE(temple_address, 'Nguy\u1EC5n', 'Ph\u1EA1m'), description = REPLACE(description, 'Nguy\u1EC5n', 'Ph\u1EA1m') WHERE name LIKE '%Nguy\u1EC5n%' OR description LIKE '%Nguy\u1EC5n%'");
      await db.execute("UPDATE members SET full_name = REPLACE(full_name, 'Nguy\u1EC5n ', 'Ph\u1EA1m ') WHERE full_name LIKE 'Nguy\u1EC5n %'");
      await db.execute("UPDATE members SET bio = REPLACE(bio, 'Nguy\u1EC5n ', 'Ph\u1EA1m ') WHERE bio LIKE '%Nguy\u1EC5n %'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m V\u0103n Ph\xFAc' WHERE id = 'mem_gen1_01'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m V\u0103n Th\xE0nh' WHERE id = 'mem_gen2_01'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m Th\u1ECB Hoa' WHERE id = 'mem_gen2_02'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m V\u0103n D\u0169ng' WHERE id = 'mem_gen2_03'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m \u0110\u1EE9c Phi' WHERE id = 'mem_gen3_01'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m Thanh H\xE0' WHERE id = 'mem_gen3_02'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m V\u0103n Tu\u1EA5n' WHERE id = 'mem_gen3_03'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m Minh Khang' WHERE id = 'mem_gen4_01'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m B\u1EA3o An' WHERE id = 'mem_gen4_02'");
      await db.execute("UPDATE members SET full_name = 'Ph\u1EA1m Tu\u1EA5n Ki\u1EC7t' WHERE id = 'mem_gen4_03'");
    } catch (migErr) {
      console.warn("Migration warning:", migErr);
    }
    const membersCount = await db.execute("SELECT COUNT(*) as count FROM members");
    const count = Number(membersCount.rows[0]?.count || 0);
    if (count === 0) {
      console.log("Seeding initial genealogical tree data for H\u1ECD Ph\u1EA1m...");
      await seedSampleMembers();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
async function resetToPhamClanDemo() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.execute("DELETE FROM members");
  const clanCheck = await db.execute("SELECT id FROM clan_info LIMIT 1");
  if (clanCheck.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO clan_info (
        id, name, ancestor_name, origin, temple_address, anniversary_lunar,
        description, logo_text, logo_shape, theme_color, bg_style, pattern_style,
        seo_title, seo_description, seo_keywords, og_image_url, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "clan_default",
        "Gia T\u1ED9c H\u1ECD Ph\u1EA1m \u0110\u1EA1i T\xF4n",
        "C\u1EE5 Th\u1EE7y T\u1ED5 Ph\u1EA1m Qu\xFD C\xF4ng",
        "L\xE0ng C\u1ED5 K\xEDnh Ch\u1EE7, Ch\xED Linh, H\u1EA3i D\u01B0\u01A1ng & H\xE0 N\u1ED9i",
        "T\u1EEB \u0110\u01B0\u1EDDng D\xF2ng H\u1ECD Ph\u1EA1m, Th\xF4n \u0110\xF4ng",
        "Ng\xE0y 16 th\xE1ng Gi\xEAng (\xC2m l\u1ECBch)",
        "Gia ph\u1EA3 Gia T\u1ED9c H\u1ECD Ph\u1EA1m l\u01B0u truy\u1EC1n c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, ph\xE1t huy truy\u1EC1n th\u1ED1ng hi\u1EBFu h\u1ECDc, trung hi\u1EBFu ngh\u0129a t\xECnh, \u0111o\xE0n k\u1EBFt t\u01B0\u01A1ng th\xE2n t\u01B0\u01A1ng \xE1i, r\u1EA1ng danh con ch\xE1u mu\xF4n \u0111\u1EDDi.",
        "\u8303",
        "rounded-xl",
        "amber",
        "dark",
        "dongson",
        "Gia T\u1ED9c H\u1ECD Ph\u1EA1m - C\u1ED5ng Th\xF4ng Tin Gia Ph\u1EA3 \u0110i\u1EC7n T\u1EED",
        "H\u1EC7 th\u1ED1ng qu\u1EA3n l\xFD gia ph\u1EA3 d\xF2ng h\u1ECD tr\u1EF1c tuy\u1EBFn v\u1EDBi s\u01A1 \u0111\u1ED3 c\xE2y t\u01B0\u01A1ng t\xE1c, l\u01B0u gi\u1EEF c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, b\u1EA3o m\u1EADt d\xF2ng t\u1ED9c v\xE0 xu\u1EA5t b\u1EA3n PDF.",
        "gia ph\u1EA3, h\u1ECD ph\u1EA1m, gia t\u1ED9c h\u1ECD ph\u1EA1m, gia ph\u1EA3 \u0111i\u1EC7n t\u1EED, c\xE2y ph\u1EA3 h\u1EC7, \u0111\u1EA1i t\xF4n",
        "https://cdn.upanhlaylink.com/i/NVk3RyLC.png",
        now
      ]
    });
  } else {
    await db.execute({
      sql: `UPDATE clan_info SET
        name = 'Gia T\u1ED9c H\u1ECD Ph\u1EA1m \u0110\u1EA1i T\xF4n',
        ancestor_name = 'C\u1EE5 Th\u1EE7y T\u1ED5 Ph\u1EA1m Qu\xFD C\xF4ng',
        origin = 'L\xE0ng C\u1ED5 K\xEDnh Ch\u1EE7, Ch\xED Linh, H\u1EA3i D\u01B0\u01A1ng & H\xE0 N\u1ED9i',
        temple_address = 'T\u1EEB \u0110\u01B0\u1EDDng D\xF2ng H\u1ECD Ph\u1EA1m, Th\xF4n \u0110\xF4ng',
        anniversary_lunar = 'Ng\xE0y 16 th\xE1ng Gi\xEAng (\xC2m l\u1ECBch)',
        description = 'Gia ph\u1EA3 Gia T\u1ED9c H\u1ECD Ph\u1EA1m l\u01B0u truy\u1EC1n c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, ph\xE1t huy truy\u1EC1n th\u1ED1ng hi\u1EBFu h\u1ECDc, trung hi\u1EBFu ngh\u0129a t\xECnh, \u0111o\xE0n k\u1EBFt t\u01B0\u01A1ng th\xE2n t\u01B0\u01A1ng \xE1i, r\u1EA1ng danh con ch\xE1u mu\xF4n \u0111\u1EDDi.',
        logo_text = '\u8303',
        seo_title = 'Gia T\u1ED9c H\u1ECD Ph\u1EA1m - C\u1ED5ng Th\xF4ng Tin Gia Ph\u1EA3 \u0110i\u1EC7n T\u1EED',
        seo_description = 'H\u1EC7 th\u1ED1ng qu\u1EA3n l\xFD gia ph\u1EA3 d\xF2ng h\u1ECD tr\u1EF1c tuy\u1EBFn v\u1EDBi s\u01A1 \u0111\u1ED3 c\xE2y t\u01B0\u01A1ng t\xE1c, l\u01B0u gi\u1EEF c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, b\u1EA3o m\u1EADt d\xF2ng t\u1ED9c v\xE0 xu\u1EA5t b\u1EA3n PDF.',
        seo_keywords = 'gia ph\u1EA3, h\u1ECD ph\u1EA1m, gia t\u1ED9c h\u1ECD ph\u1EA1m, gia ph\u1EA3 \u0111i\u1EC7n t\u1EED, c\xE2y ph\u1EA3 h\u1EC7, \u0111\u1EA1i t\xF4n',
        og_image_url = 'https://cdn.upanhlaylink.com/i/NVk3RyLC.png',
        updated_at = ?`,
      args: [now]
    });
  }
  await seedSampleMembers();
}
async function seedSampleMembers() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sampleMembers = [
    // Đời 1: Cụ Thủy Tổ
    {
      id: "mem_gen1_01",
      full_name: "Ph\u1EA1m V\u0103n Ph\xFAc",
      gender: "male",
      birth_date: "1920-03-15",
      birth_year: 1920,
      is_alive: 0,
      death_date: "1995-10-20",
      burial_place: "Ngh\u0129a trang D\xF2ng h\u1ECD Ph\u1EA1m, Khu L\u0103ng M\u1ED9 T\u1ED5",
      occupation: "Nh\xE0 Nho & L\u01B0\u01A1ng y",
      address: "T\u1EEB \u0110\u01B0\u1EDDng H\u1ECD Ph\u1EA1m, Th\xF4n \u0110\xF4ng",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      generation: 1,
      parent_id: null,
      mother_id: null,
      spouse_name: "Tr\u1EA7n Th\u1ECB Hi\u1EC1n (1923 - 2002)",
      birth_order: 1,
      branch: "Tr\u01B0\u1EDFng T\u1ED9c",
      phone: "",
      bio: "C\u1EE5 Th\u1EE7y t\u1ED5 c\xF3 c\xF4ng khai kh\u1EA9n, m\u1EDF mang t\u1EEB \u0111\u01B0\u1EDDng d\xF2ng h\u1ECD Ph\u1EA1m, l\u01B0\u01A1ng y nh\xE2n t\u1EEB c\u1EE9u gi\xFAp b\xE0 con d\xE2n l\xE0ng. \u0110\u1EE9c \u0111\u1ED9 cao d\xE0y, con ch\xE1u mu\xF4n \u0111\u1EDDi ghi nh\u1EDB c\xF4ng \u01A1n."
    },
    // Đời 2: Các con của Cụ Phúc
    {
      id: "mem_gen2_01",
      full_name: "Ph\u1EA1m V\u0103n Th\xE0nh",
      gender: "male",
      birth_date: "1945-06-12",
      birth_year: 1945,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "K\u1EF9 s\u01B0 Th\u1EE7y l\u1EE3i (\u0110\xE3 ngh\u1EC9 h\u01B0u)",
      address: "S\u1ED1 18 Ho\xE0ng Hoa Th\xE1m, Ba \u0110\xECnh, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      generation: 2,
      parent_id: "mem_gen1_01",
      mother_id: null,
      spouse_name: "L\xEA Th\u1ECB Mai (1948)",
      birth_order: 1,
      branch: "Chi Tr\u01B0\u1EDFng",
      phone: "0912345678",
      bio: "Tr\u01B0\u1EDFng chi \u0111\u1EDDi th\u1EE9 hai c\u1EE7a gia t\u1ED9c H\u1ECD Ph\u1EA1m, t\xEDch c\u1EF1c k\u1EBFt n\u1ED1i b\xE0 con h\u1ECD t\u1ED9c v\xE0 ch\u1EE7 tr\xEC tu b\u1ED5 t\u1EEB \u0111\u01B0\u1EDDng."
    },
    {
      id: "mem_gen2_02",
      full_name: "Ph\u1EA1m Th\u1ECB Hoa",
      gender: "female",
      birth_date: "1948-09-24",
      birth_year: 1948,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "Gi\xE1o vi\xEAn Nh\xE2n d\xE2n",
      address: "Qu\u1EADn C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      generation: 2,
      parent_id: "mem_gen1_01",
      mother_id: null,
      spouse_name: "Nguy\u1EC5n Qu\u1ED1c H\xF9ng (1946)",
      birth_order: 2,
      branch: "Chi Hai",
      phone: "0987654321",
      bio: "C\xF4 gi\xE1o d\u1EA1y v\u0103n m\u1EABu m\u1EF1c, \u0111\u01B0\u1EE3c t\u1EB7ng th\u01B0\u1EDFng Hu\xE2n ch\u01B0\u01A1ng v\xEC s\u1EF1 nghi\u1EC7p gi\xE1o d\u1EE5c."
    },
    {
      id: "mem_gen2_03",
      full_name: "Ph\u1EA1m V\u0103n D\u0169ng",
      gender: "male",
      birth_date: "1952-11-05",
      birth_year: 1952,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "S\u0129 quan Qu\xE2n \u0111\u1ED9i (\u0110\u1EA1i t\xE1 ph\u1EE5c vi\xEAn)",
      address: "H\u1EA3i Ch\xE2u, TP \u0110\xE0 N\u1EB5ng",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      generation: 2,
      parent_id: "mem_gen1_01",
      mother_id: null,
      spouse_name: "Ho\xE0ng Minh Ch\xE2u (1955)",
      birth_order: 3,
      branch: "Chi Ba",
      phone: "0905123456",
      bio: "Chi\u1EBFn s\u0129 tham gia chi\u1EBFn tr\u01B0\u1EDDng gi\u1EA3i ph\xF3ng mi\u1EC1n Nam, sau chuy\u1EC3n ng\xE0nh v\u1EC1 c\xF4ng t\xE1c t\u1EA1i \u0110\xE0 N\u1EB5ng."
    },
    // Đời 3: Con của cụ Thành
    {
      id: "mem_gen3_01",
      full_name: "Ph\u1EA1m \u0110\u1EE9c Phi",
      gender: "male",
      birth_date: "1975-04-18",
      birth_year: 1975,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "Chuy\xEAn gia C\xF4ng ngh\u1EC7 Th\xF4ng tin & Qu\u1EA3n tr\u1ECB",
      address: "C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      generation: 3,
      parent_id: "mem_gen2_01",
      mother_id: null,
      spouse_name: "V\u0169 Thu Trang (1978)",
      birth_order: 1,
      branch: "Chi Tr\u01B0\u1EDFng",
      phone: "0913888999",
      bio: "Ng\u01B0\u1EDDi ph\u1EE5 tr\xE1ch s\u1ED1 h\xF3a gia ph\u1EA3 \u0111i\u1EC7n t\u1EED cho Gia T\u1ED9c H\u1ECD Ph\u1EA1m, k\u1EBFt n\u1ED1i con ch\xE1u tr\xEAn to\xE0n c\u1EA7u."
    },
    {
      id: "mem_gen3_02",
      full_name: "Ph\u1EA1m Thanh H\xE0",
      gender: "female",
      birth_date: "1980-08-30",
      birth_year: 1980,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "B\xE1c s\u0129 Tim m\u1EA1ch - B\u1EC7nh vi\u1EC7n B\u1EA1ch Mai",
      address: "\u0110\u1ED1ng \u0110a, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      generation: 3,
      parent_id: "mem_gen2_01",
      mother_id: null,
      spouse_name: "\u0110\u1EB7ng Qu\u1ED1c To\xE0n (1977)",
      birth_order: 2,
      branch: "Chi Tr\u01B0\u1EDFng",
      phone: "0982334455",
      bio: "B\xE1c s\u0129 chuy\xEAn khoa II, nhi\u1EC1u c\u1ED1ng hi\u1EBFn trong \u0111i\u1EC1u tr\u1ECB v\xE0 ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe c\u1ED9ng \u0111\u1ED3ng."
    },
    // Con của cụ Dũng
    {
      id: "mem_gen3_03",
      full_name: "Ph\u1EA1m V\u0103n Tu\u1EA5n",
      gender: "male",
      birth_date: "1982-01-15",
      birth_year: 1982,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "Doanh nh\xE2n - Ki\u1EBFn tr\xFAc s\u01B0",
      address: "S\u01A1n Tr\xE0, TP \u0110\xE0 N\u1EB5ng",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      generation: 3,
      parent_id: "mem_gen2_03",
      mother_id: null,
      spouse_name: "Ng\xF4 M\u1EF9 Linh (1985)",
      birth_order: 1,
      branch: "Chi Ba",
      phone: "0905888777",
      bio: "Ch\u1EE7 doanh nghi\u1EC7p ki\u1EBFn tr\xFAc, t\xE0i tr\u1EE3 nhi\u1EC1u c\xF4ng tr\xECnh khuy\u1EBFn h\u1ECDc cho con ch\xE1u H\u1ECD Ph\u1EA1m."
    },
    // Đời 4: Con của Phạm Đức Phi
    {
      id: "mem_gen4_01",
      full_name: "Ph\u1EA1m Minh Khang",
      gender: "male",
      birth_date: "2005-10-10",
      birth_year: 2005,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "Sinh vi\xEAn \u0110H B\xE1ch Khoa H\xE0 N\u1ED9i",
      address: "C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      generation: 4,
      parent_id: "mem_gen3_01",
      mother_id: null,
      spouse_name: "",
      birth_order: 1,
      branch: "Chi Tr\u01B0\u1EDFng",
      phone: "0961223344",
      bio: "\u0110\u1EA1t gi\u1EA3i Nh\xEC Olympic Tin h\u1ECDc to\xE0n qu\u1ED1c, t\xEDch c\u1EF1c tham gia c\xF4ng t\xE1c thanh ni\xEAn d\xF2ng h\u1ECD."
    },
    {
      id: "mem_gen4_02",
      full_name: "Ph\u1EA1m B\u1EA3o An",
      gender: "female",
      birth_date: "2010-05-22",
      birth_year: 2010,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "H\u1ECDc sinh THCS Chuy\xEAn H\xE0 N\u1ED9i - Amsterdam",
      address: "C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      generation: 4,
      parent_id: "mem_gen3_01",
      mother_id: null,
      spouse_name: "",
      birth_order: 2,
      branch: "Chi Tr\u01B0\u1EDFng",
      phone: "",
      bio: "H\u1ECDc sinh gi\u1ECFi to\xE0n di\u1EC7n, \u0111\u1EA1t gi\u1EA3i v\u1EBD thi\u1EBFu nhi qu\u1ED1c t\u1EBF."
    },
    // Con của Phạm Văn Tuấn
    {
      id: "mem_gen4_03",
      full_name: "Ph\u1EA1m Tu\u1EA5n Ki\u1EC7t",
      gender: "male",
      birth_date: "2014-07-08",
      birth_year: 2014,
      is_alive: 1,
      death_date: null,
      burial_place: null,
      occupation: "H\u1ECDc sinh Ti\u1EC3u h\u1ECDc",
      address: "S\u01A1n Tr\xE0, TP \u0110\xE0 N\u1EB5ng",
      avatar_url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80",
      generation: 4,
      parent_id: "mem_gen3_03",
      mother_id: null,
      spouse_name: "",
      birth_order: 1,
      branch: "Chi Ba",
      phone: "",
      bio: "Ch\xE1u \u0111\xEDch t\xF4n chi ba \u0111\u1EDDi th\u1EE9 4, ch\u0103m ngoan hi\u1EBFu th\u1EA3o."
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
        now
      ]
    });
  }
  console.log("Sample members seeded successfully.");
}

// server/api.ts
var JWT_SECRET = process.env.JWT_SECRET || "giapha_jwt_secret_token_2026";
var apiRouter = import_express.default.Router();
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    message: "Gia Ph\u1EA3 H\u1ECD Ph\u1EA1m API \u0111ang ho\u1EA1t \u0111\u1ED9ng b\xECnh th\u01B0\u1EDDng",
    host: getTursoHost(),
    isCustomTurso: isCustomTursoConfigured()
  });
});
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
  }
  next();
}
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n th\u1EF1c hi\u1EC7n thao t\xE1c n\xE0y. Vui l\xF2ng \u0111\u0103ng nh\u1EADp v\u1EDBi t\xE0i kho\u1EA3n \u0111\u01B0\u1EE3c c\u1EA5p quy\u1EC1n."
      });
    }
    next();
  };
}
apiRouter.use(authMiddleware);
apiRouter.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng nh\u1EADp t\xEAn \u0111\u0103ng nh\u1EADp v\xE0 m\u1EADt kh\u1EA9u." });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password);
    try {
      await initDatabase();
    } catch (initErr) {
      console.warn("[Auth] Database init check warning:", initErr);
    }
    let result;
    try {
      result = await db.execute({
        sql: "SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?",
        args: [cleanUsername]
      });
    } catch (queryErr) {
      console.error("[Auth] Query error, attempting forced table initialization:", queryErr);
      await initDatabase(true);
      result = await db.execute({
        sql: "SELECT id, username, password_hash, full_name, role FROM users WHERE username = ?",
        args: [cleanUsername]
      });
    }
    if (!result || result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "T\xE0i kho\u1EA3n ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." });
    }
    const user = result.rows[0];
    const isMatch = verifyPassword(cleanPassword, String(user.password_hash));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "T\xE0i kho\u1EA3n ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." });
    }
    const userPayload = {
      id: String(user.id),
      username: String(user.username),
      full_name: String(user.full_name),
      role: String(user.role)
    };
    const token = import_jsonwebtoken.default.sign(userPayload, JWT_SECRET, { expiresIn: "30d" });
    return res.json({
      success: true,
      token,
      user: userPayload,
      message: "\u0110\u0103ng nh\u1EADp th\xE0nh c\xF4ng."
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message ? `L\u1ED7i \u0111\u0103ng nh\u1EADp (${error.message})` : "L\u1ED7i m\xE1y ch\u1EE7 khi \u0111\u0103ng nh\u1EADp."
    });
  }
});
apiRouter.post("/auth/register", async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 t\xE0i kho\u1EA3n v\xE0 m\u1EADt kh\u1EA9u." });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, message: "T\xEAn t\xE0i kho\u1EA3n ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 3 k\xFD t\u1EF1." });
    }
    if (cleanPassword.length < 3) {
      return res.status(400).json({ success: false, message: "M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 3 k\xFD t\u1EF1." });
    }
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE username = ?",
      args: [cleanUsername]
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "T\xE0i kho\u1EA3n n\xE0y \u0111\xE3 t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng. Vui l\xF2ng ch\u1ECDn t\xE0i kho\u1EA3n kh\xE1c ho\u1EB7c chuy\u1EC3n sang \u0110\u0103ng nh\u1EADp."
      });
    }
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const displayName = full_name && String(full_name).trim() ? String(full_name).trim() : cleanUsername;
    const passwordHash = hashPassword(cleanPassword);
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    await db.execute({
      sql: `INSERT INTO users (id, username, password_hash, full_name, role, created_at)
            VALUES (?, ?, ?, ?, 'viewer', ?)`,
      args: [userId, cleanUsername, passwordHash, displayName, createdAt]
    });
    const userPayload = {
      id: userId,
      username: cleanUsername,
      full_name: displayName,
      role: "viewer"
    };
    const token = import_jsonwebtoken.default.sign(userPayload, JWT_SECRET, { expiresIn: "30d" });
    return res.json({
      success: true,
      token,
      user: userPayload,
      message: "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n th\xE0nh c\xF4ng! Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi Gia Ph\u1EA3."
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i m\xE1y ch\u1EE7 khi \u0111\u0103ng k\xFD t\xE0i kho\u1EA3n." });
  }
});
apiRouter.get("/auth/me", (req, res) => {
  if (!req.user) {
    return res.json({ success: true, user: null, role: "viewer" });
  }
  return res.json({ success: true, user: req.user, role: req.user.role });
});
apiRouter.put("/auth/profile", requireRole(["admin", "editor", "viewer"]), async (req, res) => {
  try {
    const { full_name } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: "H\u1ECD v\xE0 t\xEAn kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng." });
    }
    const userId = req.user.id;
    await db.execute({
      sql: "UPDATE users SET full_name = ? WHERE id = ?",
      args: [full_name.trim(), userId]
    });
    return res.json({ success: true, message: "C\u1EADp nh\u1EADt th\xF4ng tin t\xE0i kho\u1EA3n th\xE0nh c\xF4ng." });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi c\u1EADp nh\u1EADt th\xF4ng tin." });
  }
});
apiRouter.put("/auth/change-password", requireRole(["admin", "editor", "viewer"]), async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng \u0111i\u1EC1n m\u1EADt kh\u1EA9u c\u0169 v\xE0 m\u1EADt kh\u1EA9u m\u1EDBi." });
    }
    if (new_password.trim().length < 3) {
      return res.status(400).json({ success: false, message: "M\u1EADt kh\u1EA9u m\u1EDBi ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 3 k\xFD t\u1EF1." });
    }
    const userId = req.user.id;
    const userRes = await db.execute({
      sql: "SELECT password_hash FROM users WHERE id = ?",
      args: [userId]
    });
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n." });
    }
    const isMatch = verifyPassword(old_password, String(userRes.rows[0].password_hash));
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "M\u1EADt kh\u1EA9u hi\u1EC7n t\u1EA1i kh\xF4ng ch\xEDnh x\xE1c." });
    }
    const newHash = hashPassword(new_password.trim());
    await db.execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [newHash, userId]
    });
    return res.json({ success: true, message: "\u0110\u1ED5i m\u1EADt kh\u1EA9u th\xE0nh c\xF4ng." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi \u0111\u1ED5i m\u1EADt kh\u1EA9u." });
  }
});
apiRouter.get("/clan", async (_req, res) => {
  try {
    const result = await db.execute("SELECT * FROM clan_info LIMIT 1");
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          id: "clan_default",
          name: "Gia Ph\u1EA3 \u0110\u1EA1i T\u1ED9c",
          ancestor_name: "C\u1EE5 Th\u1EE7y T\u1ED5",
          origin: "",
          temple_address: "",
          anniversary_lunar: "",
          description: ""
        }
      });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Fetch clan error:", error);
    return res.status(500).json({ success: false, message: "Kh\xF4ng th\u1EC3 t\u1EA3i th\xF4ng tin d\xF2ng h\u1ECD." });
  }
});
apiRouter.put("/clan", requireRole(["admin"]), async (req, res) => {
  try {
    const {
      name,
      ancestor_name,
      origin,
      temple_address,
      anniversary_lunar,
      description,
      logo_url,
      logo_text,
      logo_shape,
      theme_color,
      bg_style,
      pattern_style,
      seo_title,
      seo_description,
      seo_keywords,
      og_image_url
    } = req.body;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = await db.execute("SELECT * FROM clan_info LIMIT 1");
    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO clan_info (id, name, ancestor_name, origin, temple_address, anniversary_lunar, description, logo_url, logo_text, logo_shape, theme_color, bg_style, pattern_style, seo_title, seo_description, seo_keywords, og_image_url, updated_at)
              VALUES ('clan_default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          name ?? "Gia Ph\u1EA3 \u0110\u1EA1i T\u1ED9c",
          ancestor_name ?? "",
          origin ?? "",
          temple_address ?? "",
          anniversary_lunar ?? "",
          description ?? "",
          logo_url ?? null,
          logo_text ?? "\u6C0F",
          logo_shape ?? "rounded-xl",
          theme_color ?? "amber",
          bg_style ?? "dark",
          pattern_style ?? "dongson",
          seo_title ?? "Remix Qu\u1EA3n L\xFD Gia Ph\u1EA3 - Gia T\u1ED9c H\u1ECD Ph\u1EA1m",
          seo_description ?? "C\u1ED5ng th\xF4ng tin gia ph\u1EA3 \u0111i\u1EC7n t\u1EED Gia T\u1ED9c H\u1ECD Ph\u1EA1m v\u1EDBi s\u01A1 \u0111\u1ED3 ph\u1EA3 h\u1EC7 t\u01B0\u01A1ng t\xE1c, l\u01B0u gi\u1EEF c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, b\u1EA3o m\u1EADt d\xF2ng t\u1ED9c v\xE0 xu\u1EA5t b\u1EA3n PDF truy\u1EC1n th\u1ED1ng.",
          seo_keywords ?? "gia ph\u1EA3, h\u1ECD ph\u1EA1m, gia t\u1ED9c h\u1ECD ph\u1EA1m, ph\u1EA3 h\u1EC7, \u0111\u1EA1i t\xF4n",
          og_image_url ?? "https://cdn.upanhlaylink.com/i/NVk3RyLC.png",
          now
        ]
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
          name !== void 0 ? name : clan.name,
          ancestor_name !== void 0 ? ancestor_name : clan.ancestor_name,
          origin !== void 0 ? origin : clan.origin,
          temple_address !== void 0 ? temple_address : clan.temple_address,
          anniversary_lunar !== void 0 ? anniversary_lunar : clan.anniversary_lunar,
          description !== void 0 ? description : clan.description,
          logo_url !== void 0 ? logo_url : clan.logo_url,
          logo_text !== void 0 ? logo_text : clan.logo_text || "\u6C0F",
          logo_shape !== void 0 ? logo_shape : clan.logo_shape || "rounded-xl",
          theme_color !== void 0 ? theme_color : clan.theme_color || "amber",
          bg_style !== void 0 ? bg_style : clan.bg_style || "dark",
          pattern_style !== void 0 ? pattern_style : clan.pattern_style || "dongson",
          seo_title !== void 0 ? seo_title : clan.seo_title || "Remix Qu\u1EA3n L\xFD Gia Ph\u1EA3 - Gia T\u1ED9c H\u1ECD Ph\u1EA1m",
          seo_description !== void 0 ? seo_description : clan.seo_description || "C\u1ED5ng th\xF4ng tin gia ph\u1EA3 \u0111i\u1EC7n t\u1EED Gia T\u1ED9c H\u1ECD Ph\u1EA1m v\u1EDBi s\u01A1 \u0111\u1ED3 ph\u1EA3 h\u1EC7 t\u01B0\u01A1ng t\xE1c, l\u01B0u gi\u1EEF c\xF4ng \u0111\u1EE9c t\u1ED5 ti\xEAn, b\u1EA3o m\u1EADt d\xF2ng t\u1ED9c v\xE0 xu\u1EA5t b\u1EA3n PDF truy\u1EC1n th\u1ED1ng.",
          seo_keywords !== void 0 ? seo_keywords : clan.seo_keywords || "gia ph\u1EA3, h\u1ECD ph\u1EA1m, gia t\u1ED9c h\u1ECD ph\u1EA1m, ph\u1EA3 h\u1EC7, \u0111\u1EA1i t\xF4n",
          og_image_url !== void 0 ? og_image_url : clan.og_image_url || "https://cdn.upanhlaylink.com/i/NVk3RyLC.png",
          now,
          clanId
        ]
      });
    }
    const updated = await db.execute("SELECT * FROM clan_info LIMIT 1");
    return res.json({ success: true, message: "C\u1EADp nh\u1EADt th\xF4ng tin v\xE0 giao di\u1EC7n d\xF2ng h\u1ECD th\xE0nh c\xF4ng.", data: updated.rows[0] });
  } catch (error) {
    console.error("Update clan error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi c\u1EADp nh\u1EADt th\xF4ng tin d\xF2ng h\u1ECD." });
  }
});
apiRouter.get("/members", async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    const generation = req.query.generation ? Number(req.query.generation) : null;
    const gender = req.query.gender ? String(req.query.gender) : null;
    const isAlive = req.query.is_alive !== void 0 && req.query.is_alive !== "" ? Number(req.query.is_alive) : null;
    const branch = req.query.branch ? String(req.query.branch) : null;
    let sql = "SELECT * FROM members WHERE 1=1";
    const args = [];
    if (q) {
      const isYear = /^\d{4}$/.test(q);
      if (isYear) {
        sql += " AND (birth_year = ? OR full_name LIKE ? OR occupation LIKE ? OR address LIKE ?)";
        args.push(Number(q), `%${q}%`, `%${q}%`, `%${q}%`);
      } else {
        sql += " AND (full_name LIKE ? OR birth_year LIKE ? OR occupation LIKE ? OR address LIKE ? OR spouse_name LIKE ?)";
        args.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
      }
    }
    if (generation) {
      sql += " AND generation = ?";
      args.push(generation);
    }
    if (gender) {
      sql += " AND gender = ?";
      args.push(gender);
    }
    if (isAlive !== null) {
      sql += " AND is_alive = ?";
      args.push(isAlive);
    }
    if (branch) {
      sql += " AND branch = ?";
      args.push(branch);
    }
    sql += " ORDER BY generation ASC, birth_order ASC, birth_year ASC";
    const result = await db.execute({ sql, args });
    return res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error("List members error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA3i danh s\xE1ch th\xE0nh vi\xEAn." });
  }
});
apiRouter.get("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM members WHERE id = ?",
      args: [id]
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin th\xE0nh vi\xEAn." });
    }
    const member = result.rows[0];
    let parent = null;
    if (member.parent_id) {
      const parentRes = await db.execute({
        sql: "SELECT id, full_name, gender, birth_year, is_alive FROM members WHERE id = ?",
        args: [member.parent_id]
      });
      if (parentRes.rows.length > 0) {
        parent = parentRes.rows[0];
      }
    }
    const childrenRes = await db.execute({
      sql: "SELECT id, full_name, gender, birth_year, is_alive, avatar_url, birth_order FROM members WHERE parent_id = ? ORDER BY birth_order ASC, birth_year ASC",
      args: [id]
    });
    let siblings = [];
    if (member.parent_id) {
      const sibRes = await db.execute({
        sql: "SELECT id, full_name, gender, birth_year, is_alive, birth_order FROM members WHERE parent_id = ? AND id != ? ORDER BY birth_order ASC",
        args: [member.parent_id, id]
      });
      siblings = sibRes.rows;
    }
    return res.json({
      success: true,
      data: {
        ...member,
        parent,
        children: childrenRes.rows,
        siblings
      }
    });
  } catch (error) {
    console.error("Get member detail error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi l\u1EA5y th\xF4ng tin chi ti\u1EBFt." });
  }
});
apiRouter.post("/members", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const {
      full_name,
      gender = "male",
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
      bio
    } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: "H\u1ECD v\xE0 t\xEAn l\xE0 b\u1EAFt bu\u1ED9c." });
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
        sql: "SELECT generation, branch, full_name FROM members WHERE id = ?",
        args: [parent_id]
      });
      if (pRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin cha/m\u1EB9 \u0111\u01B0\u1EE3c ch\u1ECDn." });
      }
      gen = Number(pRes.rows[0].generation) + 1;
      const dupCheck = await db.execute({
        sql: "SELECT id, full_name, birth_order FROM members WHERE parent_id = ? AND birth_order = ?",
        args: [parent_id, orderNum]
      });
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cha/M\u1EB9 (${pRes.rows[0].full_name}) \u0111\xE3 c\xF3 con th\u1EE9 ${orderNum} (${dupCheck.rows[0].full_name}). Vui l\xF2ng ch\u1ECDn s\u1ED1 th\u1EE9 t\u1EF1 con kh\xE1c.`
        });
      }
    } else {
      if (gen > 1) {
        const prevGenCheck = await db.execute({
          sql: "SELECT COUNT(*) as count FROM members WHERE generation = ?",
          args: [gen - 1]
        });
        if (Number(prevGenCheck.rows[0]?.count || 0) === 0) {
          return res.status(400).json({
            success: false,
            message: `Kh\xF4ng th\u1EC3 th\xEAm th\xE0nh vi\xEAn \u0110\u1EDDi th\u1EE9 ${gen} khi \u0110\u1EDDi th\u1EE9 ${gen - 1} ch\u01B0a c\xF3 ai trong gia ph\u1EA3. C\xE1c th\u1EBF h\u1EC7 ph\u1EA3i li\xEAn t\u1EE5c, kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EA3y c\xF3c.`
          });
        }
      }
    }
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
        now
      ]
    });
    return res.status(201).json({
      success: true,
      message: "Th\xEAm th\xE0nh vi\xEAn th\xE0nh c\xF4ng.",
      data: { id }
    });
  } catch (error) {
    console.error("Add member error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi l\u01B0u th\xF4ng tin th\xE0nh vi\xEAn." });
  }
});
apiRouter.put("/members/:id", requireRole(["admin", "editor"]), async (req, res) => {
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
      bio
    } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: "H\u1ECD v\xE0 t\xEAn l\xE0 b\u1EAFt bu\u1ED9c." });
    }
    if (parent_id && parent_id === id) {
      return res.status(400).json({ success: false, message: "Th\xE0nh vi\xEAn kh\xF4ng th\u1EC3 t\u1EF1 l\xE0m cha/m\u1EB9 c\u1EE7a ch\xEDnh m\xECnh." });
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
        sql: "SELECT generation, branch, full_name FROM members WHERE id = ?",
        args: [parent_id]
      });
      if (pRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin cha/m\u1EB9 \u0111\u01B0\u1EE3c ch\u1ECDn." });
      }
      gen = Number(pRes.rows[0].generation) + 1;
      const dupCheck = await db.execute({
        sql: "SELECT id, full_name, birth_order FROM members WHERE parent_id = ? AND id != ? AND birth_order = ?",
        args: [parent_id, id, orderNum]
      });
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cha/M\u1EB9 (${pRes.rows[0].full_name}) \u0111\xE3 c\xF3 con th\u1EE9 ${orderNum} (${dupCheck.rows[0].full_name}). Kh\xF4ng th\u1EC3 ch\u1ECDn tr\xF9ng th\u1EE9 t\u1EF1 con.`
        });
      }
    } else {
      if (gen > 1) {
        const prevGenCheck = await db.execute({
          sql: "SELECT COUNT(*) as count FROM members WHERE generation = ? AND id != ?",
          args: [gen - 1, id]
        });
        if (Number(prevGenCheck.rows[0]?.count || 0) === 0) {
          return res.status(400).json({
            success: false,
            message: `Kh\xF4ng th\u1EC3 ch\u1ECDn \u0110\u1EDDi th\u1EE9 ${gen} khi \u0110\u1EDDi th\u1EE9 ${gen - 1} ch\u01B0a c\xF3 th\xE0nh vi\xEAn n\xE0o kh\xE1c trong gia ph\u1EA3. C\xE1c th\u1EBF h\u1EC7 ph\u1EA3i li\xEAn t\u1EE5c, kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EA3y c\xF3c.`
          });
        }
      }
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
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
        id
      ]
    });
    return res.json({ success: true, message: "C\u1EADp nh\u1EADt th\xE0nh vi\xEAn th\xE0nh c\xF4ng." });
  } catch (error) {
    console.error("Update member error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi c\u1EADp nh\u1EADt th\xF4ng tin th\xE0nh vi\xEAn." });
  }
});
apiRouter.delete("/members/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const childrenCheck = await db.execute({
      sql: "SELECT COUNT(*) as count FROM members WHERE parent_id = ?",
      args: [id]
    });
    const childCount = Number(childrenCheck.rows[0]?.count || 0);
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kh\xF4ng th\u1EC3 x\xF3a th\xE0nh vi\xEAn n\xE0y v\xEC c\xF2n ${childCount} ng\u01B0\u1EDDi con ph\u1EE5 thu\u1ED9c. Vui l\xF2ng chuy\u1EC3n ho\u1EB7c x\xF3a con tr\u01B0\u1EDBc.`
      });
    }
    await db.execute({
      sql: "DELETE FROM members WHERE id = ?",
      args: [id]
    });
    return res.json({ success: true, message: "\u0110\xE3 x\xF3a th\xE0nh vi\xEAn kh\u1ECFi gia ph\u1EA3." });
  } catch (error) {
    console.error("Delete member error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi x\xF3a th\xE0nh vi\xEAn." });
  }
});
apiRouter.post("/members/bulk-add", requireRole(["admin", "editor"]), async (req, res) => {
  try {
    const { members = [] } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: "Danh s\xE1ch th\xE0nh vi\xEAn c\u1EA7n th\xEAm kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng." });
    }
    let addedCount = 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const createdIds = [];
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
          m.gender === "female" ? "female" : "male",
          m.birth_date || null,
          calculatedYear,
          m.is_alive !== void 0 ? Number(m.is_alive) : 1,
          m.death_date || null,
          m.burial_place || null,
          m.occupation || null,
          m.address || null,
          m.avatar_url || null,
          gen,
          m.parent_id || null,
          m.mother_id || null,
          m.spouse_name || null,
          Number(m.birth_order) || i + 1,
          m.branch || null,
          m.phone || null,
          m.bio || null,
          now,
          now
        ]
      });
      createdIds.push(id);
      addedCount++;
    }
    return res.status(201).json({
      success: true,
      count: addedCount,
      message: `\u0110\xE3 th\xEAm th\xE0nh c\xF4ng ${addedCount} th\xE0nh vi\xEAn v\xE0o gia ph\u1EA3.`,
      ids: createdIds
    });
  } catch (error) {
    console.error("Bulk add members error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi th\xEAm th\xE0nh vi\xEAn h\xE0ng lo\u1EA1t." });
  }
});
apiRouter.post("/members/bulk-delete", requireRole(["admin"]), async (req, res) => {
  try {
    const { ids = [], unlinkChildren = true } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng ch\u1ECDn \xEDt nh\u1EA5t m\u1ED9t th\xE0nh vi\xEAn \u0111\u1EC3 x\xF3a." });
    }
    if (unlinkChildren) {
      for (const id of ids) {
        await db.execute({
          sql: "UPDATE members SET parent_id = NULL WHERE parent_id = ?",
          args: [id]
        });
      }
    } else {
      for (const id of ids) {
        const check = await db.execute({
          sql: "SELECT COUNT(*) as count FROM members WHERE parent_id = ?",
          args: [id]
        });
        const count = Number(check.rows[0]?.count || 0);
        if (count > 0) {
          return res.status(400).json({
            success: false,
            message: "M\u1ED9t s\u1ED1 th\xE0nh vi\xEAn \u0111\u01B0\u1EE3c ch\u1ECDn c\xF2n ng\u01B0\u1EDDi con ph\u1EE5 thu\u1ED9c. H\xE3y t\xEDch ch\u1ECDn g\u1EE1 li\xEAn k\u1EBFt con ho\u1EB7c x\xF3a con tr\u01B0\u1EDBc."
          });
        }
      }
    }
    let deletedCount = 0;
    for (const id of ids) {
      await db.execute({
        sql: "DELETE FROM members WHERE id = ?",
        args: [id]
      });
      deletedCount++;
    }
    return res.json({
      success: true,
      count: deletedCount,
      message: `\u0110\xE3 x\xF3a th\xE0nh c\xF4ng ${deletedCount} th\xE0nh vi\xEAn kh\u1ECFi gia ph\u1EA3.`
    });
  } catch (error) {
    console.error("Bulk delete members error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi x\xF3a th\xE0nh vi\xEAn h\xE0ng lo\u1EA1t." });
  }
});
apiRouter.post("/clan/reset-demo-pham", requireRole(["admin"]), async (_req, res) => {
  try {
    await resetToPhamClanDemo();
    const updatedClan = await db.execute("SELECT * FROM clan_info LIMIT 1");
    return res.json({
      success: true,
      message: "\u0110\xE3 thi\u1EBFt l\u1EADp l\u1EA1i to\xE0n b\u1ED9 d\u1EEF li\u1EC7u m\u1EABu Gia T\u1ED9c H\u1ECD Ph\u1EA1m th\xE0nh c\xF4ng (4 th\u1EBF h\u1EC7 chu\u1EA9n).",
      clan: updatedClan.rows[0]
    });
  } catch (error) {
    console.error("Reset to Pham clan error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi \u0111\u1EB7t l\u1EA1i d\u1EEF li\u1EC7u H\u1ECD Ph\u1EA1m." });
  }
});
apiRouter.get("/tree", async (_req, res) => {
  try {
    const membersRes = await db.execute(
      "SELECT id, full_name, gender, birth_date, birth_year, is_alive, death_date, occupation, address, avatar_url, generation, parent_id, spouse_name, birth_order, branch FROM members ORDER BY generation ASC, birth_order ASC, birth_year ASC"
    );
    const members = membersRes.rows;
    const memberMap = {};
    members.forEach((m) => {
      memberMap[String(m.id)] = {
        ...m,
        children: []
      };
    });
    const rootNodes = [];
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
      flat: members
    });
  } catch (error) {
    console.error("Tree error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi d\u1EF1ng c\xE2y gia ph\u1EA3." });
  }
});
apiRouter.get("/stats", async (_req, res) => {
  try {
    const totalRes = await db.execute("SELECT COUNT(*) as count FROM members");
    const aliveRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE is_alive = 1");
    const deceasedRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE is_alive = 0");
    const maleRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE gender = 'male'");
    const femaleRes = await db.execute("SELECT COUNT(*) as count FROM members WHERE gender = 'female'");
    const genMaxRes = await db.execute("SELECT MAX(generation) as maxGen FROM members");
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
        branches: branchRes.rows.map((b) => b.branch)
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA3i th\u1ED1ng k\xEA." });
  }
});
apiRouter.get("/anniversaries", async (_req, res) => {
  try {
    const clanRes = await db.execute("SELECT name, anniversary_lunar, temple_address FROM clan_info LIMIT 1");
    const clan = clanRes.rows[0] || {};
    const deceasedRes = await db.execute({
      sql: `SELECT id, full_name, gender, generation, birth_year, death_date, burial_place, spouse_name, branch
            FROM members
            WHERE is_alive = 0 OR death_date IS NOT NULL
            ORDER BY generation ASC, death_date ASC`
    });
    return res.json({
      success: true,
      clan: {
        name: clan.name || "Gia T\u1ED9c H\u1ECD Ph\u1EA1m",
        anniversary_lunar: clan.anniversary_lunar || "Ng\xE0y 10 th\xE1ng 3 \xC2m l\u1ECBch",
        temple_address: clan.temple_address || ""
      },
      total: deceasedRes.rows.length,
      anniversaries: deceasedRes.rows
    });
  } catch (error) {
    console.error("Anniversaries error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA3i danh s\xE1ch ng\xE0y gi\u1ED7." });
  }
});
apiRouter.get("/generations", async (_req, res) => {
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
        female_count: Number(row.female_count)
      }))
    });
  } catch (error) {
    console.error("Generations summary error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA3i danh s\xE1ch th\u1EBF h\u1EC7." });
  }
});
apiRouter.get("/users", requireRole(["admin"]), async (_req, res) => {
  try {
    const result = await db.execute("SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at ASC");
    return res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA3i danh s\xE1ch t\xE0i kho\u1EA3n." });
  }
});
apiRouter.post("/users", requireRole(["admin"]), async (req, res) => {
  try {
    const { username, password, full_name, role = "editor" } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: "Vui l\xF2ng \u0111i\u1EC1n \u0111\u1EE7 th\xF4ng tin t\xE0i kho\u1EA3n." });
    }
    const userHash = hashPassword(password);
    const id = `user_${Date.now()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await db.execute({
      sql: "INSERT INTO users (id, username, password_hash, full_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, username.trim().toLowerCase(), userHash, full_name.trim(), role, now]
    });
    return res.status(201).json({ success: true, message: "T\u1EA1o t\xE0i kho\u1EA3n th\xE0nh c\xF4ng." });
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint")) {
      return res.status(400).json({ success: false, message: "T\xEAn \u0111\u0103ng nh\u1EADp n\xE0y \u0111\xE3 t\u1ED3n t\u1EA1i." });
    }
    console.error("Create user error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi t\u1EA1o t\xE0i kho\u1EA3n." });
  }
});
apiRouter.put("/users/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, password } = req.body;
    if (password && password.trim()) {
      const hash = hashPassword(password.trim());
      await db.execute({
        sql: "UPDATE users SET full_name = ?, role = ?, password_hash = ? WHERE id = ?",
        args: [full_name, role, hash, id]
      });
    } else {
      await db.execute({
        sql: "UPDATE users SET full_name = ?, role = ? WHERE id = ?",
        args: [full_name, role, id]
      });
    }
    return res.json({ success: true, message: "C\u1EADp nh\u1EADt t\xE0i kho\u1EA3n th\xE0nh c\xF4ng." });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi c\u1EADp nh\u1EADt t\xE0i kho\u1EA3n." });
  }
});
apiRouter.delete("/users/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await db.execute({ sql: "SELECT username FROM users WHERE id = ?", args: [id] });
    if (userRes.rows.length > 0 && String(userRes.rows[0].username) === "ducphi") {
      return res.status(400).json({ success: false, message: "Kh\xF4ng th\u1EC3 x\xF3a t\xE0i kho\u1EA3n qu\u1EA3n tr\u1ECB vi\xEAn ch\xEDnh ducphi." });
    }
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
    return res.json({ success: true, message: "\u0110\xE3 x\xF3a t\xE0i kho\u1EA3n." });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "L\u1ED7i khi x\xF3a t\xE0i kho\u1EA3n." });
  }
});
apiRouter.get("/system/status", requireRole(["admin"]), async (_req, res) => {
  try {
    const startTime = Date.now();
    await db.execute("SELECT 1");
    const latency = Date.now() - startTime;
    const memberCountRes = await db.execute("SELECT COUNT(*) as count FROM members");
    const userCountRes = await db.execute("SELECT COUNT(*) as count FROM users");
    const isCustom = isCustomTursoConfigured();
    return res.json({
      success: true,
      status: "healthy",
      database: {
        provider: "Cloud Database (Turso libSQL)",
        connected: true,
        latencyMs: latency,
        host: getTursoHost(),
        isCustomTurso: isCustom,
        configuredSource: isCustom ? "C\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso ri\xEAng c\u1EE7a b\u1EA1n" : "M\u1EB7c \u0111\u1ECBnh h\u1EC7 th\u1ED1ng (Fallback Demo DB)"
      },
      stats: {
        membersCount: Number(memberCountRes.rows[0]?.count || 0),
        usersCount: Number(userCountRes.rows[0]?.count || 0)
      },
      serverTime: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: "error",
      message: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso."
    });
  }
});
apiRouter.get("/system/turso-config", requireRole(["admin"]), async (_req, res) => {
  try {
    const info = getTursoConfigInfo();
    return res.json({
      success: true,
      data: info
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "L\u1ED7i khi l\u1EA5y th\xF4ng tin c\u1EA5u h\xECnh Turso"
    });
  }
});
apiRouter.post("/system/turso-config", requireRole(["admin"]), async (req, res) => {
  try {
    const { databaseUrl, authToken, seedSampleData } = req.body;
    if (!databaseUrl || typeof databaseUrl !== "string" || !databaseUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui l\xF2ng cung c\u1EA5p URL c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso (v\xED d\u1EE5: libsql://ten-db.turso.io)."
      });
    }
    if (!authToken || typeof authToken !== "string" || !authToken.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui l\xF2ng cung c\u1EA5p Auth Token c\u1EE7a Turso (t\u1EA1o b\u1EB1ng l\u1EC7nh `turso db tokens create`)."
      });
    }
    const connectResult = await setTursoCredentials(databaseUrl, authToken, true);
    if (seedSampleData) {
      await resetToPhamClanDemo();
    }
    return res.json({
      success: true,
      message: connectResult.message,
      host: connectResult.host,
      latencyMs: connectResult.latencyMs,
      seeded: Boolean(seedSampleData)
    });
  } catch (err) {
    console.error("Error configuring Turso:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "L\u1ED7i khi k\u1EBFt n\u1ED1i v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso. Vui l\xF2ng ki\u1EC3m tra l\u1EA1i URL v\xE0 Token."
    });
  }
});
apiRouter.post("/system/reset-turso-default", requireRole(["admin"]), async (_req, res) => {
  try {
    const resetResult = await resetTursoToDefault();
    return res.json({
      success: true,
      message: "\u0110\xE3 chuy\u1EC3n v\u1EC1 k\u1EBFt n\u1ED1i c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso m\u1EB7c \u0111\u1ECBnh c\u1EE7a h\u1EC7 th\u1ED1ng.",
      host: resetResult.host
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "L\u1ED7i khi kh\xF4i ph\u1EE5c Turso m\u1EB7c \u0111\u1ECBnh."
    });
  }
});
apiRouter.post("/system/seed-turso", requireRole(["admin"]), async (_req, res) => {
  try {
    await resetToPhamClanDemo();
    const countRes = await db.execute("SELECT COUNT(*) as count FROM members");
    return res.json({
      success: true,
      message: "\u0110\xE3 n\u1EA1p th\xE0nh c\xF4ng c\xE2y ph\u1EA3 h\u1EC7 H\u1ECD Ph\u1EA1m v\xE0o c\u01A1 s\u1EDF d\u1EEF li\u1EC7u Turso \u0111ang k\u1EBFt n\u1ED1i!",
      host: getTursoHost(),
      membersCount: Number(countRes.rows[0]?.count || 0)
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "L\u1ED7i khi n\u1EA1p d\u1EEF li\u1EC7u m\u1EABu v\xE0o Turso."
    });
  }
});
apiRouter.post("/system/test-turso", requireRole(["admin"]), async (_req, res) => {
  try {
    const startTime = Date.now();
    await db.execute("SELECT 1");
    const countRes = await db.execute("SELECT COUNT(*) as count FROM members");
    const readCount = Number(countRes.rows[0]?.count || 0);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS _turso_diagnostics (
        id TEXT PRIMARY KEY,
        tested_at TEXT NOT NULL,
        host TEXT NOT NULL
      )
    `);
    const testId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await db.execute({
      sql: "INSERT INTO _turso_diagnostics (id, tested_at, host) VALUES (?, ?, ?)",
      args: [testId, nowIso, getTursoHost()]
    });
    const verifyRes = await db.execute({
      sql: "SELECT id, tested_at FROM _turso_diagnostics WHERE id = ?",
      args: [testId]
    });
    const writeSuccess = verifyRes.rows.length > 0;
    await db.execute({
      sql: "DELETE FROM _turso_diagnostics WHERE id = ?",
      args: [testId]
    });
    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      message: "Ki\u1EC3m tra \u0111\u1ECDc v\xE0 ghi v\xE0o Turso th\xE0nh c\xF4ng 100%!",
      host: getTursoHost(),
      isCustomTurso: isCustomTursoConfigured(),
      readCount,
      writeSuccess,
      cleanupSuccess: true,
      latencyMs,
      testedAt: nowIso
    });
  } catch (error) {
    console.error("Turso diagnostic test error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "L\u1ED7i khi ki\u1EC3m tra \u0111\u1ECDc/ghi Turso.",
      host: getTursoHost(),
      isCustomTurso: isCustomTursoConfigured()
    });
  }
});
var cachedFontPayload = null;
apiRouter.get("/fonts/vietnamese", (_req, res) => {
  try {
    if (cachedFontPayload) {
      return res.json({ success: true, fonts: cachedFontPayload });
    }
    const regPath = import_node_path2.default.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");
    const boldPath = import_node_path2.default.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf");
    if (import_node_fs2.default.existsSync(regPath) && import_node_fs2.default.existsSync(boldPath)) {
      const regBuf = import_node_fs2.default.readFileSync(regPath);
      const boldBuf = import_node_fs2.default.readFileSync(boldPath);
      cachedFontPayload = {
        regular: regBuf.toString("base64"),
        bold: boldBuf.toString("base64")
      };
      return res.json({ success: true, fonts: cachedFontPayload });
    }
    return res.status(404).json({ success: false, message: "Font files not found on server" });
  } catch (err) {
    console.error("Error serving Vietnamese fonts:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// server/entry-serverless.ts
var app = (0, import_express2.default)();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});
app.use((req, res, next) => {
  if (req.body !== void 0 && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString("utf-8"));
      } catch (_) {
      }
    } else if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch (_) {
      }
    }
    return next();
  }
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS" || req.readableEnded) {
    req.body = req.body || {};
    return next();
  }
  import_express2.default.json({ limit: "10mb" })(req, res, (err) => {
    if (err) {
      console.error("Body parser error:", err);
      return res.status(400).json({ success: false, message: "D\u1EEF li\u1EC7u y\xEAu c\u1EA7u kh\xF4ng h\u1EE3p l\u1EC7" });
    }
    next();
  });
});
app.use((req, _res, next) => {
  const urlCandidate = req.headers["x-matched-path"] || req.headers["x-vercel-matched-path"] || req.headers["x-forwarded-uri"] || req.originalUrl || req.url;
  if (urlCandidate && urlCandidate !== "/" && urlCandidate !== "/api") {
    req.url = urlCandidate;
  }
  next();
});
var dbReady = null;
app.use(async (_req, _res, next) => {
  try {
    if (!dbReady) {
      dbReady = initDatabase().catch((err) => {
        console.error("Database initialization error:", err);
        dbReady = null;
      });
    }
    await Promise.race([
      dbReady,
      new Promise((resolve) => setTimeout(resolve, 2500))
    ]);
  } catch (err) {
    console.error("Database middleware error:", err);
  }
  next();
});
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    message: "Gia Ph\u1EA3 H\u1ECD Ph\u1EA1m API \u0111ang ho\u1EA1t \u0111\u1ED9ng b\xECnh th\u01B0\u1EDDng tr\xEAn Vercel"
  });
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: `\u0110\u01B0\u1EDDng d\u1EABn API kh\xF4ng t\u1ED3n t\u1EA1i: ${req.method} ${req.originalUrl || req.url}`
    });
  }
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled server error in serverless:", err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: err?.message || "L\u1ED7i x\u1EED l\xFD y\xEAu c\u1EA7u m\xE1y ch\u1EE7"
    });
  }
});
var entry_serverless_default = app;
