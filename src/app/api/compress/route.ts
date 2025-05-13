import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const buffer = await file.arrayBuffer();
    const base64 = await compressAndConvertToWebP(buffer);
    return NextResponse.json(base64, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function compressAndConvertToWebP(buffer: ArrayBuffer): Promise<string> {
  const image = sharp(buffer);
  // 转换为WebP并压缩
  const outputBuffer = await image
    .webp({
      quality: 80,
      lossless: true,
      effort: 6, // 压缩努力级别 (0-6, 6最慢但压缩率最高)
    })
    .toBuffer();

  // 转换为Base64
  return outputBuffer.toString("base64");
}
