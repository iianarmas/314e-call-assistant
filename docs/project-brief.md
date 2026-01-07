# Complete Project Brief: AI-Powered Call Assistant for Dexit & Muspell

## Project Overview

Build a web-based application that acts as a real-time call companion for appointment setting. The user is calling healthcare organizations across the US to schedule discovery calls or demos for two products: **Dexit** (document processing) and **Muspell** (data archival). English is not the user's primary language, so the app must provide reliable, dynamically generated scripts and responses.

---

## Products Being Sold

### Dexit - Intelligent Document Processing System

**What it does:**

- AI-powered document processing using proprietary "DextractLM" model
- Automates document classification, data extraction, and routing
- Virtual fax server included
- Integrates with any EHR (Epic, Cerner, etc.)
- Handles both clinical and non-clinical documents

**Primary use cases:**

1. HIM workflows (processing documents from arrival to EHR)
2. Referral management (for ambulatory/provider organizations)
3. Prior authorization workflows
4. Release of information

**Target personas:**

- Health Information Management (HIM) Directors/Managers
- IT Directors/Managers
- Project Managers/Directors
- Product Managers/Directors
- PMO staff
- Anyone managing document workflows or whose team processes documents

**Key selling points:**

- Automation of manual/repetitive tasks
- AI and machine learning capabilities
- Integration with existing systems (no need to replace current DMS)
- Can work alongside OnBase, Epic Gallery, Cerner WQM
- Handles both clinical and non-clinical documents (advantage over Epic Gallery)

**Demo qualification criteria (if enough info gathered, schedule demo instead of discovery call):**

- EHR system identified
- Document Management System (DMS) identified
- HIM team size known
- Document volume (daily/weekly/monthly)
- Current challenges/pain points identified
- Manual processes confirmed

### Muspell - Data Archival & Analytics Platform

**What it does:**

- FHIR-native cloud platform for healthcare data archival and analytics
- Makes legacy EHR data accessible alongside new systems
- Includes A/R Rundown Management for financial data during transitions
- Patient-centric view with advanced search
- ROI workflows, population health analytics

**Trigger events (when to call):**

- EHR migrations (e.g., Cerner to Epic, Epic to Epic upgrade)
- Mergers & acquisitions
- Legacy system retirement
- EHR replacements or upgrades

**Target personas:**

- IT Directors/Managers/Leaders
- Project Managers handling migrations
- Directors of applications
- Anyone involved in EHR transitions or data management
- **Note:** The right person varies by organization - often need to discover who's responsible

**Key selling points:**

- 20+ years of healthcare IT experience
- FHIR-native (but explain in simple terms: "works with modern health data standards")
- Legacy data accessible immediately at go-live
- Handles clinical and non-clinical data
- Managed ETL and integrations
- SOC 2 Type 2 certified, HIPAA compliant

**Simplified language needed:**

- "FHIR-native" → "works with modern health data standards" or just remove
- "SSO integration" → "single login system"
- "go-live concurrently" → "launches at the same time as your new system"
- Use simple, everyday language that regular people can understand

---

## Contact Database Structure

**Information stored for each contact:**

- Name
- Company/Organization
- Title/Position
- Product they're being called about (Dexit or Muspell)
- Optional: Notes field for any trigger information (e.g., "Found article about Cerner to Epic migration," "Told they're acquiring 3 hospitals")

**Note:** Phone numbers not needed. Triggers for Muspell are sometimes links to articles or information gathered from conversations, not structured data.

---

## App Features & Workflow

### 1. Pre-Call Preparation

- Search for contact by name
- View contact details: role, company, product
- Get opening script tailored to:
  - Their position (IT vs HIM for Dexit; IT/PM for Muspell)
  - Product being discussed
  - Any trigger notes (for Muspell)

### 2. During Call - Three Conversation Paths

**Path A: Direct to Decision-Maker**

- Discovery questions appropriate to their role
- Real-time qualification tracking (especially for Dexit)
- Shows when enough info gathered for demo vs discovery call

**Path B: Influencer/Wrong Person Route**

- Scripts to identify the right person
- "Who handles [X]?" templates
- Transfer request scripts
- Handle "I'm not the decision maker" even when they should be

**Path C: Cold Navigation (General Line/Unknown Contact)**

- Department discovery scripts
- Gatekeeper value propositions
- "Can you direct me to..." scripts

### 3. Real-Time Intelligence Gathering

**For Dexit - Qualification Tracker:**
Progress indicator showing what's been collected:

- ☐ EHR system
- ☐ DMS/document system
- ☐ HIM team size
- ☐ Document volume (daily/weekly/monthly)
- ☐ Current challenges/pain points
- ☐ Manual processes (yes/no)

**Mix of input types:**

- Dropdowns for common selections (EHR systems, yes/no toggles)
- Free text fields for detailed notes
- Quick-log buttons for common scenarios

**Outcome guidance:**

- When 4+ items checked → Suggest scheduling DEMO
- When fewer items → Schedule DISCOVERY CALL

**For Muspell:**

- Free-form notes on trigger (migration type, timeline, concerns)
- Who they've talked to so far
- Current archival solution (if any)
- RFP status

