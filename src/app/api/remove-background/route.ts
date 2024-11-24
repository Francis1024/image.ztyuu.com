export const runtime = 'nodejs'

import { NextResponse } from "next/server";
import { removeBackground, type Config, } from "@imgly/background-removal-node";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: Request) {
  try {
    console.log('=== 开始处理请求 ===');

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file found' },
        { status: 400 }
      );
    }

    console.log('文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 将文件保存到临时目录
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `upload-${Date.now()}.png`);
    await writeFile(tempPath, buffer);

    // 配置选项
    const config: Config = {
      publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-node@1.4.5/dist/',
      debug: true,
      model: 'small',
      output: {
        format: 'image/png',
        quality: 1,
      },
      progress: (key: string, current: number, total: number) => {
        console.log(`下载进度 ${key}: ${current}/${total}`);
      }
    };

    console.log('开始抠图处理...');
    const result = await removeBackground(tempPath, config);
    console.log('抠图处理完成');

    const outputBuffer = await result.arrayBuffer();
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('处理错误:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}