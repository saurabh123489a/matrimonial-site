# UI Refactoring Guide

## Overview

This document outlines the UI refactoring initiative to improve consistency, maintainability, and developer experience across the application.

## Goals

1. **Consistency**: Standardize UI patterns across all components
2. **Maintainability**: Reduce code duplication and improve reusability
3. **Theme Integration**: Better use of CSS variables from theme system
4. **Developer Experience**: Easier to use, well-documented components
5. **Accessibility**: Built-in accessibility features

## New UI Component Library

Located in `frontend/components/ui/`, this library provides:

### Core Components

- **Button**: Consistent button styling with variants
- **Card**: Flexible container component
- **Badge**: Labels and tags
- **Input**: Form inputs with validation
- **Typography**: Consistent text styling
- **Spacing**: Utility spacing component

### Benefits

- ✅ Uses theme CSS variables
- ✅ Consistent styling across app
- ✅ Built-in accessibility
- ✅ Responsive by default
- ✅ TypeScript support
- ✅ Easy to extend

## Migration Strategy

### Phase 1: Create Component Library ✅
- [x] Create Button component
- [x] Create Card component
- [x] Create Badge component
- [x] Create Input component
- [x] Create Typography component
- [x] Create Spacing component
- [x] Create documentation

### Phase 2: Refactor Core Components (In Progress)
- [ ] Refactor EmptyState (example done)
- [ ] Refactor ProfileCard components
- [ ] Refactor form components
- [ ] Refactor button usage across app

### Phase 3: Standardize Patterns
- [ ] Create shared styles utilities
- [ ] Standardize spacing system
- [ ] Standardize color usage
- [ ] Update all components to use new library

## Usage Examples

### Before (Old Pattern)
```tsx
<button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
  Click me
</button>
```

### After (New Pattern)
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click me
</Button>
```

### Before (Old Card)
```tsx
<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
  Content
</div>
```

### After (New Card)
```tsx
import { Card } from '@/components/ui';

<Card variant="default" padding="md">
  Content
</Card>
```

## Component Guidelines

### When to Use UI Components

✅ **DO**:
- Use UI components for common patterns
- Extend UI components for specific needs
- Use theme variables for colors
- Follow component prop patterns

❌ **DON'T**:
- Hardcode colors or spacing
- Create duplicate button/card styles
- Bypass UI components for common patterns
- Mix old and new patterns in same component

## Next Steps

1. Continue refactoring components to use UI library
2. Update existing components incrementally
3. Add more components as needed (Select, Modal, etc.)
4. Create component showcase/storybook
5. Update team documentation

## Resources

- UI Component Library: `frontend/components/ui/`
- Component Documentation: `frontend/components/ui/README.md`
- Theme Variables: `frontend/app/theme.css`

