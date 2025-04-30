const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/segment', upload.single('image'), async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Archivo no es una imagen válida.' });
  }

  const imagePath = req.file.path;
  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath));

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/mask2former-swin-base-coco',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: '',
        },
      }
    );

    fs.unlinkSync(imagePath);
    res.json(response.data);
  } catch (error) {
    console.error("Error al llamar a Hugging Face:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`); 
});