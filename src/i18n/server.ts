import { createI18nServer } from 'next-international/server'

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import("./locales/en"),
  "zh-CN": () => import("./locales/zh-CN"),
});
