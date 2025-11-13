# Internationalization (i18n) Setup

The application supports **English** and **Hindi** languages with easy switching between them.

## Features

- ✅ Full frontend translation support (English & Hindi)
- ✅ Backend API message translations
- ✅ Language switcher in navbar
- ✅ Language preference saved in localStorage
- ✅ HTML lang attribute updates automatically
- ✅ Parameter replacement in translations (e.g., `{count}`)

## Frontend Translation

### Using Translations in Components

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  const { t, language } = useTranslation();

  return (
    <div>
      <h1>{t('common.appName')}</h1>
      <p>{t('home.subtitle')}</p>
      <p>Current language: {language}</p>
    </div>
  );
}
```

### Translation Keys

All translations are organized in namespaces:

- `common.*` - Common UI elements (buttons, labels, etc.)
- `home.*` - Home page content
- `auth.*` - Authentication pages
- `profile.*` - Profile pages
- `notifications.*` - Notification pages
- `profileViews.*` - Profile views page
- `messages.*` - Messaging
- `interests.*` - Interest system
- `shortlist.*` - Shortlist

### Adding New Translations

1. Add the English translation to `frontend/lib/i18n/translations/en.json`
2. Add the Hindi translation to `frontend/lib/i18n/translations/hi.json`
3. Use the translation in your component with `t('namespace.key')`

Example:
```json
// en.json
{
  "myFeature": {
    "title": "My Feature Title",
    "description": "Description here"
  }
}

// hi.json
{
  "myFeature": {
    "title": "मेरी सुविधा शीर्षक",
    "description": "विवरण यहाँ"
  }
}

// Component
<h1>{t('myFeature.title')}</h1>
```

### Using Parameters

```json
{
  "notifications": {
    "unreadCount": "You have {count} unread notification(s)"
  }
}
```

```typescript
{t('notifications.unreadCount', { count: 5 })}
// English: "You have 5 unread notification(s)"
// Hindi: "आपके पास 5 अपठित सूचना(एं) हैं"
```

## Backend Translation

### Using Translations in Controllers

```javascript
import { getMessage } from '../utils/messages.js';

// In your controller
const lang = req.headers['accept-language']?.includes('hi') ? 'hi' : 'en';
res.json({
  status: true,
  message: getMessage('user.created', lang),
  data: user
});
```

### Available Message Keys

- `user.*` - User operations
- `auth.*` - Authentication messages
- `photo.*` - Photo operations
- `interest.*` - Interest operations
- `shortlist.*` - Shortlist operations
- `notification.*` - Notification messages
- `profileView.*` - Profile view messages
- `message.*` - Messaging
- `validation.*` - Validation errors
- `error.*` - Error messages

## Language Switcher

The language switcher is automatically added to the navbar. Users can switch between English and Hindi with a single click.

The selected language is:
- Saved in localStorage
- Persists across page refreshes
- Updates the HTML `lang` attribute
- Applied to all components automatically

## Adding New Languages

To add a new language (e.g., Tamil, Telugu):

1. Create translation file: `frontend/lib/i18n/translations/ta.json`
2. Add to `LanguageContext.tsx` type: `export type Language = 'en' | 'hi' | 'ta';`
3. Update `LanguageSwitcher.tsx` to include new language button
4. Add backend messages: `backend/src/utils/messages.js`

## Translation File Structure

```
frontend/lib/i18n/
├── translations/
│   ├── en.json     # English translations
│   └── hi.json     # Hindi translations
└── index.ts        # Translation utility functions

backend/src/utils/
└── messages.js     # Backend API messages
```

## Best Practices

1. **Use descriptive keys**: `common.saveButton` instead of `btn1`
2. **Organize by feature**: Group related translations together
3. **Keep translations consistent**: Use same terminology across the app
4. **Test both languages**: Ensure UI doesn't break with longer Hindi text
5. **Handle pluralization**: Use parameters for dynamic content

## Testing

1. Switch language using the navbar switcher
2. Verify all text changes correctly
3. Check that the HTML lang attribute updates
4. Refresh the page and verify language persists
5. Test with different screen sizes (Hindi text may be longer)

