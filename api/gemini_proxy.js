import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { birth_year } = req.body;
        const birthYear = parseInt(birth_year, 10);
        const currentYear = new Date().getFullYear();
        const allFacts = [];
        
        for (let year = birthYear; year <= currentYear; year++) {
            const prompt = `Berikan 3 fakta unik yang terjadi di tahun ${year} di Indonesia dan dunia. Fokus pada kategori: ${year === birthYear ? 'Peristiwa Hari Kelahiran,' : ''} Politik, Budaya Pop, Teknologi, atau Olahraga. Sajikan dalam format JSON. Contoh format JSON: {"year": "2024", "facts": [{"title": "Judul Fakta", "description": "Deskripsi fakta unik yang terjadi pada tahun 2024."}]}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResult = response.text();
            
            const jsonString = textResult.replace(/```json\n|```/g, '').trim();

            try {
                const parsedData = JSON.parse(jsonString);
                allFacts.push(parsedData);
            } catch (parseError) {
                console.error(`Error parsing JSON for year ${year}:`, parseError, jsonString);
                allFacts.push({
                    year: year,
                    facts: [{ title: "Fakta Tidak Ditemukan", description: "Terjadi kesalahan saat memproses data." }]
                });
            }
        }

        res.status(200).json({ facts: allFacts });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data dari Gemini API.' });
    }
}
