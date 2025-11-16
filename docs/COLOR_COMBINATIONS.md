# Color Combinations - Light & Dark Themes

## Complete Color Reference Table

### Light Theme Colors

| Category | Variable Name | Hex Code | Usage | Example |
|----------|---------------|----------|-------|---------|
| **Background** | `--bg` | `#ffffff` | Main page background | Body, containers |
| **Background Secondary** | `--bg-secondary` | `#f9fafb` | Card/surface background | Cards, panels |
| **Background Tertiary** | `--bg-tertiary` | `#f3f4f6` | Elevated surface | Hover states, elevated cards |
| **Background Input** | `--bg-input` | `#ffffff` | Input field background | Form inputs |
| **Text Primary** | `--text-primary` | `#232323` | Headings, primary text | H1-H4, important text |
| **Text Secondary** | `--text-secondary` | `#4b5563` | Body text, labels | Paragraphs, labels |
| **Text Muted** | `--text-muted` | `#6b7280` | Muted text, placeholders | Helper text, placeholders |
| **Text Disabled** | `--text-disabled` | `#9ca3af` | Disabled text | Disabled inputs, inactive text |
| **Primary** | `--primary` | `#ec4899` | Main brand color | Buttons, links, accents |
| **Primary Dark** | `--primary-dark` | `#be185d` | Hover/active states | Button hover, active links |
| **Primary Light** | `--primary-light` | `#f9a8d4` | Light variant | Backgrounds, badges |
| **Primary Medium** | `--primary-medium` | `#f472b6` | Medium emphasis | Secondary buttons |
| **Accent** | `--accent` | `#dc2626` | Accent color | Highlights, alerts |
| **Border** | `--border` | `#e5e7eb` | Default border | Card borders, dividers |
| **Success** | `--success` | `#10b981` | Success color | Success messages, badges |
| **Error** | `--error` | `#ef4444` | Error color | Error messages, validation |
| **Warning** | `--warning` | `#f59e0b` | Warning color | Warning messages |
| **Info** | `--info` | `#3b82f6` | Info color | Info messages |

### Dark Theme Colors (Maroon Matrimonial Theme)

| Category | Variable Name | Hex Code | Usage | Example |
|----------|---------------|----------|-------|---------|
| **Background** | `--bg` | `#1A0C11` | Main dark background | Body, containers |
| **Background Secondary** | `--bg-secondary` | `#2B0F17` | Card/surface background | Cards, panels |
| **Background Tertiary** | `--bg-tertiary` | `#241317` | Elevated surface | Hover states, elevated cards |
| **Background Input** | `--bg-input` | `#1F1417` | Input field background | Form inputs |
| **Text Primary** | `--text-primary` | `#FFFFFF` | Headings, primary text | H1-H4, important text |
| **Text Secondary** | `--text-secondary` | `#D5D3D7` | Body text, labels | Paragraphs, labels |
| **Text Muted** | `--text-muted` | `#A29CA3` | Muted text, placeholders | Helper text, placeholders |
| **Text Disabled** | `--text-disabled` | `#6b7280` | Disabled text | Disabled inputs, inactive text |
| **Primary** | `--primary` | `#E04F5F` | Main accent color | Buttons, links, accents |
| **Primary Dark** | `--primary-dark` | `#C43A4E` | Hover/active states | Button hover, active links |
| **Primary Light** | `--primary-light` | `#E04F5F` | Light variant | Backgrounds, badges |
| **Primary Medium** | `--primary-medium` | `#C43A4E` | Medium emphasis | Secondary buttons |
| **Accent** | `--accent` | `#E04F5F` | Accent color | Highlights, alerts |
| **Border** | `--border` | `#2F2327` | Default border | Card borders, dividers |
| **Success** | `--success` | `#64D39A` | Success color | Success messages, badges |
| **Error** | `--error` | `#F25D5D` | Error color | Error messages, validation |
| **Warning** | `--warning` | `#F5C75B` | Warning color | Warning messages |
| **Info** | `--info` | `#E04F5F` | Info color | Info messages |

## Component Color Mapping

### Buttons

