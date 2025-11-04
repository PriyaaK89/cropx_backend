const axios = require('axios');

exports.uploadToImgBB = async (base64Image, name) => {
  try {
    const params = new URLSearchParams();
    params.append('key', process.env.IMGBB_API_KEY);
    params.append('image', base64Image);
    if (name) params.append('name', name);

    const response = await axios.post('https://api.imgbb.com/1/upload', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.data.url;
  } catch (err) {
    console.error('ImgBB error:', err.response?.data || err.message);
    throw new Error('ImgBB upload failed');
  }
};