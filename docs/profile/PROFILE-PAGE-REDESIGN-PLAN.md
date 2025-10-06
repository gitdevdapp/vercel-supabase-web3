# Profile Page Redesign Plan
**Version:** 1.0  
**Date:** October 6, 2025  
**Type:** Pure Frontend Design Reorganization  
**Status:** PLANNING PHASE

---

## Executive Summary

This document outlines a comprehensive plan to reorganize the profile page (`/app/protected/profile/page.tsx`) for both desktop and mobile devices. The goal is to improve the user experience by:

1. **Making wallet functionality prominent** - Moving wallet to center stage
2. **Condensing profile information** - Left-justifying and streamlining the profile section
3. **Improving space utilization** - Using accordions and collapsible elements
4. **Maintaining full functionality** - Zero breaking changes to existing features

### Critical Requirements
- ✅ **Non-styling breaking** - Only layout/positioning changes
- ✅ **Non-Vercel breaking** - No build/deploy config changes
- ✅ **Non-functionality breaking** - All buttons, interactions, and features remain accessible
- ✅ **Pure frontend design work** - No backend/API changes

---

## Current Layout Analysis

### Desktop Layout (Current)
```
┌─────────────────────────────────────────────────────────┐
│  GUIDE ACCESS CTA BANNER (full width, 2-color border)  │
│  "🎉 You're in! Click here for exclusive access..."     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  INFO BANNER (full width)                                │
│  "This is your personal profile page..."                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  WELCOME HEADER                                          │
│  "Welcome, User!"                                        │
│  "Update your profile information..."                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           PROFILE FORM (max-w-3xl, centered)            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Avatar | My Profile                              │  │
│  │        | Welcome! Tell us about yourself         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Profile Picture Upload Section                   │  │
│  │ Email: user@example.com                          │  │
│  │ Username: JohnDoe                                │  │
│  │ About Me: (textarea - large)                     │  │
│  │ [Edit Profile] [Save] [Cancel]                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           WALLET CARD (max-w-3xl, centered)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 💼 My Wallet                                      │  │
│  │ Manage your testnet funds                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ Wallet Address: 0x123...                         │  │
│  │ ETH Balance | USDC Balance                       │  │
│  │ [Request Funds] [Send] [History]                 │  │
│  │ (expandable sections below)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (Current)
- Vertical stacking of all elements
- Full-width components
- Profile card takes significant space
- Wallet card below, requiring scroll

### Issues with Current Design
1. **Wallet functionality is buried** - Users must scroll to access primary feature
2. **Profile section too large** - Takes up prime real estate with less-used features
3. **Banners take too much space** - Guide access banner always visible
4. **Poor space utilization** - Lots of whitespace, centered cards
5. **About Me section large** - Less critical info takes prime space

---

## Proposed Desktop Layout

### Overall Structure
```
┌─────────────────────────────────────────────────────────────────────────┐
│  [▼] GUIDE ACCESS (Collapsible, starts collapsed)                       │
│  Click to expand: "🎉 Access your exclusive setup guide..."             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬────────────────────────────────────────────────┐
│  LEFT SIDEBAR        │  MAIN CONTENT AREA                             │
│  (Profile Section)   │  (Wallet Section - Primary Focus)              │
│  width: ~320px       │  flex-1 (remaining space)                      │
│                      │                                                 │
│  ┌────────────────┐ │  ┌──────────────────────────────────────────┐ │
│  │ [Avatar]       │ │  │  💼 My Wallet                             │ │
│  │    User        │ │  │  Manage testnet funds (Base Sepolia)     │ │
│  │  @username     │ │  ├──────────────────────────────────────────┤ │
│  └────────────────┘ │  │                                           │ │
│                      │  │  Wallet Address: 0x123...  [Copy]        │ │
│  Email:              │  │                                           │ │
│  user@example.com    │  │  ┌──────────────┬──────────────┐        │ │
│                      │  │  │ ETH Balance  │ USDC Balance │        │ │
│  Username:           │  │  │ 0.0050 ETH   │ 10.00 USDC   │        │ │
│  JohnDoe             │  │  └──────────────┴──────────────┘        │ │
│                      │  │                                           │ │
│  [Edit Profile]      │  │  🟢 Connected to Base Sepolia            │ │
│                      │  │                                           │ │
│  ───────────────     │  │  ┌────────────────────────────────────┐ │ │
│  [▼] About Me        │  │  │  [Request Funds] [Send] [History] │ │ │
│  (Collapsible)       │  │  └────────────────────────────────────┘ │ │
│                      │  │                                           │ │
│  ───────────────     │  │  [▼] Request Testnet Funds               │ │
│  [▼] Picture Upload  │  │  (Accordion - opens here)                │ │
│  (Collapsible)       │  │                                           │ │
│                      │  │  [▼] Send Funds                           │ │
│                      │  │  (Accordion - opens here)                │ │
│                      │  │                                           │ │
│                      │  │  [▼] Transaction History                  │ │
│                      │  │  (Accordion - opens here)                │ │
│                      │  │                                           │ │
│                      │  └──────────────────────────────────────────┘ │
└──────────────────────┴────────────────────────────────────────────────┘
```

### Desktop Layout Details

#### 1. Top Banner Section
**Guide Access CTA (Collapsible)**
- **Default State:** Collapsed (only show one-line teaser)
- **Collapsed View:**
  ```
  [▼] 🎉 Guide Access Available - Click to expand
  ```
- **Expanded View:** Full current banner content
- **Implementation:** 
  - Use `useState` for collapse state (default: `false`)
  - Use Accordion component or custom collapsible
  - Save state to `localStorage` to persist preference
  - Small, unobtrusive when collapsed
  - Icons: `ChevronDown` / `ChevronRight` from lucide-react

**Removed Elements:**
- ❌ Info banner ("This is your personal profile page...") - Not needed, obvious from context
- ❌ Welcome header ("Welcome, User!") - Redundant, username shown in profile card

#### 2. Two-Column Layout
**Grid Structure:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
  {/* Left: Profile */}
  {/* Right: Wallet */}
</div>
```

