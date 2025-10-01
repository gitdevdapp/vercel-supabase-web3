# Scroll-Synced Progress Navigation

## Problem
The left sidebar progress navigation doesn't auto-scroll to show the active step when users scroll through the guide content. The active step indicator updates correctly via IntersectionObserver, but the sidebar stays at its current scroll position, making it hard to see which step is currently active if it's out of view.

## Solution
Implement auto-scrolling in the sidebar to keep the active step centered/visible when the active step changes.

## Implementation Plan

### 1. Add useRef for Step List Container
Add a ref to track the scrollable container containing the step list:
```tsx
const stepListRef = useRef<HTMLDivElement>(null)
```

### 2. Add useEffect to Sync Scroll on Active Step Change
When `activeStep` changes, scroll the sidebar to show the active step:
```tsx
useEffect(() => {
  if (!stepListRef.current) return
  
  const activeButton = stepListRef.current.querySelector(`[data-step-id="${activeStep}"]`)
  if (activeButton) {
    activeButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest', // or 'center' for centering
      inline: 'nearest'
    })
  }
}, [activeStep])
```

### 3. Update Step Buttons with Data Attribute
Add `data-step-id` to each step button for targeting:
```tsx
<button
  key={step.id}
  data-step-id={step.id}
  onClick={() => scrollToStep(step.id)}
  // ... rest of props
>
```

### 4. Attach Ref to Container
Wrap the step list in a div with the ref:
```tsx
<div ref={stepListRef} className="space-y-1">
  {steps.map((step) => (
    // ... step buttons
  ))}
</div>
```

## Code Changes Required

### File: `components/guide/ProgressNav.tsx`

**Line 3-4:** Add useRef import
```tsx
import { useEffect, useState, useRef } from 'react'
```

**After line 31:** Add ref
```tsx
const stepListRef = useRef<HTMLDivElement>(null)
```

**After line 61:** Add scroll sync effect
```tsx
useEffect(() => {
  if (!stepListRef.current) return
  
  const activeButton = stepListRef.current.querySelector(`[data-step-id="${activeStep}"]`)
  if (activeButton) {
    activeButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    })
  }
}, [activeStep])
```

**Line 130:** Update the div to include ref
```tsx
<div ref={stepListRef} className="space-y-1">
```

**Line 136:** Add data-step-id attribute
```tsx
<button
  key={step.id}
  data-step-id={step.id}
  onClick={() => scrollToStep(step.id)}
  className={`w-full text-left rounded-lg p-3 transition-all ${
```

## Non-Breaking Considerations

1. **Desktop Only**: Only affects desktop sidebar (hidden on mobile)
2. **Smooth Behavior**: Uses `behavior: 'smooth'` for gradual scrolling
3. **block: 'nearest'**: Won't scroll if already visible, preventing jarring movements
4. **Guard Clause**: Checks ref exists before scrolling
5. **No DOM Changes**: Only adds ref and data attribute, no structural changes
6. **Backwards Compatible**: Works with existing IntersectionObserver logic

## Testing Checklist

- [ ] Verify scroll syncs when scrolling guide content
- [ ] Check smooth scrolling behavior
- [ ] Ensure no scroll when step already visible
- [ ] Test on different screen sizes (desktop only)
- [ ] Verify clicking steps still works
- [ ] Confirm no scroll on mobile (nav is different)
- [ ] Run `npm run build` locally
- [ ] Check for TypeScript errors
- [ ] Verify no layout shifts or jumps

## Alternative Approaches

1. **scroll-margin**: Add CSS `scroll-margin-top` to buttons
2. **scrollIntoViewIfNeeded**: Use non-standard API (less compatible)
3. **Manual scroll calculation**: Calculate scroll position manually (more complex)
4. **Intersection Observer on sidebar**: Detect when active step is out of view

## Recommended Approach
Option 1 (scrollIntoView with 'nearest') - Simple, smooth, and prevents unnecessary scrolling.

