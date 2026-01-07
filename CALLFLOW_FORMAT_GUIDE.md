# Call Flow Markdown Format Guide

## Overview
This guide defines the standardized format for writing call flow scripts that support dynamic variables, multiple versions, and proper parsing.

---

## Dynamic Variables

Use double curly braces `{{variable}}` for dynamic content that will be replaced at runtime:

### Available Variables

**Contact Information:**
- `{{contact.first_name}}` - Contact's first name (e.g., "John")
- `{{contact.last_name}}` - Contact's last name (e.g., "Smith")
- `{{contact.full_name}}` - Full name (e.g., "John Smith")
- `{{contact.title}}` - Job title (e.g., "HIM Director")
- `{{contact.organization}}` - Organization name (e.g., "Memorial Hospital")

**Sales Rep Information:**
- `{{rep.name}}` - Your name (e.g., "Sarah Johnson")
- `{{rep.first_name}}` - Your first name
- `{{rep.company}}` - Your company name (e.g., "Dexit Solutions")

**Product Information:**
- `{{product.name}}` - Product name (e.g., "Dexit" or "Muspell")

**Technical Context (from notes):**
- `{{context.ehr}}` - EHR system (e.g., "Cerner")
- `{{context.dms}}` - DMS system (e.g., "OnBase")
- `{{context.volume}}` - Document volume (e.g., "500/day")

### Example Usage:
```markdown
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. I noticed that {{contact.organization}} is using {{context.ehr}}, and I wanted to reach out about your medical records workflow.
```

**Renders as:**
> Hi John, this is Sarah Johnson from Dexit Solutions. I noticed that Memorial Hospital is using Cerner, and I wanted to reach out about your medical records workflow.

---

## Section Headers

Use these exact headers (case-insensitive, but recommend UPPERCASE for clarity):

```markdown
# OPENING
# DISCOVERY QUESTIONS
# TRANSITION TO PITCH
# OBJECTION HANDLING
# CLOSING
```

---

## OPENING Section Format

### Single Version:
```markdown
# OPENING

Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. I'm reaching out because...
```

### Multiple Versions:
Use `## Version N:` or `## Alternative:` for different approaches:

```markdown
# OPENING

## Version 1: Direct Approach
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. I'm calling because we help {{contact.title}}s at organizations like {{contact.organization}} automate their medical records workflow. Do you have 2 minutes?

## Version 2: Question-Led
Hi {{contact.first_name}}, {{rep.name}} here from {{rep.company}}. Quick question - how is {{contact.organization}} currently handling incoming medical records requests? I ask because...

## Version 3: Pain Point Focus
{{contact.first_name}}, this is {{rep.name}}. I work with HIM Directors who are drowning in manual fax sorting. Is that something you're dealing with at {{contact.organization}}?
```

**Parser will extract:**
- Version 1: Direct Approach
- Version 2: Question-Led
- Version 3: Pain Point Focus

---

## DISCOVERY QUESTIONS Section Format

Use `##` for each question, followed by `**Why ask this:**` for context:

```markdown
# DISCOVERY QUESTIONS

## What EHR system are you currently using?
**Why ask this:** Understanding their EHR helps position {{product.name}} as complementary, not a replacement.
**Keywords:** cerner, epic, meditech, athena

## How many medical records requests do you receive daily?
**Why ask this:** Volume determines ROI and urgency.
**Keywords:** volume, per day, daily, requests

## Who handles the sorting and routing of these records?
**Why ask this:** Identifies if it's manual labor (pain point) or already automated.
**Keywords:** manual, staff, FTE, automated
```

**Parser extracts:**
- Question text
- "Why" explanation
- Keywords for smart detection

---

## TRANSITION TO PITCH Section Format

Use `##` for each trigger scenario, followed by `**Response:**`:

```markdown
# TRANSITION TO PITCH

## If they mention manual processes:
**Response:**
Got it. So it sounds like your team is spending a lot of time manually sorting through faxes and matching them to the right patient records in {{context.ehr}}. That's exactly what {{product.name}} was designed to eliminate. Let me tell you how...

## If they mention staffing shortages:
**Response:**
I hear you - finding qualified HIM staff is tough right now. What if I told you {{product.name}} could handle 80% of that workload automatically, so {{contact.first_name}}, your existing team could focus on the complex cases?

## If they mention compliance concerns:
**Response:**
Compliance is critical, {{contact.first_name}}. {{product.name}} actually improves audit trails because every document is tracked digitally with timestamps and user logs. No more lost faxes or "I thought someone else handled it."
```

**Parser extracts:**
- Trigger scenario
- Response pitch
- Automatically detects keywords from trigger

---

