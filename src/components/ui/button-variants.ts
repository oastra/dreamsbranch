// Pure className generator — kept in its own non-"use client" module so
// server components (e.g. marketing pages styling a <Link>) can import
// it without pulling the client-only Button primitive into the bundle.
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button relative overflow-hidden inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-body font-medium whitespace-nowrap transition-colors duration-[550ms] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-white [--ripple-color:theme(colors.primary)] hover:text-grey-100",
        outline:
          "border-border bg-background text-foreground [--ripple-color:theme(colors.secondary/10%)]",
        secondary:
          "bg-primary text-grey-100 [--ripple-color:theme(colors.secondary)] hover:text-white",
        ghost: "text-foreground [--ripple-color:theme(colors.secondary/10%)]",
        destructive:
          "bg-destructive/10 text-destructive [--ripple-color:theme(colors.destructive/20%)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-body in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-[32px] py-[14px]",
        // Public-site marketing CTAs. Pair with shape="pill" for the
        // brand-blue rounded-full button used across events, campaigns,
        // shop, etc. Don't repeat text-body here — the base already
        // sets it, and tailwind-merge would treat it as a text-color
        // group and silently drop the variant's text-white.
        xl: "h-12 gap-2 px-8",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
      shape: {
        default: "",
        // Marketing CTA shape — pill, with the default variant's
        // yellow-ripple-on-hover behavior preserved: blue + white at
        // rest, yellow + grey on hover.
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
