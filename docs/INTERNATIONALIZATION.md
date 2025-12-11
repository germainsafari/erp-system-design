# Multi-Language Support (i18n)

## Overview

The RetailFlow ERP system now supports multiple languages:
- **English (en)** - Default language
- **French (fr)** - Français
- **Kinyarwanda (rw)** - Native language of Rwanda

## Implementation

We use `next-intl`, a modern internationalization library for Next.js, which provides:
- Type-safe translations
- Automatic locale detection
- SEO-friendly URL structure
- Server and client-side rendering support

## Project Structure

```
erp-system-design/
├── i18n.ts                     # i18n configuration
├── middleware.ts               # Locale routing middleware
├── messages/                   # Translation files
│   ├── en.json                # English translations
│   ├── fr.json                # French translations
│   └── rw.json                # Kinyarwanda translations
├── app/
│   ├── layout.tsx             # Root layout
│   ├── not-found.tsx          # 404 page
│   └── [locale]/              # Locale-specific pages
│       ├── layout.tsx         # Locale layout with providers
│       ├── page.tsx           # Dashboard
│       ├── login/page.tsx     # Login page
│       ├── sales/page.tsx     # Sales page
│       ├── inventory/page.tsx # Inventory page
│       ├── customers/page.tsx # Customers page
│       ├── suppliers/page.tsx # Suppliers page
│       ├── hr/page.tsx        # HR page
│       ├── accounting/page.tsx# Accounting page
│       └── settings/page.tsx  # Settings page
└── components/
    └── language-switcher.tsx  # Language selection component
```

## URL Structure

The application uses locale prefixes in URLs:

- English (default): `https://your-domain.com/` or `https://your-domain.com/en/`
- French: `https://your-domain.com/fr/`
- Kinyarwanda: `https://your-domain.com/rw/`

Examples:
- Dashboard: `/` (English) or `/fr/` (French) or `/rw/` (Kinyarwanda)
- Sales: `/sales` (English) or `/fr/sales` (French) or `/rw/sales` (Kinyarwanda)
- Customers: `/customers` (English) or `/fr/customers` (French) or `/rw/customers` (Kinyarwanda)

## Using Translations in Components

### Client Components

For client-side components, use the `useTranslations` hook:

```typescript
"use client"

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('dashboard')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

### Multiple Translation Namespaces

You can use multiple translation namespaces in a single component:

```typescript
"use client"

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{tCommon('save')}</button>
    </div>
  )
}
```

### Server Components

For server-side components, use `getTranslations`:

```typescript
import { getTranslations } from 'next-intl/server'

export default async function MyServerComponent() {
  const t = await getTranslations('dashboard')
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  )
}
```

## Translation Files

Translation files are organized by namespace. Each language has its own JSON file in the `messages/` directory.

### Structure

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "description": "Welcome back!"
  }
}
```

### Available Namespaces

- `common` - Common UI elements (buttons, actions, etc.)
- `navigation` - Navigation menu items
- `dashboard` - Dashboard page
- `sales` - Sales module
- `inventory` - Inventory module
- `customers` - Customers module
- `suppliers` - Suppliers module
- `accounting` - Accounting module
- `hr` - Human Resources module
- `auth` - Authentication pages
- `settings` - Settings page
- `ai` - AI Copilot
- `errors` - Error messages

## Adding New Translations

### 1. Add to Translation Files

Add your new translation key to all language files:

**messages/en.json**
```json
{
  "myModule": {
    "newKey": "Hello World"
  }
}
```

**messages/fr.json**
```json
{
  "myModule": {
    "newKey": "Bonjour le monde"
  }
}
```

**messages/rw.json**
```json
{
  "myModule": {
    "newKey": "Mwaramutse isi"
  }
}
```

### 2. Use in Component

```typescript
const t = useTranslations('myModule')
return <div>{t('newKey')}</div>
```

## Language Switcher

The language switcher is available in the header of every page. Users can switch between languages at any time, and their preference will be reflected in the URL.

### Implementation

The `LanguageSwitcher` component is located at `components/language-switcher.tsx` and uses the `Select` component from the UI library.

```typescript
import { LanguageSwitcher } from '@/components/language-switcher'

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <LanguageSwitcher />
    </header>
  )
}
```

## Adding a New Language

