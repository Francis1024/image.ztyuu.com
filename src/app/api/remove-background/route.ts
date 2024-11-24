import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file upload' },
        { status: 400 }
      );
    }

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 调用本地处理服务
    const response = await fetch('https://navapi.ztyuu.com/api/processimage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:${file.type};base64,${base64Image}`
      })
    });

    if (!response.ok) {
      console.error('Processing error:', response.status, response.statusText);
      throw new Error(`Processing failed: ${response.statusText}`);
    }

    // 获取处理后的图片
    const processedImageBuffer = await response.arrayBuffer();

    // 返回处理后的图片
    return new NextResponse(processedImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};