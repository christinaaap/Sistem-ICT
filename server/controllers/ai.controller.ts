import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export const diagnoseTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, description, category, workLocation } = req.body;

    const ai = getAiClient();
    if (!ai) {
      res.json({
        diagnosis: `[Saran Diagnostik Standar DSLNG ICT]\nKategori: ${category || 'Umum'} di ${workLocation || 'Site Luwuk'}\n1. Verifikasi konektivitas jaringan kilang (LAN/VPN).\n2. Periksa status update software/driver terkait.\n3. Hubungi Helpdesk ICT di ekstensi x4420 untuk eskalasi on-site.`,
        isAiPowered: false,
      });
      return;
    }

    const prompt = `Anda adalah asisten AI Helpdesk ICT PT Donggi-Senoro LNG (DSLNG).
Berikan analisis teknis singkat, rekomendasi troubleshooting cepat, dan estimasi waktu penanganan untuk tiket berikut:
- Subjek: ${subject}
- Deskripsi: ${description}
- Kategori: ${category}
- Lokasi Kerja: ${workLocation}

Format jawaban dengan poin-poin jelas dan profesional dalam Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({
      diagnosis: response.text || 'Tidak ada analisis yang dihasilkan.',
      isAiPowered: true,
    });
  } catch (error) {
    res.json({
      diagnosis: 'Verifikasi perangkat keras/jaringan lokal kilang dan pastikan kredensial DSLNG aktif.',
      isAiPowered: false,
      error: 'AI service temporarily unavailable',
    });
  }
};
