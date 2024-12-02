const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadImg = async (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (!result || !result.secure_url) {
          reject(new Error("Invalid response from Cloudinary"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
};

module.exports = cloudinaryUploadImg;
