# Homepage Hero Section Cleanup Plan

## Overview
Update the homepage to remove specific elements and enhance the DevDapp messaging as specified in user requirements.

## Changes Required

### 1. Remove Root Logo
- **Component**: `components/hero.tsx`
- **Target**: Lines 40-51 - Remove the entire DevDapp logo section
- **Reason**: User specifically requested to remove the "root logo from the top of the website"

### 2. Delete Web2 Benefits Text
- **Component**: `components/problem-explanation-section.tsx`
- **Target**: Line 51 - Remove "✨ Ship fast, iterate quickly, scale seamlessly"
- **Impact**: The Web2 card will lose its positive call-out text but maintain the feature list

### 3. Delete Web3 Problems Text
- **Component**: `components/problem-explanation-section.tsx`  
- **Target**: Line 90 - Remove "⚠️ Steep learning curve, hidden costs, expert dependency"
- **Impact**: The Web3 card will lose its warning call-out text but maintain the feature list

### 4. Update DevDapp Messaging
- **Component**: `components/problem-explanation-section.tsx`
- **Target**: Line 101 - Update text content
- **Current**: "DevDapp makes Web3 development as easy as Web2"
- **New**: "Until Now, Only DevDapp makes Web3 development as easy as Web2"

### 5. Make Text Interactive on Scroll
- **Component**: `components/problem-explanation-section.tsx`
- **Enhancement**: Add scroll-triggered animations and prominence
- **Implementation**: 
  - Add scroll detection using `useEffect` and `useState`
  - Apply scaling, color changes, or other visual effects when text comes into view
  - Use CSS transforms and transitions for smooth animations

## Technical Implementation

### Files to Modify
1. `components/hero.tsx` - Remove logo section
2. `components/problem-explanation-section.tsx` - Remove texts and update messaging with interactivity

### Dependencies
- May need to add intersection observer or scroll event listeners
- Ensure animations are smooth and performant
- Maintain responsive design across all screen sizes

## Testing Requirements
- Verify logo removal doesn't break layout
- Confirm text deletions maintain card structure
- Test scroll animations work properly on different devices
- Ensure accessibility is maintained

## Deployment
- Changes will trigger automatic Vercel build upon GitHub push
- No environment variable changes required
- No database migrations needed

## Timeline
- Implementation: 30 minutes
- Testing: 15 minutes
- Deployment: Automatic upon commit

## Success Criteria
- [ ] DevDapp logo removed from hero section
- [ ] Web2 benefits text deleted
- [ ] Web3 problems text deleted  
- [ ] DevDapp text updated with new messaging
- [ ] New text has prominent, interactive scroll behavior
- [ ] All changes deployed and live on Vercel