### 4. Real-Time Objection Handler

**Pre-loaded Common Objections:**

**Dexit objections:**

- "I'm not the right person" (even when they ARE - misunderstanding product)
- "Call corporate office"
- "I'm not the decision maker"
- "We're using OnBase" / "We use Cerner WQM" / "Checking Epic Gallery"
- "Our current solution does that"
- "We don't use DMS"
- "Not interested"
- "I don't have time"
- "Already have a DMS"

**Muspell objections:**

- "I'm not the right person"
- "We're all set"
- "Our IT team is already handling the archiving/data conversion"
- "We already have a data conversion solution or archiving system"
- "No budget"
- "Already have a solution" (ask follow-ups: which vendor? contract end date? SSO integration? yearly cost increases? delays retrieving records?)

**AI-powered objection handling:**

- User can type ANY objection into a free text field
- App generates response that:
  1. Acknowledges their concern
  2. Reframes with value proposition
  3. Transitions to scheduling the call
- Responses stay under 3-4 sentences, conversational tone
- Uses simple language, not jargon

### 5. Navigation Scenarios (Quick Access Scripts)

**"Person no longer here":**

- Ask who replaced them
- Ask who handles [specific responsibility]
- Ask to be transferred to relevant department

**"Wrong person" scenarios:**

- For Dexit HIM: Emphasize automation of clerical tasks, working with existing applications
- For Dexit IT: Emphasize efficiency, automation in applications
- For Muspell: Ask who handles EHR transitions/data archival/legacy systems

**Gatekeeper scripts:**

- Brief value prop to get transferred
- "I wanted to understand their current process and see if our AI-powered solution can help speed things up"

### 6. Call Closing Scripts

**Based on qualification level:**

- **Dexit with full qualification** → Demo scheduling script
- **Standard cases** → Discovery call scheduling script
- **Hesitant prospects** → Offer direct demo with product expert

**Scheduling language:**

- Suggest specific timeframes ("this week or next?")
- Handle calendar conflicts
- Confirm their availability

---

## Technical Approach

### Tech Stack (Confirmed):

- **Frontend:** React with Tailwind CSS
- **AI Engine:** Claude API (Sonnet 4) for script generation
- **Hosting:** Vercel (free tier)
- **Database:** Supabase (free tier)
- **Cost:** ~$24-30/month (just Claude API usage)

### Important Notes:

- Claude API is separate from Claude Pro subscription
- App won't be affected by claude.ai rate limits
- Pay-as-you-go pricing based on actual usage

### Cost Breakdown for Your Usage:

**Daily pattern:**

- 100 calls/day total
- 20-30 live conversations (~25 average)
- ~4 API calls per live conversation
- 100 API calls/day = 2,000/month

**Monthly cost:**

- ~$24/month for solo use
- ~$75-100/month if 3-4 team members use it
- Everything else (hosting, database) is FREE

---

## Key Design Principles

### Scripts Must Be:

1. **Conversational** - Not robotic or overly formal
2. **Simple language** - No jargon unless necessary, explain technical terms
3. **Concise** - 2-4 sentences max for most responses
4. **Natural flow** - Feels like a real conversation, not reading a script
5. **Flexible** - AI generates variations, not identical copy each time

### User Experience:

1. **Minimal clicks** - Fast to log information during live calls
2. **Clear guidance** - Always know what to do next
3. **Progressive disclosure** - Show relevant options based on context
4. **Mobile-friendly** - Works on phone/tablet if needed
5. **Keyboard shortcuts** - For power users

### Script Generation Logic:

- **Base templates** from existing scripts (provided separately)
- **Dynamic personalization** based on:
  - Contact's role and company
  - Product being discussed
  - Information already gathered
  - Specific objection or scenario
- **Tone consistency** - Match 314e Corporation's voice
- **Always lead to scheduling** - Every response path should attempt to schedule a meeting

---

## Existing Scripts Reference

### Dexit Scripts (3 documents provided):

1. **Main Dexit Script** - IT approach, HIM approach, objections
2. **Ambulatory/Referral Script** - For provider organizations, referral management focus
3. **General objection handling** - Various scenarios

**Notes on existing scripts:**

- Some objections don't apply (service-based objections like "too expensive" for labor, "we have in-house team")
- Need to update/remove these
- Some responses are too long and defensive
- Need clearer paths to scheduling

### Muspell Scripts (1 document provided):

- Scripts for different triggers (Cerner to Epic, Epic to Epic, M&A, non-Epic systems)
- Objection handling
- Discovery questions
- RFP checking process

**Notes on existing scripts:**

- Use too much jargon (FHIR-native, SSO, go-live concurrently)
- Need simplification for general audience
- Good structure but needs tightening

---

## User Workflow Example

### Typical Dexit Call (HIM Manager):

1. **Pre-call:** Search "John Smith, HIM Director, Memorial Hospital" → App shows Dexit opening script for HIM
2. **Opening:** Read tailored script: "Hi John, this is [Name] from 314e Corporation, a healthcare software and solutions company. I'm curious how you currently manage document workflows at your organization..."
3. **During conversation:**
   - Log responses in quick fields (EHR: Epic, DMS: OnBase, Team size: 12, Volume: 500/day)
   - Type objection: "We're using OnBase already"
   - Get AI response instantly
