const imageInput = document.getElementById('imageInput');
const colorPicker = document.getElementById('colorPicker');
const segmentBtn = document.getElementById('segmentBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let imageFile = null;

imageInput.addEventListener('change', (e) => {
  imageFile = e.target.files[0];
});

segmentBtn.addEventListener('click', async () => {
  if (!imageFile) return alert("Debes subir una imagen.");

  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch('http://localhost:5000/segment', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!data || !data[0] || !data[0].mask) {
    return alert("No se pudo detectar la pared.");
  }

  const maskUrl = data[0].mask;
  const maskImg = new Image();
  const originalImg = new Image();

  originalImg.src = URL.createObjectURL(imageFile);
  maskImg.src = maskUrl;

  originalImg.onload = () => {
    canvas.width = originalImg.width;
    canvas.height = originalImg.height;
    ctx.drawImage(originalImg, 0, 0);

    maskImg.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalImg.width;
      tempCanvas.height = originalImg.height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(maskImg, 0, 0, originalImg.width, originalImg.height);

      const maskData = tempCtx.getImageData(0, 0, originalImg.width, originalImg.height);
      const imgData = ctx.getImageData(0, 0, originalImg.width, originalImg.height);
      const color = hexToRGB(colorPicker.value);

      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 100) {
          imgData.data[i] = color.r;
          imgData.data[i + 1] = color.g;
          imgData.data[i + 2] = color.b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  };
});

function hexToRGB(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}