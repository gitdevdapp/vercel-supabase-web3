# Backed By Section Move and Content Update Plan

## Current State Analysis

### Current Section Order (app/page.tsx)
1. Hero
2. ProblemExplanationSection  
3. HowItWorksSection
4. FeaturesSection
5. **BackedBySection** (currently here)
6. FoundationSection
7. FinalCtaSection

### Current BackedBySection Structure
- Location: `components/backed-by-section.tsx`
- Heading: h2 with `text-3xl lg:text-4xl font-bold` (already appropriate styling)
- Content: Investor logos + accelerator credentials

### Text to Replace
- Location: `components/foundation-section.tsx` lines 12-14
- Current text: "DevDapp is committed to 100% open source and free forever. With 0 cost Vercel + Supabase + Web3"
- New text: "With our 0 cost AI starter framework, new users can scale to million+ user production dApps for free, growing the utilization of underlying Web3 infrastructure"

## Implementation Plan

### Step 1: Move BackedBySection to Bottom
**File**: `app/page.tsx`
- Move `<BackedBySection />` from line 50 to after `<FinalCtaSection />` (line 52)
- New order will be: Hero → Problem → HowItWorks → Features → Foundation → FinalCta → **BackedBy**

### Step 2: Update Foundation Section Text  
**File**: `components/foundation-section.tsx`
- Replace text in paragraph (lines 12-14)
- Maintain existing styling and structure
- Update the rest of the paragraph to flow naturally with new text

### Step 3: Verification Steps
1. **Styling Verification**: Confirm BackedBySection heading already matches site pattern
2. **Local Build Test**: Run `npm run build` to ensure no breaking changes
3. **Visual Check**: Verify new position and text flow properly
4. **Responsive Check**: Ensure mobile/desktop layouts work correctly

### Step 4: Deployment
1. Commit changes to remote main branch
2. Trigger Vercel deployment
3. Verify live site functionality

## Expected Outcome

### New Section Order
1. Hero
2. ProblemExplanationSection  
3. HowItWorksSection
4. FeaturesSection
5. FoundationSection (with updated text)
6. FinalCtaSection
7. **BackedBySection** (moved to bottom)

### Benefits of New Layout
- BackedBySection serves as credibility reinforcement after the call-to-action
- Foundation section flows better positioned earlier in the narrative
- Updated text emphasizes scalability and infrastructure benefits

## Risk Assessment
- **Low Risk**: Simple component reordering and text replacement
- **No Breaking Changes**: No component structure modifications
- **Styling**: BackedBySection already has appropriate h2 styling matching site pattern
