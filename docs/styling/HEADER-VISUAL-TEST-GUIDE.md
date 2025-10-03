# Header Navigation - Visual Testing Guide

**Date**: October 3, 2025  
**Purpose**: Quick visual reference for testing header fixes across all pages

---

## Quick Reference: What Should You See?

### 🖥️ Desktop (≥768px width)

#### When LOGGED OUT
```
┌─────────────────────────────────────────────────────────────┐
│ [DevDapp Logo] [Guide]        [🌙] [Sign in] [Sign up]      │
└─────────────────────────────────────────────────────────────┘
```
**Expected Elements:**
- ✅ Logo (left)
- ✅ Guide button (left, next to logo)
- ✅ Theme switcher (right side)
- ✅ Sign in button (right side)
- ✅ Sign up button (right side)
- ❌ NO Profile button
- ❌ NO Logout button
- ❌ NO Hamburger menu

#### When LOGGED IN
```
┌─────────────────────────────────────────────────────────────────────┐
│ [DevDapp Logo] [Guide]   [🌙] Hey, user@email.com! [Profile] [Logout] │
└─────────────────────────────────────────────────────────────────────┘
```
**Expected Elements:**
- ✅ Logo (left)
- ✅ Guide button (left, next to logo)
- ✅ Theme switcher (right side)
- ✅ User email (right side)
- ✅ Profile button (right side)
- ✅ Logout button (right side)
- ❌ NO Sign in button
- ❌ NO Sign up button
- ❌ NO Hamburger menu

---

### 📱 Mobile (<768px width)

#### When LOGGED OUT
```
┌──────────────────────────────────┐
│ [DevDapp Logo]  [🌙] [Sign in] [Sign up] │
└──────────────────────────────────┘
```
**Expected Elements:**
- ✅ Logo (left)
- ✅ Theme switcher (right side)
- ✅ Sign in button (right side)
- ✅ Sign up button (right side)
- ❌ NO Guide button
- ❌ NO Profile button
- ❌ NO Logout button
- ❌ NO Hamburger menu (not needed)

