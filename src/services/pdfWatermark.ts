/**
 * Generates high-resolution Vietnamese traditional watermark & ornate frames
 * for genealogy (Gia Phả) PDF export.
 * Features:
 * - Traditional Vietnamese royal parchment background tone (Nền giấy dó ngà ấm cổ truyền)
 * - Double royal ornamental frame with traditional corner filigree (Khung viền cung đình kép & Hồi văn 4 góc)
 * - Mặt Trống Đồng Đông Sơn (Đông Sơn Bronze Drum) watermark with 14-pointed sun star,
 *   concentric beaded rings, geometric herringbone, and flying Lạc birds (Chim Lạc sải cánh)
 * - Imperial Lotus (Hoa Sen Cổ Truyền) option when clan pattern is lotus
 * - Imperial vermilion red clan seal (Dấu triện son đỏ gia tộc)
 * - Balanced opacity so watermarks are clearly visible while all text remains 100% legible
 */

export interface WatermarkOptions {
  pattern?: 'dongson' | 'lotus' | 'minimal' | 'none';
  clanName?: string;
  logoText?: string;
}

const watermarkCache = new Map<string, string>();

export function getGenealogyWatermarkDataUrl(options: WatermarkOptions = {}): string {
  const pattern = options.pattern || 'dongson';
  const clanName = options.clanName || '';
  const logoText = options.logoText || '氏';
  const cacheKey = `${pattern}_${clanName}_${logoText}`;

  if (watermarkCache.has(cacheKey)) {
    return watermarkCache.get(cacheKey)!;
  }

  // A4 ratio (1 : 1.414) at ~150 DPI for crisp vector-like rendering without lag
  const width = 1240;
  const height = 1754;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // -------------------------------------------------------------
  // 0. WARM ROYAL PARCHMENT BACKGROUND TONE (Nền giấy dó cổ truyền)
  // -------------------------------------------------------------
  ctx.fillStyle = '#faf8f3';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial gradient to simulate antique parchment texture
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    200,
    width / 2,
    height / 2,
    width * 0.75
  );
  bgGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  bgGrad.addColorStop(0.7, 'rgba(247, 241, 227, 0.3)');
  bgGrad.addColorStop(1, 'rgba(240, 230, 210, 0.5)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2 + 18; // Centered on page

  // -------------------------------------------------------------
  // 1. CENTER WATERMARK PATTERN
  // -------------------------------------------------------------
  ctx.save();

  if (pattern === 'lotus') {
    // -------------------------------------------------------------
    // HOA SEN CUNG ĐÌNH (Imperial Lotus Watermark)
    // -------------------------------------------------------------
    const lotusStroke = 'rgba(180, 83, 9, 0.16)';
    const lotusFill = 'rgba(180, 83, 9, 0.05)';
    const lotusAccent = 'rgba(180, 83, 9, 0.22)';

    ctx.strokeStyle = lotusStroke;
    ctx.fillStyle = lotusFill;
    ctx.lineWidth = 2;

    // Concentric sacred halos
    ctx.beginPath();
    ctx.arc(cx, cy, 400, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 370, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 310, 0, Math.PI * 2);
    ctx.stroke();

    // Central lotus seed pod / Gương sen
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Seeds in pod
    for (let i = 0; i < 8; i++) {
      const a = (i * 2 * Math.PI) / 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32, 5, 0, Math.PI * 2);
      ctx.fillStyle = lotusAccent;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    // 16 Radiating Lotus Petals (Cánh sen lớn bung nở)
    const numPetals = 16;
    ctx.lineWidth = 2.2;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i * 2 * Math.PI) / numPetals;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.quadraticCurveTo(-45, -160, 0, -250);
      ctx.quadraticCurveTo(45, -160, 0, -60);
      ctx.fillStyle = lotusFill;
      ctx.fill();
      ctx.strokeStyle = lotusStroke;
      ctx.stroke();

      // Petal vein
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(0, -230);
      ctx.strokeStyle = lotusAccent;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }

    // Outer secondary petals
    for (let i = 0; i < numPetals; i++) {
      const angle = ((i + 0.5) * 2 * Math.PI) / numPetals;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.quadraticCurveTo(-35, -190, 0, -290);
      ctx.quadraticCurveTo(35, -190, 0, -90);
      ctx.fillStyle = lotusFill;
      ctx.fill();
      ctx.strokeStyle = lotusStroke;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.restore();
    }

    // Water wave ripples at bottom (Sóng nước hoa sen)
    ctx.lineWidth = 1.5;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(cx, cy + 180, 160 + r * 30, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = lotusStroke;
      ctx.stroke();
    }
  } else {
    // -------------------------------------------------------------
    // DEFAULT: TRỐNG ĐỒNG ĐÔNG SƠN (Đông Sơn Bronze Drum)
    // -------------------------------------------------------------
    const maxR = 450;
    const drumStroke = 'rgba(180, 83, 9, 0.16)';
    const drumFill = 'rgba(180, 83, 9, 0.055)';
    const drumAccent = 'rgba(180, 83, 9, 0.22)';
    const drumTick = 'rgba(180, 83, 9, 0.18)';

    // Outer rim 1
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = drumStroke;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.stroke();

    // Outer rim 2
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Radial tick marks on outer rim (vành răng cưa nhỏ ngoài cùng)
    const numOuterTicks = 128;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = drumTick;
    for (let i = 0; i < numOuterTicks; i++) {
      const angle = (i * 2 * Math.PI) / numOuterTicks;
      const x1 = cx + Math.cos(angle) * (maxR - 10);
      const y1 = cy + Math.sin(angle) * (maxR - 10);
      const x2 = cx + Math.cos(angle) * maxR;
      const y2 = cy + Math.sin(angle) * maxR;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Ring 2: Geometric herringbone / cross-hatch ring
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = drumStroke;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 50, 0, Math.PI * 2);
    ctx.stroke();

    const numSawteethOuter = 48;
    for (let i = 0; i < numSawteethOuter; i++) {
      const a1 = (i * 2 * Math.PI) / numSawteethOuter;
      const a2 = ((i + 0.5) * 2 * Math.PI) / numSawteethOuter;
      const a3 = ((i + 1) * 2 * Math.PI) / numSawteethOuter;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * (maxR - 50), cy + Math.sin(a1) * (maxR - 50));
      ctx.lineTo(cx + Math.cos(a2) * (maxR - 25), cy + Math.sin(a2) * (maxR - 25));
      ctx.lineTo(cx + Math.cos(a3) * (maxR - 50), cy + Math.sin(a3) * (maxR - 50));
      ctx.stroke();
    }

    // Ring 3: Đàn chim Lạc sải cánh bay ngược chiều kim đồng hồ (Văn hóa Đông Sơn)
    const birdRadius = maxR - 95;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, maxR - 120, 0, Math.PI * 2);
    ctx.stroke();

    const numBirds = 8;
    for (let i = 0; i < numBirds; i++) {
      const angle = (i * 2 * Math.PI) / numBirds;
      const bx = cx + Math.cos(angle) * birdRadius;
      const by = cy + Math.sin(angle) * birdRadius;

      ctx.save();
      ctx.translate(bx, by);
      // Rotate tangential to circle (flying counter-clockwise)
      ctx.rotate(angle + Math.PI / 2);

      ctx.strokeStyle = drumAccent;
      ctx.fillStyle = drumFill;
      ctx.lineWidth = 1.8;

      // Stylized Đông Sơn Crane / Chim Lạc with long beak, swept wings, trailing plumes
      ctx.beginPath();
      // Beak and head
      ctx.moveTo(42, -2);
      ctx.lineTo(18, -4);
      // Head crest
      ctx.quadraticCurveTo(24, -14, 12, -10);
      // Body & back
      ctx.quadraticCurveTo(0, -7, -18, -2);
      // Long tail feathers
      ctx.quadraticCurveTo(-42, -1, -60, 5);
      ctx.quadraticCurveTo(-36, 10, -18, 7);
      // Belly & chest
      ctx.quadraticCurveTo(6, 8, 24, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Swept wing
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.quadraticCurveTo(-6, -34, -30, -30);
      ctx.quadraticCurveTo(-18, -14, -2, -3);
      ctx.stroke();

      ctx.restore();
    }

    // Ring 4: Vòng tròn tiếp tuyến đôi (Beaded tangent dots ring)
    const ring4R = maxR - 150;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, ring4R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, ring4R - 30, 0, Math.PI * 2);
    ctx.stroke();

    const numDots = 42;
    for (let i = 0; i < numDots; i++) {
      const angle = (i * 2 * Math.PI) / numDots;
      const dotX = cx + Math.cos(angle) * (ring4R - 15);
      const dotY = cy + Math.sin(angle) * (ring4R - 15);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = drumAccent;
      ctx.fill();
      ctx.stroke();
    }

    // Ring 5: Vòng hoa văn răng cưa trong
    const ring5R = ring4R - 60;
    ctx.beginPath();
    ctx.arc(cx, cy, ring5R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, ring5R - 30, 0, Math.PI * 2);
    ctx.stroke();

    const numInnerTeeth = 32;
    for (let i = 0; i < numInnerTeeth; i++) {
      const a1 = (i * 2 * Math.PI) / numInnerTeeth;
      const a2 = ((i + 0.5) * 2 * Math.PI) / numInnerTeeth;
      const a3 = ((i + 1) * 2 * Math.PI) / numInnerTeeth;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * (ring5R - 30), cy + Math.sin(a1) * (ring5R - 30));
      ctx.lineTo(cx + Math.cos(a2) * ring5R, cy + Math.sin(a2) * ring5R);
      ctx.lineTo(cx + Math.cos(a3) * (ring5R - 30), cy + Math.sin(a3) * (ring5R - 30));
      ctx.stroke();
    }

    // Center: Mặt trời 14 tia sáng (14-Pointed Sun Star)
    const sunCenterR = 45;
    const sunRayR = 135;
    ctx.beginPath();
    ctx.arc(cx, cy, sunCenterR, 0, Math.PI * 2);
    ctx.fillStyle = drumFill;
    ctx.fill();
    ctx.stroke();

    const numRays = 14;
    for (let i = 0; i < numRays; i++) {
      const aRay = (i * 2 * Math.PI) / numRays;
      const aLeft = aRay - Math.PI / numRays;
      const aRight = aRay + Math.PI / numRays;

      // Tip of ray
      const rx = cx + Math.cos(aRay) * sunRayR;
      const ry = cy + Math.sin(aRay) * sunRayR;

      // Base on center circle
      const lx = cx + Math.cos(aLeft) * sunCenterR;
      const ly = cy + Math.sin(aLeft) * sunCenterR;
      const rbx = cx + Math.cos(aRight) * sunCenterR;
      const rby = cy + Math.sin(aRight) * sunCenterR;

      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.lineTo(rbx, rby);
      ctx.closePath();
      ctx.fillStyle = drumFill;
      ctx.fill();
      ctx.stroke();

      // Peacock feather ornament between rays (họa tiết lông công)
      const midAngle = aRay + Math.PI / numRays;
      const fx1 = cx + Math.cos(midAngle) * (sunCenterR + 12);
      const fy1 = cy + Math.sin(midAngle) * (sunCenterR + 12);
      const fx2 = cx + Math.cos(midAngle) * (sunRayR - 16);
      const fy2 = cy + Math.sin(midAngle) * (sunRayR - 16);
      ctx.beginPath();
      ctx.moveTo(fx1, fy1);
      ctx.lineTo(fx2, fy2);
      ctx.strokeStyle = drumAccent;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  ctx.restore();

  // -------------------------------------------------------------
  // 2. KHUNG VIỀN CUNG ĐÌNH & HOA VĂN GÓC (Double Royal Frame & Corners)
  // -------------------------------------------------------------
  ctx.save();
  const borderMarginOuter = 40;
  const borderMarginInner = 52;
  const frameColorOuter = 'rgba(180, 83, 9, 0.65)';
  const frameColorInner = 'rgba(180, 83, 9, 0.38)';

  // Outer primary border
  ctx.strokeStyle = frameColorOuter;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(
    borderMarginOuter,
    borderMarginOuter,
    width - borderMarginOuter * 2,
    height - borderMarginOuter * 2
  );

  // Inner delicate border
  ctx.strokeStyle = frameColorInner;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(
    borderMarginInner,
    borderMarginInner,
    width - borderMarginInner * 2,
    height - borderMarginInner * 2
  );

  // 4 Ornate Corner Motifs (Hồi văn góc hoa sen / góc mây cung đình thời Lê - Nguyễn)
  const cornerSize = 75;
  const cornerStroke = 'rgba(180, 83, 9, 0.55)';

  function drawCornerFiligree(x: number, y: number, scaleX: number, scaleY: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.strokeStyle = cornerStroke;
    ctx.lineWidth = 2;

    // Traditional Vietnamese L-shaped stepped fret (Hồi văn cổ truyền)
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, cornerSize - 15);
    ctx.lineTo(10, 10);
    ctx.lineTo(cornerSize - 15, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, cornerSize - 30);
    ctx.lineTo(20, 20);
    ctx.lineTo(cornerSize - 30, 20);
    ctx.stroke();

    // Central corner diamond / lotus blossom
    ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
    ctx.beginPath();
    ctx.moveTo(28, 20);
    ctx.lineTo(36, 28);
    ctx.lineTo(28, 36);
    ctx.lineTo(20, 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Top-Left
  drawCornerFiligree(borderMarginInner + 4, borderMarginInner + 4, 1, 1);
  // Top-Right
  drawCornerFiligree(width - borderMarginInner - 4, borderMarginInner + 4, -1, 1);
  // Bottom-Left
  drawCornerFiligree(borderMarginInner + 4, height - borderMarginInner - 4, 1, -1);
  // Bottom-Right
  drawCornerFiligree(width - borderMarginInner - 4, height - borderMarginInner - 4, -1, -1);

  // -------------------------------------------------------------
  // 3. TOP & BOTTOM TRADITIONAL CARTOUCHE (Khánh trang trí)
  // -------------------------------------------------------------
  // Top Header Cartouche
  const topCartY = borderMarginInner - 2;
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.5)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cx - 130, topCartY);
  ctx.quadraticCurveTo(cx - 65, topCartY - 16, cx, topCartY - 16);
  ctx.quadraticCurveTo(cx + 65, topCartY - 16, cx + 130, topCartY);
  ctx.stroke();

  // Lotus bud emblem at top center
  ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
  ctx.beginPath();
  ctx.arc(cx, topCartY - 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Footer Cartouche
  const botCartY = height - borderMarginInner + 2;
  ctx.beginPath();
  ctx.moveTo(cx - 130, botCartY);
  ctx.quadraticCurveTo(cx - 65, botCartY + 16, cx, botCartY + 16);
  ctx.quadraticCurveTo(cx + 65, botCartY + 16, cx + 130, botCartY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, botCartY + 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------
  // 4. IMPERIAL VERMILION CLAN SEAL (Dấu Triện Son Đỏ Gia Tộc)
  // -------------------------------------------------------------
  const sealX = width - borderMarginInner - 95;
  const sealY = borderMarginInner + 30;
  const sealSize = 75;

  ctx.strokeStyle = 'rgba(185, 28, 28, 0.55)'; // Imperial Vermilion Red
  ctx.fillStyle = 'rgba(185, 28, 28, 0.05)';
  ctx.lineWidth = 2.5;

  // Outer square with rounded corners
  ctx.strokeRect(sealX, sealY, sealSize, sealSize);
  ctx.fillRect(sealX, sealY, sealSize, sealSize);

  // Inner thin frame
  ctx.lineWidth = 1;
  ctx.strokeRect(sealX + 4, sealY + 4, sealSize - 8, sealSize - 8);

  // Seal inscription text
  ctx.fillStyle = 'rgba(185, 28, 28, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('GIA TỘC', sealX + sealSize / 2, sealY + 26);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('TRƯỜNG TỒN', sealX + sealSize / 2, sealY + 48);

  ctx.restore();

  // Export to Data URL and cache
  const dataUrl = canvas.toDataURL('image/png');
  watermarkCache.set(cacheKey, dataUrl);
  return dataUrl;
}
