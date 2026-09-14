import { ClanInfo, ClanStats, Member } from '../types.ts';
import { getGenealogyWatermarkDataUrl } from './pdfWatermark.ts';

// Cached Base64 font strings across exports for instant performance
let cachedRegularBase64: string | null = null;
let cachedBoldBase64: string | null = null;

// Reliable helper to convert Blob to Base64 using HTML5 FileReader
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convert ArrayBuffer to Base64 safely
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 4096;
  for (let i = 0; i < len; i += chunkSize) {
    const end = Math.min(i + chunkSize, len);
    for (let j = i; j < end; j++) {
      binary += String.fromCharCode(bytes[j]);
    }
  }
  return btoa(binary);
}

// Load TrueType fonts supporting full Vietnamese UTF-8 accents
async function setupVietnameseFonts(doc: any): Promise<boolean> {
  try {
    // 1. Return from memory cache if already loaded
    if (cachedRegularBase64 && cachedBoldBase64) {
      doc.addFileToVFS('Roboto-Regular.ttf', cachedRegularBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

      doc.addFileToVFS('Roboto-Bold.ttf', cachedBoldBase64);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
      doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'normal');
      doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'bold');

      doc.setFont('Roboto', 'normal');
      return true;
    }

    // 2. Primary source: Server API endpoint delivering Base64 directly
    try {
      const apiRes = await fetch('/api/fonts/vietnamese');
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success && data.fonts?.regular && data.fonts?.bold) {
          cachedRegularBase64 = data.fonts.regular;
          cachedBoldBase64 = data.fonts.bold;

          doc.addFileToVFS('Roboto-Regular.ttf', cachedRegularBase64);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

          doc.addFileToVFS('Roboto-Bold.ttf', cachedBoldBase64);
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
          doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'normal');
          doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'bold');

          doc.setFont('Roboto', 'normal');
          return true;
        }
      }
    } catch (apiErr) {
      console.warn('API font fetch failed, trying static fonts...', apiErr);
    }

    // 3. Secondary source: Direct static files from /fonts/
    try {
      const [regRes, boldRes] = await Promise.all([
        fetch('/fonts/Roboto-Regular.ttf'),
        fetch('/fonts/Roboto-Bold.ttf'),
      ]);

      if (regRes.ok && boldRes.ok) {
        const [regBlob, boldBlob] = await Promise.all([
          regRes.blob(),
          boldRes.blob(),
        ]);

        const [regBase64, boldBase64] = await Promise.all([
          blobToBase64(regBlob),
          blobToBase64(boldBlob),
        ]);

        if (regBase64 && boldBase64) {
          cachedRegularBase64 = regBase64;
          cachedBoldBase64 = boldBase64;

          doc.addFileToVFS('Roboto-Regular.ttf', cachedRegularBase64);
          doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
          doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

          doc.addFileToVFS('Roboto-Bold.ttf', cachedBoldBase64);
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
          doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'normal');
          doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'bold');

          doc.setFont('Roboto', 'normal');
          return true;
        }
      }
    } catch (staticErr) {
      console.warn('Static font fetch failed, trying CDN fallback...', staticErr);
    }

    // 4. Tertiary source: CDN fallback with full Vietnamese glyphs
    try {
      const [regRes, boldRes] = await Promise.all([
        fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf'),
        fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf'),
      ]);

      if (regRes.ok && boldRes.ok) {
        const [regBuf, boldBuf] = await Promise.all([
          regRes.arrayBuffer(),
          boldRes.arrayBuffer(),
        ]);

        cachedRegularBase64 = arrayBufferToBase64(regBuf);
        cachedBoldBase64 = arrayBufferToBase64(boldBuf);

        doc.addFileToVFS('Roboto-Regular.ttf', cachedRegularBase64);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

        doc.addFileToVFS('Roboto-Bold.ttf', cachedBoldBase64);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'normal');
        doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'bold');

        doc.setFont('Roboto', 'normal');
        return true;
      }
    } catch (cdnErr) {
      console.warn('CDN font fetch failed:', cdnErr);
    }

    return false;
  } catch (err) {
    console.error('Fatal error loading custom Vietnamese fonts:', err);
    return false;
  }
}

