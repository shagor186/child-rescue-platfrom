
const BASE_URL = 'http://localhost:5000/api/predict';

export const predictImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${BASE_URL}/image`, { method: 'POST', body: formData });
  return res.json();
};

export const predictVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('video', file);
  const res = await fetch(`${BASE_URL}/video`, { method: 'POST', body: formData });
  return res.json();
};

export const predictWebcam = async (base64Img: string) => {
  const res = await fetch(`${BASE_URL}/webcam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Img }),
  });
  return res.json();
};