## OBJECTION HANDLING Section Format

### Single Response Per Objection:
```markdown
# OBJECTION HANDLING

## "I'm not the decision maker"
I totally understand, {{contact.first_name}}. Most {{contact.title}}s aren't the final decision maker, but they're definitely the expert who influences it. Who would you typically loop in for something like this - would it be IT, finance, or someone else?

## "We're all set with our current process"
That's great to hear! Out of curiosity, what's working well? I ask because even organizations that have a solid process often find there are specific pain points - like after-hours coverage or patient matching accuracy - that {{product.name}} can complement.
```

### Multiple Response Versions:
Use `**Response:**` for primary, then `**Alternative 1:**`, `**Alternative 2:**`, etc.

```markdown
# OBJECTION HANDLING

## "How much does it cost?"
**Response:**
Great question, {{contact.first_name}}. Our pricing is based on your monthly document volume. For an organization like {{contact.organization}} processing {{context.volume}}, most clients see ROI within 3-6 months just from labor savings alone. Can I ask - what's your current monthly volume?

**Alternative 1:**
I appreciate you asking about budget. Before I throw numbers at you, can I ask - if {{product.name}} could save your team 20 hours a week, what would that be worth to {{contact.organization}}?

**Alternative 2:**
Fair question. The investment depends on your volume and use case, but I can tell you that our average client saves 2-3 FTEs worth of work. Would it make sense to do a quick discovery call so I can give you an accurate quote?
```

**Parser extracts:**
- Objection text
- Primary response
- Alternative responses (array)

---

## CLOSING Section Format

Similar to OPENING, use versions:

```markdown
# CLOSING

## Version 1: Standard Discovery Call
So {{contact.first_name}}, based on what you've shared about {{contact.organization}}'s workflow, I think a 15-minute discovery call would be valuable. I can show you exactly how {{product.name}} integrates with {{context.ehr}} and what the ROI would look like. Does Thursday at 2pm work?

## Version 2: Send Information First
How about this - I'll send you a quick 2-minute demo video showing {{product.name}} in action with {{context.ehr}}, and then we can schedule a call if it looks like a fit. What's the best email to send that to?

## Version 3: Soft Close
{{contact.first_name}}, I don't want to take up too much of your time today. Would it be helpful if I sent you a one-pager on how {{product.name}} works, and we can reconnect next week if it looks interesting?
```

---

## Special Formatting Rules

### Line Breaks
- Use single line break between paragraphs within a response
- Use double line break between different sections/versions

### Emphasis
- **Bold** for emphasis: `**important point**`
- *Italic* for context: `*internal note*`

### Comments (Not shown to user)
Use `<!-- comment -->` for internal notes:

```markdown
## Version 1: Direct Approach
<!-- Use this for cold calls to HIM Directors -->
Hi {{contact.first_name}}, this is {{rep.name}}...
```

---

## Complete Example: Dexit HIM Call Flow

```markdown
# OPENING

## Version 1: Direct Approach
Hi {{contact.first_name}}, this is {{rep.name}} from {{rep.company}}. I'm reaching out to {{contact.title}}s at organizations like {{contact.organization}} because we specialize in automating medical records workflows. Do you have about 2 minutes?

## Version 2: Question-Led Approach
Hi {{contact.first_name}}, {{rep.name}} here from {{rep.company}}. Quick question - is {{contact.organization}} still manually sorting incoming faxes and records requests, or have you automated that process?

---

# DISCOVERY QUESTIONS

## What EHR system are you currently using?
**Why ask this:** Helps position {{product.name}} as complementary to their existing {{context.ehr}} system.
**Keywords:** ehr, cerner, epic, meditech

## How many medical records requests do you receive per day?
**Why ask this:** Volume determines ROI calculation and urgency.
**Keywords:** volume, per day, daily, requests, faxes

## Who currently handles the sorting and routing?
**Why ask this:** Identifies manual labor pain points.
**Keywords:** manual, staff, team, FTE

## What's your biggest challenge with the current process?
**Why ask this:** Uncovers specific pain points to address.
**Keywords:** challenge, problem, issue, pain point

---

# TRANSITION TO PITCH

## If they mention manual sorting:
**Response:**
Got it, {{contact.first_name}}. So your team is manually reviewing every fax, matching it to the patient in {{context.ehr}}, and routing it to the right department. That's exactly what {{product.name}} automates. Our AI reads the fax, identifies the patient, matches them in {{context.ehr}}, and routes it automatically - all in under 30 seconds. Would you like to see how it works?

## If they mention staffing issues:
**Response:**
I hear you - qualified HIM staff are hard to find right now. Here's the thing: {{product.name}} can handle about 80% of your routine requests automatically, so your team only touches the complex cases. Most clients tell us it's like adding 2-3 FTEs without the hiring headache.

---

# OBJECTION HANDLING

## "I'm not the decision maker"
I totally understand, {{contact.first_name}}. Most {{contact.title}}s aren't the final signer, but you're definitely the expert. Who would you typically loop in for workflow automation - IT, finance, or your VP?

## "We're all set"
**Response:**
That's great! What's working well for you? I ask because even teams with solid processes often find specific pain points - like after-hours coverage or patient matching accuracy - where {{product.name}} can help.

**Alternative 1:**
I appreciate that. Out of curiosity, are you hitting your turnaround time goals consistently, or are there certain request types that back up?

## "How much does it cost?"
**Response:**
Great question. Our pricing is based on monthly volume. For organizations processing {{context.volume}} like {{contact.organization}}, most see ROI in 3-6 months just from labor savings. Can I ask what your current monthly volume is?

**Alternative 1:**
Before I quote numbers, let me ask - if {{product.name}} could save your team 20 hours a week, what would that be worth to you?

---

# CLOSING

## Version 1: Discovery Call
Based on what you've shared, {{contact.first_name}}, I think a 15-minute discovery call would be valuable. I can show you how {{product.name}} integrates with {{context.ehr}} and what your specific ROI would look like. Does Thursday at 2pm work?

## Version 2: Send Demo First
How about this - I'll send you a 2-minute demo video showing {{product.name}} with {{context.ehr}}, and if it looks interesting, we can schedule a call. What's your email?

## Version 3: Soft Close
{{contact.first_name}}, I don't want to take up your whole day. Let me send you a one-pager, and we can reconnect next week if it looks like a fit. Sound good?
```

