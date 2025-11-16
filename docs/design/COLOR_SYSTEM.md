# Color System Documentation

## Overview
This document defines the consistent color system used throughout the Matrimonial Site application. All colors follow WCAG AA accessibility standards (4.5:1 contrast ratio minimum).

## Color Palette

### Primary Colors
**Primary Color (Pink)**
- **Purpose**: Main brand color, primary actions, links, active states
- **Light Mode**: 
  - Primary: `#ec4899` (Pink-500)
  - Primary Dark: `#be185d` (Pink-700) - for hover states
  - Primary Light: `#f9a8d4` (Pink-300) - for backgrounds/accents
- **Dark Mode**:
  - Primary: `#ff6584` (Pink-400)
  - Primary Dark: `#f2466c` (Pink-500)
  - Primary Light: `#ff8fa3` (Pink-300)
- **Usage**: Buttons, links, active states, brand elements, CTAs

### Secondary Colors
**Secondary Color (Gray)**
- **Purpose**: Supporting elements, borders, backgrounds, text
- **Light Mode**:
  - Secondary: `#6b7280` (Gray-500) - for text
  - Secondary Dark: `#374151` (Gray-700) - for headings
  - Secondary Light: `#f3f4f6` (Gray-100) - for backgrounds
- **Dark Mode**:
  - Secondary: `#9ca3af` (Gray-400) - for text
  - Secondary Dark: `#1a1c23` - for card backgrounds
  - Secondary Light: `#1f212a` - for elevated surfaces
- **Usage**: Text, borders, card backgrounds, dividers

### Accent Colors
**Accent Color (Red/Pink Gradient)**
- **Purpose**: Highlights, gradients, decorative elements
- **Light Mode**:
  - Accent: `#dc2626` (Red-600) - for accents
  - Accent Gradient: `from-pink-600 to-red-600`
- **Dark Mode**:
  - Accent: `#f472b6` (Pink-400) - for accents
  - Accent Gradient: `from-pink-500 to-pink-600`
- **Usage**: Gradients, decorative elements, highlights

## Background Colors

### Light Mode
- **Background**: `#ffffff` (White)
- **Background Secondary**: `#f9fafb` (Gray-50)
- **Background Tertiary**: `#f3f4f6` (Gray-100)

### Dark Mode
- **Background**: `#0f1117` (Dark Blue-Gray)
- **Background Secondary**: `#181b23` (Card backgrounds)
- **Background Tertiary**: `#1f212a` (Elevated surfaces)

## Text Colors

### Light Mode
- **Primary Text**: `#171717` (Gray-900)
- **Secondary Text**: `#6b7280` (Gray-500)
- **Muted Text**: `#9ca3af` (Gray-400)

### Dark Mode
- **Primary Text**: `#f5f6f9` (Light Gray)
- **Secondary Text**: `#9ca3af` (Gray-400)
- **Muted Text**: `#6b7280` (Gray-500)

## Status Colors

### Success
- **Light**: `#10b981` (Green-500)
- **Dark**: `#34d399` (Green-400)

### Error/Warning
- **Light**: `#ef4444` (Red-500)
- **Dark**: `#f87171` (Red-400)

### Info
- **Light**: `#3b82f6` (Blue-500)
- **Dark**: `#60a5fa` (Blue-400)

## Gradient Definitions

### Primary Gradient
- **Light Mode**: `bg-gradient-to-r from-pink-600 to-red-600`
- **Dark Mode**: `bg-gradient-to-r from-pink-500 to-pink-600`
- **Usage**: Hero sections, CTAs, decorative elements

### Background Gradients
- **Light Mode**: `bg-gradient-to-br from-pink-50 via-white to-purple-50`
- **Dark Mode**: `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`
- **Usage**: Page backgrounds, card backgrounds

## Usage Guidelines

### Buttons
- **Primary Button**: Use `bg-pink-600` with `text-white`
- **Secondary Button**: Use `bg-gray-200 dark:bg-gray-700` with `text-gray-700 dark:text-gray-300`
- **Hover State**: Use `hover:bg-pink-700` for primary buttons

### Links
- **Default**: `text-pink-600 dark:text-pink-400`
- **Hover**: `hover:text-pink-700 dark:hover:text-pink-300`
- **Visited**: Same as default

### Borders
- **Light Mode**: `border-gray-200` or `border-gray-300`
- **Dark Mode**: `border-gray-700` or `border-gray-600`

### Focus States
- **Focus Ring**: `focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`
- **Focus Outline**: `outline: 2px solid #ec4899`

## CSS Variables

All colors are defined in `frontend/app/globals.css` using CSS variables:

```css
:root {
  --primary: #ec4899;
  --primary-dark: #be185d;
  --primary-light: #f9a8d4;
  --secondary: #6b7280;
  --accent: #dc2626;
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --primary: #ff6584;
  --primary-dark: #f2466c;
  --primary-light: #ff8fa3;
  --secondary: #9ca3af;
  --accent: #f472b6;
  --background: #0f1117;
  --foreground: #f5f6f9;
}
```

## Tailwind Color Classes

### Primary Colors
- `bg-pink-600` / `text-pink-600` - Primary color
- `bg-pink-700` / `text-pink-700` - Primary dark (hover)
- `bg-pink-500` / `text-pink-500` - Primary medium
- `bg-pink-400` / `text-pink-400` - Primary light
- `bg-pink-300` / `text-pink-300` - Primary lighter

### Secondary Colors
- `bg-gray-700` / `text-gray-700` - Secondary dark
- `bg-gray-500` / `text-gray-500` - Secondary medium
- `bg-gray-400` / `text-gray-400` - Secondary light
- `bg-gray-100` / `text-gray-100` - Secondary lighter

### Accent Colors
- `bg-red-600` / `text-red-600` - Accent color
- `bg-red-500` / `text-red-500` - Accent medium

## Accessibility

All color combinations meet WCAG AA standards:
- **Normal Text**: 4.5:1 contrast ratio minimum
- **Large Text**: 3:1 contrast ratio minimum
- **Interactive Elements**: Clear focus indicators
- **Color Blindness**: Not relying solely on color for information

## Examples

### Primary Button
```tsx
<button className="bg-pink-600 text-white hover:bg-pink-700 focus:ring-2 focus:ring-pink-500">
  Click Me
</button>
```

### Secondary Button
```tsx
<button className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
  Cancel
</button>
```

### Link
```tsx
<a href="#" className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300">
  Learn More
</a>
```

### Gradient Background
```tsx
<div className="bg-gradient-to-r from-pink-600 to-red-600">
  Content
</div>
```

## Migration Notes

When updating existing components:
1. Replace mixed pink/purple/magenta gradients with primary gradient
2. Use consistent pink shades (pink-600, pink-700, pink-500)
3. Replace black backgrounds with dark mode background colors
4. Ensure all text meets contrast requirements
5. Use CSS variables where possible for theme support

