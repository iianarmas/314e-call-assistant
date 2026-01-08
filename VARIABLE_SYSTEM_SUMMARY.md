# Variable System Implementation Summary

## Overview
Implemented a standardized variable replacement system for call flow scripts that allows dynamic personalization using `{{variable}}` syntax.

---

## Changes Made

### 1. Removed Haiku Model ✅

**File**: [CallPageWithFlowNavigator.jsx](src/pages/CallPageWithFlowNavigator.jsx)

- Changed default AI model from `haiku` to `sonnet`
- Replaced dropdown selector with static badge showing "Sonnet 4"
- Only Sonnet 4 model is now available (best quality)

**Lines Changed**:
- Line 31: `const [selectedAIModel, setSelectedAIModel] = useState('sonnet')`
- Lines 247-253: Static badge instead of dropdown

---

### 2. Created Variable Replacement Utility ✅

**File**: [src/utils/scriptVariables.js](src/utils/scriptVariables.js) *(NEW)*

**Key Functions**:
- `replaceScriptVariables(content, context)` - Main replacement function
- `parseNotesContext(notes)` - Extract EHR, DMS, volume from notes
- `getRepSettings()` - Load sales rep name/company from localStorage
- `saveRepSettings(settings)` - Save sales rep settings
- `buildReplacementContext(contact, notes)` - Build complete context

**Available Variables**:
```javascript
// Contact information
{{contact.first_name}}     // "John"
{{contact.last_name}}      // "Smith"
{{contact.full_name}}      // "John Smith"
{{contact.title}}          // "HIM Director"
{{contact.organization}}   // "Memorial Hospital"

// Sales rep information (from localStorage)
{{rep.name}}               // "Sarah Johnson"
{{rep.first_name}}         // "Sarah"
{{rep.company}}            // "Dexit Solutions"

// Product information
{{product.name}}           // "Dexit" or "Muspell"

// Technical context (parsed from notes)
{{context.ehr}}            // "Cerner"
{{context.dms}}            // "OnBase"
{{context.volume}}         // "500/day"
```

---

### 3. Updated CallFlowContentPanel ✅

**File**: [src/components/CallFlowContentPanel.jsx](src/components/CallFlowContentPanel.jsx)

**Changes**:
1. Added `replaceScriptVariables` import
2. Added `contact` and `notes` props to component
3. Created `buildContext()` function to build replacement context
4. Updated all content rendering to apply variable replacement:
   - Opening scripts
   - Closing scripts
   - Discovery questions
   - Transition pitches
   - Objection responses
   - Alternative responses

**Example**:
```javascript
// Before (raw script):
{data.content}

// After (with variables replaced):
const content = replaceScriptVariables(data.content, context)
{content}
```

---

### 4. Updated CallPageWithFlowNavigator ✅

**File**: [src/pages/CallPageWithFlowNavigator.jsx](src/pages/CallPageWithFlowNavigator.jsx)

**Changes**:
- Lines 299-300: Pass `contact` and `notes` props to CallFlowContentPanel

```javascript
<CallFlowContentPanel
  activeSection={activeSection}
  callFlow={selectedCallFlow}
  contact={contact}      // NEW
  notes={callNotes}      // NEW
/>
```

---

### 5. Created Format Guide ✅

**File**: [CALLFLOW_FORMAT_GUIDE.md](CALLFLOW_FORMAT_GUIDE.md) *(NEW)*

**Comprehensive guide covering**:
- Variable syntax and available variables
- Section headers format
- Opening/Closing versions format
- Discovery questions format
- Transition pitches format
- Objection handling format (single and multiple responses)
- File naming conventions
- Complete examples
- Migration checklist

---

## How It Works

### Runtime Flow

1. **User opens call page** → Contact and notes data loaded
2. **User clicks section in navigation** → Section content displayed
3. **CallFlowContentPanel receives**:
   - `activeSection`: Current section data
   - `contact`: Contact object with first_name, last_name, title, etc.
   - `notes`: Free-form notes from right panel
4. **buildContext() creates replacement context**:
   ```javascript
   {
     contact: { first_name: "John", last_name: "Smith", ... },
     rep: { name: "Chris Armas", company: "314e Corporation" },
     product: { name: "Dexit" },
     scriptContext: { ehr: "Cerner", dms: "OnBase", volume: "500/day" }
   }
   ```
5. **replaceScriptVariables() replaces all {{variables}}**:
   ```
   Input:  "Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}."
   Output: "Hi John, this is Chris Johnson from 314e Corporation."
   ```
6. **Personalized script displayed** to user

---

## Example Usage in Markdown Files

### Before (Old Format):
```markdown
# OPENING

Hi [Contact Name], this is [Your Name] from Dexit. I'm reaching out because...
```

### After (New Format):
```markdown
# OPENING

## Version 1: Direct Approach
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. I'm reaching out to {{contact.title}}s at organizations like {{contact.organization}} because we specialize in automating medical records workflows. Do you have about 2 minutes?

## Version 2: Question-Led
{{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. Quick question - is {{contact.organization}} still manually sorting incoming faxes and records requests, or have you automated that process?
```

### Rendered Output (for John Smith, HIM Director at Memorial Hospital):
```
Version 1:
Hi John, this is Sarah Johnson from Dexit Solutions. I'm reaching out to HIM Directors at organizations like Memorial Hospital because we specialize in automating medical records workflows. Do you have about 2 minutes?

Version 2:
John, this is Sarah Johnson from Dexit Solutions. Quick question - is Memorial Hospital still manually sorting incoming faxes and records requests, or have you automated that process?
```

---

## Configuration

### Setting Your Rep Information

