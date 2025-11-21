const axios = require("axios");
const FormData = require("form-data");

exports.uploadToImgBB = async (fileBuffer, fileName) => {
  try {
    const form = new FormData();
    form.append("key", process.env.IMGBB_API_KEY);
    form.append("image", fileBuffer.toString("base64"));
    form.append("name", fileName);

    const response = await axios.post("https://api.imgbb.com/1/upload", form, {
      headers: form.getHeaders(),
    });

    // ⭐ Return actual public URL
    return response.data.data.display_url;

  } catch (err) {
    console.log("ImgBB Error:", err.response?.data || err);
    throw new Error("ImgBB upload failed");
  }
};
