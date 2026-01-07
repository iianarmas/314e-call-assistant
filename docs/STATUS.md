# Project Status - 314e Call Assistant App

**Last Updated:** January 7, 2026  
**Project Location:** `C:\Users\iian\Documents\JavaScript\projects\314e`

---

## ✅ What's Complete

### 1. Project Setup

- ✅ Vite + React initialized
- ✅ Tailwind CSS v3 configured
- ✅ Folder structure created:
  ```
  src/
  ├── components/
  ├── pages/
  ├── hooks/
  ├── lib/
  │   ├── supabase.js (configured)
  │   └── claude.js (configured)
  └── utils/
  docs/
  ├── project-brief.md (complete)
  ├── dexit-main-script.md (needs content)
  ├── dexit-ambulatory-script.md (needs content)
  └── muspell-script.md (needs content)
  ```

### 2. Database (Supabase)

- ✅ Account created
- ✅ Project: `314e-call-assistant`
- ✅ Tables created:
  - `contacts` (name, company, title, product, notes)
  - `call_logs` (contact_id, call data, qualifications, objections, outcomes)
- ✅ Connection tested and working
- ✅ Credentials in `.env.local`

### 3. Claude API

- ✅ Account created at console.anthropic.com
- ✅ API key configured in `.env.local`
- ✅ Connection tested and working
- ✅ Credits added: $4.99 remaining
- ✅ Using model: `claude-sonnet-4-20250514`

### 4. Environment Variables

File: `.env.local` (already configured, do not commit to git)

```
VITE_SUPABASE_URL=https://xiehsizcoxjmaagrqeyu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📋 What Needs to Be Done

### Immediate Next Steps (Priority 1)

1. **Add Script Content to docs folder**

   - Copy Dexit main script → `docs/dexit-main-script.md`
   - Copy Dexit ambulatory script → `docs/dexit-ambulatory-script.md`
   - Copy Muspell script → `docs/muspell-script.md`

2. **Build Contact Management**

   - Add new contact form
   - Search/filter contacts
   - Edit contact details
   - View contact list

3. **Build Script Generation Engine**

   - Read scripts from docs folder
   - Generate opening scripts based on:
     - Contact role (IT vs HIM for Dexit)
     - Product (Dexit vs Muspell)
     - Trigger info (for Muspell)
   - Use Claude API to personalize scripts

4. **Build Call Interface**

   - Display contact info
   - Show generated opening script
   - Quick-log fields for Dexit qualification:
     - EHR system (dropdown + custom)
     - DMS system (dropdown + custom)
     - Team size (text input)
     - Document volume (text input)
     - Challenges (textarea)
     - Manual processes (yes/no toggle)
   - Progress indicator (X/6 items for demo qualification)
   - Notes field for Muspell triggers

5. **Build Objection Handler**

   - Dropdown for common objections (pre-loaded from scripts)
   - Free text input for custom objections
   - AI generates response using Claude API
   - Response format: Acknowledge → Reframe → Ask for meeting
   - Keep responses 2-4 sentences max

6. **Build Closing Scripts**
   - Demo scheduling script (for Dexit with 4+ qualifications)
   - Discovery call script (standard)
   - Alternative: Direct demo with product expert

---

### Future Enhancements (Priority 2)

7. **Script & Knowledge Management**

   - Upload new script versions
   - Version history
   - Best practices library
   - Company updates/instructions storage

8. **Navigation Scenarios**
   - "Person no longer here" scripts
   - "Wrong person" redirects
   - Gatekeeper handling
   - Quick-access common scenarios

---

## 🎯 Key Requirements

### Script Generation Guidelines

- **Conversational tone** - not robotic
- **Simple language** - no jargon unless necessary
- **Concise** - 2-4 sentences max
- **Always lead to scheduling** - every response should attempt to get a meeting

### Simplify Technical Terms

- "FHIR-native" → "works with modern health data standards"
- "SSO integration" → "single login system"
- "go-live concurrently" → "launches at the same time"

### UX Priorities

- Minimal clicks during live calls
- Fast input methods (dropdowns + quick buttons where possible)
- Clear guidance on what to do next
- Progressive disclosure based on context
- Works well on desktop (tablet support nice-to-have)

---

## 💰 Cost Tracking

**Current Status:**

- Supabase: Free tier (plenty for small team)
- Vercel: Not deployed yet (free tier when ready)
- Claude API: $4.99 credits remaining

**Expected Usage:**

- ~100 calls/day
- ~25 live conversations
- ~4 API calls per conversation
- **Estimated cost: ~$24/month**

---

## 📦 Dependencies Installed

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@supabase/supabase-js": "latest",
    "@anthropic-ai/sdk": "latest"
  },
  "devDependencies": {
    "vite": "^7.x",
    "tailwindcss": "^3.x",
    "postcss": "latest",
    "autoprefixer": "latest"
  }
}
```

---

## 🚀 How to Continue Development

### Start the dev server:

```bash
cd C:\Users\iian\Documents\JavaScript\projects\314e
npm run dev
```

### Access the app:

```
http://localhost:5173/
```

### File Structure Reference:

- **Components:** `src/components/` - Reusable UI components
- **Pages:** `src/pages/` - Full page views
- **Hooks:** `src/hooks/` - Custom React hooks
- **Library:** `src/lib/` - API clients (Supabase, Claude)
- **Utils:** `src/utils/` - Helper functions
- **Docs:** `docs/` - Scripts and project documentation

---

## 📝 Important Notes

1. **User Context:**

   - English is not primary language - scripts must be reliable
   - Calling 100 numbers/day, ~25 live conversations
   - Cold calling healthcare organizations (hospitals, health systems)
   - Target roles: Directors, Managers in IT, HIM, PMO

2. **Products:**

   - **Dexit:** Document processing automation (AI/ML)
   - **Muspell:** EHR data archival for migrations/M&A

3. **Key Differentiators:**

   - Dexit demo qualification: Need 4+ data points to offer demo instead of discovery
   - Muspell is trigger-based: migrations, acquisitions, upgrades

4. **Database Schema:**
   - `contacts` table: stores prospect information
   - `call_logs` table: stores call history and qualification data
   - Both have RLS enabled with public access policies (single user for now)

---

## 🎨 Design Direction

- Clean, professional interface
- Focus on speed and efficiency
- Tailwind CSS for styling
- Primary colors: Blue/Green (trustworthy, tech-forward)
- Mobile-responsive (desktop-first)

---

## 🔐 Security Notes

- `.env.local` is gitignored
- API keys are client-side (acceptable for now since user-only app)
- For team deployment: Consider moving sensitive operations to serverless functions
- Supabase RLS policies currently allow all (update when adding auth)

---

## Next Session Prompt

Use this when starting with a new Claude:

> "I'm continuing development on the 314e Call Assistant app. The project is at `C:\Users\iian\Documents\JavaScript\projects\314e`. All setup is complete (Vite, React, Tailwind, Supabase, Claude API tested and working). Check `docs/project-brief.md` for complete requirements and `docs/STATUS.md` for current progress. Let's start building the contact management and script generation features. Focus on creating a simple, fast interface for real-time call assistance."