#### When LOGGED IN
```
┌──────────────────────────────────┐
│ [DevDapp Logo]         [🌙] [☰]  │
└──────────────────────────────────┘
                              │
                              └─ Opens Menu:
                                 ┌─────────────────┐
                                 │ user@email.com  │
                                 ├─────────────────┤
                                 │ Guide           │
                                 │ Profile         │
                                 ├─────────────────┤
                                 │ Logout          │
                                 └─────────────────┘
```
**Expected Elements:**
- ✅ Logo (left)
- ✅ Theme switcher (right side)
- ✅ Hamburger menu icon (☰) (right side)
- ❌ NO Guide button visible (it's in menu)
- ❌ NO Profile button visible (it's in menu)
- ❌ NO Logout button visible (it's in menu)
- ❌ NO Sign in/Sign up buttons

**Hamburger Menu Contents:**
- ✅ User email at top
- ✅ Guide link
- ✅ Profile link
- ✅ Logout link (red color)

---

## Page-by-Page Testing Matrix

| Page | URL | Desktop Logged Out | Desktop Logged In | Mobile Logged Out | Mobile Logged In |
|------|-----|-------------------|------------------|------------------|-----------------|
| **Homepage** | `/` | Sign in + Sign up | Guide + Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Guide** | `/guide` | Sign in + Sign up | Guide + Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Profile** | `/protected/profile` | Redirect to login | Guide + Profile + Logout | Redirect to login | Hamburger with Guide |
| **Flow** | `/flow` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Root** | `/root` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Avalanche** | `/avalanche` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **ApeChain** | `/apechain` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Tezos** | `/tezos` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |
| **Stacks** | `/stacks` | Sign in + Sign up | Profile + Logout | Sign in + Sign up | Hamburger with Guide |

---

## Critical Test Cases

### Test 1: Logged Out Homepage
1. Go to `/`
2. **Desktop**: Should see Sign in + Sign up buttons
3. **Mobile**: Should see Sign in + Sign up buttons
4. **Should NOT see**: Profile, Logout, or Hamburger menu

### Test 2: Logged In Homepage
1. Sign in to account
2. Go to `/`
3. **Desktop**: Should see Guide button, Profile, Logout
4. **Mobile**: Should see Hamburger menu (☰)
5. Click hamburger on mobile → Should see Guide, Profile, Logout

### Test 3: Mobile Hamburger Menu Navigation
1. Sign in to account
2. On mobile view, click hamburger menu (☰)
3. Menu should show:
   - Your email at top
   - Guide link
   - Profile link
   - Logout link (in red)
4. Click "Guide" → Should navigate to `/guide`
5. Click "Profile" → Should navigate to `/protected/profile`
6. Click "Logout" → Should sign out and redirect to login

### Test 4: All Blockchain Pages
1. Visit each blockchain page (Flow, Root, Avalanche, ApeChain, Tezos, Stacks)
2. **When logged out**: Should see Sign in + Sign up
3. **When logged in**: 
   - Desktop: Should see Profile + Logout
   - Mobile: Should see Hamburger with Guide link

---

## Common Issues to Watch For

### ❌ PROBLEM: No buttons showing when logged out
**Expected**: Sign in + Sign up buttons should always show when logged out  
**If missing**: Check that `AuthButton` component is being rendered

### ❌ PROBLEM: No hamburger menu when logged in on mobile
**Expected**: Hamburger icon (☰) should show on mobile when logged in  
**If missing**: Check that `MobileMenu` component is being rendered

### ❌ PROBLEM: Guide link missing from hamburger menu
**Expected**: Guide link should appear in hamburger menu when logged in  
**If missing**: Verify `showGuideButton={true}` is passed to `AuthButton`

### ❌ PROBLEM: Desktop shows hamburger menu
**Expected**: Hamburger should only show on mobile (< 768px)  
**If showing on desktop**: Check CSS class `md:hidden` is applied

---

## Browser/Device Testing Matrix

### Desktop Browsers (≥768px)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari (iPhone)
- [ ] Chrome Mobile (Android)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Device Sizes to Test
- [ ] **Mobile Small** (iPhone SE: 375px width)
- [ ] **Mobile Medium** (iPhone 12: 390px width)
- [ ] **Mobile Large** (iPhone 14 Pro Max: 430px width)
- [ ] **Tablet** (iPad: 768px width)
- [ ] **Desktop Small** (1024px width)
- [ ] **Desktop Large** (1920px width)

---

## Responsive Breakpoint

**Critical Breakpoint**: `768px` (defined by `md:` in Tailwind)

- **< 768px**: Mobile layout (hamburger menu when logged in)
- **≥ 768px**: Desktop layout (full buttons visible)

---

## Quick Test Script

```bash
# Test in different viewport sizes using Chrome DevTools

# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
# 3. Test these sizes:

- iPhone SE (375x667)
- iPhone 12 Pro (390x844)
- iPad (768x1024)
- Desktop (1920x1080)

# 4. For each size:
#    - Test logged out state
#    - Sign in
#    - Test logged in state
#    - Verify hamburger menu (mobile) or buttons (desktop)
```

---

## Success Criteria

All fixes are successful when:

1. ✅ **Logged out users** can always see Sign in + Sign up buttons on all pages
2. ✅ **Logged in users** see Profile + Logout on desktop
3. ✅ **Logged in users** see hamburger menu on mobile
4. ✅ **Hamburger menu** contains Guide, Profile, and Logout links
5. ✅ **Guide link** navigates correctly to `/guide`
6. ✅ **No layout overflow** on any screen size
7. ✅ **Sticky header** works on both desktop and mobile

---

**Testing Priority**: High  
**Before Deployment**: Complete all critical test cases  
**After Deployment**: Monitor for any user reports

