import crypto from 'crypto';

const uploadOnCloudinary = async (
  file: Blob
): Promise<string | null> => {
  if (!file || file.size === 0) {
    throw new Error("File is empty or missing");
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName) {
    throw new Error("Missing CLOUDINARY_CLOUD_NAME in .env file.");
  }

  if (!uploadPreset && (!apiKey || !apiSecret)) {
    console.error("Missing Cloudinary configuration:", {
      cloudName: Boolean(cloudName),
      apiKey: Boolean(apiKey),
      apiSecret: Boolean(apiSecret),
    });
    throw new Error(
      "Cloudinary credentials missing. Please check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (or set CLOUDINARY_UPLOAD_PRESET) in your .env file."
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    const resourceType = "auto";
    const folder = "raahi/documents";

    const formData = new FormData();
    formData.append("file", fileUri);
    formData.append("folder", folder);

    if (uploadPreset) {
      // Unsigned upload using preset
      formData.append("upload_preset", uploadPreset);
    } else {
      // Signed upload using API Key + Secret
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      formData.append("api_key", apiKey!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const xCldError = res.headers.get("x-cld-error");

    if (!res.ok) {
      let detail = xCldError || "";
      try {
        const json = await res.json();
        if (json?.error?.message) {
          detail = json.error.message;
        }
      } catch {
        const text = await res.text();
        if (text) detail = detail || text;
      }

      console.error("Cloudinary HTTP Error:", {
        status: res.status,
        xCldError,
        detail,
      });

      throw new Error(
        detail || `Cloudinary upload rejected with status ${res.status}. Check your Cloudinary account credentials and permissions.`
      );
    }

    const data = await res.json();

    if (!data?.secure_url) {
      throw new Error("Cloudinary did not return a secure URL");
    }

    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error details:", error);
    const detail =
      error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error));
    throw new Error(detail);
  }
};

export default uploadOnCloudinary;