**Breakpoints:**
- `< lg (1024px)`: Single column (mobile layout)
- `≥ lg (1024px)`: Two-column layout

#### 3. Left Sidebar - Profile Section (Condensed)
**Fixed Width:** `320px` on desktop

**Layout:**
```tsx
<div className="space-y-4">
  {/* Compact Profile Card */}
  <Card>
    <CardContent className="pt-6">
      {/* Avatar - Centered */}
      <div className="flex flex-col items-center gap-3">
        <Avatar size="lg" /> {/* 80x80px */}
        <div className="text-center">
          <h2 className="font-semibold text-lg">{username}</h2>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>
      
      {/* Read-only Info - Compact */}
      <div className="space-y-3 mt-4">
        <div>
          <Label className="text-xs">Email</Label>
          <div className="text-sm text-muted-foreground truncate">
            {email}
          </div>
        </div>
        <div>
          <Label className="text-xs">Username</Label>
          <div className="text-sm">{username}</div>
        </div>
      </div>
      
      {/* Edit Button - Prominent */}
      <Button className="w-full mt-4">
        Edit Profile
      </Button>
    </CardContent>
  </Card>
  
  {/* Collapsible: About Me */}
  <Accordion type="single" collapsible>
    <AccordionItem value="about">
      <AccordionTrigger>About Me</AccordionTrigger>
      <AccordionContent>
        <textarea /> {/* Edit mode */}
        <div>{aboutMe}</div> {/* Read mode */}
        <Button>Save</Button>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  
  {/* Collapsible: Profile Picture Upload */}
  <Accordion type="single" collapsible>
    <AccordionItem value="picture">
      <AccordionTrigger>Profile Picture</AccordionTrigger>
      <AccordionContent>
        <ProfileImageUploader />
        {/* Or URL input */}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

**Key Features:**
- ✅ Compact, clean design
- ✅ Avatar prominent at top
- ✅ Essential info visible (email, username)
- ✅ Edit button easily accessible
- ✅ Less-used features (About Me, Picture Upload) in accordions
- ✅ All functionality preserved

#### 4. Right Main Area - Wallet Section (Primary Focus)
**Full Width:** `flex-1` (takes remaining space)

**Layout:**
```tsx
<Card className="h-fit"> {/* h-fit to not stretch unnecessarily */}
  <CardHeader>
    <div className="flex items-center gap-3">
      <Wallet className="w-6 h-6" />
      <div>
        <CardTitle>My Wallet</CardTitle>
        <CardDescription>Base Sepolia Testnet</CardDescription>
      </div>
    </div>
  </CardHeader>
  
  <CardContent className="space-y-6">
    {/* Wallet Info - Prominent */}
    <div className="space-y-4">
      {/* Address */}
      <div>
        <Label>Wallet Address</Label>
        <div className="flex gap-2">
          <Input value={address} readOnly className="font-mono" />
          <Button onClick={copy}><Copy /></Button>
        </div>
      </div>
      
      {/* Balances - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <Label className="text-xs">ETH Balance</Label>
          <div className="text-2xl font-bold">{eth}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <Label className="text-xs">USDC Balance</Label>
          <div className="text-2xl font-bold">{usdc}</div>
        </div>
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Connected to Base Sepolia
      </div>
    </div>
    
    {/* Action Buttons - Prominent */}
    <div className="grid grid-cols-3 gap-3">
      <Button variant="outline">
        <Droplet /> Request Funds
      </Button>
      <Button variant="outline">
        <Send /> Send
      </Button>
      <Button variant="outline">
        <History /> History
      </Button>
    </div>
    
    {/* Expandable Sections - Accordion Style */}
    <Accordion type="single" collapsible>
      {/* Request Funds */}
      <AccordionItem value="fund">
        <AccordionTrigger>Request Testnet Funds</AccordionTrigger>
        <AccordionContent>
          {/* Current fund UI */}
        </AccordionContent>
      </AccordionItem>
      
      {/* Send Funds */}
      <AccordionItem value="send">
        <AccordionTrigger>Send Funds</AccordionTrigger>
        <AccordionContent>
          {/* Current send UI */}
        </AccordionContent>
      </AccordionItem>
      
      {/* Transaction History */}
      <AccordionItem value="history">
        <AccordionTrigger>Transaction History</AccordionTrigger>
        <AccordionContent>
          <TransactionHistory />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </CardContent>
