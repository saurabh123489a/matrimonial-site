# Maroon & Gold Theme Implementation

## Color Scheme Analysis

Based on the provided HTML design, the following color scheme has been implemented:

### Light Theme
- **Background**: `#F5F5DC` (Soft Cream)
- **Primary**: `#800020` (Deep Maroon)
- **Accent**: `#D4AF37` (Gold)
- **Text Primary**: `#800020` (Deep Maroon)
- **Text Secondary**: `#5a0017` (Darker Maroon)
- **Borders**: `rgba(128, 0, 32, 0.1)` (Maroon with 10% opacity)

### Dark Theme
- **Background**: `#2A000A` (Dark Maroon/Brown)
- **Primary**: `#800020` (Deep Maroon)
- **Accent**: `#D4AF37` (Gold)
- **Text Primary**: `#F5F5DC` (Soft Cream)
- **Text Secondary**: `#E8E8C8` (Light Cream)
- **Borders**: `rgba(212, 175, 55, 0.1)` (Gold with 10% opacity)

## Design Patterns

### Settings Page Structure
1. **Sticky Header**: Back button, centered title, placeholder for balance
2. **Sections**: Uppercase headings with spacing
3. **Setting Items**: 
   - Icon in circular background (gold accent)
   - Label text
   - Chevron or toggle switch
   - Hover states with background color change
4. **Toggle Switches**: Custom styled with gold accent when active
5. **Action Buttons**: Full-width buttons with maroon/gold colors

### Component Patterns
- **SettingItem**: Reusable component for list items
- **ToggleSwitch**: Custom toggle component matching design
- **Section Headings**: Uppercase, tracked, with opacity
- **Icons**: Circular backgrounds with gold accent color

## Implementation Details

### CSS Variables Updated
- All theme colors updated in `theme.css`
- Light theme uses cream background with maroon text
- Dark theme uses dark maroon background with cream text
- Gold accent used for interactive elements

### Settings Page Features
- Account Management section
- Privacy & Visibility section
- Notification Preferences section
- App Preferences section
- Legal & Support section
- Logout and Delete Account actions

### Responsive Design
- Mobile-first approach
- Touch-friendly targets (min 44x44px)
- Proper spacing and padding
- Backdrop blur on header

## Usage

The theme is automatically applied through CSS variables. Components use:
- `bg-[#F5F5DC]` / `dark:bg-[#2A000A]` for backgrounds
- `text-[#800020]` / `dark:text-[#F5F5DC]` for text
- `bg-[#800020]/5` / `dark:bg-[#D4AF37]/5` for item backgrounds
- `border-[#800020]/10` / `dark:border-[#D4AF37]/10` for borders

