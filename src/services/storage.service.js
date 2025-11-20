const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(file, fileName) {
  try {
    const result = await imagekit.upload({
      file: file, // Buffer or base64 string
      fileName: fileName,
    });
    return result;
  } catch (error) {
    throw new Error("Error uploading file to ImageKit: " + error.message);
  }
}

module.exports = { uploadFile };
