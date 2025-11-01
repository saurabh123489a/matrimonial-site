# Sliding Notifications System

## Overview
A beautiful, sliding notification/toast system that replaces traditional browser alerts with smooth, animated notifications that slide in from the right side of the screen.

## Features

### ✅ Animation
- **Slide-in Effect**: Notifications slide in from the right side
- **Smooth Transitions**: 300ms animation duration
- **Auto-dismiss**: Automatically closes after specified duration (default: 5 seconds)
- **Manual Close**: Users can click the X button to dismiss

### 📱 Responsive Design
- **Mobile-friendly**: Adapts to screen size
- **Proper spacing**: Top-right positioning with responsive padding
- **Multiple notifications**: Stacks vertically with proper spacing

### 🌐 Internationalization
- **Bilingual Support**: English and Hindi
- **Auto-detection**: Uses current language setting
- **Proper Text Direction**: Supports RTL/LTR text

### 🎨 Four Types
1. **Success** (Green) - ✅
2. **Error** (Red) - ❌
3. **Info** (Blue) - ℹ️
4. **Warning** (Yellow) - ⚠️

## Usage

### Basic Usage

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useNotifications();

  const handleAction = async () => {
    try {
      // Your action here
      showSuccess('Operation completed successfully!');
    } catch (error) {
      showError('Something went wrong');
    }
  };
}
```

### Advanced Usage

```typescript
const { showNotification } = useNotifications();

// Custom notification with title
showNotification({
  type: 'success',
  message: 'Profile updated successfully',
  title: 'Success',
  duration: 3000, // 3 seconds
});
```

## API Reference

### `useNotifications()` Hook

Returns an object with the following methods:

#### `showSuccess(message: string, title?: string)`
Display a success notification.

```typescript
showSuccess('Login successful!');
showSuccess('Profile saved', 'Success');
```

#### `showError(message: string, title?: string)`
Display an error notification.

```typescript
showError('Failed to save changes');
showError('Network error', 'Error');
```

#### `showInfo(message: string, title?: string)`
Display an info notification.

```typescript
showInfo('New feature available');
```

#### `showWarning(message: string, title?: string)`
Display a warning notification.

```typescript
showWarning('Please fill all required fields');
```

#### `showNotification(notification: Notification)`
Display a custom notification with full control.

```typescript
showNotification({
  type: 'success',
  message: 'Custom message',
  title: 'Custom Title',
  duration: 10000, // 10 seconds
});
```

## Integration Examples

### Replacing `alert()` Calls

**Before:**
```typescript
if (success) {
  alert('✅ Success!');
} else {
  alert('❌ Error occurred');
}
```

**After:**
```typescript
const { showSuccess, showError } = useNotifications();

if (success) {
  showSuccess('Success!');
} else {
  showError('Error occurred');
}
```

### API Error Handling

```typescript
const { showError } = useNotifications();

try {
  const response = await api.updateProfile(data);
  if (response.status) {
    showSuccess('Profile updated');
  }
} catch (error: any) {
  showError(error.response?.data?.message || 'Failed to update profile');
}
```

### Form Validation

```typescript
const { showError, showWarning } = useNotifications();

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.email) {
    showWarning('Email is required');
    return;
  }
  
  if (!isValidEmail(formData.email)) {
    showError('Invalid email format');
    return;
  }
  
  // Submit form
};
```

## Component Structure

### NotificationContext
- **Location**: `frontend/contexts/NotificationContext.tsx`
- **Purpose**: Global state management for notifications
- **Provider**: Wraps the entire app in `layout.tsx`

### ToastNotification
- **Location**: `frontend/components/ToastNotification.tsx`
- **Purpose**: Individual notification component
- **Features**: Animations, icons, close button

## Styling

### Colors by Type
- **Success**: `border-green-500`
- **Error**: `border-red-500`
- **Info**: `border-blue-500`
- **Warning**: `border-yellow-500`

### Animation Classes
- **Enter**: `translate-x-0 opacity-100`
- **Exit**: `translate-x-full opacity-0`
- **Duration**: `duration-300` (300ms)

### Positioning
- **Desktop**: `top-4 right-4`
- **Mobile**: `top-4 right-4 px-4` (with padding)

## Accessibility

- **ARIA Labels**: Proper `role="alert"` and `aria-live="polite"`
- **Keyboard Support**: Close button is keyboard accessible
- **Screen Reader**: Announcements work with screen readers

## Configuration

### Default Duration
```typescript
// Default: 5000ms (5 seconds)
showNotification({
  type: 'success',
  message: 'Message',
  duration: 5000, // Optional
});
```

### Custom Duration
```typescript
// Short notification (2 seconds)
showInfo('Quick info', undefined, 2000);

// Long notification (10 seconds)
showWarning('Important warning', undefined, 10000);
```

## Best Practices

1. **Use appropriate types**:
   - Success for completed actions
   - Error for failures
   - Info for informational messages
   - Warning for cautionary messages

2. **Keep messages concise**: Notifications should be brief and clear

3. **Avoid overuse**: Don't show notifications for every minor action

4. **Handle errors gracefully**: Always show error notifications for failed operations

5. **Use translations**: Messages should use the translation system for i18n support

## Examples

### Login Success
```typescript
const { showSuccess } = useNotifications();
showSuccess(t('auth.loginSuccess'));
```

### API Error
```typescript
const { showError } = useNotifications();
showError(error.response?.data?.message || t('common.error'));
```

### Form Validation
```typescript
const { showWarning } = useNotifications();
if (!email) {
  showWarning(t('auth.emailRequired'));
}
```

### Copy to Clipboard
```typescript
const { showSuccess } = useNotifications();
navigator.clipboard.writeText(text);
showSuccess('Copied to clipboard!');
```

## Migration Guide

To migrate from `alert()` to notifications:

1. Import the hook:
```typescript
import { useNotifications } from '@/contexts/NotificationContext';
```

2. Use in component:
```typescript
const { showSuccess, showError } = useNotifications();
```

3. Replace alerts:
```typescript
// Before
alert('Success!');

// After
showSuccess('Success!');
```

## Future Enhancements

- [ ] Queue system for multiple notifications
- [ ] Action buttons in notifications
- [ ] Progress indicators
- [ ] Sound notifications (optional)
- [ ] Notification history
- [ ] Different positions (top-left, bottom-right, etc.)
- [ ] Swipe to dismiss on mobile


