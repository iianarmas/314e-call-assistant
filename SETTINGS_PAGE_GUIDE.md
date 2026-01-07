# Settings Page Guide

## Overview
A new Settings page has been added where you can configure your personal information that's used in script variables.

---

## How to Access

Click **Settings** in the navigation menu (top of the page), or navigate to `/settings`

---

## What You Can Configure

### 1. Full Name
- Used for `{{rep.name}}` variable
- Example: "Chris Johnson"
- Shows your full name in scripts

### 2. First Name (Optional)
- Used for `{{rep.first_name}}` variable
- If left empty, automatically extracts from Full Name
- Example: "Chris"

### 3. Company Name
- Used for `{{rep.company}}` variable
- Example: "Dexit Solutions"
- Your company name in scripts

---

## Features

### Live Preview
- See how your information will appear in scripts
- Updates in real-time as you type
- Shows example script with your variables

### Available Variables Display
- Complete list of all variables you can use
- Organized by category:
  - Sales Rep (You)
  - Contact Info
  - Product Info
  - Context (from notes)

### Clear Cache
- Fix issues with outdated data
- Useful if contact names aren't updating
- Click "Clear Cache & Reload" button

---

## How It Works

### Saving Settings
1. Fill in your information
2. Click "Save Settings"
3. Settings are saved to localStorage
4. You'll see "✓ Saved successfully!" confirmation

### Where Settings Are Stored
- **localStorage** on your browser
- Persists across sessions
- Syncs across all scripts and call flows

### Using in Scripts
Once saved, your information automatically replaces variables:

**Before** (in script):
```
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}.
```

**After** (during call):
```
Hi John, this is Chris Johnson from Dexit Solutions.
```

---

## Fixing Common Issues

### Issue 1: Variables Still Show Old Name

**Problem**: `{{rep.name}}` still shows "Sarah Johnson" even after editing scriptVariables.js

**Solution**:
1. Go to Settings page
2. Enter your name and company
3. Click "Save Settings"
4. Refresh any open call pages

**Why**: The default in scriptVariables.js is only used as a fallback. localStorage takes priority.

### Issue 2: Contact Name Not Updating in Call Page

**Problem**: Changed contact name but call page shows old name

**Solutions**:
1. **Hard refresh**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Use Clear Cache**: Go to Settings → Click "Clear Cache & Reload"

**Why**: Browser caching can show stale data

### Issue 3: Settings Not Saving

**Problem**: Click save but settings revert

**Solution**:
- Check browser console for errors (F12)
- Make sure localStorage is enabled
- Try a different browser
- Ensure all required fields are filled

---

## File Locations

### New Files
- `src/pages/SettingsPage.jsx` - Settings page component

### Modified Files
- `src/App.jsx` - Added /settings route
- `src/components/Navigation.jsx` - Added Settings button

### Related Files
- `src/utils/scriptVariables.js` - Variable replacement utility
- Uses `getRepSettings()` and `saveRepSettings()` functions

---

## Example Workflow

### First Time Setup
1. Navigate to **Settings** page
2. Enter your information:
   - Full Name: Chris A
   - Company: Dexit Solutions
3. Click **Save Settings**
4. Review the preview to confirm
5. Variables now work throughout the app!

### Updating Information
1. Go to **Settings**
2. Change any field
3. Click **Save Settings**
4. Changes take effect immediately

### Testing Variables
1. Go to **Scripts** page
2. Add a new script with `{{rep.name}}`
3. Click **Call** on any contact
4. See your name appear in the script!

---

## Tips

### Use Live Preview
- The preview updates as you type
- Verify your information looks correct before saving
- Check spacing and capitalization

### Keep It Professional
- Use your professional name
- Match your company's official name
- Consider how it will appear to prospects

### Regular Updates
- Update if you change companies
- Adjust formatting if needed
- Keep information current

### Backup Your Settings
Since settings are in localStorage:
- Export/backup if switching browsers
- Document your settings somewhere safe
- Can manually copy from console if needed

---

## Advanced: Manual Configuration

If you prefer console commands:

```javascript
// Set individual values
localStorage.setItem('rep_name', 'Chris A')
localStorage.setItem('rep_first_name', 'Chris')
localStorage.setItem('rep_company', 'Dexit Solutions')

// Or use the utility function
import { saveRepSettings } from './src/utils/scriptVariables'
saveRepSettings({
  name: 'Chris A',
  first_name: 'Chris',
  company: 'Dexit Solutions'
})

// Clear all settings
localStorage.removeItem('rep_settings')
localStorage.removeItem('rep_name')
localStorage.removeItem('rep_first_name')
localStorage.removeItem('rep_company')
```

---

## Status: ✅ Complete

Settings page is fully functional and accessible from the navigation menu!
