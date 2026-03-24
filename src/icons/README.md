# Custom Icons

All icons are custom SVGs exported from Figma and written as React components.

## How to add a new icon

1. Export the SVG from Figma
2. Create a new file here: `src/icons/IconName.tsx`
3. Paste the SVG as a React component:

```tsx
// src/icons/HeartIcon.tsx
export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* paste SVG path here */}
    </svg>
  )
}
```

4. Import where needed:
```tsx
import { HeartIcon } from '@/icons/HeartIcon'

<HeartIcon className="w-6 h-6 text-red-500" />
```

## Why not lucide-react?

Dreams Branch uses custom-designed icons from Figma to match the brand identity.
lucide-react is not used directly (it may be present as a shadcn/ui peer dependency).
