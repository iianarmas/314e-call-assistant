# Database Scripts Integration with Call Flows

## Overview
Database scripts are now fully integrated with markdown call flows. When you add a script via the UI, it will automatically appear in the appropriate call flow during calls.

---

## How It Works

### 1. Script Creation (via UI)
When adding a script in Scripts page:
- **Product**: Dexit or Muspell
- **Call Flow / Approach**: HIM, IT, Ambulatory, or Revenue Cycle (REQUIRED for Dexit)
- **Section Type**: Opening, Discovery, Transition, Objections, or Closing
- **Variations**: Multiple versions with labels

### 2. Script Storage
Scripts are stored in the `scripts` table with:
```sql
{
  id: UUID,
  name: TEXT,
  product: TEXT,           -- 'Dexit' or 'Muspell'
  approach: TEXT,          -- 'HIM', 'IT', 'Ambulatory', 'Revenue Cycle'
  section_type: TEXT,      -- 'opening', 'discovery', 'transition', 'objections', 'closing'
  content: TEXT,           -- Formatted markdown with variations
  is_active: BOOLEAN
}
```

### 3. Call Flow Loading
When opening a call page:

1. **Load Markdown Call Flows** (from `/docs/` folder)
   - dexit-him-callflow-v1.md
   - dexit-it-callflow-v1.md
   - dexit-ambulatory-callflow-v1.md
   - dexit-rc-callflow-v1.md

2. **Load Database Scripts** (from `scripts` table)
   - WHERE `is_active = true`
   - Grouped by `product` and `approach`

3. **Merge Scripts into Call Flows**
   - Database scripts are added to the appropriate call flow section
   - Based on matching `product` and `approach`
   - Scripts appear alongside markdown content

### 4. Display in Call Flow Navigator
- All scripts (markdown + database) appear together
- Organized by section (Opening, Discovery, Objections, etc.)
- Database scripts are tagged with `dbScriptId` for tracking

---

## Example

### Adding a Script

1. Go to Scripts page
2. Click "Add Script"
3. Fill in form:
   - **Script Name**: "Cost Objection Response"
   - **Product**: Dexit
   - **Call Flow / Approach**: HIM ← This determines which call flow it appears in
   - **Section Type**: Objections
   - **Primary Response**: "Great question, {{contact.first_name}}. Our pricing is based on volume..."
   - **Alternative 1**: "Before I quote numbers, let me ask - what would 20 hours/week savings be worth?"

4. Click "Add Script"

### During a Call

1. Select contact with:
   - Product: Dexit
   - Title: HIM Director

2. Call page opens with **Dexit HIM Call Flow** selected

3. Navigate to **Objections** section

4. Your custom "Cost Objection Response" appears in the list with:
   - Primary response
   - Alternative response
   - All variables replaced with actual contact data

---

## Call Flow Matching Logic

Scripts appear in call flows based on exact matching:

| Script Property | Call Flow Property | Must Match |
|----------------|-------------------|-----------|
| `product` | `product` | ✅ Yes |
| `approach` | `approach` | ✅ Yes |
| `section_type` | section name | ✅ Yes |

**Examples:**
- Script: `product='Dexit', approach='HIM', section_type='opening'`
  → Appears in: **Dexit HIM Call Flow → Opening**

- Script: `product='Dexit', approach='IT', section_type='objections'`
  → Appears in: **Dexit IT Call Flow → Objections**

- Script: `product='Dexit', approach='Ambulatory', section_type='closing'`
  → Appears in: **Dexit Ambulatory Call Flow → Closing**

---

## Content Formatting

### Opening / Closing Scripts
Format with multiple versions:
```markdown
## Version 1: Direct Approach
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}...

---

## Version 2: Question-Led
{{contact.first_name}}, quick question - is {{contact.organization}} still manually...
```

**Result**: Each version appears as separate option in call flow

### Objection Scripts
Format with primary + alternatives:
```markdown
**Response:**
Great question, {{contact.first_name}}. Our pricing is based on {{context.volume}}...

**Alternative 1:**
Before I quote numbers, let me ask - what would saving 20 hours per week be worth to {{contact.organization}}?

**Alternative 2:**
I appreciate you asking upfront. Let me understand your current process first...
```

**Result**: Primary response + alternatives available during call

