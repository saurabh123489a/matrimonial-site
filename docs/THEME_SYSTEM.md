# Complete Light + Dark Theme System

## Overview

This document describes the complete theme system for the Matrimonial Site application. The theme system uses CSS variables exclusively, ensuring consistent colors across all components and easy theme switching.

## Theme Files

- **`frontend/app/theme.css`** - Complete theme system with CSS variables and utility classes
- **`frontend/app/globals.css`** - Global styles (imports theme.css)

## Color Tokens

### Light Theme

#### Backgrounds
```css
--bg: #ffffff              /* Main background */
--bg-secondary: #f9fafb    /* Card/surface background */
--bg-tertiary: #f3f4f6     /* Elevated surface */
--bg-input: #ffffff        /* Input field background */
--bg-hover: #f9fafb        /* Hover state background */
--bg-active: #f3f4f6       /* Active state background */
```

#### Text Colors
```css
--text-primary: #232323    /* Headings, primary text (lightly dark, not pure black) */
--text-secondary: #4b5563  /* Body text, labels */
--text-muted: #6b7280      /* Muted text, placeholders */
--text-disabled: #9ca3af   /* Disabled text */
--text-inverse: #ffffff    /* Text on colored backgrounds */
```

#### Primary Colors (Pink Family)
```css
--primary: #ec4899         /* Main brand color */
--primary-dark: #be185d    /* Darker variant (hover) */
--primary-light: #f9a8d4   /* Lighter variant */
--primary-medium: #f472b6  /* Medium variant */
--primary-hover: #be185d   /* Hover state */
--primary-active: #9d174d  /* Active state */
--primary-disabled: #f9a8d4 /* Disabled state */
```

#### Accent Colors
```css
--accent: #dc2626          /* Accent color */
--accent-hover: #b91c1c    /* Accent hover */
--accent-light: #fee2e2    /* Light accent background */
```

#### Borders
```css
--border: #e5e7eb          /* Default border */
--border-light: #f3f4f6     /* Light border */
--border-dark: #d1d5db     /* Dark border */
--border-focus: #ec4899    /* Focus border */
```

#### State Colors
```css
--success: #10b981         /* Success color */
--success-bg: #d1fae5     /* Success background */
--success-text: #065f46    /* Success text */

--error: #ef4444           /* Error color */
--error-bg: #fee2e2        /* Error background */
--error-text: #991b1b      /* Error text */

--warning: #f59e0b         /* Warning color */
--warning-bg: #fef3c7      /* Warning background */
--warning-text: #92400e    /* Warning text */

--info: #3b82f6            /* Info color */
--info-bg: #dbeafe         /* Info background */
--info-text: #1e40af       /* Info text */
```

### Dark Theme (Maroon Matrimonial Theme)

#### Backgrounds
```css
--bg: #1A0C11              /* Main dark background */
--bg-secondary: #2B0F17    /* Primary surface, cards */
--bg-tertiary: #241317     /* Elevated surface */
--bg-input: #1F1417        /* Input field background */
--bg-hover: #241317        /* Hover state background */
--bg-active: #1F1417       /* Active state background */
```

#### Text Colors (Fully Readable)
```css
--text-primary: #FFFFFF   /* Headings, primary text (fully readable white) */
--text-secondary: #D5D3D7  /* Body text, labels */
--text-muted: #A29CA3      /* Muted text, placeholders */
--text-disabled: #6b7280   /* Disabled text */
--text-inverse: #232323    /* Text on colored backgrounds */
```

#### Primary Colors (Red Accent Family)
```css
--primary: #E04F5F         /* Main accent color */
--primary-dark: #C43A4E    /* Darker variant (hover) */
--primary-light: #E04F5F   /* Light variant */
--primary-medium: #C43A4E  /* Medium variant */
--primary-hover: #C43A4E   /* Hover state */
--primary-active: #B02A3E  /* Active state */
--primary-disabled: #6b7280 /* Disabled state */
```

#### Accent Colors
```css
--accent: #E04F5F          /* Accent color */
--accent-hover: #C43A4E    /* Accent hover */
--accent-light: #241317    /* Light accent background */
```

#### Borders
```css
--border: #2F2327          /* Default border */
--border-light: #241317     /* Light border */
--border-dark: #1F1417     /* Dark border */
--border-focus: #E04F5F    /* Focus border */
```

