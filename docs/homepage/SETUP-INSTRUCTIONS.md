# 🚀 Quick Setup Instructions

## **Step 1: Drop Images**
Place these 3 files in `/public/images/`:
- `devdapp-horizontal.png` (desktop logo)  
- `devdapp-sq.png` (mobile logo)
- `devdapp-fav.png` (favicon source)

## **Step 2: Update Navigation**

### **Homepage (`app/page.tsx`)**
```tsx
// Add import at top
import { DevDappLogo } from "@/components/ui/images";

// Replace line 41
// FROM:
<Link href={"/"} className="text-xl font-bold">DevDapp.Store</Link>

// TO:
<Link href={"/"} className="flex items-center">
  <DevDappLogo priority={true} />
</Link>
```

### **Protected Layout (`app/protected/layout.tsx`)**  
```tsx
// Add import at top
import { DevDappLogo } from "@/components/ui/images";

// Replace line 19
// FROM:
<Link href={"/"}>DevDapp.Store</Link>

// TO:
<Link href={"/"} className="flex items-center">
  <DevDappLogo />
</Link>
```

## **Step 3: Test**
```bash
npm run dev
```

Visit homepage and protected pages to verify logos display correctly on desktop and mobile.

## **Step 4: Generate Favicon** (Optional)
Use `devdapp-fav.png` to generate:
- `favicon.ico` (replace existing in `/app/`)
- `apple-touch-icon.png` (add to `/public/`)

---

**Full details in**: `/docs/homepage/logo-image-implementation-plan.md`