To add support for a new language:

### 1. Create Translation File

Create a new JSON file in the `messages/` directory:

```bash
messages/de.json  # For German
```

### 2. Update i18n Configuration

Edit `i18n.ts`:

```typescript
export const locales = ['en', 'fr', 'rw', 'de'] as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda',
  de: 'Deutsch', // Add new language
};
```

### 3. Update Middleware

Edit `middleware.ts` if needed (usually automatic):

```typescript
export const config = {
  matcher: ['/', '/(fr|rw|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### 4. Translate Content

Copy the structure from `messages/en.json` and translate all strings to the new language.

## Best Practices

### 1. Keep Keys Descriptive

Use descriptive key names:

```json
// ✅ Good
"customerForm": {
  "nameLabel": "Customer Name",
  "emailLabel": "Email Address"
}

// ❌ Bad
"form": {
  "label1": "Customer Name",
  "label2": "Email Address"
}
```

### 2. Organize by Feature

Group related translations under the same namespace:

```json
{
  "sales": {
    "title": "Sales",
    "newOrder": "New Order",
    "orderList": "Order List"
  }
}
```

### 3. Avoid Hardcoded Strings

Always use translations instead of hardcoded text:

```typescript
// ✅ Good
<button>{t('common.save')}</button>

// ❌ Bad
<button>Save</button>
```

### 4. Use Fallback Language

English is the fallback language. If a translation is missing in another language, the English version will be used.

## Translation Variables

You can use variables in translations:

**messages/en.json**
```json
{
  "greeting": "Hello, {name}!"
}
```

**Component**
```typescript
const t = useTranslations()
<p>{t('greeting', { name: 'John' })}</p>
// Output: Hello, John!
```

## Date and Number Formatting

next-intl automatically formats dates and numbers based on the current locale:

```typescript
import { useFormatter } from 'next-intl'

export function MyComponent() {
  const format = useFormatter()
  
  return (
    <div>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.number(1234.56, { style: 'currency', currency: 'USD' })}</p>
    </div>
  )
}
```

## SEO Considerations

### Alternate Links

The application automatically generates alternate links for SEO:

```html
<link rel="alternate" hreflang="en" href="https://your-domain.com/" />
<link rel="alternate" hreflang="fr" href="https://your-domain.com/fr/" />
<link rel="alternate" hreflang="rw" href="https://your-domain.com/rw/" />
```

### Metadata

Update metadata per locale in `app/[locale]/layout.tsx`:

```typescript
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'metadata' })
  
  return {
    title: t('title'),
    description: t('description')
  }
}
```

## Testing

To test different languages:

1. **Via URL**: Navigate to `/fr/` or `/rw/`
2. **Via Language Switcher**: Use the dropdown in the header
3. **Via Browser**: Set your browser's preferred language

## Common Issues

### Issue: Translation Not Showing

**Solution**: 
1. Verify the key exists in all translation files
2. Check that you're using the correct namespace
3. Restart the development server

### Issue: Language Switcher Not Working

**Solution**:
1. Check that middleware.ts is properly configured
2. Verify the locale is included in the `locales` array in i18n.ts
3. Clear browser cache

### Issue: 404 on Language Routes

**Solution**:
1. Ensure the page exists in `app/[locale]/`
2. Check middleware matcher pattern
3. Verify Next.js is using the correct output mode

## Performance

- Translations are loaded on-demand per page
- Next.js automatically code-splits translations
- Only the current locale's translations are sent to the client
- Server-side rendering ensures fast initial page loads

## Future Enhancements

Potential improvements for the i18n system:

1. **Persistent Language Preference**: Store user's language choice in cookies/localStorage
2. **Browser Language Detection**: Automatically detect and set user's preferred language
3. **Translation Management**: Integrate with a translation management system (e.g., Crowdin, Lokalise)
4. **RTL Support**: Add support for right-to-left languages
5. **Pluralization**: Implement plural rules for different languages
6. **Currency Formatting**: Format currency based on locale
7. **Time Zone Support**: Display dates/times in user's time zone

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [RFC 5646 Language Tags](https://www.rfc-editor.org/rfc/rfc5646.html)

## Support

For questions or issues related to internationalization:
1. Check this documentation
2. Review the next-intl documentation
3. Contact the development team



