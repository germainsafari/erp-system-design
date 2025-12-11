# Multi-Language Quick Start Guide

## 🌍 Supported Languages

- **English (en)** - Default
- **Français (fr)** - French
- **Kinyarwanda (rw)** - Rwandan

## 🚀 Quick Start

### Switching Languages

**Method 1: Using the Language Switcher (Recommended)**
1. Look for the language dropdown (🌐) in the header
2. Select your preferred language
3. The entire application will switch to that language

**Method 2: Using URLs**
- English: `http://localhost:3000/`
- French: `http://localhost:3000/fr/`
- Kinyarwanda: `http://localhost:3000/rw/`

## 💻 For Developers

### Using Translations in Your Code

```typescript
"use client"

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  
  return <button>{t('save')}</button>
}
```

### Adding New Text

1. **Add to English** (`messages/en.json`):
```json
{
  "mySection": {
    "myText": "Hello World"
  }
}
```

2. **Add to French** (`messages/fr.json`):
```json
{
  "mySection": {
    "myText": "Bonjour le monde"
  }
}
```

3. **Add to Kinyarwanda** (`messages/rw.json`):
```json
{
  "mySection": {
    "myText": "Mwaramutse isi"
  }
}
```

4. **Use in component**:
```typescript
const t = useTranslations('mySection')
return <div>{t('myText')}</div>
```

## 📝 Translation Sections

All translation files are organized into sections:

- **common** - Buttons, actions (save, cancel, delete, etc.)
- **navigation** - Menu items (dashboard, sales, inventory, etc.)
- **dashboard** - Dashboard page content
- **sales** - Sales module
- **inventory** - Inventory module
- **customers** - Customer management
- **suppliers** - Supplier management
- **accounting** - Financial data
- **hr** - Human resources
- **auth** - Login/authentication
- **settings** - Application settings
- **ai** - AI Copilot features
- **errors** - Error messages

## 🔍 Examples

### Example 1: Page with Translations

```typescript
"use client"

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function MyPage() {
  const t = useTranslations('sales')
  const tCommon = useTranslations('common')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Button>{tCommon('save')}</Button>
    </div>
  )
}
```

### Example 2: Dynamic Values

```typescript
// In messages/en.json
{
  "welcome": "Welcome, {name}!"
}

// In component
const t = useTranslations()
<p>{t('welcome', { name: user.name })}</p>
```

## 🎨 Current Translations

### Common UI Elements
- Buttons: Save, Cancel, Delete, Edit, Add
- Actions: Search, Filter, Export, Import, Refresh
- Navigation: Back, Next, Previous, Submit

### All Main Pages
- Dashboard with stats and charts
- Sales orders and transactions
- Inventory and stock management
- Customer relationship management
- Supplier management
- Human resources and employees
- Accounting and financial data
- Settings and preferences

## ✅ Checklist for New Features

When adding new features:

- [ ] Add English translations to `messages/en.json`
- [ ] Add French translations to `messages/fr.json`
- [ ] Add Kinyarwanda translations to `messages/rw.json`
- [ ] Use `useTranslations()` hook in components
- [ ] Test all three languages
- [ ] Update documentation if needed

## 🌟 Tips

1. **Keep keys organized**: Group related translations together
2. **Use descriptive names**: Make translation keys clear and meaningful
3. **Test each language**: Always test your feature in all three languages
4. **Consistency matters**: Use the same terminology across the application
5. **No hardcoded text**: Always use translations, never hardcode text

## 🐛 Troubleshooting

**Problem**: Text not translating
- Check if the key exists in all three translation files
- Verify you're using the correct namespace
- Restart the dev server (`pnpm dev`)

**Problem**: Language switcher not working
- Clear your browser cache
- Check the URL format
- Make sure middleware.ts is configured correctly

**Problem**: Wrong language showing
- Check the URL - should have `/fr/` or `/rw/` prefix for those languages
- Use the language switcher to change manually

## 🎯 Next Steps

1. Run the application: `pnpm dev`
2. Navigate to the dashboard
3. Try switching languages using the dropdown in the header
4. Explore different pages in different languages
5. Start adding your own translations!

## 📚 More Information

For detailed documentation, see [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md)

---

**Happy translating! 🌍✨**