### Discovery Questions
Format with question + why:
```markdown
What EHR are you currently using?

**Why ask this:**
Understanding their EHR helps position {{product.name}} as complementary

**Keywords:**
ehr, system, epic, cerner
```

**Result**: Question appears with context and keywords

### Transition Pitches
Simple format:
```markdown
Based on what you shared about {{context.ehr}}, it sounds like your team is spending significant time on manual document routing. {{product.name}} can automate that entire workflow...
```

**Result**: Contextual pitch based on discovery

---

## Benefits

### 1. Unified Management
- All scripts (markdown + database) in one place during calls
- No switching between different systems
- Consistent experience

### 2. Dynamic Updates
- Add scripts via UI without editing markdown files
- Scripts appear immediately in call flows
- No deployment needed

### 3. Organization by Call Flow
- Scripts automatically organized by approach (HIM, IT, etc.)
- Only relevant scripts shown for each contact type
- Cleaner navigation

### 4. Variable Support
- Database scripts support same `{{variable}}` syntax as markdown
- Automatic personalization with contact data
- Context from notes (EHR, DMS, volume)

### 5. Tracking
- Database scripts tagged with `dbScriptId`
- Can track usage and effectiveness
- Easy to update or deactivate

---

## File Changes

### New Files
1. `src/utils/mergeScriptsIntoCallFlows.js` - Merge logic
2. `MIGRATION_ADD_SECTION_TYPE.sql` - Database migration
3. `DATABASE_SCRIPTS_INTEGRATION.md` - This file

### Modified Files
1. `src/components/AddScriptModal.jsx`
   - Made approach field required and always visible for Dexit
   - Changed label to "Call Flow / Approach"
   - Added help text explaining call flow assignment

2. `src/pages/CallPageWithFlowNavigator.jsx`
   - Added import for `mergeScriptsIntoCallFlows`
   - Load database scripts from Supabase
   - Merge database scripts into call flows
   - Log merged results for debugging

3. `DATABASE_SCHEMA.md`
   - Added `section_type` column to scripts table
   - Added index for `section_type`

---

## Testing

### 1. Add a Script
1. Go to Scripts page
2. Click "Add Script"
3. Fill in:
   - Name: "Test Opening"
   - Product: Dexit
   - Call Flow: HIM
   - Section: Opening
   - Variation 1: "Hi {{contact.first_name}}, this is a test opening"
4. Save

### 2. Verify in Call Flow
1. Create or select contact:
   - Product: Dexit
   - Title: HIM Director (or Director of HIM, etc.)
2. Click "Call" button
3. Page should load with **Dexit HIM Call Flow**
4. Click **Opening** section in left navigator
5. Your "Test Opening" script should appear in the list
6. Click it to see content with variables replaced

### 3. Check Console
Open browser console and verify:
- "Loaded call flows from markdown" - shows 4 flows
- "Merged call flows with database scripts" - shows script counts per section
- Opening count should be higher if your script was added

---

## Troubleshooting

### Script Not Appearing

**Check 1: Approach Field**
- Make sure you selected an approach (HIM, IT, Ambulatory, RC)
- Dexit scripts require an approach to match call flows

**Check 2: Product Match**
- Script product must match call flow product exactly
- "Dexit" ≠ "dexit" (case-sensitive)

**Check 3: Active Status**
- Only scripts with `is_active = true` appear
- Check in Scripts page that script is active

**Check 4: Section Type**
- Make sure `section_type` column exists in database
- Run migration if needed: `MIGRATION_ADD_SECTION_TYPE.sql`

**Check 5: Browser Console**
- Look for merge logs showing script counts
- Check for any JavaScript errors

### Script Formatting Issues

**Problem**: Script content not parsing correctly

**Solution**: Follow format guide exactly
- Opening/Closing: Use `## Version N: Label` headers
- Objections: Use `**Response:**` and `**Alternative N:**`
- Discovery: Use `**Why ask this:**` and `**Keywords:**`

---

## Future Enhancements

1. **Bulk Import**: Upload multiple scripts from CSV
2. **Script Templates**: Pre-defined templates for common objections
3. **Usage Analytics**: Track which scripts are used most
4. **A/B Testing**: Test different script variations
5. **Script Versioning**: Track changes over time
6. **Shared Library**: Share scripts across team members

---

## Status: ✅ Complete

Database scripts are now fully integrated with call flows. Add scripts via UI and they automatically appear in the appropriate call flow during calls!
