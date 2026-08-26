import React from 'react';
import { UserPreferences } from '../../types';
import { Sliders, Type, Layout, Eye, Sparkles, Check, X, Shield, Clock } from 'lucide-react';
import { notifySuccess } from '../../utils/notifications';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: UserPreferences) => void;
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    notifySuccess('Preferensi tampilan dan tipografi formal berhasil disimpan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#004380] text-white rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Personalisasi Tampilan & Font
              </h2>
              <p className="text-xs text-slate-500">
                Kustomisasi tata letak, warna aksen, dan kenyamanan visual portal DSLNG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Font & Typography Presets */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Type className="w-4 h-4 text-[#00A3E0]" />
              <span>Gaya Tipografi Korporat (Formal Font)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border-2 border-[#004380] bg-sky-50/40 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#004380]">Plus Jakarta Sans (Formal)</span>
                  <Check className="w-4 h-4 text-[#004380]" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  Standar formal industri energi & gas alam cair dengan keterbacaan tinggi.
                </p>
              </div>

              <div className="p-3 border border-slate-200 bg-slate-50 rounded-xl opacity-90">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-700">Space Grotesk Modern</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                  Digunakan khusus untuk nomor tiket, serial tag, dan label kode kilang.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Layout Density */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Layout className="w-4 h-4 text-[#00A3E0]" />
              <span>Kerapatan Tata Letak (Density)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, themeDensity: 'comfortable' })}
                className={`p-3 text-left rounded-xl border transition ${
                  preferences.themeDensity === 'comfortable'
                    ? 'border-[#004380] bg-sky-50/50 ring-1 ring-[#004380]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-800 mb-0.5">Comfortable (Standar)</div>
                <div className="text-[11px] text-slate-500">Spasi proporsional untuk kemudahan navigasi harian.</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, themeDensity: 'compact' })}
                className={`p-3 text-left rounded-xl border transition ${
                  preferences.themeDensity === 'compact'
                    ? 'border-[#004380] bg-sky-50/50 ring-1 ring-[#004380]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-800 mb-0.5">Compact (Dense Data)</div>
                <div className="text-[11px] text-slate-500">Kerapatan tinggi untuk monitoring tabel aset & tiket besar.</div>
              </button>
            </div>
          </div>

          {/* Section 3: Accent Color Theme */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-[#00A3E0]" />
              <span>Tema Warna Brand PT DSLNG</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, accentTheme: 'dslng_blue' })}
                className={`p-2.5 text-center rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  preferences.accentTheme === 'dslng_blue'
                    ? 'border-[#004380] bg-sky-50 ring-2 ring-[#004380]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#004380] shadow-xs"></div>
                <span className="text-[11px] font-bold text-slate-800">DSLNG Navy</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, accentTheme: 'energy_cyan' })}
                className={`p-2.5 text-center rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  preferences.accentTheme === 'energy_cyan'
                    ? 'border-[#00A3E0] bg-sky-50 ring-2 ring-[#00A3E0]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#00A3E0] shadow-xs"></div>
                <span className="text-[11px] font-bold text-slate-800">Energy Azure</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, accentTheme: 'slate_corporate' })}
                className={`p-2.5 text-center rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  preferences.accentTheme === 'slate_corporate'
                    ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-800 shadow-xs"></div>
                <span className="text-[11px] font-bold text-slate-800">Industrial Slate</span>
              </button>
            </div>
          </div>

          {/* Section 4: Operational Settings */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Tampilkan Jam Operasi Dual-Zone</div>
                  <div className="text-[11px] text-slate-500">Site Luwuk (WITA) dan Head Office Jakarta (WIB)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.clockFormat === 'both'}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    clockFormat: e.target.checked ? 'both' : 'local',
                  })
                }
                className="w-4 h-4 accent-[#004380] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Mode Kontras Tinggi (CCR Room)</div>
                  <div className="text-[11px] text-slate-500">Meningkatkan ketegasan garis tepi dan border</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.highContrast}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    highContrast: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-[#004380] rounded cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-[#004380] hover:bg-[#003366] rounded-lg shadow-sm transition"
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
};