</Card>
```

**Key Features:**
- ✅ Center stage placement
- ✅ Large, readable balances
- ✅ Easy access to all wallet functions
- ✅ Expandable sections keep UI clean
- ✅ All existing functionality preserved

---

## Proposed Mobile Layout

### Overall Structure (< 1024px)
```
┌─────────────────────────────────┐
│  [▼] Guide Access               │ ← Collapsible, collapsed by default
│  (Collapsed teaser)             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  COMPACT PROFILE CARD           │
│  ┌───────────────────────────┐  │
│  │  [Avatar] User @username  │  │ ← Small, horizontal layout
│  │  user@example.com         │  │
│  │  [Edit Profile]           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
    ↓ Fold line (visible without scroll)
┌─────────────────────────────────┐
│  WALLET CARD (Primary)          │
│  ┌───────────────────────────┐  │
│  │ 💼 My Wallet              │  │
│  │ 0x123... [Copy]           │  │
│  │                           │  │
│  │ ETH: 0.0050 | USDC: 10.00│  │
│  │ 🟢 Base Sepolia           │  │
│  │                           │  │
│  │ [Request] [Send] [History]│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
    ↓ (Scroll down)
┌─────────────────────────────────┐
│  Accordion: Request Funds       │
│  Accordion: Send Funds          │
│  Accordion: Transaction History │
└─────────────────────────────────┘
    ↓ (Scroll down)
┌─────────────────────────────────┐
│  Accordion: About Me            │
│  Accordion: Profile Picture     │
└─────────────────────────────────┘
```

### Mobile Layout Details

#### 1. Top Section - Guide Access
**Collapsible Banner (Collapsed by Default)**
```tsx
<Accordion type="single" collapsible className="mb-4">
  <AccordionItem value="guide" className="border-2 border-primary/30 rounded-lg">
    <AccordionTrigger className="px-4 py-3 hover:no-underline">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">🎉 Guide Access Available</span>
      </div>
    </AccordionTrigger>
    <AccordionContent className="px-4 pb-4">
      {/* Full guide CTA content */}
      <Button asChild className="w-full">
        <Link href="/guide">Access Guide</Link>
      </Button>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Height:** ~50px collapsed, saves space

#### 2. Compact Profile Card (Above Fold)
**Goal:** Show essential profile info in minimal space

```tsx
<Card className="mb-4">
  <CardContent className="p-4">
    {/* Horizontal Layout - Avatar + Info */}
    <div className="flex items-center gap-3 mb-3">
      <Avatar size="md" /> {/* 48x48px - smaller */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-base truncate">{username}</h2>
        <p className="text-xs text-muted-foreground truncate">@{username}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
    </div>
    
    {/* Edit Button - Full Width */}
    <Button variant="outline" className="w-full" size="sm">
      Edit Profile
    </Button>
  </CardContent>
</Card>
```

