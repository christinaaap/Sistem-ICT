import * as XLSX from 'xlsx';
import { Asset, AssetType, AssetState, WorkLocation, User } from '../types';

export const downloadAssetTemplate = () => {
  const headers = [
    'Product Name',
    'Type Name (Laptop/Desktop/Monitor)',
    'Serial Number',
    'Hostname',
    'Assigned User Email (@dslng.com)',
    'Work Location (Site Luwuk/HO Jakarta)',
    'Location Detail (Room/Area)',
    'Asset State (store/use/lend/broken/services)',
    'Installed Apps (comma separated)'
  ];

  const sampleRows = [
    [
      'ThinkPad P16s Gen 2',
      'Laptop',
      'SN-DSLNG-2026-901',
      'HO-DSLNG-ENG01',
      'ahmad.dahlan@dslng.com',
      'HO Jakarta',
      'Sentral Senayan II Lt. 8 Room 802',
      'use',
      'SAP GUI 7.70, MS Office 365, Cisco AnyConnect, AutoCAD'
    ],
    [
      'Dell Precision 3660 Tower',
      'Desktop',
      'SN-DSLNG-2026-902',
      'SITE-DCS-WS04',
      'budi.santoso@dslng.com',
      'Site Luwuk',
      'CCR Control Building Site Luwuk',
      'use',
      'Yokogawa DCS Client, OSIsoft PI, MS Office'
    ],
    [
      'Dell UltraSharp 27 4K U2723QE',
      'Monitor',
      'SN-DSLNG-2026-903',
      'MON-HO-802',
      'ahmad.dahlan@dslng.com',
      'HO Jakarta',
      'Sentral Senayan II Lt. 8 Room 802',
      'use',
      '-'
    ],
    [
      'Lenovo ThinkPad T14 Gen 4 (Spare)',
      'Laptop',
      'SN-DSLNG-2026-904',
      'HO-STK-LAP09',
      '',
      'HO Jakarta',
      'ICT Warehouse Sentral Senayan II Lt. 8',
      'store',
      'Standard Corporate Windows 11 Enterprise'
    ]
  ];

  const wsData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 },
    { wch: 35 },
    { wch: 25 },
    { wch: 22 },
    { wch: 32 },
    { wch: 36 },
    { wch: 35 },
    { wch: 28 },
    { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asset_Template_DSLNG');
  XLSX.writeFile(wb, 'DSLNG_ICT_Asset_Import_Template.xlsx');
};

export interface ParseResult {
  success: boolean;
  message: string;
  data?: Partial<Asset>[];
  count?: number;
  duplicateRow?: number;
}

