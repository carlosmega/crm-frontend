# Settings Feature

## 📋 Overview

The **Settings** feature manages user preferences and system configuration for the CRM application. It provides:

- **User Preferences**: Theme, language, notifications, and display options
- **System Configuration**: Regional formats (date, time, currency, timezone, number format)
- **Internationalization (i18n)**: Support for multiple languages (ES/EN)
- **Persistence**: LocalStorage-based settings persistence

## 🏗️ Architecture

### Feature Structure

```
features/settings/
├── components/
│   ├── language-selector.tsx         # Language dropdown
│   ├── theme-selector.tsx            # Theme selector (light/dark/system)
│   ├── timezone-selector.tsx         # Timezone dropdown
│   ├── user-preferences-section.tsx  # User preferences UI
│   └── system-config-section.tsx     # System configuration UI
├── types.ts                          # Re-exports from core/config
└── AGENTS.md                         # This file
```

### Core Infrastructure (Shared across app)

```
core/
├── config/
│   ├── i18n-config.ts               # i18n configuration
│   └── settings-defaults.ts         # Settings types & defaults
└── providers/
    ├── settings-provider.tsx        # Settings context & LocalStorage
    └── theme-provider.tsx           # Theme application to DOM
```

### Shared Utilities (Reusable)

```
shared/
├── hooks/
│   └── use-translation.ts           # Translation hook
└── utils/
    ├── i18n.ts                      # Translation utilities
    └── formatters.ts                # Locale-aware formatters
```

### Translation Files

```
locales/
├── en/
│   ├── common.json                  # Common UI elements
│   ├── navigation.json              # Navigation labels
│   └── settings.json                # Settings page
└── es/
    ├── common.json
    ├── navigation.json
    └── settings.json
```

## 🔧 Technical Implementation

### 1. Settings Provider

**Location**: `core/providers/settings-provider.tsx`

Provides global access to user settings with LocalStorage persistence:

```typescript
const { settings, updateSettings, resetSettings } = useSettings()

// Update single setting
updateSettings({ theme: 'dark' })

// Update multiple settings
updateSettings({
  theme: 'dark',
  locale: 'en-US',
  currency: 'USD'
})

// Reset to defaults
resetSettings()
```

### 2. Theme Provider

**Location**: `core/providers/theme-provider.tsx`

Automatically applies theme to document based on settings:

- Adds/removes `.dark` class on `<html>`
- Listens to system theme changes when `theme: 'system'`
- No-op component (renders children unchanged)

### 3. Translation Hook

**Location**: `shared/hooks/use-translation.ts`

Client-side translation hook:

```typescript
const { t, locale, isLoading } = useTranslation('settings')

// Basic translation
t('preferences.title') // → "User Preferences"

// With variables
t('validation.minLength', { min: 5 }) // → "Minimum 5 characters"
```

### 4. Locale Formatters

**Location**: `shared/utils/formatters.ts`

Provides locale-aware formatting utility functions:

```typescript
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  formatRelativeDate
} from '@/shared/utils/formatters'

formatCurrency(1234.56)      // → "$1,234.56" (USD)
formatDate(new Date())        // → "Nov 15, 2025"
formatRelativeDate(date)      // → "2 hours ago"
```

## 📊 Settings Schema

### UserSettings Interface

```typescript
interface UserSettings {
  // Theme
  theme: 'light' | 'dark' | 'system'

  // Language
  locale: 'en-US' | 'es-ES'

  // Regional Formats
  dateFormat: 'short' | 'medium' | 'long'
  timeFormat: '12h' | '24h'
  timezone: string  // IANA timezone
  currency: 'EUR' | 'USD' | 'GBP'
  numberFormat: 'es-ES' | 'en-US'

  // Notifications
  notifications: {
    desktop: boolean
    email: boolean
    sound: boolean
  }

  // Display
  sidebarCollapsed: boolean
  compactMode: boolean
}
```

### LocalStorage Structure

```json
{
  "version": "1.0.0",
  "settings": { /* UserSettings */ },
  "lastUpdated": "2025-11-11T..."
}
```

**Key**: `crm-user-settings`

## 🌐 Internationalization (i18n)

### Supported Locales

- `es-ES` - Spanish (Spain) - **Default**
- `en-US` - English (United States)

### Translation Namespaces

| Namespace | Description | Files |
|-----------|-------------|-------|
| `common` | Shared UI elements | buttons, states, messages, validation |
| `navigation` | Navigation labels | sidebar sections, menu items |
| `settings` | Settings page | preferences, system config |
| `leads` | Lead management | (future) |
| `opportunities` | Opportunities | (future) |
| ... | Other features | (future) |

### Adding New Translations

1. Create translation files in `locales/{lang}/{namespace}.json`
2. Use `useTranslation(namespace)` hook in components
3. Call `t('key.path')` to get translated string

Example:

```typescript
// 1. Create locales/es/myfeature.json
{
  "title": "Mi Característica",
  "button": "Guardar"
}

// 2. Use in component
const { t } = useTranslation('myfeature')
return <h1>{t('title')}</h1>
```

## 🎨 UI Components

### Settings Page

**Route**: `/settings`
**Location**: `app/(sales)/settings/page.tsx`

