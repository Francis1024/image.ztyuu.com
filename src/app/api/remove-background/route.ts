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

    // 创建新的 FormData 并传递文件
    const newFormData = new FormData();
    newFormData.append('image', file);

    // 调用本地处理服务
    const response = await fetch('http://localhost:3001/api/processimage', {
      method: 'POST',
      body: newFormData  // 直接发送 FormData
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

export const runtime = 'nodejs';
export const maxDuration = 300; // 5分钟超时
export const dynamic = 'force-dynamic';