# Sticky Navigation Implementation Plan

## Problem Statement
The ProgressNav sidebar currently scrolls the entire content (header, progress bar, current step preview, and step list) together. We need the header, progress bar, and current step preview to remain sticky at the top while only the step list scrolls.

## Exact Section to Make Sticky

### Component: `components/guide/ProgressNav.tsx`

**Lines 102-142 (to remain sticky at top):**
- Setup Guide header with gradient text
- Progress percentage display  
- Progress bar visualization
- Current Step Preview box (CURRENT STEP / UP NEXT)

**Lines 145-198 (to scroll independently):**
- List of all navigation steps with scroll behavior

## Current Architecture

```tsx
// Current structure (simplified)
<nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
  <div className="p-6">
    {/* Header */}
    {/* Progress Bar */}
    {/* Current Step Preview */}
    {/* Steps List */}
  </div>
</nav>
```

**Issue:** The entire `<div className="p-6">` scrolls together because `overflow-y-auto` is on the parent nav element.

## Solution Design

### Approach: Flexbox with Sticky Header + Scrollable Body

```tsx
<nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col">
  {/* Sticky section - stays at top */}
  <div className="flex-shrink-0 p-6 pb-0">
    {/* Header */}
    {/* Progress Bar */}
    {/* Current Step Preview */}
  </div>
  
  {/* Scrollable section - scrolls independently */}
  <div className="flex-1 overflow-y-auto px-6 pb-6">
    {/* Steps List */}
  </div>
</nav>
```

### Key Changes:

1. **Parent nav element:**
   - Remove `overflow-y-auto`
   - Add `flex flex-col` for vertical layout
   - Keep `fixed` positioning

2. **Sticky header section:**
   - Wrap header + progress + current step in `<div className="flex-shrink-0 p-6 pb-0">`
   - `flex-shrink-0` prevents compression
   - Maintain horizontal padding, remove bottom padding

3. **Scrollable list section:**
   - Wrap step list in `<div className="flex-1 overflow-y-auto px-6 pb-6">`
   - `flex-1` allows it to fill remaining space
   - `overflow-y-auto` enables vertical scrolling
   - Restore horizontal and bottom padding

## Implementation Steps

### Step 1: Update Nav Container
```tsx
// Change from:
className="progress-nav-desktop hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-border bg-background overflow-y-auto z-30"

// To:
className="progress-nav-desktop hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r border-border bg-background flex flex-col z-30"
```

### Step 2: Wrap Sticky Header Section
```tsx
{/* NEW: Sticky header container */}
<div className="flex-shrink-0 p-6 pb-0 bg-background">
  {/* Header */}
  <div className="mb-8">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
      Setup Guide
    </h2>
    <p className="mt-2 text-sm text-muted-foreground">
      Follow these steps to deploy your Web3 dApp
    </p>
  </div>

  {/* Progress Bar */}
  <div className="mb-8">
    {/* ... existing progress bar code ... */}
  </div>

  {/* Current Step Preview */}
  {activeStep && activeStep !== 'welcome' && (
    <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
      {/* ... existing current step preview code ... */}
    </div>
  )}
</div>
```

### Step 3: Wrap Scrollable Steps List
```tsx
{/* NEW: Scrollable steps container */}
<div className="flex-1 overflow-y-auto px-6 pb-6">
  <div ref={stepListRef} className="space-y-1">
    {steps.map((step) => {
      {/* ... existing step mapping code ... */}
    })}
  </div>
</div>
```

## Edge Cases & Considerations

### 1. Small Screens
- Test on screens where sticky section takes >50% of viewport
- Ensure at least 2-3 steps are visible in scrollable area

### 2. Background Color
- Add `bg-background` to sticky header to prevent transparency
- Ensures clean appearance when scrolling

### 3. Mobile View
- Changes only affect desktop (md:block)
- Mobile top bar remains unchanged

### 4. Auto-scroll Behavior
- Existing `scrollIntoView` logic on stepListRef remains compatible
- Works within new scrollable container

### 5. Browser Compatibility
- Flexbox is well-supported (IE11+)
- No bleeding-edge CSS features required

## Testing Plan

### Local Development Test
```bash
npm run dev
```

**Test Cases:**
1. ✅ Navigate to `/guide` page (must be authenticated)
2. ✅ Scroll content to verify header/progress/current-step stay fixed
3. ✅ Verify step list scrolls independently
4. ✅ Click different steps to test auto-scroll
5. ✅ Resize browser window to test responsive behavior
6. ✅ Test dark/light mode for visual consistency

### Vercel Build Test
```bash
npm run build
npm run start
```

**Test Cases:**
1. ✅ Build completes without errors
2. ✅ Production bundle size unchanged
3. ✅ Sticky behavior works in production build
4. ✅ No console errors or warnings

### Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## Rollback Plan

If issues occur:
1. Revert to original structure with single scrolling container
2. Git command: `git checkout HEAD -- components/guide/ProgressNav.tsx`

## Success Criteria

✅ Header, progress bar, and current step preview remain fixed at top  
✅ Only step list scrolls independently  
✅ No visual regressions (spacing, colors, borders)  
✅ Auto-scroll to active step still works  
✅ Mobile view unaffected  
✅ Vercel build succeeds  
✅ No new console errors  
✅ Performance unchanged  

## Files Modified

- `components/guide/ProgressNav.tsx` (lines 90-200)

## Dependencies

None - uses existing Tailwind CSS utilities

## Estimated Time

- Implementation: 10 minutes
- Testing: 15 minutes
- Total: 25 minutes