export const parseAssetExcel = async (
  file: File,
  existingAssets: Asset[],
  users: User[]
): Promise<ParseResult> => {
  // Validate file extension
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  if (!isValidExtension) {
    return {
      success: false,
      message: 'Format file tidak valid! Harap gunakan file berformat .xlsx sesuai template yang disediakan.',
    };
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      return {
        success: false,
        message: 'Format file tidak valid! Sheet Excel kosong.',
      };
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (rows.length < 2) {
      return {
        success: false,
        message: 'Format file tidak valid! Tidak ada data baris yang ditemukan dalam file template.',
      };
    }

    // Existing serial numbers set for duplicate check
    const serialSet = new Set<string>(existingAssets.map(a => a.serial_number.trim().toUpperCase()));
    const batchSerialSet = new Set<string>();

    const parsedAssets: Partial<Asset>[] = [];

    // Row 0 is header, start from Row index 1 (Excel Row 2)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) continue; // Skip empty rows

      const excelRowNumber = i + 1;
      const productName = String(row[0] || '').trim();
      let typeNameRaw = String(row[1] || '').trim();
      const serialNumber = String(row[2] || '').trim();
      const hostname = String(row[3] || '').trim();
      const userEmail = String(row[4] || '').trim().toLowerCase();
      let workLocationRaw = String(row[5] || '').trim();
      const locationDetail = String(row[6] || '').trim();
      let assetStateRaw = String(row[7] || '').trim().toLowerCase();
      let installedAppsRaw = String(row[8] || '').trim();

      // If user had older template without asset state column (8 cols vs 9 cols)
      if (row.length === 8 && !['store', 'use', 'lend', 'broken', 'services'].includes(assetStateRaw)) {
        installedAppsRaw = assetStateRaw;
        assetStateRaw = userEmail ? 'use' : 'store';
      }

      if (!productName || !serialNumber) {
        continue; // skip malformed row if no product or serial
      }

      const upperSerial = serialNumber.toUpperCase();

      // Duplicate Serial Number check
      if (serialSet.has(upperSerial) || batchSerialSet.has(upperSerial)) {
        return {
          success: false,
          message: `Gagal mengimport: Ditemukan duplikasi Serial Number pada baris ke-${excelRowNumber}.`,
          duplicateRow: excelRowNumber,
        };
      }
      batchSerialSet.add(upperSerial);

      // Normalize Type Name
      let typeName: AssetType = 'Laptop';
      if (typeNameRaw.toLowerCase().includes('desktop')) typeName = 'Desktop';
      else if (typeNameRaw.toLowerCase().includes('monitor')) typeName = 'Monitor';

      // Normalize Work Location
      let workLocation: WorkLocation = 'Site Luwuk';
      if (workLocationRaw.toLowerCase().includes('jakarta') || workLocationRaw.toLowerCase().includes('ho') || workLocationRaw.toLowerCase().includes('senayan')) {
        workLocation = 'HO Jakarta';
      }

      // Normalize Asset State
      let assetState: AssetState = 'use';
      if (assetStateRaw === 'store' || assetStateRaw.includes('gudang') || assetStateRaw.includes('simpan')) {
        assetState = 'store';
      } else if (assetStateRaw === 'lend' || assetStateRaw.includes('pinjam')) {
        assetState = 'lend';
      } else if (assetStateRaw === 'broken' || assetStateRaw.includes('rusak') || assetStateRaw.includes('afkir')) {
        assetState = 'broken';
      } else if (assetStateRaw === 'services' || assetStateRaw === 'service' || assetStateRaw.includes('servis')) {
        assetState = 'services';
      } else if (assetStateRaw === 'use' || assetStateRaw.includes('pakai') || assetStateRaw.includes('guna')) {
        assetState = 'use';
      } else {
        assetState = userEmail ? 'use' : 'store';
      }

      // Match User
      const matchedUser = users.find(u => u.email.toLowerCase() === userEmail);

      const installedApps = installedAppsRaw && installedAppsRaw !== '-'
        ? installedAppsRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      parsedAssets.push({
        product_name: productName,
        type_name: typeName,
        serial_number: serialNumber,
        hostname: hostname || `DSLNG-${typeName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: matchedUser ? matchedUser.id : null,
        user_name: matchedUser ? matchedUser.name : (userEmail ? userEmail.split('@')[0] : 'Unassigned'),
        work_location: workLocation,
        location: locationDetail || (workLocation === 'Site Luwuk' ? 'Main Administration Building' : 'Sentral Senayan II Lt. 8'),
        asset_state: assetState,
        installed_apps: installedApps.length > 0 ? installedApps : ['Standard OS', 'Endpoint Antivirus'],
        created_at: new Date().toISOString(),
      });
    }

    if (parsedAssets.length === 0) {
      return {
        success: false,
        message: 'Format file tidak valid! Tidak ada data valid yang dapat diimpor.',
      };
    }

    return {
      success: true,
      message: `Import data asset berhasil! Sebanyak [${parsedAssets.length}] data baru berhasil ditambahkan.`,
      data: parsedAssets,
      count: parsedAssets.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Format file tidak valid! Harap gunakan file berformat .xlsx sesuai template yang disediakan.',
    };
  }
};

export const exportAssetsToExcel = (assets: Asset[]) => {
  const exportData = assets.map((a, idx) => ({
    'No': idx + 1,
    'Product Name': a.product_name,
    'Type': a.type_name,
    'Serial Number': a.serial_number,
    'Hostname': a.hostname,
    'Assigned User': a.user_name || 'Unassigned',
    'Work Location': a.work_location,
    'Asset State': a.asset_state || 'use',
    'Room / Area Location': a.location,
    'Installed Software': a.installed_apps.join(', '),
    'Registered Date': a.created_at.split('T')[0],
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DSLNG_Assets');
  XLSX.writeFile(wb, `DSLNG_Asset_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTicketsToExcel = (tickets: any[]) => {
  const exportData = tickets.map((t, idx) => ({
    'No': idx + 1,
    'Ticket Code': t.ticket_code,
    'Requester': t.requester_name,
    'Email': t.requester_email,
    'Department': t.department,
    'Work Location': t.work_location,
    'Category': t.category,
    'Subject': t.subject,
    'Status': t.status,
    'Created Date': t.created_at.split('T')[0],
    'Resolution': t.resolution_notes || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DSLNG_Tickets');
  XLSX.writeFile(wb, `DSLNG_Helpdesk_Tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
};
