"use client"

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('settings')

  const handleLocaleChange = (newLocale: string) => {
    // Get the current pathname without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Navigate to the new locale
    if (newLocale === 'en') {
      router.push(pathWithoutLocale)
    } else {
      router.push(`/${newLocale}${pathWithoutLocale}`)
    }
    
    // Refresh to ensure all translations are loaded
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t('selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          {locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


