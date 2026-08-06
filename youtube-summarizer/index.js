require('dotenv').config();
const express = require("express");
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.send("<h1>Halo, Node.js!</h1><p><a href='/youtube'>Coba Fitur Rangkuman YouTube</a></p>");
});

app.get("/youtube", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'youtube.html'));
});

// Endpoint API Rangkuman
app.post('/api/summarize', async (req, res) => {
    try {
        const url = req.body.url;
        if (!url) {
            return res.status(400).json({ error: 'URL YouTube tidak boleh kosong' });
        }
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di file .env' });
        }

        // 1. Ambil Transcript
        let transcriptList;
        try {
            transcriptList = await YoutubeTranscript.fetchTranscript(url);
        } catch (error) {
            console.error("Error fetching transcript:", error);
            return res.status(400).json({ error: 'Gagal mengambil subtitle dari video ini. Pastikan video memiliki subtitle CC.' });
        }

        // Gabungkan seluruh teks transcript
        const fullText = transcriptList.map(t => t.text).join(' ');

        // 2. Rangkum menggunakan Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Tolong buatkan rangkuman yang komprehensif, terstruktur, dan mudah dipahami dari teks video YouTube berikut ini dalam bahasa Indonesia. Gunakan poin-poin (bullet points) untuk memudahkan pembacaan:\n\n${fullText}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error) {
        console.error('Error saat merangkum:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses rangkuman.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});