---

## File Naming Convention

Use this format for consistency:

```
{product}-{approach}-callflow-v{version}.md
```

**Examples:**
- `dexit-him-callflow-v1.md`
- `dexit-it-callflow-v1.md`
- `dexit-ambulatory-callflow-v1.md`
- `dexit-rc-callflow-v1.md`
- `muspell-migration-callflow-v1.md`
- `muspell-merger-callflow-v1.md`

---

## Variable Replacement Timing

**At Runtime (when displaying script):**
- All `{{contact.*}}` variables
- All `{{context.*}}` variables (parsed from notes)

**At App Load (configured in settings):**
- `{{rep.name}}` - Your name
- `{{rep.first_name}}` - Your first name
- `{{rep.company}}` - Your company

**Always Available:**
- `{{product.name}}` - Determined by contact's product field

---

## Testing Your Format

### Valid Markdown Test:
```markdown
# OPENING
## Version 1: Test
Hi {{contact.first_name}}, this is {{rep.name}}.

# DISCOVERY QUESTIONS
## Test question?
**Why ask this:** Testing
```

### Expected Parser Output:
```javascript
{
  sections: {
    opening: {
      versions: [
        {
          number: 1,
          label: "Test",
          content: "Hi {{contact.first_name}}, this is {{rep.name}}."
        }
      ]
    },
    discovery: [
      {
        question: "Test question?",
        why: "Testing",
        keywords: []
      }
    ]
  }
}
```

---

## Quick Reference

| Element | Format |
|---------|--------|
| Section Header | `# SECTION_NAME` |
| Version | `## Version N: Label` |
| Alternative Response | `**Alternative 1:**` |
| Why Explanation | `**Why ask this:**` |
| Keywords | `**Keywords:**` |
| Contact First Name | `{{contact.first_name}}` |
| Contact Title | `{{contact.title}}` |
| Rep Name | `{{rep.name}}` |
| Product Name | `{{product.name}}` |
| EHR System | `{{context.ehr}}` |
| Comment | `<!-- comment -->` |

---

## Migration Checklist

When updating existing call flow files:

- [ ] Replace hardcoded names with `{{contact.first_name}}`
- [ ] Replace "your organization" with `{{contact.organization}}`
- [ ] Replace "your title" with `{{contact.title}}`
- [ ] Add `{{rep.name}}` where you introduce yourself
- [ ] Use `{{context.ehr}}` when mentioning their EHR
- [ ] Add version labels to all opening/closing variants
- [ ] Add "Why ask this" to all discovery questions
- [ ] Add keywords to questions and transitions
- [ ] Use `**Alternative 1:**` format for multiple objection responses
- [ ] Remove any HTML comments and use `<!-- -->` instead

---

## Next Steps

1. Update parser to handle `{{variable}}` replacement
2. Add user settings for `{{rep.name}}` and `{{rep.company}}`
3. Update existing call flow markdown files with new format
4. Test variable replacement in live calls
