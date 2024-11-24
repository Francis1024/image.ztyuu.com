import { createI18nMiddleware } from 'next-international/middleware'
import { NextRequest, NextResponse } from 'next/server'

const I18nMiddleware = createI18nMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  urlMappingStrategy: 'rewrite'
})

export function middleware(request: NextRequest) {
  // 从 cookie 中获取语言设置
  const locale = request.cookies.get('locale')?.value

  if (locale) {
    // 如果有缓存的语言设置，使用该设置
    return I18nMiddleware(request)
  }

  // 获取浏览器的语言偏好
  const acceptLanguage = request.headers.get('accept-language')
  let preferredLocale = 'en' // 默认英语

  if (acceptLanguage) {
    // 检查是否包含中文
    if (acceptLanguage.includes('zh')) {
      preferredLocale = 'zh'
    }
    // 可以添加更多语言的检查
  }

  // 创建响应
  const response = I18nMiddleware(request)

  // 如果是 NextResponse，设置 cookie
  if (response instanceof NextResponse) {
    // 设置 cookie，有效期 1 年
    response.cookies.set('locale', preferredLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    })
  }

  return response
}

export const config = {
  matcher: ['/', '/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)']
}