#### State Colors
```css
--success: #64D39A         /* Success color */
--success-bg: rgba(100, 211, 154, 0.1) /* Success background */
--success-text: #64D39A    /* Success text */

--error: #F25D5D           /* Error color */
--error-bg: rgba(242, 93, 93, 0.1) /* Error background */
--error-text: #F25D5D      /* Error text */

--warning: #F5C75B         /* Warning color */
--warning-bg: rgba(245, 199, 91, 0.1) /* Warning background */
--warning-text: #F5C75B    /* Warning text */

--info: #E04F5F            /* Info color */
--info-bg: rgba(224, 79, 95, 0.1) /* Info background */
--info-text: #E04F5F       /* Info text */
```

## Utility Classes

### Typography
```html
<h1 class="text-primary">Primary Heading</h1>
<p class="text-secondary">Secondary text</p>
<span class="text-muted">Muted text</span>
<div class="text-disabled">Disabled text</div>
```

### Backgrounds
```html
<div class="bg">Main background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-tertiary">Tertiary background</div>
<div class="bg-input">Input background</div>
```

### Surfaces/Cards
```html
<div class="surface">Basic surface</div>
<div class="card">Card component</div>
<div class="card-elevated">Elevated card</div>
```

### Buttons
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-outline">Outline Button</button>
<button class="btn btn-ghost">Ghost Button</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Inputs
```html
<input type="text" class="input" placeholder="Normal input" />
<input type="text" class="input input-error" placeholder="Error input" />
```

### Borders
```html
<div class="border">Default border</div>
<div class="border-light">Light border</div>
<div class="border-dark">Dark border</div>
<div class="border-focus">Focus border</div>
```

### States
```html
<div class="text-success">Success text</div>
<div class="bg-success">Success background</div>

<div class="text-error">Error text</div>
<div class="bg-error">Error background</div>

<div class="text-warning">Warning text</div>
<div class="bg-warning">Warning background</div>

<div class="text-info">Info text</div>
<div class="bg-info">Info background</div>
```

### Alerts
```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-error">Error message</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-info">Info message</div>
```

## Usage Examples

### Example 1: Button Component
```html
<button class="btn btn-primary">
  Click Me
</button>
```

### Example 2: Card Component
```html
<div class="card">
  <h2 class="text-primary">Card Title</h2>
  <p class="text-secondary">Card content goes here</p>
  <button class="btn btn-primary">Action</button>
</div>
```

### Example 3: Input with Error State
```html
<div>
  <label class="text-secondary">Email</label>
  <input type="email" class="input input-error" />
  <p class="text-error">Please enter a valid email</p>
</div>
```

### Example 4: Alert Component
```html
<div class="alert alert-success">
  <strong class="text-success">Success!</strong>
  <p class="text-success">Your profile has been updated.</p>
</div>
```

## Direct CSS Variable Usage

You can also use CSS variables directly in your components:

```css
.my-component {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.my-component:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-focus);
}
```

## Tailwind Integration

To use with Tailwind CSS, you can extend your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-input': 'var(--bg-input)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)',
      },
    },
  },
}
```

Then use in Tailwind classes:
```html
<div class="bg-bg-secondary text-text-primary border-border">
  Content
</div>
```

## Best Practices

1. **Always use CSS variables** - Never hardcode colors
2. **Use semantic names** - Use `--text-primary` instead of `--color-1`
3. **Test both themes** - Always test components in both light and dark mode
4. **Check contrast** - Ensure text meets WCAG AA contrast ratios
5. **Use utility classes** - Prefer utility classes over direct CSS when possible
6. **Consistent spacing** - Use consistent padding/margin with theme tokens

## Accessibility

- All text colors meet WCAG AA contrast requirements (4.5:1 ratio)
- Focus states are clearly visible
- Disabled states are properly indicated
- Reduced motion preferences are respected

## Theme Switching

The theme system automatically switches based on the `.dark` class on the root element:

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

## Migration Guide

When migrating existing components:

1. Replace hardcoded colors with CSS variables
2. Replace Tailwind color classes (e.g., `text-gray-900`) with theme utilities (`text-primary`)
3. Test in both light and dark modes
4. Ensure proper contrast ratios

## Support

For questions or issues with the theme system, refer to:
- `frontend/app/theme.css` - Complete theme implementation
- `docs/THEME_SYSTEM.md` - This documentation

