# Homepage Improvements Plan
*Date: September 12, 2025*

## Overview
This plan addresses two specific improvements to the homepage components:
1. Remove the backed by section subheading and optimize padding
2. Update the final CTA section headline to be more ambitious

## Task 1: Backed By Section Improvements

### Current State
- **Component**: `components/backed-by-section.tsx`
- **Current Subheading**: "Leading Web3 Funds and Foundations" (line 15)
- **Current Padding**: Section uses `py-20` (top/bottom), header content has `mb-16` (bottom margin)

### Requirements
- **Remove Subheading**: Delete the `<p>` tag containing "Leading Web3 Funds and Foundations"
- **Optimize Padding**: Ensure spacing between "Backed By" heading and logo grid is appropriate
- **Maintain Visual Balance**: Keep clean layout without excessive whitespace

### Implementation Plan
1. Remove the subheading paragraph element (lines 14-16)
2. Adjust margin-bottom on the header div if needed to optimize spacing
3. Test visual balance between heading and logo grid

### Expected Changes
```tsx
// BEFORE
<div className="text-center mb-16">
  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
    Backed By
  </h2>
  <p className="text-lg text-muted-foreground">
    Leading Web3 Funds and Foundations
  </p>
</div>

// AFTER  
<div className="text-center mb-12">
  <h2 className="text-3xl lg:text-4xl font-bold mb-8">
    Backed By
  </h2>
</div>
```

## Task 2: Final CTA Section Update

### Current State
- **Component**: `components/final-cta-section.tsx`
- **Current Headline**: "Ready to Build Your Web3 dApp?" (line 9)
- **Context**: Main CTA heading in final section before footer

### Requirements
- **Update Text**: Change to "Ready to Build and Scale the Next Web3 Unicorn?"
- **Maintain Styling**: Keep all existing classes and layout
- **Preserve Responsiveness**: Ensure text works well on mobile devices

### Implementation Plan
1. Update the heading text in line 9
2. Verify text length works well on mobile screens
3. Maintain existing `text-3xl lg:text-4xl font-bold mb-6` styling

### Expected Changes
```tsx
// BEFORE
<h2 className="text-3xl lg:text-4xl font-bold mb-6">
  Ready to Build Your Web3 dApp?
</h2>

// AFTER
<h2 className="text-3xl lg:text-4xl font-bold mb-6">
  Ready to Build and Scale the Next Web3 Unicorn?
</h2>
```

## Risk Assessment

### Low Risk Changes
- Both changes are simple text/markup modifications
- No new dependencies or complex logic required
- Existing styling and responsive behavior preserved

### Testing Requirements
- Visual review of backed by section spacing
- Mobile responsive check for new CTA text length
- Overall page layout validation

## Success Criteria
1. **Task 1**: Backed by section has clean heading without subtext and appropriate spacing
2. **Task 2**: Final CTA section displays new ambitious headline properly
3. **Overall**: Homepage maintains professional appearance and responsive behavior

## Implementation Timeline
- **Estimated Time**: 10-15 minutes
- **Priority**: High (user-requested changes)
- **Dependencies**: None
