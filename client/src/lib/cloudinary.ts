import { v2 as cloudinary } from 'cloudinary'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (
  file: Blob
): Promise<string | null> => {
  if (!file || file.size === 0) {
    throw new Error("File is empty or missing");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "raahi/documents",
        },
        (error, result) => {
        //   if (error) {
        //     console.error("Cloudinary SDK error:", error);
        //     reject(error);
        //     return;
        //   }
        if (error) {
  console.error(
    "Cloudinary error details:",
    JSON.stringify(error, null, 2)
  );
  reject(error);
  return;
}

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return a secure URL"));
            return;
          }

          resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });

    return url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default uploadOnCloudinary;
