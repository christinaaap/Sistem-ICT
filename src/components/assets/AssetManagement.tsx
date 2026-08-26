import React, { useState, useRef } from 'react';
import { Asset, AssetType, AssetState, WorkLocation, User } from '../../types';
import {
  downloadAssetTemplate,
  parseAssetExcel,
  exportAssetsToExcel,
} from '../../utils/excel';
import { notifySuccess, notifyError, notifyConfirm } from '../../utils/notifications';
import {
  Server,
  Laptop,
  Monitor,
  HardDrive,
  FileSpreadsheet,
  UploadCloud,
  DownloadCloud,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Building,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Cpu,
  Package,
  Wrench,
  AlertOctagon,
  Clock,
} from 'lucide-react';

interface AssetManagementProps {
  assets: Asset[];
  users?: User[];
  currentUser?: User;
  currentRole?: string;
  onAddAsset: (asset: Asset) => void;
  onAddBatchAssets?: (newAssets: Asset[]) => void;
  onBulkAddAssets?: (newAssets: Asset[]) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: number) => void;
}

export const AssetManagement: React.FC<AssetManagementProps> = ({
  assets = [],
  users = [],
  currentUser,
  currentRole,
  onAddAsset,
  onAddBatchAssets,
  onBulkAddAssets,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const effectiveUserLocation = currentUser?.work_location || 'Site Luwuk';
  const addBatchFn = onAddBatchAssets || onBulkAddAssets || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  
  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for manual Add/Edit
  const [formData, setFormData] = useState<{
    product_name: string;
    type_name: AssetType;
    serial_number: string;
    hostname: string;
    user_id: number | null;
    work_location: WorkLocation;
    location: string;
    asset_state: AssetState;
    installed_apps: string;
  }>({
    product_name: '',
    type_name: 'Laptop',
    serial_number: '',
    hostname: '',
    user_id: null,
    work_location: effectiveUserLocation,
    location: '',
    asset_state: 'use',
    installed_apps: 'MS Office 365, Cisco AnyConnect, CrowdStrike Falcon',
  });

  const handleDownloadTemplate = () => {
    try {
      downloadAssetTemplate();
      notifySuccess('Template Excel resmi DSLNG berhasil diunduh.');
    } catch (e) {
      notifyError('Gagal mengunduh template Excel.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessExcelUpload = async () => {
    if (!selectedFile) {
      notifyError('Silakan pilih file Excel terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    const result = await parseAssetExcel(selectedFile, assets, users);
    setIsUploading(false);

    if (result.success && result.data) {
      const formattedAssets: Asset[] = result.data.map((item, idx) => ({
        id: Date.now() + idx,
        product_name: item.product_name || 'Generic IT Device',
        type_name: item.type_name || 'Laptop',
        serial_number: item.serial_number || `SN-${Date.now()}-${idx}`,
        hostname: item.hostname || `DSLNG-HOST-${idx}`,
        user_id: item.user_id || null,
        user_name: item.user_name || 'Unassigned',
        work_location: item.work_location || 'Site Luwuk',
        location: item.location || 'Main Building',
        asset_state: item.asset_state || (item.user_id ? 'use' : 'store'),
        installed_apps: item.installed_apps || ['Standard Software'],
        created_at: new Date().toISOString(),
      }));

      addBatchFn(formattedAssets);
      notifySuccess(result.message);
      setShowUploadModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      notifyError(result.message);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setFormData({
      product_name: '',
      type_name: 'Laptop',
      serial_number: '',
      hostname: `DSLNG-LAP-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: null,
      work_location: effectiveUserLocation,
      location: effectiveUserLocation === 'Site Luwuk' ? 'Admin Building Site Batui' : 'Sentral Senayan II Lt. 8',
      asset_state: 'use',
      installed_apps: 'MS Office 365, Cisco AnyConnect, CrowdStrike Falcon, SAP GUI',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      product_name: asset.product_name,
      type_name: asset.type_name,
      serial_number: asset.serial_number,
      hostname: asset.hostname,
      user_id: asset.user_id,
      work_location: asset.work_location,
      location: asset.location,
      asset_state: asset.asset_state || 'use',
      installed_apps: asset.installed_apps.join(', '),
    });
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_name.trim() || !formData.serial_number.trim()) {
      notifyError('Mohon isi Product Name dan Serial Number.');
      return;
    }

    // Check duplicate serial number if new or changed
    const upperSN = formData.serial_number.trim().toUpperCase();
    const isDuplicate = assets.some(
      a => a.serial_number.trim().toUpperCase() === upperSN && (!editingAsset || a.id !== editingAsset.id)
    );

    if (isDuplicate) {
      notifyError(`Gagal: Serial Number ${upperSN} sudah terdaftar pada database aset.`);
      return;
    }

    const assignedUser = users.find(u => u.id === Number(formData.user_id));
    const appsArray = formData.installed_apps
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingAsset) {
      const updated: Asset = {
        ...editingAsset,
        product_name: formData.product_name,
        type_name: formData.type_name,
        serial_number: formData.serial_number.trim(),
        hostname: formData.hostname.trim(),
        user_id: formData.user_id ? Number(formData.user_id) : null,
        user_name: assignedUser ? assignedUser.name : 'Unassigned',
        work_location: formData.work_location,
        location: formData.location,
        asset_state: formData.asset_state,
        installed_apps: appsArray,
      };
      onUpdateAsset(updated);
      notifySuccess('Data asset berhasil diperbarui.');
    } else {
      const newAsset: Asset = {
        id: Date.now(),
        product_name: formData.product_name,
        type_name: formData.type_name,
        serial_number: formData.serial_number.trim(),
        hostname: formData.hostname.trim(),
        user_id: formData.user_id ? Number(formData.user_id) : null,
        user_name: assignedUser ? assignedUser.name : 'Unassigned',
        work_location: formData.work_location,
        location: formData.location,
        asset_state: formData.asset_state,
        installed_apps: appsArray,
        created_at: new Date().toISOString(),
      };
      onAddAsset(newAsset);
      notifySuccess('Asset baru berhasil ditambahkan.');
    }

    setShowAddModal(false);
  };

  const handleDelete = async (asset: Asset) => {
    const ok = await notifyConfirm(
      'Hapus Data Asset?',
      `Yakin ingin menghapus asset ${asset.product_name} (${asset.serial_number})? Tindakan ini tidak dapat dibatalkan.`
    );
    if (ok) {
      onDeleteAsset(asset.id);
      notifySuccess('Data asset telah dihapus.');
    }
  };

  // Filtered list
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.user_name && asset.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = filterLocation === 'all' || asset.work_location === filterLocation;
    const matchesType = filterType === 'all' || asset.type_name === filterType;
    const matchesState = filterState === 'all' || (asset.asset_state || 'use') === filterState;

    return matchesSearch && matchesLocation && matchesType && matchesState;
  });

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-[#00A3E0]" />;
      case 'Desktop':
        return <HardDrive className="w-4 h-4 text-purple-600" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-emerald-600" />;
    }
  };

  const renderStateBadge = (state?: AssetState) => {
    const st = state || 'use';
    switch (st) {
      case 'use':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>In Use (Aktif)</span>
          </span>
        );
      case 'store':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-[#004380] border border-sky-200">
            <Package className="w-3 h-3 text-[#00A3E0]" />
            <span>Store (Gudang)</span>
          </span>
        );
      case 'lend':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Lend (Dipinjam)</span>
          </span>
        );
      case 'services':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
            <Wrench className="w-3 h-3 text-purple-600" />
            <span>Services (Servis)</span>
          </span>
        );
      case 'broken':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            <span>Broken (Afkir)</span>
          </span>
        );
    }
  };

  const stats = {
    total: assets.length,
    inUse: assets.filter(a => (a.asset_state || 'use') === 'use').length,
    inStore: assets.filter(a => a.asset_state === 'store').length,
    inLend: assets.filter(a => a.asset_state === 'lend').length,
    inServices: assets.filter(a => a.asset_state === 'services').length,
    broken: assets.filter(a => a.asset_state === 'broken').length,
    laptops: assets.filter(a => a.type_name === 'Laptop').length,
    desktops: assets.filter(a => a.type_name === 'Desktop').length,
    monitors: assets.filter(a => a.type_name === 'Monitor').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#004380] uppercase tracking-wider">
            <Server className="w-4 h-4 text-[#00A3E0]" />
            <span>Manajemen Aset ICT</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            Data Asset
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data perangkat keras (Laptop, Desktop, Monitor), hostname, user penanggung jawab, status kondisi (Asset State), dan sebaran lokasi kilang DSLNG.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            title="Download Template Format .xlsx"
          >
            <DownloadCloud className="w-4 h-4 text-slate-500" />
            <span>Download Template</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#004380] border border-sky-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00A3E0]" />
            <span>Bulk Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={() => exportAssetsToExcel(filteredAssets)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            title="Export Daftar Aset ke Excel"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-600" />
            <span>Export XLS</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Asset Manual</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip with Asset State Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500">Total Asset</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Use (Aktif)
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{stats.inUse}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-[#00A3E0]" /> In Store (Gudang)
          </div>
          <div className="text-xl font-bold text-[#004380] mt-0.5">{stats.inStore}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Lend (Dipinjam)
          </div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{stats.inLend}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-purple-600" /> Services (Servis)
          </div>
          <div className="text-xl font-bold text-purple-700 mt-0.5">{stats.inServices}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Broken (Afkir)
          </div>
          <div className="text-xl font-bold text-rose-700 mt-0.5">{stats.broken}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Product, Serial Number, Hostname, User..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#004380] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>State:</span>
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#004380] outline-none"
          >
            <option value="all">Semua Asset State</option>
            <option value="use">In Use (Aktif)</option>
            <option value="store">Store (Gudang)</option>
            <option value="lend">Lend (Dipinjam)</option>
            <option value="services">Services (Servis)</option>
            <option value="broken">Broken (Afkir)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Lokasi:</span>
          </div>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
          >
            <option value="all">Semua Lokasi</option>
            <option value="Site Luwuk">Site Luwuk (Plant)</option>
            <option value="HO Jakarta">HO Jakarta (Senayan)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Tipe:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
          >
            <option value="all">Semua Tipe</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Monitor">Monitor</option>
          </select>
        </div>
      </div>

      {/* Asset Table with Asset State Column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tipe & Perangkat</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Hostname</th>
                <th className="py-3 px-4">Asset State</th>
                <th className="py-3 px-4">User Penanggung Jawab</th>
                <th className="py-3 px-4">Lokasi Kerja & Ruangan</th>
                <th className="py-3 px-4">Aplikasi Terinstal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data asset yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-sky-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                          {getTypeIcon(asset.type_name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{asset.product_name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{asset.type_name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#004380] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {asset.serial_number}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 font-semibold">{asset.hostname}</span>
                    </td>

                    <td className="py-3 px-4">
                      {renderStateBadge(asset.asset_state)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{asset.user_name || 'Unassigned'}</div>
                      <div className="text-[10px] text-slate-400">
                        {asset.user_id ? users.find(u => u.id === asset.user_id)?.email : 'Belum ditugaskan'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" />
                        <span>{asset.work_location}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-5">{asset.location}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      {asset.installed_apps && asset.installed_apps.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {asset.installed_apps.slice(0, 3).map((app, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {app}
                            </span>
                          ))}
                          {asset.installed_apps.length > 3 && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded">
                              +{asset.installed_apps.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(asset)}
                          className="p-1.5 text-slate-500 hover:text-[#004380] hover:bg-sky-50 rounded-lg transition"
                          title="Edit Data Asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(asset)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BULK UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-base font-bold text-slate-900">Bulk Upload Data Asset (.xlsx)</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Gunakan template resmi PT DSLNG untuk mengimpor batch aset secara massal ke database, termasuk kolom kondisi <strong>Asset State (store/use/lend/broken/services)</strong>.
              </p>

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-[#00A3E0] bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
                    <div className="text-xs font-bold text-slate-900">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Klik untuk ganti file
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                    <div className="text-xs font-bold text-slate-800">Klik untuk memilih file Excel</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Mendukung format .xlsx resmi template DSLNG</div>
                  </div>
                )}
              </div>

              {/* Quick instructions & template download */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600">Belum punya format kolom resmi?</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="font-bold text-[#004380] hover:underline flex items-center gap-1"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Unduh Template .xlsx</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleProcessExcelUpload}
                className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] disabled:bg-slate-400 rounded-lg shadow-sm transition flex items-center gap-2"
              >
                {isUploading ? <span>Memproses File...</span> : <span>Proses Import Data</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingAsset ? 'Edit Data Asset' : 'Tambah Asset Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Name / Model
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="Contoh: ThinkPad X1 Carbon Gen 11"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type Name
                  </label>
                  <select
                    value={formData.type_name}
                    onChange={(e) => setFormData({ ...formData, type_name: e.target.value as AssetType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#004380] outline-none"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Serial Number (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="SN-DSLNG-2026-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hostname
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    placeholder="SITE-OPS-WS01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Asset State (Status Kondisi)
                  </label>
                  <select
                    value={formData.asset_state}
                    onChange={(e) => setFormData({ ...formData, asset_state: e.target.value as AssetState })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-[#004380] focus:ring-2 focus:ring-[#004380] outline-none"
                  >
                    <option value="use">In Use (Sedang Digunakan / Aktif)</option>
                    <option value="store">Store (Gudang / Penyimpanan)</option>
                    <option value="lend">Lend (Dipinjam Sementara)</option>
                    <option value="services">Services (Dalam Perbaikan / Servis)</option>
                    <option value="broken">Broken (Rusak / Afkir)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    User Penanggung Jawab
                  </label>
                  <select
                    value={formData.user_id || ''}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  >
                    <option value="">-- Belum Ditugaskan (Unassigned) --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department} - {u.work_location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lokasi Kerja
                  </label>
                  <select
                    value={formData.work_location}
                    onChange={(e) => setFormData({ ...formData, work_location: e.target.value as WorkLocation })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  >
                    <option value="Site Luwuk">Site Luwuk (Plant)</option>
                    <option value="HO Jakarta">HO Jakarta (Sentral Senayan II)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detail Ruangan / Area Kilang
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: CCR Control Console 3 / Sentral Senayan II Lt. 8 Room 802"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Aplikasi Terinstal (Pisahkan dengan koma)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.installed_apps}
                    onChange={(e) => setFormData({ ...formData, installed_apps: e.target.value })}
                    placeholder="SAP GUI, Cisco AnyConnect, MS Office 365, PI Vision"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition"
                >
                  {editingAsset ? 'Simpan Perubahan' : 'Tambahkan Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
