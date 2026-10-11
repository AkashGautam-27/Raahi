import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  const configState = {
    cloudName,
    hasApiKey: Boolean(apiKey),
    apiKeyPrefix: apiKey ? apiKey.slice(0, 4) + "..." : null,
    hasApiSecret: Boolean(apiSecret),
  };

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({
      success: false,
      error: "Missing Cloudinary environment variables in .env",
      config: configState,
    }, { status: 400 });
  }

  // 1. Test ping endpoint
  let pingResult: any = {};
  try {
    const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const pingRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
      headers: { Authorization: authHeader },
    });

    pingResult = {
      status: pingRes.status,
      statusText: pingRes.statusText,
      xCldError: pingRes.headers.get("x-cld-error"),
      headers: Object.fromEntries(pingRes.headers.entries()),
      body: await pingRes.text(),
    };
  } catch (err: any) {
    pingResult = { error: err.message };
  }

  // 2. Test upload with Cloudinary SDK
  let uploadResult: any = {};
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    // Small 1x1 transparent PNG data uri
    const tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const res = await cloudinary.uploader.upload(tinyPng, {
      folder: "raahi/test",
      resource_type: "auto",
    });

    uploadResult = {
      success: true,
      secure_url: res.secure_url,
      public_id: res.public_id,
    };
  } catch (err: any) {
    uploadResult = {
      success: false,
      message: err.message,
      http_code: err.http_code,
      name: err.name,
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    };
  }

  return NextResponse.json({
    config: configState,
    ping: pingResult,
    upload: uploadResult,
  });
}
