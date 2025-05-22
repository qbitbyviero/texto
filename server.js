import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import FormData from 'form-data';
import cors from 'cors'; // ✅ IMPORTANTE

dotenv.config();

const app = express();
const upload = multer();

// ✅ Habilita CORS para todas las rutas
app.use(cors());

app.post('/transcribe', upload.single('file'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);
    form.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    const data = await response.json();

    // Validación de respuesta
    if (response.ok && data.text) {
      res.json({ text: data.text });
    } else {
      res.status(500).send(data.error?.message || 'Error desconocido al transcribir');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/', (req, res) => res.send('✅ Transcriptor backend activo'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
