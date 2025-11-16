# Responsive Design System

## Overview
This document outlines the comprehensive responsive design system implemented across the Matrimonial Site application, ensuring optimal user experience across all device sizes.

## Breakpoints

### Mobile First Approach
The application uses a mobile-first responsive design strategy with the following breakpoints:

- **Mobile**: `< 640px` (Default)
- **Small Tablet**: `≥ 640px` (sm:)
- **Tablet**: `≥ 768px` (md:)
- **Desktop**: `≥ 1024px` (lg:)
- **Large Desktop**: `≥ 1280px` (xl:)
- **Extra Large**: `≥ 1536px` (2xl:)

## Responsive Utilities

### Container Utilities
```css
.container-responsive
```
- Automatically adjusts padding and max-width based on screen size
- Mobile: 16px padding, full width
- Tablet: 24px padding, max-width 768px
- Desktop: 32px padding, max-width 1280px+

### Typography Utilities
```css
.text-responsive-xs    /* 12px → 14px → 14px */
.text-responsive-sm    /* 14px → 16px → 16px */
.text-responsive-base  /* 16px → 18px → 18px */
.text-responsive-lg    /* 18px → 20px → 24px */
.text-responsive-xl    /* 20px → 24px → 30px */
.text-responsive-2xl   /* 24px → 30px → 36px */
.text-responsive-3xl   /* 30px → 36px → 48px */
.text-responsive-4xl   /* 36px → 48px → 60px */
```

### Spacing Utilities
```css
.spacing-responsive
```
- Mobile: 16px padding
- Tablet: 24px padding
- Desktop: 32px padding

### Grid Utilities
```css
.grid-responsive
```
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Large Desktop: 4 columns

### Touch Targets
```css
.touch-target
```
- Mobile: Minimum 44x44px (Apple HIG standard)
- Desktop: Minimum 40x40px

### Hide/Show Utilities
```css
.hide-mobile        /* Hidden on mobile, visible on tablet+ */
.show-mobile-only   /* Visible on mobile only */
.hide-tablet        /* Hidden on tablet only */
.hide-desktop       /* Hidden on desktop */
```

## Component Guidelines

### Buttons
- Use `.btn-responsive` for automatic sizing
- Ensure minimum 44px height on mobile
- Use `touch-manipulation` class for better touch response

### Cards
- Use `.card-padding-responsive` for consistent padding
- Ensure cards stack vertically on mobile
- Use grid layouts for multiple cards on larger screens

### Images
- Use `.img-responsive` for automatic scaling
- Use `.img-responsive-container` for aspect ratio control
- Implement lazy loading for performance

### Modals/Dialogs
- Use `.modal-responsive` for proper sizing
- Mobile: 95% width, 90vh max height
- Tablet: 90% width, max 500px
- Desktop: 80% width, max 600px

## Safe Area Support

For devices with notches (iPhone X+):
```css
.safe-area-top
.safe-area-bottom
.safe-area-left
.safe-area-right
```

## Orientation Support

### Landscape Mode
```css
.landscape-compact  /* Reduced padding in landscape */
.landscape-hide     /* Hide elements in landscape */
```

## Best Practices

1. **Mobile First**: Always design for mobile first, then enhance for larger screens
2. **Touch Targets**: Ensure all interactive elements are at least 44x44px on mobile
3. **Readable Text**: Maintain minimum 16px font size for body text
4. **Spacing**: Use consistent spacing scale (8px base unit)
5. **Images**: Always set width: 100% and height: auto for responsive images
6. **Testing**: Test on actual devices, not just browser dev tools

## Testing Checklist

- [ ] Mobile (320px - 640px)
  - [ ] Text is readable without zooming
  - [ ] Buttons are easily tappable
  - [ ] Forms are usable
  - [ ] Navigation is accessible
  - [ ] Images scale properly

- [ ] Tablet (641px - 1024px)
  - [ ] Layout adapts appropriately
  - [ ] Grid columns adjust correctly
  - [ ] Touch targets remain accessible

- [ ] Desktop (1025px+)
  - [ ] Content doesn't stretch too wide
  - [ ] Hover states work properly
  - [ ] Multi-column layouts display correctly

## Common Patterns

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
  Title
</h1>
```

### Responsive Padding
```tsx
<div className="p-4 sm:p-6 lg:p-8">
  Content
</div>
```

### Conditional Rendering
```tsx
<div className="block sm:hidden">
  {/* Mobile only */}
</div>
<div className="hidden sm:block">
  {/* Tablet+ */}
</div>
```

