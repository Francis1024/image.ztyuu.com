import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const file = data.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: '没有找到图片' },
        { status: 400 }
      )
    }

    // 创建临时目录
    const tempDir = path.join(process.cwd(), 'temp_images')
    try {
      await fs.access(tempDir)
    } catch {
      await fs.mkdir(tempDir)
    }

    // 生成唯一的文件名
    const timestamp = Date.now()
    const inputPath = path.join(tempDir, `input-${timestamp}.png`)

    // 保存上传的文件
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(inputPath, buffer)

    // 调用处理脚本
    const scriptPath = path.join(process.cwd(), 'scripts', 'processImage.js')
    const command = `node -e "require('${scriptPath}')('${inputPath}')"`;

    await execAsync(command)

    // 读取处理后的文件
    const outputPath = inputPath.replace('.png', '-output.png')
    const result = await fs.readFile(outputPath)

    // 清理临时文件
    await fs.unlink(inputPath).catch(console.error)
    await fs.unlink(outputPath).catch(console.error)

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: '处理图片时出错', details: error.message },
      { status: 500 }
    )
  }
}