Tabbed interface with two sections:

1. **User Preferences**
   - Theme selector
   - Language selector
   - Notifications toggles
   - Display options

2. **System Configuration**
   - Date format selector
   - Time format selector (12h/24h)
   - Timezone selector
   - Currency selector
   - Number format selector

### Selectors

- `LanguageSelector` - Dropdown with flag emojis
- `ThemeSelector` - Light/Dark/System with icons
- `TimezoneSelector` - Common timezones list

All selectors accept:
- `value` - Current value
- `onChange` - Change handler
- `label` - Optional label
- `description` - Optional description

## 🔄 Integration

### 1. Layout Integration

**File**: `app/layout.tsx`

```typescript
<SettingsProvider>
  <ThemeProvider>
    <QueryProvider>
      {/* Rest of app */}
    </QueryProvider>
  </ThemeProvider>
</SettingsProvider>
```

**Important**: `SettingsProvider` must be outermost to provide settings to all children.

### 2. Navigation Integration

**File**: `components/sidebar/app-sidebar.tsx`

Uses `useNavigationData()` hook to get translated navigation labels:

```typescript
const navigationData = useNavigationData()

<NavSection label={navigationData.labels.sales} items={navigationData.sales} />
```

### 3. Using Settings in Features

```typescript
// Read settings
const { settings } = useSettings()

if (settings.theme === 'dark') {
  // Dark theme logic
}

// Update settings
const { updateSettings } = useSettings()

updateSettings({ currency: 'USD' })
```

### 4. Using Translations in Features

```typescript
const { t } = useTranslation('myfeature')

return (
  <Button>{t('buttons.save')}</Button>
)
```

### 5. Using Locale Formatters in Features

```typescript
import { formatCurrency, formatDate } from '@/shared/utils/formatters'

return (
  <div>
    <span>{formatCurrency(1000)}</span>
    <span>{formatDate(new Date())}</span>
  </div>
)
```

## ⚡ Performance Optimizations

1. **Memoized Navigation Data**: `useNavigationData()` uses `useMemo` to prevent recreation
2. **Translation Caching**: Loaded translations are cached in memory
3. **Hydration-Safe**: Settings load client-side to prevent SSR mismatches
4. **Minimal Re-renders**: Providers only trigger re-renders when settings actually change

## 🚀 Future Enhancements

### Short-term (MVP+)
- [ ] Add more languages (de-DE, fr-FR, pt-BR)
- [ ] Profile picture upload
- [ ] Keyboard shortcuts configuration
- [ ] Data export preferences

### Long-term
- [ ] Server-side settings persistence (sync across devices)
- [ ] Team/organization-wide settings
- [ ] Custom themes (color customization)
- [ ] Accessibility settings (font size, contrast)
- [ ] Advanced notification rules

## 📝 Notes

### Why LocalStorage?

For MVP, LocalStorage provides:
- ✅ Zero backend dependencies
- ✅ Instant persistence
- ✅ Per-device settings (no sync needed)
- ✅ Simple implementation

Future versions can migrate to server-side storage for:
- Cross-device sync
- Team-wide settings
- Audit logs
- Advanced permissions

### Why Simple i18n Instead of next-intl?

For MVP with 2 languages, a simple implementation provides:
- ✅ Zero external dependencies
- ✅ Full control over loading strategy
- ✅ Smaller bundle size
- ✅ Easy to understand and maintain

Migration to `next-intl` is straightforward if needed for:
- SSR translations
- Route-based locales
- Advanced pluralization
- 5+ languages

### Theme Implementation

Using Tailwind's dark mode with class strategy:
- `.dark` class on `<html>` element
- CSS variables for colors (already in `globals.css`)
- System preference detection via `matchMedia`

## 🔗 Related Files

### Core
- `core/config/settings-defaults.ts` - Settings types & defaults
- `core/config/i18n-config.ts` - i18n configuration
- `core/providers/settings-provider.tsx` - Settings context
- `core/providers/theme-provider.tsx` - Theme application

### Shared
- `shared/hooks/use-translation.ts` - Translation hook
- `shared/utils/formatters.ts` - Formatter utilities
- `shared/utils/i18n.ts` - Translation utilities

### App
- `app/layout.tsx` - Provider integration
- `app/(sales)/settings/page.tsx` - Settings page
- `components/sidebar/app-sidebar.tsx` - Navigation integration

### Translations
- `locales/en/*.json` - English translations
- `locales/es/*.json` - Spanish translations

## 🐛 Troubleshooting

### Settings not persisting
- Check browser LocalStorage is enabled
- Check for QuotaExceededError in console
- Verify `SETTINGS_STORAGE_KEY` is correct

### Translations not updating
- Clear browser cache (translations are cached)
- Check translation file syntax (must be valid JSON)
- Verify namespace matches in `useTranslation(namespace)`

### Theme not applying
- Check `<html>` element has `.dark` class when dark theme
- Verify `suppressHydrationWarning` on `<html>` element
- Check CSS variables are defined in `globals.css`

### Formatters showing wrong locale
- Verify settings are loaded (`settings.locale` is correct)
- Check `Intl` API is supported in browser
- Verify timezone is valid IANA timezone string