**Height:** ~120px - Compact, essential info only

#### 3. Wallet Card (Primary - Above/At Fold)
**Goal:** Immediately visible, shows key wallet info

```tsx
<Card className="mb-4">
  <CardHeader className="pb-3">
    <div className="flex items-center gap-2">
      <Wallet className="w-5 h-5" />
      <CardTitle className="text-lg">My Wallet</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {/* Address - Compact */}
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono truncate">{address}</div>
      </div>
      <Button size="sm" variant="ghost" onClick={copy}>
        <Copy className="w-3 h-3" />
      </Button>
    </div>
    
    {/* Balances - Compact Side by Side */}
    <div className="grid grid-cols-2 gap-2">
      <div className="p-3 border rounded-lg text-center">
        <div className="text-xs text-muted-foreground">ETH</div>
        <div className="text-lg font-bold">{eth}</div>
      </div>
      <div className="p-3 border rounded-lg text-center">
        <div className="text-xs text-muted-foreground">USDC</div>
        <div className="text-lg font-bold">{usdc}</div>
      </div>
    </div>
    
    {/* Status */}
    <div className="flex items-center gap-2 text-xs">
      <span className="w-2 h-2 bg-green-500 rounded-full" />
      Base Sepolia
    </div>
    
    {/* Action Buttons - Stacked for Mobile */}
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" size="sm" className="flex-col h-auto py-2">
        <Droplet className="w-4 h-4 mb-1" />
        <span className="text-xs">Request</span>
      </Button>
      <Button variant="outline" size="sm" className="flex-col h-auto py-2">
        <Send className="w-4 h-4 mb-1" />
        <span className="text-xs">Send</span>
      </Button>
      <Button variant="outline" size="sm" className="flex-col h-auto py-2">
        <History className="w-4 h-4 mb-1" />
        <span className="text-xs">History</span>
      </Button>
    </div>
  </CardContent>
</Card>
```

**Height:** ~320px - Fits most screens above/at fold with profile

#### 4. Accordion Sections (Below Fold)
**Wallet Actions First (Primary)**
```tsx
<Accordion type="single" collapsible className="space-y-2 mb-4">
  <AccordionItem value="fund" className="border rounded-lg px-4">
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <Droplet className="w-4 h-4" />
        Request Testnet Funds
      </div>
    </AccordionTrigger>
    <AccordionContent>
      {/* Fund wallet UI */}
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="send" className="border rounded-lg px-4">
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4" />
        Send Funds
      </div>
    </AccordionTrigger>
    <AccordionContent>
      {/* Send funds UI */}
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="history" className="border rounded-lg px-4">
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <History className="w-4 h-4" />
        Transaction History
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <TransactionHistory />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Profile Details Second (Less Important)**
```tsx
<Accordion type="single" collapsible className="space-y-2">
  <AccordionItem value="about" className="border rounded-lg px-4">
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        About Me
      </div>
    </AccordionTrigger>
    <AccordionContent>
      {/* About me edit UI */}
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="picture" className="border rounded-lg px-4">
    <AccordionTrigger>
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4" />
        Profile Picture
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <ProfileImageUploader />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Key Features:**
- ✅ Profile info visible but compact (above fold)
- ✅ Wallet info and actions immediately visible/accessible
- ✅ Accordion saves space while maintaining functionality
- ✅ Logical grouping (wallet actions, then profile details)
- ✅ All buttons and interactions accessible
- ✅ No horizontal scrolling
- ✅ Touch-friendly button sizes

---

## Implementation Plan

### Phase 1: Preparation
**Files to Modify:**
1. `app/protected/profile/page.tsx` - Main page layout
2. `components/simple-profile-form.tsx` - Refactor for new layout
3. `components/profile-wallet-card.tsx` - Refactor for new layout

**New Components to Create:**
1. `components/profile/CompactProfileCard.tsx` - Desktop left sidebar
2. `components/profile/MobileProfileHeader.tsx` - Mobile compact header
3. `components/profile/CollapsibleGuideAccess.tsx` - Reusable guide banner

**UI Components Needed (from shadcn/ui):**
- Already have: `Card`, `Button`, `Input`, `Label`
- May need: `Accordion` (check if already exists)

