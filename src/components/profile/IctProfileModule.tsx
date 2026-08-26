import React, { useState, useRef } from 'react';
import { IctDocument, DocumentCategory, User } from '../../types';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { DslngLogo } from '../common/DslngLogo';
import {
  BookOpen,
  FileText,
  UploadCloud,
  DownloadCloud,
  Shield,
  Building,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Award,
  Compass,
  MapPin,
  FileCode,
  X,
  Eye,
  Plus,
  ExternalLink,
  Navigation,
  Globe,
  Radio,
  Clock,
  Check,
} from 'lucide-react';

interface IctProfileProps {
  documents: IctDocument[];
  currentUser: User;
  onAddDocument: (doc: IctDocument) => void;
}

export const IctProfileModule: React.FC<IctProfileProps> = ({
  documents,
  currentUser,
  onAddDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'maps' | 'policy' | 'wi'>('about');
  const [selectedMapLocation, setSelectedMapLocation] = useState<'Site Luwuk' | 'HO Jakarta'>('Site Luwuk');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<IctDocument | null>(null);

  // Exact coordinates and location details
  const DSLNG_LOCATIONS = {
    'Site Luwuk': {
      title: 'Site Luwuk',
      coordinates: '-1.2511205, 122.5878024',
      lat: -1.2511205,
      lng: 122.5878024,
      address: 'Uso, Kec.Batui, Kab.Banggai, Kota Luwuk, Sulawesi Tengah, 94716',
      areaType: 'LNG Liquefaction Plant, Process Area, Storage Tank & Marine Jetty Terminal',
      telp: '+62 (461) 312 8000',
      description: 'Fasilitas kilang pencairan gas alam cair (LNG) terpadu dengan pelabuhan khusus Donggi Port dan Pusat Kendali Operasi CCR.',
      googleMapsUrl: 'https://www.google.com/maps/place/PT+Donggi-Senoro+LNG/@-1.2513726,122.5895453,18z/data=!4m14!1m7!3m6!1s0x2d84391d7dde6b6d:0x7b214be0405e5c3d!2sDonggi+Port!8m2!3d-1.2518151!4d122.5939012!16s%2Fg%2F11d_8ly9b1!3m5!1s0x2d84301aaaaaaaab:0x7e624f16daa4f84a!8m2!3d-1.2511205!4d122.5878024',
      features: [
        'Central Control Room (CCR) & Process Engineering',
        'VSAT Satellite Earth Station & Subsea Fiber Optic Link',
        'UHF DMR Radio Trunking & Marine Harbor Jetty Comms',
        'OT / Industrial Control System (ICS) Cybersecurity Center'
      ]
    },
    'HO Jakarta': {
      title: 'HO Jakarta',
      coordinates: '-6.225916, 106.799722',
      lat: -6.225916,
      lng: 106.799722,
      address: 'Sentral Senayan II,8th Floor, Gelora, Tanah Abang, Jakarta 10270',
      areaType: 'Corporate Head Office & Enterprise ICT Data Center',
      telp: '+62 (21) 5795 4000',
      description: 'Pusat administrasi korporat, arsitektur enterprise ICT, hybrid data center, dan tata kelola bisnis terpadu PT Donggi-Senoro LNG.',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sentral+Senayan+II+Jl+Asia+Afrika+No+8+Jakarta',
      features: [
        'Corporate Executive Boardroom & IT Operations Center',
        'Hybrid Multi-Cloud Data Center & Disaster Recovery Hub',
        'Enterprise Identity, Access Management & SAP S/4HANA',
        'Secure Remote VPN & Global Partner Interconnect'
      ]
    }
  };

  // Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Work Instruction');
  const [docCode, setDocCode] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isSizeOk = file.size <= 10 * 1024 * 1024; // 10MB max

      if (!isPdf || !isSizeOk) {
        notifyError('Upload dokumen gagal: Ukuran file terlalu besar atau format bukan PDF.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedPdfFile(null);
        return;
      }
      setSelectedPdfFile(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!docTitle.trim() || !selectedPdfFile) {
      notifyError('Mohon lengkapi judul dokumen dan lampirkan file PDF.');
      return;
    }

    const generatedCode = docCode.trim() || `DSLNG-${docCategory === 'Policy' ? 'POL' : 'WI'}-ICT-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc: IctDocument = {
      id: Date.now(),
      doc_code: generatedCode,
      title: docTitle.trim(),
      category: docCategory,
      file_path: `/docs/${generatedCode}.pdf`,
      uploaded_by: currentUser.id,
      uploaded_by_name: currentUser.name,
      size_kb: Math.round(selectedPdfFile.size / 1024),
      version: 'Rev. 1.0',
      description: docDescription.trim() || 'Dokumen pedoman operasional Departemen ICT PT Donggi-Senoro LNG.',
      created_at: new Date().toISOString(),
    };

    onAddDocument(newDoc);
    const successMsg =
      docCategory === 'Work Instruction'
        ? 'Dokumen Work Instruction baru berhasil di-upload.'
        : 'Dokumen Policy baru berhasil di-upload.';
    notifySuccess(successMsg);

    setShowUploadModal(false);
    setDocTitle('');
    setDocCode('');
    setDocDescription('');
    setSelectedPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'policy') return doc.category === 'Policy';
    if (activeTab === 'wi') return doc.category === 'Work Instruction';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Module Title Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#004380] uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#00A3E0]" />
            <span>Profil Departemen ICT & Kebijakan Korporat</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            ICT Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur organisasi, standar keamanan informasi kilang LNG, dan repositori dokumen resmi Departemen ICT PT DSLNG.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Dokumen PDF Baru</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold max-w-2xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-2 px-3 whitespace-nowrap rounded-xl transition ${
            activeTab === 'about'
              ? 'bg-[#004380] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          About & Lokasi Kantor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('maps')}
          className={`flex-1 py-2 px-3 whitespace-nowrap rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'maps'
              ? 'bg-[#004380] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Peta Lokasi DSLNG</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('policy')}
          className={`flex-1 py-2 px-3 whitespace-nowrap rounded-xl transition ${
            activeTab === 'policy'
              ? 'bg-[#004380] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Policy Kebijakan ({documents.filter(d => d.category === 'Policy').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wi')}
          className={`flex-1 py-2 px-3 whitespace-nowrap rounded-xl transition ${
            activeTab === 'wi'
              ? 'bg-[#004380] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Work Instruction ({documents.filter(d => d.category === 'Work Instruction').length})
        </button>
      </div>

      {/* PETA LOKASI & GEOLOCATION DSLNG TAB */}
      {activeTab === 'maps' && (
        <div className="space-y-6">
          
          {/* Top Banner / Location Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#004380] uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-[#00A3E0]" />
                  <span>Geographic Information System & Peta Lokasi</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  Titik Koordinat Resmi PT Donggi-Senoro LNG
                </h2>
                <p className="text-xs text-slate-500">
                  Data spasial dan koordinat GPS akurat untuk verifikasi operasional kilang dan sistem presensi helpdesk.
                </p>
              </div>

              {/* Location Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedMapLocation('Site Luwuk')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    selectedMapLocation === 'Site Luwuk'
                      ? 'bg-[#004380] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00A3E0]" />
                  <span>Site Luwuk (Plant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMapLocation('HO Jakarta')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    selectedMapLocation === 'HO Jakarta'
                      ? 'bg-[#004380] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-purple-600" />
                  <span>HO Jakarta (Senayan)</span>
                </button>
              </div>
            </div>

            {/* Selected Location Highlight Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100">
              
              {/* Info Details */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-[#004380] border border-sky-200">
                      {selectedMapLocation === 'Site Luwuk' ? 'Kilang LNG & Pelabuhan Khusus' : 'Kantor Pusat Enterprise'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Terverifikasi GPS
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {DSLNG_LOCATIONS[selectedMapLocation].title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {DSLNG_LOCATIONS[selectedMapLocation].description}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#00A3E0] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Alamat Lengkap:</span>
                      <span className="text-slate-600">{DSLNG_LOCATIONS[selectedMapLocation].address}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                    <Compass className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Koordinat Latitude, Longitude:</span>
                      <code className="text-xs font-mono font-bold text-[#004380] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {DSLNG_LOCATIONS[selectedMapLocation].coordinates}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                    <Radio className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 block">Telepon & Helpdesk Hotline:</span>
                      <span className="text-slate-600 font-mono">{DSLNG_LOCATIONS[selectedMapLocation].telp}</span>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Highlights */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Infrastruktur ICT & Fasilitas Terkoneksi:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {DSLNG_LOCATIONS[selectedMapLocation].features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={DSLNG_LOCATIONS[selectedMapLocation].googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-xs transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka di Google Maps Langsung</span>
                  </a>
                  
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(DSLNG_LOCATIONS[selectedMapLocation].coordinates);
                      notifySuccess(`Koordinat ${selectedMapLocation} berhasil disalin!`);
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition border border-slate-200"
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Koordinat GPS</span>
                  </button>
                </div>
              </div>

              {/* Visual Map / Geographic Display */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm min-h-[320px] flex flex-col items-center justify-center p-6 text-white text-center">
                  
                  {/* Decorative map visual grid */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>

                  <div className="relative z-10 max-w-sm space-y-3">
                    <div className="w-12 h-12 bg-[#00A3E0]/20 rounded-full flex items-center justify-center mx-auto border border-[#00A3E0]/40 text-[#00A3E0] shadow-lg animate-pulse">
                      <MapPin className="w-6 h-6" />
                    </div>

                    <h4 className="text-sm font-extrabold text-white">
                      {selectedMapLocation === 'Site Luwuk' ? 'Donggi-Senoro LNG Plant & Donggi Port' : 'Sentral Senayan II Jakarta Office'}
                    </h4>

                    <p className="text-[11px] text-slate-300">
                      {selectedMapLocation === 'Site Luwuk'
                        ? 'Koordinat akurat: -1.2511205, 122.5878024 (Kawasan Kilang Batui & Marine Terminal)'
                        : 'Koordinat akurat: -6.225916, 106.799722 (Sentral Senayan II Lt. 8 Gelora)'}
                    </p>

                    <div className="pt-2">
                      <a
                        href={DSLNG_LOCATIONS[selectedMapLocation].googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A3E0] hover:bg-[#0284C7] text-white text-xs font-bold rounded-xl transition shadow-md"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Lihat Lokasi & Petunjuk Arah</span>
                      </a>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2 z-10">
                    <span>Geofence radius: 250 Meter</span>
                    <span className="font-mono">{DSLNG_LOCATIONS[selectedMapLocation].coordinates}</span>
                  </div>
                </div>

                {/* Both Locations Quick Overview cards */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div
                    onClick={() => setSelectedMapLocation('Site Luwuk')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedMapLocation === 'Site Luwuk'
                        ? 'bg-sky-50 border-[#004380] ring-2 ring-[#004380]/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#004380]">SITE BATUI, SULTENG</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">Kilang LNG Luwuk</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">-1.2511205, 122.5878024</div>
                  </div>

                  <div
                    onClick={() => setSelectedMapLocation('HO Jakarta')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      selectedMapLocation === 'HO Jakarta'
                        ? 'bg-purple-50 border-purple-800 ring-2 ring-purple-800/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-purple-800">HO SENAYAN, JAKARTA</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">Sentral Senayan II Lt. 8</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">-6.225916, 106.799722</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Dual Locations Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Site Luwuk Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#00A3E0]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Site Luwuk</h3>
                    <p className="text-[11px] text-slate-500">Uso, Kec.Batui, Kab.Banggai, Kota Luwuk, Sulawesi Tengah, 94716</p>
                  </div>
                </div>
                <a
                  href={DSLNG_LOCATIONS['Site Luwuk'].googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#004380] hover:text-[#00A3E0] flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Maps</span>
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-[#004380]">Fasilitas Utama Kilang:</div>
                  <div className="text-slate-700 mt-1">Single-Train LNG Liquefaction Plant, 2 LNG Storage Tanks (100,000 m³), Donggi Port Jetty, Power Plant 3x11MW, Central Control Room.</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Koordinat Presensi Helpdesk:</span>
                  <span className="font-mono font-bold text-slate-900">-1.2511205, 122.5878024</span>
                </div>
              </div>
            </div>

            {/* HO Jakarta Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">HO Jakarta</h3>
                    <p className="text-[11px] text-slate-500">Sentral Senayan II,8th Floor, Gelora, Tanah Abang, Jakarta 10270</p>
                  </div>
                </div>
                <a
                  href={DSLNG_LOCATIONS['HO Jakarta'].googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-purple-800 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Google Maps</span>
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-purple-800">Fasilitas Utama Kantor Pusat:</div>
                  <div className="text-slate-700 mt-1">Executive Boardroom, Data Center Server Room, Enterprise ICT Helpdesk Hub, Cyber Security Monitoring Room, Treasury & Corporate Affairs.</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Koordinat Presensi Helpdesk:</span>
                  <span className="font-mono font-bold text-slate-900">-6.225916, 106.799722</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ABOUT US & ORGANIZATIONAL STRUCTURE TAB */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          
          {/* Vision & Mission Card */}
          <div className="bg-gradient-to-br from-[#0A2540] via-[#004380] to-[#002D57] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A3E0]/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00A3E0] uppercase tracking-widest">
                <Shield className="w-4 h-4" />
                <span>ICT Mandate & Core Strategy</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Mendukung Keandalan Operasi Kilang LNG Kelas Dunia Melalui Infrastruktur Digital Tangguh
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                Departemen ICT PT Donggi-Senoro LNG bertindak sebagai pilar utama transformasi digital, pengamanan aset siber kilang, dan penyedia konektivitas telekomunikasi tanpa henti (99.99% availability) yang menghubungkan Plant Site di Batui, Kabupaten Banggai, dengan Head Office Jakarta dan mitra global.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/15">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-[#00A3E0]">99.98%</div>
                  <div className="text-[11px] text-slate-300 font-medium">Plant Network Availability</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-emerald-400">&lt; 15 Mins</div>
                  <div className="text-[11px] text-slate-300 font-medium">Mean Response Time SLA</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-amber-400">Zero Trust</div>
                  <div className="text-[11px] text-slate-300 font-medium">ICS & DCS Cybersecurity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Offices Detailed Maps: Site Luwuk & HO Jakarta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Site Luwuk Card with Detail Maps */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 text-[#004380]">
                    <MapPin className="w-5 h-5 text-[#00A3E0]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Site Luwuk</h3>
                    <p className="text-xs font-medium text-slate-600">Kilang LNG & Pelabuhan Khusus Donggi Port</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  GPS Valid
                </span>
              </div>

              {/* Address details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-700">Alamat Resmi:</div>
                <div className="text-slate-800 font-medium leading-relaxed">
                  Uso, Kec.Batui, Kab.Banggai, Kota Luwuk, Sulawesi Tengah, 94716
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Koordinat GPS:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-[#004380]">
                    -1.2511205, 122.5878024
                  </code>
                </div>
              </div>

              {/* Detail Maps Preview Visual */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-4 text-white min-h-[160px] flex flex-col justify-between">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#00A3E0_1px,transparent_1px)] [background-size:12px_12px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs text-sky-200">
                    SATELLITE RADAR VIEW
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Batui Plant Online
                  </span>
                </div>

                <div className="relative z-10 my-2 text-center">
                  <div className="w-9 h-9 bg-[#00A3E0]/20 rounded-full flex items-center justify-center mx-auto border border-[#00A3E0]/50 text-[#00A3E0] shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-extrabold text-white mt-1">PT Donggi-Senoro LNG Plant</div>
                  <div className="text-[10px] text-slate-300">Desa Uso, Batui & Marine Jetty Donggi Port</div>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <a
                    href="https://www.google.com/maps/place/PT+Donggi-Senoro+LNG/@-1.2513726,122.5895453,18z/data=!4m14!1m7!3m6!1s0x2d84391d7dde6b6d:0x7b214be0405e5c3d!2sDonggi+Port!8m2!3d-1.2518151!4d122.5939012!16s%2Fg%2F11d_8ly9b1!3m5!1s0x2d84301aaaaaaaab:0x7e624f16daa4f84a!8m2!3d-1.2511205!4d122.5878024"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 bg-[#004380] hover:bg-[#003366] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Buka Google Maps</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('-1.2511205, 122.5878024');
                      notifySuccess('Koordinat Site Luwuk berhasil disalin!');
                    }}
                    className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Salin GPS</span>
                  </button>
                </div>
              </div>

              {/* Key Site Facilities */}
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-700">Fasilitas Utama:</div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Single-Train LNG Plant, 2 Tangki Penyimpanan LNG (100.000 m³), Central Control Room (CCR), Workshop ICT & Dermaga Donggi Port.
                </div>
              </div>
            </div>

            {/* HO Jakarta Card with Detail Maps */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">HO Jakarta</h3>
                    <p className="text-xs font-medium text-slate-600">Kantor Pusat Korporat & Enterprise Data Center</p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2.5 py-1 rounded-md border border-purple-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  GPS Valid
                </span>
              </div>

              {/* Address details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-700">Alamat Resmi:</div>
                <div className="text-slate-800 font-medium leading-relaxed">
                  Sentral Senayan II,8th Floor, Gelora, Tanah Abang, Jakarta 10270
                </div>
                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Koordinat GPS:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-purple-800">
                    -6.225916, 106.799722
                  </code>
                </div>
              </div>

              {/* Detail Maps Preview Visual */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-4 text-white min-h-[160px] flex flex-col justify-between">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:12px_12px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded backdrop-blur-xs text-purple-200">
                    CORPORATE SENAYAN VIEW
                  </span>
                  <span className="text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    HO Jakarta Online
                  </span>
                </div>

                <div className="relative z-10 my-2 text-center">
                  <div className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/50 text-purple-300 shadow-md">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-extrabold text-white mt-1">Sentral Senayan II Lt. 8</div>
                  <div className="text-[10px] text-slate-300">Jl. Asia Afrika No.8, Gelora, Tanah Abang</div>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sentral+Senayan+II+Jl+Asia+Afrika+No+8+Jakarta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Buka Google Maps</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('-6.225916, 106.799722');
                      notifySuccess('Koordinat HO Jakarta berhasil disalin!');
                    }}
                    className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Salin GPS</span>
                  </button>
                </div>
              </div>

              {/* Key Corporate Facilities */}
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-700">Fasilitas Utama:</div>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  Executive Boardroom, Data Center Server Room, Enterprise ICT Helpdesk Hub, Cyber Security Monitoring Room, Treasury & Corporate Affairs.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* POLICY & WORK INSTRUCTION REPOSITORY LIST */}
      {(activeTab === 'policy' || activeTab === 'wi') && (
        <div className="space-y-4">
          {filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Belum ada dokumen {activeTab === 'policy' ? 'Policy (Kebijakan)' : 'Work Instruction (WI)'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Repositori dokumen dalam kondisi bersih dan siap untuk pengunggahan file PDF baru oleh Administrator.
              </p>
              {currentUser.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setDocCategory(activeTab === 'policy' ? 'Policy' : 'Work Instruction');
                    setShowUploadModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Dokumen PDF Sekarang</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-[#00A3E0] transition space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-[#004380] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {doc.doc_code}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                        {doc.version} &bull; {doc.size_kb} KB
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{doc.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Uploaded by {doc.uploaded_by_name} ({new Date(doc.created_at).toLocaleDateString('id-ID')})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(doc)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={`#download-${doc.doc_code}`}
                        onClick={(e) => {
                          e.preventDefault();
                          notifySuccess(`Mengunduh berkas resmi ${doc.doc_code}.pdf...`);
                        }}
                        className="px-3 py-1.5 bg-[#004380] hover:bg-[#003366] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-xs"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedDocPreview.doc_code}: {selectedDocPreview.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">Ringkasan Dokumen:</div>
                <p className="text-slate-600 leading-relaxed">{selectedDocPreview.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Kategori: <strong className="text-slate-800">{selectedDocPreview.category}</strong></span>
                  <span>Versi: <strong className="text-slate-800">{selectedDocPreview.version}</strong></span>
                  <span>Format: <strong className="text-red-700">PDF Document</strong></span>
                </div>
              </div>

              {/* Sample PDF Page Frame Preview */}
              <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs space-y-3 font-serif">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div className="text-[10px] font-sans font-bold text-slate-500 uppercase">PT DONGGI-SENORO LNG ICT REPOSITORY</div>
                  <div className="text-[10px] font-mono text-slate-400">{selectedDocPreview.doc_code}</div>
                </div>
                <h4 className="text-base font-bold font-sans text-slate-900">{selectedDocPreview.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Dokumen ini merupakan panduan resmi Departemen ICT PT Donggi-Senoro LNG. Segala bentuk pelanggaran terhadap ketentuan dalam dokumen ini dapat dikenakan sanksi sesuai Peraturan Perusahaan PT DSLNG dan standar hukum ketenagakerjaan yang berlaku.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  notifySuccess(`Dokumen ${selectedDocPreview.doc_code}.pdf berhasil diunduh.`);
                  setSelectedDocPreview(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Unduh File PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PDF MODAL (Admin Only) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#00A3E0]" />
                <h3 className="text-base font-bold text-slate-900">Upload Dokumen PDF Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Dokumen
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocCategory('Policy')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      docCategory === 'Policy'
                        ? 'bg-[#004380] text-white border-[#004380]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Policy (Kebijakan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocCategory('Work Instruction')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                      docCategory === 'Work Instruction'
                        ? 'bg-[#004380] text-white border-[#004380]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Work Instruction (WI)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Dokumen Resmi
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Contoh: Work Instruction Konfigurasi Port Switch Kilang"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kode Dokumen (Opsional)
                </label>
                <input
                  type="text"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  placeholder="Contoh: DSLNG-WI-ICT-088"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi / Ruang Lingkup Dokumen
                </label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Ringkasan isi dan sasaran kepatuhan dokumen..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#004380] outline-none"
                />
              </div>

              {/* PDF File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lampiran Berkas PDF (Maks. 10MB)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  required
                  onChange={handleFileSelect}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#004380] file:text-white hover:file:bg-[#003366] cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition"
                >
                  Simpan & Publikasikan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
