# Typography System Documentation

## Overview
This document defines the typography system used throughout the Matrimonial Site application. All typography follows WCAG AA accessibility standards with proper contrast ratios and readable line heights.

## Type Scale

### Heading Hierarchy

#### H1 - Page Titles
- **Font Size**: 
  - Mobile: `2.5rem` (40px) / `text-4xl`
  - Tablet: `3rem` (48px) / `text-5xl`
  - Desktop: `3.75rem` (60px) / `text-6xl`
- **Font Weight**: `700` (Bold) / `font-bold`
- **Line Height**: `1.1` (Tight for large headings)
- **Letter Spacing**: `-0.02em` (Slightly tighter)
- **Usage**: Main page titles, hero headings
- **Example Classes**: `text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight`

#### H2 - Section Headings
- **Font Size**: 
  - Mobile: `1.875rem` (30px) / `text-3xl`
  - Tablet: `2.25rem` (36px) / `text-4xl`
  - Desktop: `2.5rem` (40px) / `text-5xl`
- **Font Weight**: `600` (Semibold) / `font-semibold`
- **Line Height**: `1.2` (Tight but readable)
- **Letter Spacing**: `-0.01em`
- **Usage**: Major section headings, feature titles
- **Example Classes**: `text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight`

#### H3 - Subsection Headings
- **Font Size**: 
  - Mobile: `1.5rem` (24px) / `text-2xl`
  - Tablet: `1.75rem` (28px) / `text-3xl`
  - Desktop: `2rem` (32px) / `text-4xl`
- **Font Weight**: `600` (Semibold) / `font-semibold`
- **Line Height**: `1.3` (Comfortable)
- **Letter Spacing**: `0` (Normal)
- **Usage**: Subsection headings, card titles
- **Example Classes**: `text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug`

#### H4 - Minor Headings
- **Font Size**: 
  - Mobile: `1.25rem` (20px) / `text-xl`
  - Tablet: `1.5rem` (24px) / `text-2xl`
  - Desktop: `1.5rem` (24px) / `text-2xl`
- **Font Weight**: `600` (Semibold) / `font-semibold`
- **Line Height**: `1.4` (Comfortable)
- **Usage**: Form section titles, small card headings
- **Example Classes**: `text-xl sm:text-2xl font-semibold leading-normal`

### Body Text

#### Large Body Text
- **Font Size**: `1.125rem` (18px) / `text-lg`
- **Font Weight**: `400` (Regular) / `font-normal`
- **Line Height**: `1.7` (Comfortable for reading)
- **Usage**: Lead paragraphs, important descriptions
- **Example Classes**: `text-lg leading-relaxed`

#### Regular Body Text
- **Font Size**: `1rem` (16px) / `text-base`
- **Font Weight**: `400` (Regular) / `font-normal`
- **Line Height**: `1.6` (Optimal for reading)
- **Usage**: Standard paragraphs, content text
- **Example Classes**: `text-base leading-relaxed`

#### Small Body Text
- **Font Size**: `0.875rem` (14px) / `text-sm`
- **Font Weight**: `400` (Regular) / `font-normal`
- **Line Height**: `1.5` (Tighter but readable)
- **Usage**: Captions, helper text, labels
- **Example Classes**: `text-sm leading-normal`

#### Extra Small Text
- **Font Size**: `0.75rem` (12px) / `text-xs`
- **Font Weight**: `400` (Regular) / `font-normal`
- **Line Height**: `1.4`
- **Usage**: Fine print, timestamps, metadata
- **Example Classes**: `text-xs leading-normal`

## Font Weights

- **Light (300)**: `font-light` - Used sparingly for large display text
- **Regular (400)**: `font-normal` - Default for body text
- **Medium (500)**: `font-medium` - Emphasized text, labels
- **Semibold (600)**: `font-semibold` - Headings H2-H4, important text
- **Bold (700)**: `font-bold` - H1 headings, strong emphasis

## Line Heights

- **Tight (1.1)**: `leading-tight` - Large headings (H1)
- **Snug (1.2)**: `leading-snug` - Medium headings (H2)
- **Normal (1.3-1.4)**: `leading-normal` - Small headings (H3-H4)
- **Relaxed (1.6-1.7)**: `leading-relaxed` - Body text for optimal readability
- **Loose (1.8)**: `leading-loose` - Spacious text (rarely used)

