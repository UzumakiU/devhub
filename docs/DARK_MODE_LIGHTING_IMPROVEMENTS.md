# Dark Mode Lighting Improvements

## Changes Made to Lighten Dark Mode

### Background Colors (Before → After)
- `--background`: `#0a0a0a` → `#1a1a1a` (Much lighter main background)
- `--card`: `#111827` → `#262626` (Lighter card backgrounds)
- `--popover`: `#111827` → `#262626` (Lighter popup backgrounds)

### Secondary Elements
- `--secondary`: `#1e293b` → `#374151` (Lighter secondary backgrounds)
- `--muted`: `#1e293b` → `#374151` (Lighter muted backgrounds)
- `--input`: `#1e293b` → `#374151` (Lighter input backgrounds)

### Text Contrast
- `--muted-foreground`: `#cbd5e1` → `#d1d5db` (Slightly brighter muted text)
- `--accent-foreground`: `#0a0a0a` → `#1a1a1a` (Updated for new background)
- `--stats-neutral`: `#94a3b8` → `#9ca3af` (Better neutral stats color)

### Enhanced Elements
- **Status badges**: Increased opacity from 0.2 to 0.25 for better visibility
- **Table hover**: Increased opacity from 0.08 to 0.12 for clearer hover states
- **Gray backgrounds**: `#374151` → `#4b5563` for better contrast
- **Borders**: Added subtle cyan borders with increased opacity
- **Shadows**: Enhanced with better contrast for the lighter background

## Visual Impact

### Before:
- Very dark background (#0a0a0a) - almost black
- Hard to distinguish between different UI elements
- Status badges barely visible
- Poor contrast for secondary text

### After:
- Lighter background (#1a1a1a) - charcoal gray
- Clear distinction between background, cards, and elements
- Status badges more visible with better opacity
- Improved text contrast across all elements
- Maintains the cyan theme while improving readability

## Testing

You can now test the improvements at: http://localhost:3005

The dark mode should feel:
- **Brighter** overall while keeping the dark aesthetic
- **More readable** with better text contrast
- **Clearer** distinction between UI elements
- **More accessible** with improved status color visibility

Switch between light and dark modes to see the enhanced contrast!
