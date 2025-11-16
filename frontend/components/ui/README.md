# UI Component Library

A collection of reusable, consistent UI components built with React and Tailwind CSS, using CSS variables from the theme system.

## Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary" isLoading={true}>Loading</Button>
<Button variant="outline" leftIcon={<Icon />}>With Icon</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

### Card
A flexible card component for content containers.

```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" padding="lg">
  Content here
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'flat'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean

### Badge
Display badges, tags, or labels.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="primary" size="md">New</Badge>
<Badge variant="success" dot>Active</Badge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean

### Input
Form input with label, error, and icon support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error={errors.email}
  leftIcon={<MailIcon />}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `fullWidth`: boolean

### Typography
Consistent typography component.

```tsx
import { Typography } from '@/components/ui';

<Typography variant="h1" color="primary">Heading</Typography>
<Typography variant="body" color="muted">Body text</Typography>
```

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption'
- `as`: HTML tag to render
- `color`: 'primary' | 'secondary' | 'muted' | 'inverse'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `align`: 'left' | 'center' | 'right'

### Spacing
Utility component for consistent spacing.

```tsx
import { Spacing } from '@/components/ui';

<Spacing size="md" />
<Spacing size="lg" horizontal />
```

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `horizontal`: boolean

## Theme Variables

All components use CSS variables from `theme.css`:
- `--primary`, `--primary-hover`, `--primary-active`
- `--accent`, `--accent-hover`
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- `--bg`, `--bg-secondary`, `--bg-tertiary`
- `--border`, `--border-light`, `--border-dark`
- `--success`, `--error`, `--warning`, `--info`

## Usage Guidelines

1. **Always use theme variables** - Don't hardcode colors
2. **Use semantic variants** - Choose variants based on meaning, not appearance
3. **Maintain consistency** - Use these components instead of custom styles
4. **Accessibility** - All components include proper ARIA attributes
5. **Responsive** - Components are mobile-first and responsive

## Migration Guide

When refactoring existing components:

1. Replace custom button styles with `<Button>`
2. Replace card divs with `<Card>`
3. Replace badge spans with `<Badge>`
4. Replace input elements with `<Input>`
5. Use `<Typography>` for consistent text styling