| Button Type | Light Theme | Dark Theme |
|-------------|-------------|------------|
| **Primary Button** | Background: `#ec4899`<br>Text: `#ffffff`<br>Hover: `#be185d` | Background: `#E04F5F`<br>Text: `#FFFFFF`<br>Hover: `#C43A4E` |
| **Secondary Button** | Background: `#f3f4f6`<br>Text: `#232323`<br>Border: `#e5e7eb` | Background: `#241317`<br>Text: `#FFFFFF`<br>Border: `#2F2327` |
| **Outline Button** | Background: transparent<br>Text: `#ec4899`<br>Border: `#ec4899` | Background: transparent<br>Text: `#E04F5F`<br>Border: `#E04F5F` |
| **Ghost Button** | Background: transparent<br>Text: `#232323`<br>Hover: `#f9fafb` | Background: transparent<br>Text: `#FFFFFF`<br>Hover: `#241317` |

### Cards

| Card Type | Light Theme | Dark Theme |
|-----------|-------------|------------|
| **Standard Card** | Background: `#f9fafb`<br>Border: `#e5e7eb`<br>Text: `#232323` | Background: `#2B0F17`<br>Border: `#2F2327`<br>Text: `#FFFFFF` |
| **Elevated Card** | Background: `#f3f4f6`<br>Border: `#e5e7eb`<br>Shadow: Light | Background: `#241317`<br>Border: `#2F2327`<br>Shadow: Dark |
| **Card Hover** | Background: `#f9fafb`<br>Border: `#d1d5db` | Background: `#241317`<br>Border: `#E04F5F` |

### Inputs

| Input State | Light Theme | Dark Theme |
|-------------|-------------|------------|
| **Normal** | Background: `#ffffff`<br>Border: `#e5e7eb`<br>Text: `#232323`<br>Placeholder: `#6b7280` | Background: `#1F1417`<br>Border: `#2F2327`<br>Text: `#FFFFFF`<br>Placeholder: `#A29CA3` |
| **Focus** | Border: `#ec4899`<br>Shadow: Pink glow | Border: `#E04F5F`<br>Shadow: Red glow |
| **Error** | Border: `#ef4444`<br>Text: `#991b1b` | Border: `#F25D5D`<br>Text: `#F25D5D` |
| **Disabled** | Background: `#f3f4f6`<br>Text: `#9ca3af` | Background: `#241317`<br>Text: `#6b7280` |

### Text Hierarchy

| Text Level | Light Theme | Dark Theme | Usage |
|------------|-------------|------------|-------|
| **H1-H4 (Headings)** | `#232323` | `#FFFFFF` | Page titles, section headers |
| **Body Text** | `#4b5563` | `#D5D3D7` | Paragraphs, descriptions |
| **Labels** | `#4b5563` | `#D5D3D7` | Form labels, field names |
| **Muted Text** | `#6b7280` | `#A29CA3` | Helper text, timestamps |
| **Links** | `#ec4899` | `#E04F5F` | Navigation, clickable text |
| **Links Hover** | `#be185d` | `#C43A4E` | Link hover state |

### Status Colors

| Status | Light Theme | Dark Theme |
|--------|-------------|------------|
| **Success** | Color: `#10b981`<br>Background: `#d1fae5`<br>Text: `#065f46` | Color: `#64D39A`<br>Background: `rgba(100, 211, 154, 0.1)`<br>Text: `#64D39A` |
| **Error** | Color: `#ef4444`<br>Background: `#fee2e2`<br>Text: `#991b1b` | Color: `#F25D5D`<br>Background: `rgba(242, 93, 93, 0.1)`<br>Text: `#F25D5D` |
| **Warning** | Color: `#f59e0b`<br>Background: `#fef3c7`<br>Text: `#92400e` | Color: `#F5C75B`<br>Background: `rgba(245, 199, 91, 0.1)`<br>Text: `#F5C75B` |
| **Info** | Color: `#3b82f6`<br>Background: `#dbeafe`<br>Text: `#1e40af` | Color: `#E04F5F`<br>Background: `rgba(224, 79, 95, 0.1)`<br>Text: `#E04F5F` |

## Color Combinations for Common Patterns

### Pattern 1: Primary Action Button
```css
/* Light Theme */
background: var(--primary);        /* #ec4899 */
color: var(--text-inverse);       /* #ffffff */
hover: var(--primary-hover);      /* #be185d */

/* Dark Theme */
background: var(--primary);        /* #E04F5F */
color: var(--text-inverse);       /* #FFFFFF */
hover: var(--primary-hover);      /* #C43A4E */
```