### Phase 2: Desktop Implementation

#### Step 1: Update Page Layout Structure
```tsx
// app/protected/profile/page.tsx

export default async function ProfilePage() {
  // ... existing auth and profile loading ...
  
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Collapsible Guide Access Banner */}
      <CollapsibleGuideAccess />
      
      {/* Desktop: Two-column layout, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Profile Section (Desktop sidebar, Mobile top) */}
        <div className="space-y-4">
          <CompactProfileCard 
            profile={profile} 
            userEmail={userEmail}
          />
          
          {/* Mobile only: Wallet comes here */}
          <div className="lg:hidden">
            <ProfileWalletCard />
          </div>
          
          {/* Accordion sections for less important features */}
          <ProfileAccordionSections 
            profile={profile}
            userEmail={userEmail}
          />
        </div>
        
        {/* Right: Wallet Section (Desktop main area, hidden on mobile) */}
        <div className="hidden lg:block">
          <ProfileWalletCard />
        </div>
      </div>
    </div>
  );
}
```

#### Step 2: Create CompactProfileCard Component
```tsx
// components/profile/CompactProfileCard.tsx

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type Profile } from "@/lib/profile";

interface CompactProfileCardProps {
  profile: Profile;
  userEmail: string;
}

export function CompactProfileCard({ profile, userEmail }: CompactProfileCardProps) {
  // Edit mode state and handlers
  // ...
  
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Avatar centered */}
        <div className="flex flex-col items-center gap-3">
          <Avatar 
            src={profile.profile_picture || profile.avatar_url}
            alt={profile.username || userEmail}
            fallbackText={profile.username || userEmail}
            size="lg"
          />
          <div className="text-center">
            <h2 className="font-semibold text-lg">{profile.username || 'User'}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username || 'username'}</p>
          </div>
        </div>
        
        {/* Essential info - read-only */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="text-sm truncate">{userEmail}</div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Username</Label>
            <div className="text-sm">{profile.username || 'Not set'}</div>
          </div>
        </div>
        
        {/* Edit button */}
        <Button className="w-full">
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Step 3: Create ProfileAccordionSections Component
```tsx
// components/profile/ProfileAccordionSections.tsx

'use client';

import { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { FileText, Camera } from "lucide-react";
import { ProfileImageUploader } from "@/components/profile-image-uploader";
import { type Profile } from "@/lib/profile";

interface ProfileAccordionSectionsProps {
  profile: Profile;
  userEmail: string;
}

export function ProfileAccordionSections({ profile, userEmail }: ProfileAccordionSectionsProps) {
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  
  // Save handlers
  // ...
  
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {/* About Me Section */}
      <AccordionItem value="about" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>About Me</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 space-y-3">
          {isEditingAbout ? (
            <>
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full min-h-[120px] p-3 border rounded-md"
                placeholder="Tell us about yourself..."
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveAbout}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingAbout(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.about_me || 'No description added yet.'}
              </div>
              <Button size="sm" onClick={() => setIsEditingAbout(true)}>Edit</Button>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
      
      {/* Profile Picture Section */}
      <AccordionItem value="picture" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Profile Picture</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <ProfileImageUploader
            userId={profile.id}
            currentImageUrl={profile.profile_picture || profile.avatar_url}
            username={profile.username || userEmail}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

#### Step 4: Create CollapsibleGuideAccess Component
```tsx
// components/profile/CollapsibleGuideAccess.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export function CollapsibleGuideAccess() {
  const [isOpen, setIsOpen] = useState<string | undefined>(undefined);
  
  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('guideAccessOpen');
    if (saved === 'true') {
      setIsOpen('guide');
    }
  }, []);
  
  // Save preference when changed
  const handleValueChange = (value: string) => {
    setIsOpen(value);
    localStorage.setItem('guideAccessOpen', value === 'guide' ? 'true' : 'false');
  };
  
  return (
    <Accordion 
      type="single" 
      collapsible 
      value={isOpen}
      onValueChange={handleValueChange}
    >
      <AccordionItem 
        value="guide" 
        className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline lg:px-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-semibold text-left">
              🎉 You&apos;re in! Click here for exclusive guide access
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 lg:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-muted-foreground flex-1">
              Follow our step-by-step guide to deploy your Web3 dApp in under 60 minutes
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/guide">
                <BookOpen className="w-5 h-5 mr-2" />
                Access Guide
              </Link>
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

#### Step 5: Update ProfileWalletCard for Desktop Layout
```tsx
// Modify components/profile-wallet-card.tsx

// Add className prop for flexibility
export function ProfileWalletCard({ className }: { className?: string }) {
  // ... existing code ...
  
  return (
    <Card className={cn("shadow-lg", className)}>
      {/* Keep existing structure, just ensure:
          1. Balances are prominent (larger text on desktop)
          2. Action buttons use Accordion for expandable sections
          3. Transaction history uses Accordion
      */}
    </Card>
  );
}
```

### Phase 3: Mobile Implementation

#### Step 1: Add Mobile-Specific Styles
- Use Tailwind `lg:` breakpoint for desktop-specific styles
- Use default (no prefix) for mobile styles
- Test at 375px, 390px, 414px widths (common mobile sizes)

#### Step 2: Mobile Profile Header
```tsx
// Mobile variant in CompactProfileCard.tsx

<Card className="lg:hidden mb-4"> {/* Mobile only */}
  <CardContent className="p-4">
    <div className="flex items-center gap-3 mb-3">
      <Avatar size="md" /> {/* Smaller on mobile */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-base truncate">{username}</h2>
        <p className="text-xs text-muted-foreground truncate">@{username}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
    </div>
    <Button variant="outline" className="w-full" size="sm">
      Edit Profile
    </Button>
  </CardContent>
</Card>
```

#### Step 3: Mobile Wallet Card Adjustments
```tsx
// In profile-wallet-card.tsx, add mobile-specific layout

<div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
  {/* Balances */}
  <div className="p-3 lg:p-4 border rounded-lg">
    <div className="text-xs lg:text-sm text-muted-foreground">ETH</div>
    <div className="text-lg lg:text-2xl font-bold">{eth}</div>
  </div>
  <div className="p-3 lg:p-4 border rounded-lg">
    <div className="text-xs lg:text-sm text-muted-foreground">USDC</div>
    <div className="text-lg lg:text-2xl font-bold">{usdc}</div>
  </div>
</div>

{/* Action buttons - 3 columns on mobile */}
<div className="grid grid-cols-3 gap-2 lg:gap-3">
  <Button 
    variant="outline" 
    size="sm" 
    className="flex-col h-auto py-2 lg:flex-row lg:h-11"
  >
    <Droplet className="w-4 h-4 lg:mr-2 mb-1 lg:mb-0" />
    <span className="text-xs lg:text-sm">Request</span>
  </Button>
  {/* Similar for Send and History */}
</div>
```

### Phase 4: Testing & Validation

#### Functional Testing Checklist
**Profile Section:**
- [ ] Avatar displays correctly
- [ ] Email displays (read-only)
- [ ] Username displays (read-only)
- [ ] Edit Profile button opens edit mode
- [ ] About Me accordion opens/closes
- [ ] About Me edit/save/cancel works
- [ ] Profile Picture accordion opens/closes
- [ ] Profile Picture upload works (file select, preview, upload, save)
- [ ] Profile Picture URL input works
- [ ] All validations still work
- [ ] Success/error messages display

**Wallet Section:**
- [ ] Create wallet works (if no wallet)
- [ ] Wallet address displays
- [ ] Copy address button works
- [ ] ETH balance displays
- [ ] USDC balance displays
- [ ] Request Funds accordion opens/closes
- [ ] Request Funds (ETH) works
- [ ] Request Funds (USDC) works
- [ ] Send Funds accordion opens/closes
- [ ] Send Funds (ETH) works
- [ ] Send Funds (USDC) works
- [ ] Transaction History accordion opens/closes
- [ ] Transaction History loads and displays
- [ ] All wallet API calls work
- [ ] Success/error messages display
- [ ] Explorer links work

**Guide Access:**
- [ ] Starts collapsed by default
- [ ] Expands on click
- [ ] Button links to /guide
- [ ] State persists in localStorage
- [ ] Works on desktop and mobile

**Layout:**
- [ ] Desktop: Two-column layout (≥1024px)
- [ ] Desktop: Profile left, wallet right
- [ ] Desktop: Proper spacing and alignment
- [ ] Mobile: Single column vertical stack
- [ ] Mobile: Profile compact at top
- [ ] Mobile: Wallet below and visible without much scroll
- [ ] Mobile: No horizontal scrolling
- [ ] Tablet (768px-1023px): Appropriate layout

**Responsive Testing:**
- [ ] 375px width (iPhone SE)
- [ ] 390px width (iPhone 12 Pro)
- [ ] 414px width (iPhone 11 Pro Max)
- [ ] 768px width (iPad Mini)
- [ ] 1024px width (iPad Pro)
- [ ] 1280px width (laptop)
- [ ] 1920px width (desktop)

**Browser Testing:**
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)

**Accessibility:**
- [ ] All buttons have accessible labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus states visible
- [ ] Color contrast sufficient

#### Visual Regression Testing
1. Take screenshots before changes
2. Implement changes
3. Take screenshots after changes
4. Compare to ensure no unintended styling changes
5. Test dark mode specifically

### Phase 5: Refinement

#### Potential Enhancements (Post-MVP)
1. **Animation:** Smooth transitions for accordions
2. **Loading states:** Skeleton loaders for wallet balances
3. **Empty states:** Better UX when no wallet/no transactions
4. **Tooltips:** Add helpful tooltips for actions
5. **Keyboard shortcuts:** Quick actions (e.g., 'E' for edit)
6. **Quick stats:** Summary cards (total value, transaction count)

---

## Risk Assessment & Mitigation

### Risk 1: Accordion Component Not Available
**Impact:** Medium  
**Likelihood:** Low  
**Mitigation:** 
- Check if `@/components/ui/accordion` exists
- If not, install from shadcn/ui: `npx shadcn-ui@latest add accordion`
- Fallback: Create custom collapsible with `useState`

### Risk 2: Layout Breaking on Specific Devices
**Impact:** High  
**Likelihood:** Medium  
**Mitigation:**
- Test on actual devices, not just browser DevTools
- Use Chrome DevTools device emulation extensively
- Add extra breakpoint if needed (e.g., `md:` for tablet)
- Use CSS Container Queries if needed for complex layouts

### Risk 3: State Management Issues with Multiple Components
**Impact:** Medium  
**Likelihood:** Medium  
**Mitigation:**
- Keep state local to components when possible
- Use React Context if needed for shared state (edit mode, etc.)
- Document state flow clearly
- Test all state transitions

### Risk 4: Performance Issues with Multiple Accordions
**Impact:** Low  
**Likelihood:** Low  
**Mitigation:**
- Use `type="single"` for Accordion (only one open at a time)
- Lazy load Transaction History component
- Monitor performance with React DevTools

### Risk 5: localStorage Not Available (SSR)
**Impact:** Low  
**Likelihood:** Low  
**Mitigation:**
- Wrap localStorage calls in `useEffect`
- Check `typeof window !== 'undefined'`
- Provide sensible defaults

---

## Component Reusability

### Extractable Components
1. **`CompactProfileCard`** - Can be used in other user-facing pages
2. **`CollapsibleGuideAccess`** - Can be used on dashboard, wallet page, etc.
3. **`ProfileAccordionSections`** - Specific to profile, but pattern reusable
4. **`MobileProfileHeader`** - Can be extracted if used in navigation

### Shared Patterns
- Accordion sections for expandable content
- Compact card layouts for sidebars
- Mobile-first responsive design patterns

---

## Documentation Updates Needed

### User-Facing
- Update screenshots in docs/profile/ if they exist
- Update any user guides that reference profile page layout

### Developer-Facing
- Document new component structure
- Update component diagram if exists
- Add comments for complex layout logic
- Document breakpoints used and reasoning

---

## Rollout Plan

### Option A: Feature Flag (Recommended)
```tsx
// Add environment variable or database flag
const USE_NEW_PROFILE_LAYOUT = process.env.NEXT_PUBLIC_NEW_PROFILE_LAYOUT === 'true';

return USE_NEW_PROFILE_LAYOUT ? (
  <NewProfileLayout />
) : (
  <OldProfileLayout />
);
```

**Pros:**
- Can test in production with specific users
- Easy rollback if issues found
- Gradual rollout possible

**Cons:**
- More code to maintain temporarily
- Need to clean up after full rollout

### Option B: Direct Deployment
- Thoroughly test in development/staging
- Deploy to production
- Monitor for errors

**Pros:**
- Simpler code
- One-time deployment

**Cons:**
- Riskier if issues arise
- Harder to rollback

**Recommendation:** Option A for initial deployment, then remove flag after 1-2 weeks of stable operation.

---

## Success Metrics

### Quantitative
1. **Page Load Time:** Should remain < 2s
2. **Lighthouse Score:** Maintain 90+ for Performance and Accessibility
3. **Error Rate:** < 0.1% of page loads
4. **Wallet Interaction Rate:** Expect increase (goal: +20%)

### Qualitative
1. **User Feedback:** Collect via feedback form or user testing
2. **Visual Consistency:** Matches existing design system
3. **Developer Satisfaction:** Easier to maintain/extend

---

## Conclusion

This redesign plan provides a comprehensive approach to reorganizing the profile page while maintaining all existing functionality. The key principles are:

1. ✅ **Wallet-first approach** - Making the primary functionality prominent
2. ✅ **Space efficiency** - Using accordions and compact layouts
3. ✅ **Mobile optimization** - Thoughtful vertical stacking and sizing
4. ✅ **Zero functionality loss** - Every button, input, and feature preserved
5. ✅ **Maintainability** - Clean component structure, reusable patterns

The implementation is straightforward, low-risk, and purely frontend-focused. No backend changes, no API modifications, no database migrations. Just a better-organized UI that puts the wallet functionality front and center where users need it.

---

## Appendix A: File Changes Summary

### Files to Modify
1. **`app/protected/profile/page.tsx`**
   - Change: Restructure layout from single column to responsive grid
   - Lines: ~39-86 (entire JSX return)
   - Risk: Low (main layout change)

2. **`components/simple-profile-form.tsx`**
   - Change: Extract compact view, add accordion for details
   - Lines: ~89-278 (entire component)
   - Risk: Medium (extensive changes, but self-contained)

3. **`components/profile-wallet-card.tsx`**
   - Change: Add accordion for expandable sections, responsive sizing
   - Lines: ~219-473 (CardContent section)
   - Risk: Medium (existing functionality must be preserved)

### Files to Create
1. **`components/profile/CompactProfileCard.tsx`**
   - Purpose: Compact profile display for desktop sidebar
   - Size: ~150 lines
   - Risk: Low (new component, no existing dependencies)

2. **`components/profile/ProfileAccordionSections.tsx`**
   - Purpose: Accordion sections for About Me, Profile Picture
   - Size: ~200 lines
   - Risk: Low (new component, extracted logic)

3. **`components/profile/CollapsibleGuideAccess.tsx`**
   - Purpose: Collapsible guide access banner
   - Size: ~80 lines
   - Risk: Low (new component, simple)

4. **`components/profile/MobileProfileHeader.tsx`** (Optional)
   - Purpose: Mobile-specific compact header
   - Size: ~100 lines
   - Risk: Low (optional enhancement)

### Total Lines Changed/Added
- Modified: ~500 lines
- Added: ~530 lines
- Net: +30 lines (with refactoring)

---

## Appendix B: Accordion Component Check

If Accordion component doesn't exist in `@/components/ui/accordion`, install it:

```bash
npx shadcn-ui@latest add accordion
```

This will add:
- `components/ui/accordion.tsx`
- Required dependencies (Radix UI)

Verify after installation:
```tsx
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
```

---

## Appendix C: Responsive Breakpoints Reference

```tsx
// Tailwind breakpoints used in this redesign
// Default (no prefix): 0px - 1023px (mobile & tablet)
// lg: ≥ 1024px (desktop)

// Examples:
className="block lg:hidden"           // Show on mobile, hide on desktop
className="hidden lg:block"           // Hide on mobile, show on desktop
className="grid-cols-1 lg:grid-cols-[320px_1fr]" // 1 col mobile, 2 col desktop
className="p-4 lg:p-6"                // Smaller padding on mobile
className="text-sm lg:text-base"     // Smaller text on mobile
```

---

## Appendix D: Color & Styling Consistency

**Maintained Elements:**
- Card background: `bg-card`
- Border colors: `border` (default)
- Text colors: `text-foreground`, `text-muted-foreground`
- Primary actions: `bg-primary`
- Accent elements: `bg-accent`
- Success: `bg-green-50 dark:bg-green-950`
- Error: `bg-destructive/10`
- Spacing: 4px grid (gap-2, gap-3, gap-4, gap-6)
- Rounded corners: `rounded-lg`, `rounded-xl`
- Shadows: `shadow-lg` for main cards

**No New Colors:** All colors from existing design system

---

**END OF REDESIGN PLAN**