## Color Contrast

### Light Mode
- **Headings**: `text-gray-900` (#171717) - 16.5:1 contrast on white
- **Body Text**: `text-gray-800` (#1f2937) - 15.3:1 contrast on white
- **Secondary Text**: `text-gray-600` (#4b5563) - 7.1:1 contrast on white
- **Muted Text**: `text-gray-500` (#6b7280) - 5.1:1 contrast on white (meets AA)

### Dark Mode
- **Headings**: `text-gray-50` (#f9fafb) - 16.5:1 contrast on dark background
- **Body Text**: `text-gray-100` (#f3f4f6) - 15.3:1 contrast on dark background
- **Secondary Text**: `text-gray-300` (#d1d5db) - 9.1:1 contrast on dark background
- **Muted Text**: `text-gray-400` (#9ca3af) - 6.5:1 contrast on dark background

**Note**: Avoid using `dark:text-pink-200` for body text as it may not meet contrast requirements. Use `dark:text-gray-100` or `dark:text-gray-200` instead.

## Responsive Typography

All headings scale responsively:
- **Mobile First**: Start with smaller sizes
- **Tablet Breakpoint** (`sm:`): Increase by one size step
- **Desktop Breakpoint** (`lg:`): Increase by another size step

Example:
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
  Page Title
</h1>
```

## Usage Guidelines

### Headings
1. **Use H1 once per page** - Main page title
2. **Use H2 for major sections** - Features, main content sections
3. **Use H3 for subsections** - Within H2 sections
4. **Use H4 for minor headings** - Form sections, card titles
5. **Maintain hierarchy** - Don't skip levels (H1 → H3 is wrong, use H1 → H2 → H3)

### Body Text
1. **Use `leading-relaxed` for paragraphs** - Improves readability
2. **Use `leading-normal` for short text** - Labels, captions
3. **Maintain consistent line heights** - Don't mix different line heights in same section

### Font Weights
1. **Don't overuse bold** - Reserve for H1 and strong emphasis
2. **Use semibold for headings** - H2-H4 should use `font-semibold`
3. **Use medium for labels** - Form labels, important inline text

## CSS Classes

### Heading Classes
```tsx
// H1
className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"

// H2
className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"

// H3
className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-snug"

// H4
className="text-xl sm:text-2xl font-semibold leading-normal"
```

### Body Text Classes
```tsx
// Large Body
className="text-lg leading-relaxed text-gray-800 dark:text-gray-100"

// Regular Body
className="text-base leading-relaxed text-gray-800 dark:text-gray-100"

// Small Body
className="text-sm leading-normal text-gray-600 dark:text-gray-300"

// Extra Small
className="text-xs leading-normal text-gray-500 dark:text-gray-400"
```

## Examples

### Page Header
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 mb-6">
  Welcome to Our Platform
</h1>
<p className="text-lg sm:text-xl leading-relaxed text-gray-700 dark:text-gray-200 mb-8">
  Your journey to finding the perfect match starts here.
</p>
```

### Section Heading
```tsx
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-gray-900 dark:text-gray-50 mb-4">
  Features
</h2>
<p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
  Discover what makes us different.
</p>
```

### Card Title
```tsx
<h3 className="text-2xl sm:text-3xl font-semibold leading-snug text-gray-900 dark:text-gray-50 mb-2">
  Profile Information
</h3>
<p className="text-sm leading-normal text-gray-600 dark:text-gray-300">
  Manage your personal details.
</p>
```

### Form Label
```tsx
<label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
  Full Name
</label>
```

## Accessibility

- **Minimum Contrast**: All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- **Line Height**: Minimum 1.5 for body text to improve readability
- **Font Size**: Minimum 14px (0.875rem) for body text
- **Spacing**: Adequate spacing between headings and paragraphs (minimum 1rem)

## Migration Notes

When updating existing components:
1. Replace inconsistent heading sizes with standardized scale
2. Update H2 from `text-lg` to `text-3xl sm:text-4xl lg:text-5xl`
3. Replace `dark:text-pink-200` with `dark:text-gray-100` or `dark:text-gray-200` for better contrast
4. Add `leading-relaxed` to all body text paragraphs
5. Use `font-semibold` for H2-H4 instead of `font-bold` or `font-light`
6. Ensure H1 uses `font-bold` for maximum distinction