4. **Qualification check:** App shows "4/6 items collected - You can schedule a DEMO"
5. **Closing:** Use demo scheduling script provided by app

### Typical Muspell Call (Unknown Decision Maker):

1. **Pre-call:** Search "Memorial Hospital - Cerner to Epic migration" → App shows Muspell opening script for migrations
2. **Call general line:** Use gatekeeper script to find right person
3. **Reach IT Director:** Read tailored script about archival strategy
4. **Type notes:** "They're using vendor X, contract ends in 6 months, unhappy with retrieval delays"
5. **Handle objection:** Type "Already have solution" → Get follow-up questions and reframing
6. **Close:** Use discovery call scheduling script

---

## Success Criteria

### The app is successful if:

1. User can make calls without memorizing scripts
2. Scripts sound natural and match 314e's voice
3. Objection responses are helpful and lead to scheduling
4. Tracking information is fast during live calls
5. User knows when to schedule demo vs discovery call (Dexit)
6. Works reliably with minimal cost
7. Can be shared with small team in the future

---

## Script & Knowledge Management System

### Dynamic Script Updates

**Feature:** Upload and manage script versions over time

**Functionality:**

- Upload new scripts/instructions as they're provided by the company
- Version history - track changes over time
- Mark scripts as "current" vs "archived"
- AI references the most current scripts when generating responses
- Can compare old vs new scripts

**Use cases:**

- Company updates product messaging
- New objection handling techniques discovered
- Product features change
- New use cases or personas added

### Best Practices Library

**Feature:** Store and utilize appointment setting best practices

**Functionality:**

- Add best practices for cold calling, objection handling, closing techniques
- Categorize by topic (opening lines, tone, timing, follow-up, etc.)
- AI incorporates these practices into script generation
- Can mark practices as "always use" or "suggest when appropriate"

**Examples of best practices to store:**

- "Always acknowledge objection before responding"
- "Use open-ended questions to gather info"
- "Suggest specific days/times when scheduling"
- "Match prospect's communication style"
- "Keep responses under 3 sentences"

### Knowledge Base Structure

```
docs/
├── scripts/
│   ├── current/
│   │   ├── dexit-main.md
│   │   ├── dexit-ambulatory.md
│   │   └── muspell.md
│   └── archive/
│       ├── 2025-01-01-dexit-main.md
│       └── 2024-12-15-muspell.md
├── instructions/
│   ├── company-updates.md
│   └── product-changes.md
└── best-practices/
    ├── cold-calling.md
    ├── objection-handling.md
    └── closing-techniques.md
```

### Implementation Approach

1. Simple file upload interface in the app
2. Parse markdown/text files
3. Store in Supabase with metadata (date uploaded, category, status)
4. When generating scripts, AI context includes:
   - Current scripts
   - Latest company instructions
   - Relevant best practices
5. Admin panel to manage/update knowledge base

## Out of Scope (For Initial Version)

- Phone integration (dialing from app)
- Call recording
- CRM integration
- Email follow-up automation
- Calendar integration for scheduling
- Analytics/reporting
- Team permissions and roles
- Advanced script version comparison tools

**These can be added later if needed**

---

## Next Steps

When starting a new chat, provide this document and say:

**"I need to build the AI-powered call assistant app we discussed. Here's the complete project brief. Let's start building using Vercel and Supabase (free tiers) with Claude API. I'll provide the existing scripts separately for you to reference and improve."**

Then share the three script documents again:

1. Main Dexit script
2. Ambulatory Dexit script
3. Muspell script

---

## Important Reminders for Development

1. **Keep it simple** - Start with core features, add complexity later
2. **Test with real calls** - User should test app during actual calls and iterate
3. **Simple language** - Always translate jargon into everyday terms
4. **Fast inputs** - Minimize typing during live calls
5. **Clear next steps** - User should never wonder "what do I do now?"
6. **Claude API costs** - Monitor usage, optimize prompts to keep costs low (~$24/month target)
7. **Use Supabase** - Even from start for team collaboration potential

---

## Contact Information Context

- User is calling healthcare organizations across the US
- Organizations include hospitals, health systems, ambulatory practices
- Typical contacts: Directors, Managers, PMOs in IT, HIM, or project management
- Cold calling mostly (no prior relationship)
- English is not user's primary language - scripts must be clear and reliable

---

## API Setup Information

**Claude API (Separate from Claude Pro):**

- Create account at console.anthropic.com
- Get API key
- Use Sonnet 4 model (claude-sonnet-4-20250514)
- Monitor usage in console
- Expected cost: $24-30/month for 100 calls/day with 25% connection rate

**Supabase Setup:**

- Free tier: 500MB database, 2GB bandwidth, 50,000 monthly active users
- More than enough for small team
- Easy to upgrade later if needed

**Vercel Setup:**

- Free tier: Unlimited deployments, 100GB bandwidth
- Perfect for this use case
- Deploy from GitHub in minutes