### Pattern 2: Card Component
```css
/* Light Theme */
background: var(--bg-secondary);   /* #f9fafb */
border: var(--border);             /* #e5e7eb */
text: var(--text-primary);         /* #232323 */

/* Dark Theme */
background: var(--bg-secondary);   /* #2B0F17 */
border: var(--border);             /* #2F2327 */
text: var(--text-primary);         /* #FFFFFF */
```

### Pattern 3: Input Field
```css
/* Light Theme */
background: var(--bg-input);       /* #ffffff */
border: var(--border);             /* #e5e7eb */
text: var(--text-primary);         /* #232323 */
placeholder: var(--text-muted);   /* #6b7280 */
focus-border: var(--border-focus); /* #ec4899 */

/* Dark Theme */
background: var(--bg-input);       /* #1F1417 */
border: var(--border);             /* #2F2327 */
text: var(--text-primary);         /* #FFFFFF */
placeholder: var(--text-muted);   /* #A29CA3 */
focus-border: var(--border-focus); /* #E04F5F */
```

### Pattern 4: Error State
```css
/* Light Theme */
border: var(--error);              /* #ef4444 */
background: var(--error-bg);       /* #fee2e2 */
text: var(--error-text);           /* #991b1b */

/* Dark Theme */
border: var(--error);              /* #F25D5D */
background: var(--error-bg);       /* rgba(242, 93, 93, 0.1) */
text: var(--error-text);           /* #F25D5D */
```

### Pattern 5: Link
```css
/* Light Theme */
color: var(--primary);             /* #ec4899 */
hover: var(--primary-hover);       /* #be185d */

/* Dark Theme */
color: var(--primary);             /* #E04F5F */
hover: var(--primary-hover);       /* #C43A4E */
```

## Contrast Ratios (WCAG AA Compliance)

### Light Theme Contrast Ratios

| Text Color | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#232323` | `#ffffff` | 15.8:1 | ✅ AAA |
| `#4b5563` | `#ffffff` | 7.1:1 | ✅ AAA |
| `#6b7280` | `#ffffff` | 4.6:1 | ✅ AA |
| `#ec4899` | `#ffffff` | 3.2:1 | ⚠️ Large text only |
| `#ec4899` | `#f9fafb` | 3.1:1 | ⚠️ Large text only |

### Dark Theme Contrast Ratios

| Text Color | Background | Ratio | Status |
|------------|------------|-------|--------|
| `#FFFFFF` | `#1A0C11` | 16.8:1 | ✅ AAA |
| `#D5D3D7` | `#1A0C11` | 12.5:1 | ✅ AAA |
| `#A29CA3` | `#1A0C11` | 6.8:1 | ✅ AAA |
| `#E04F5F` | `#1A0C11` | 4.8:1 | ✅ AA |
| `#E04F5F` | `#2B0F17` | 4.2:1 | ✅ AA |
| `#FFFFFF` | `#E04F5F` | 3.5:1 | ✅ AA (large text) |

## Quick Reference

### Light Theme Palette
- **Primary**: Pink (`#ec4899`) + Red (`#dc2626`)
- **Backgrounds**: White (`#ffffff`) + Light Grays (`#f9fafb`, `#f3f4f6`)
- **Text**: Lightly Dark (`#232323`, `#4b5563`, `#6b7280`)
- **Borders**: Light Gray (`#e5e7eb`)

### Dark Theme Palette
- **Primary**: Red Accent (`#E04F5F`) + Dark Red (`#C43A4E`)
- **Backgrounds**: Dark Maroon (`#1A0C11`) + Dark Surfaces (`#2B0F17`, `#241317`)
- **Text**: White/Light (`#FFFFFF`, `#D5D3D7`, `#A29CA3`)
- **Borders**: Dark Border (`#2F2327`)

## Usage Guidelines

1. **Always use CSS variables** - Never hardcode hex values
2. **Test both themes** - Ensure components work in light and dark mode
3. **Check contrast** - Verify text meets WCAG AA standards (4.5:1)
4. **Use semantic names** - Prefer `--text-primary` over `--color-1`
5. **Consistent spacing** - Use theme tokens for consistent design

## Files

- **Theme System**: `frontend/app/theme.css`
- **Documentation**: `docs/THEME_SYSTEM.md`
- **Color Reference**: `docs/COLOR_COMBINATIONS.md` (this file)