export async function exportGenealogyPDF(
  clan: ClanInfo,
  members: Member[],
  stats: ClanStats | null
): Promise<void> {
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const jsPDF = (jsPdfModule.default || jsPdfModule) as any;
  const autoTable = (autoTableModule.default || autoTableModule) as any;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Setup Vietnamese UTF-8 TrueType Fonts (Full tone marks & vowels)
  const hasCustomFont = await setupVietnameseFonts(doc);
  const fontRegular = hasCustomFont ? 'Roboto' : 'helvetica';
  const fontBold = hasCustomFont ? 'Roboto' : 'helvetica';

  if (hasCustomFont) {
    doc.setFont('Roboto', 'normal');
  }

  // 2. Generate Traditional Vietnamese Watermark & Royal Ornate Frame
  let watermarkDataUrl = '';
  try {
    watermarkDataUrl = getGenealogyWatermarkDataUrl({
      pattern: clan.pattern_style as any,
      clanName: clan.name,
      logoText: clan.logo_text,
    });
  } catch (wErr) {
    console.warn('Failed to generate watermark canvas:', wErr);
  }

  const stampWatermark = () => {
    if (watermarkDataUrl) {
      try {
        doc.addImage(watermarkDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      } catch (imgErr) {
        console.warn('Error stamping watermark image:', imgErr);
      }
    }
  };

  // Stamp watermark & royal frame on First Page
  stampWatermark();

  let currentY = 18;

  // 3. Traditional Hoành Phi Motto (Châm ngôn tổ tiên)
  doc.setFont(fontRegular, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // Amber-700
  doc.text('ẨM THỦY TƯ NGUYÊN • BÁCH NIÊN GIA TỘC • VẠN ĐẠI TRƯỜNG TỒN', pageWidth / 2, currentY, {
    align: 'center',
  });

  currentY += 8;

  // 4. Main Clan Title with Full Vietnamese Accents
  doc.setFont(fontBold, 'bold');
  doc.setFontSize(21);
  doc.setTextColor(153, 27, 27); // Deep Imperial Red (red-800)
  const rawClanName = (clan.name || 'GIA PHẢ DÒNG HỌ').trim();
  const clanTitle = rawClanName.toUpperCase().startsWith('GIA PHẢ')
    ? rawClanName.toUpperCase()
    : `GIA PHẢ DÒNG HỌ ${rawClanName.toUpperCase()}`;

  doc.text(clanTitle, pageWidth / 2, currentY, { align: 'center' });

  currentY += 6.5;
  doc.setFont(fontRegular, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('SƠ ĐỒ VÀ BẢNG DANH SÁCH THÀNH VIÊN TRỰC HỆ GIA TỘC', pageWidth / 2, currentY, {
    align: 'center',
  });

  // 5. Decorative Bronze Divider Line
  currentY += 6;
  doc.setDrawColor(217, 119, 6); // Amber-600
  doc.setLineWidth(0.6);
  doc.line(26, currentY, pageWidth - 26, currentY);

  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.2);
  doc.line(34, currentY + 1.2, pageWidth - 34, currentY + 1.2);

  // 6. Clan Details Section with Full Diacritics
  currentY += 7;
  doc.setFont(fontRegular, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  const leftMargin = 22;
  const lineSpacing = 5.6;

  if (clan.ancestor_name) {
    doc.setFont(fontBold, 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('Thủy Tổ / Tiền Nhân Khởi Thủy:', leftMargin, currentY);
    doc.setFont(fontRegular, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(` Cụ ${clan.ancestor_name}`, leftMargin + 52, currentY);
    currentY += lineSpacing;
  }

  if (clan.origin) {
    doc.setFont(fontBold, 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('Quê quán gốc tổ nghiệp:', leftMargin, currentY);
    doc.setFont(fontRegular, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(` ${clan.origin}`, leftMargin + 44, currentY);
    currentY += lineSpacing;
  }

  if (clan.temple_address) {
    doc.setFont(fontBold, 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('Từ đường / Nhà thờ họ:', leftMargin, currentY);
    doc.setFont(fontRegular, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(` ${clan.temple_address}`, leftMargin + 44, currentY);
    currentY += lineSpacing;
  }

  if (clan.anniversary_lunar) {
    doc.setFont(fontBold, 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('Ngày giỗ tổ (Âm lịch):', leftMargin, currentY);
    doc.setFont(fontRegular, 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(` ${clan.anniversary_lunar}`, leftMargin + 44, currentY);
    currentY += lineSpacing;
  }

  // 7. Statistics Summary Badge Box
  if (stats) {
    currentY += 2;
    // Semi-transparent parchment fill to let the watermark show through subtly
    doc.setFillColor(254, 252, 246);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.4);
    doc.roundedRect(20, currentY, pageWidth - 40, 15, 2, 2, 'FD');

    doc.setFont(fontBold, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 15);

    const statText1 = `Tổng số đinh & nữ: ${stats.totalMembers} vị  •  Nam: ${stats.maleMembers}  •  Nữ: ${stats.femaleMembers}`;
    const statText2 = `Còn sống: ${stats.aliveMembers} vị  •  Đã quy tiên: ${stats.deceasedMembers} vị  •  Số thế hệ kế truyền: ${stats.totalGenerations} đời`;

    doc.text(statText1, pageWidth / 2, currentY + 5.5, { align: 'center' });
    doc.setFont(fontRegular, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(statText2, pageWidth / 2, currentY + 11.5, { align: 'center' });

    currentY += 20;
  } else {
    currentY += 6;
  }

  // 8. Group Members by Generation
  const generationsMap: Record<number, Member[]> = {};
  members.forEach((m) => {
    const gen = m.generation || 1;
    if (!generationsMap[gen]) generationsMap[gen] = [];
    generationsMap[gen].push(m);
  });

  const sortedGens = Object.keys(generationsMap)
    .map(Number)
    .sort((a, b) => a - b);

  // 9. Prepare Table Rows with Generation Dividers and Full Vietnamese Accents
  const tableData: any[] = [];

  sortedGens.forEach((gen) => {
    const genMembers = generationsMap[gen].sort(
      (a, b) => (a.birth_order || 99) - (b.birth_order || 99)
    );

    // Generation Header Banner in Table
    tableData.push([
      {
        content: `❖ THẾ HỆ THỨ ${gen} (ĐỜI THỨ ${gen}) — TỔNG SỐ ${genMembers.length} THÀNH VIÊN ❖`,
        colSpan: 6,
        styles: {
          fillColor: [254, 243, 199], // Soft amber banner
          textColor: [146, 64, 14], // Amber-800
          font: fontBold,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          cellPadding: 2.2,
          lineColor: [217, 119, 6],
          lineWidth: 0.25,
        },
      },
    ]);

    genMembers.forEach((m) => {
      // Order suffix
      let orderTitle = '';
      if (m.birth_order === 1) {
        orderTitle = ' (Trưởng)';
      } else if (m.birth_order && m.birth_order > 1) {
        orderTitle = ` (Thứ ${m.birth_order})`;
      }

      const displayName = `${m.full_name}${orderTitle}`;
      const genderText = m.gender === 'female' ? 'Nữ' : 'Nam';

      // Birth / Death years
      let yearsInfo = '-';
      if (m.birth_year) {
        yearsInfo = String(m.birth_year);
      } else if (m.birth_date) {
        yearsInfo = String(m.birth_date).slice(0, 4);
      }

      if (m.is_alive === 0) {
        if (m.death_date) {
          yearsInfo += ` - Mất ${m.death_date}`;
        } else {
          yearsInfo += ' - Quy tiên';
        }
      }

      const spousePrefix = m.gender === 'female' ? 'Chồng' : 'Vợ';
      const spouseText = m.spouse_name ? `${spousePrefix}: ${m.spouse_name}` : '-';

      // Branch & occupation
      const details: string[] = [];
      if (m.branch) details.push(`Chi: ${m.branch}`);
      if (m.occupation) details.push(m.occupation);
      const branchOccText = details.length > 0 ? details.join(' • ') : (m.address || '-');

      // Status
      const statusText = m.is_alive === 1 ? 'Còn sống' : 'Đã quy tiên';

      tableData.push([
        displayName,
        genderText,
        yearsInfo,
        spouseText,
        branchOccText,
        statusText,
      ]);
    });
  });

  // 10. Generate PDF AutoTable with Transparent Cells so Watermark is Clearly Visible
  autoTable(doc, {
    startY: currentY,
    margin: { left: 16, right: 16, bottom: 20, top: 18 },
    head: [
      [
        'Họ và Tên',
        'Giới tính',
        'Năm sinh - Mất',
        'Hôn phối (Vợ/Chồng)',
        'Chi phái & Nghề nghiệp',
        'Trạng thái',
      ],
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      font: fontRegular,
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
      lineColor: [217, 119, 6],
      lineWidth: 0.15,
      valign: 'middle',
      // fillColor: false leaves row background transparent so the watermark pattern shines through!
      fillColor: false,
    },
    headStyles: {
      fillColor: [180, 83, 9], // Imperial Bronze-Amber
      textColor: [255, 255, 255],
      font: fontBold,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      lineColor: [146, 64, 14],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { font: fontBold, fontStyle: 'bold', cellWidth: 42 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'center', cellWidth: 26 },
      3: { cellWidth: 32 },
      4: { cellWidth: 'auto' },
      5: { halign: 'center', cellWidth: 22 },
    },
    alternateRowStyles: {
      // Very faint warm tint so watermark remains clearly visible
      fillColor: false,
    },
    willDrawPage: (data: any) => {
      // Stamp the watermark & royal frame on subsequent pages before drawing table rows
      if (data.pageNumber > 1) {
        stampWatermark();

        // Top banner for continued pages
        doc.setFont(fontRegular, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 110, 45);
        doc.text(
          `${clanTitle}  •  BẢNG DANH SÁCH THÀNH VIÊN (TIẾP THEO)`,
          pageWidth / 2,
          13,
          { align: 'center' }
        );
      }
    },
  });

  // 11. Stamp Page Numbers & Date on All Pages accurately
  const totalPages = doc.getNumberOfPages();
  const formattedDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont(fontRegular, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 120, 70); // Warm bronze slate

    const footerText = `${clan.name || 'Gia Phả'} • Trang ${p} / ${totalPages} • Trích xuất ngày ${formattedDate} • Lưu truyền vạn đại`;
    doc.text(footerText, pageWidth / 2, pageHeight - 8.5, { align: 'center' });
  }

  // 12. Trigger Download with Proper File Name
  const cleanClanFileName = (clan.name || 'Dong_Ho')
    .replace(/\s+/g, '_')
    .replace(/[^\w\d_À-ỹ-]/g, '');

  const fileName = `Gia_Pha_${cleanClanFileName}_${new Date().getFullYear()}.pdf`;
  doc.save(fileName);
}
