"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Moon, Sun, Globe, Coffee } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";

export function Header() {
  const { setTheme } = useTheme();
  const t = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1];

  const handleLanguageChange = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href={`/${currentLocale}`}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <Image
            src="/images/logo.svg"
            alt={t("header.logo")}
            width={32}
            height={32}
          />
          <span className="font-bold text-xl">{t("header.title")}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="https://buymeacoffee.com/dingdongnav"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-all duration-300 hover:scale-110"
          >
            <Coffee className="h-5 w-5" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer hover:text-primary">
                <Globe className="h-5 w-5" />
                <span className="ml-1">{t("header.currentLang")}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                {t("header.languages.english")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange("zh")}>
                {t("header.languages.chinese")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">{t("header.themeToggle")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                {t("header.themes.light")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                {t("header.themes.dark")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                {t("header.themes.system")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