Variables like `{{rep.name}}` pull from localStorage. To configure:

**Option 1: Manual localStorage (temporary)**:
```javascript
localStorage.setItem('rep_name', 'Your Name')
localStorage.setItem('rep_first_name', 'Your')
localStorage.setItem('rep_company', 'Your Company')
```

**Option 2: Using utility function**:
```javascript
import { saveRepSettings } from './utils/scriptVariables'

saveRepSettings({
  name: 'Your Name',
  first_name: 'Your',
  company: 'Your Company'
})
```

**Default Values** (if not configured):
- Rep Name: "Chris Armas"
- Rep Company: "Dexit Solutions"

---

## Migration Path

### For Existing Call Flow Files

Follow this checklist to update existing markdown files:

1. **Replace hardcoded names**:
   ```markdown
   Before: Hi John,
   After:  Hi {{contact.first_name}},
   ```

2. **Replace organization references**:
   ```markdown
   Before: ...at Memorial Hospital...
   After:  ...at {{contact.organization}}...
   ```

3. **Add version labels**:
   ```markdown
   Before:
   # OPENING
   Hi there, I'm calling from Dexit...

   After:
   # OPENING
   ## Version 1: Direct Approach
   Hi {{contact.first_name}}, I'm {{rep.name}} from {{rep.company}}...
   ```

4. **Add "Why ask this" to discovery questions**:
   ```markdown
   Before:
   ## What EHR are you using?

   After:
   ## What EHR are you using?
   **Why ask this:** Understanding their EHR helps position {{product.name}} as complementary.
   **Keywords:** ehr, cerner, epic, meditech
   ```

5. **Format multiple objection responses**:
   ```markdown
   Before:
   ## "How much does it cost?"
   Great question. Our pricing is based on volume...

   After:
   ## "How much does it cost?"
   **Response:**
   Great question, {{contact.first_name}}. Our pricing is based on your monthly volume...

   **Alternative 1:**
   Before I quote numbers, let me ask - if {{product.name}} could save your team 20 hours a week, what would that be worth?
   ```

---

## Testing

### Test Variable Replacement

1. **Create test contact**:
   - First name: "Test"
   - Last name: "User"
   - Title: "HIM Director"
   - Organization: "Test Hospital"
   - Product: "Dexit"

2. **Add test notes**:
   ```
   ehr=cerner
   no dms
   500 docs/day
   ```

3. **Open call page** and verify variables render correctly in all sections

4. **Expected output**:
   ```
   {{contact.first_name}} → Test
   {{contact.organization}} → Test Hospital
   {{context.ehr}} → Cerner
   {{context.volume}} → 500 docs/day
   ```

---

## Benefits

### 1. **Instant Personalization**
- Every script automatically includes contact's name, title, organization
- No manual find/replace needed
- Feels personal and tailored

### 2. **Context-Aware**
- Scripts reference their specific EHR system
- Mentions their document volume
- Adapts to their technical setup

### 3. **Consistent Formatting**
- All call flows use same variable syntax
- Easy to maintain and update
- Clear standard for writing new scripts

### 4. **Scalable**
- Add new variables easily
- Works across all call flows (HIM, IT, Ambulatory, RC)
- Supports both Dexit and Muspell

### 5. **No Token Usage**
- Variable replacement happens instantly client-side
- Zero API calls or tokens consumed
- Unlimited personalizations

---

## Future Enhancements

### Settings Page (Recommended)
Create a settings page where users can configure:
- Rep name
- Rep company
- Default phrases
- Custom variables

### Advanced Variables
Add support for:
- Conditional logic: `{{if context.ehr == 'Cerner'}}...{{endif}}`
- Calculations: `{{context.volume * 30}}` (monthly volume)
- Formatting: `{{contact.first_name | uppercase}}`

### Variable Preview
Add hover tooltips showing what each variable will resolve to before displaying

---

## Files Created/Modified

### New Files:
1. `src/utils/scriptVariables.js` - Variable replacement utility
2. `CALLFLOW_FORMAT_GUIDE.md` - Comprehensive format guide
3. `VARIABLE_SYSTEM_SUMMARY.md` - This file

### Modified Files:
1. `src/pages/CallPageWithFlowNavigator.jsx` - Removed Haiku, pass props
2. `src/components/CallFlowContentPanel.jsx` - Apply variable replacement
3. `src/hooks/useAIPitchBuilder.js` - Already updated (role + product emphasis)

---

## Quick Reference

### Writing Call Flows

```markdown
# OPENING
## Version 1: Label
Hi {{contact.first_name}}, I'm {{rep.name}} from {{rep.company}}.

# DISCOVERY QUESTIONS
## Question text?
**Why ask this:** Explanation
**Keywords:** keyword1, keyword2

# TRANSITION TO PITCH
## If they mention X:
**Response:**
Based on what you shared about {{context.ehr}}...

# OBJECTION HANDLING
## "Objection text"
**Response:**
I understand, {{contact.first_name}}. Let me ask...

**Alternative 1:**
Different approach...

# CLOSING
## Version 1: Label
So {{contact.first_name}}, does Thursday at 2pm work?
```

### Common Variables

| Use Case | Variable |
|----------|----------|
| Greeting | `{{contact.first_name}}` |
| Introduce yourself | `{{rep.name}} from {{rep.company}}` |
| Reference their org | `{{contact.organization}}` |
| Mention their role | `{{contact.title}}` |
| Reference EHR | `{{context.ehr}}` |
| Product name | `{{product.name}}` |

---

## Status: ✅ Complete

All components updated and tested. System ready for use with standardized `{{variable}}` format.

**Next Step**: Update existing call flow markdown files to use new variable syntax.
