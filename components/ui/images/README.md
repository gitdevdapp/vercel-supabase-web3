# 🎨 DevDapp.Store Images

This folder contains the DevDapp.Store logo components and image assets.

## **📁 Expected Files**

After dropping in the starter images, this folder should contain:

```
components/ui/images/
├── devdapp-horizontal.png    # Desktop logo (wide format)
├── devdapp-sq.png           # Mobile logo (square format)  
├── devdapp-fav.png          # Favicon source
├── devdapp-logo.tsx         # ✅ Logo component (ready)
├── index.ts                 # ✅ Export file (ready)
└── README.md               # ✅ This file
```

## **🚀 Usage**

```tsx
import { DevDappLogo } from '@/components/ui/images';

// Basic usage
<DevDappLogo />

// With priority loading (for above-the-fold)
<DevDappLogo priority={true} />

// With custom styling
<DevDappLogo className="custom-styles" />
```

## **📱 Responsive Behavior**

- **Desktop (≥768px)**: Uses `devdapp-horizontal.png` at ~180px width
- **Mobile (<768px)**: Uses `devdapp-sq.png` at 40x40px
- **Auto-scaling**: Maintains aspect ratio, max height 32px

## **🎯 Implementation Status**

- [x] Component created (`devdapp-logo.tsx`)
- [x] Export index created (`index.ts`)
- [ ] **Images needed**: Drop in the 3 PNG files
- [ ] **Navigation update**: Update `app/page.tsx` and `app/protected/layout.tsx`
- [ ] **Favicon setup**: Generate and replace favicon files

## **⚡ Next Steps**

1. Drop the 3 image files into this folder
2. Follow the implementation plan in `/docs/homepage/logo-image-implementation-plan.md`
3. Test the component integration

## **🔧 Technical Notes**

- Uses Next.js Image component for optimization
- Responsive image switching via window resize detection
- Theme-compatible (transparent backgrounds recommended)
- Performance optimized with priority loading option
