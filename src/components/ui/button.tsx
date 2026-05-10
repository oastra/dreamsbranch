"use client";

import { useRef, useEffect } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonVariantProps } from "./button-variants";

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
  children,
  ...props
}: ButtonPrimitive.Props & ButtonVariantProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;

    function onEnter(e: MouseEvent) {
      const rect = btn!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const r = Math.ceil(
        Math.max(
          Math.hypot(x, y),
          Math.hypot(rect.width - x, y),
          Math.hypot(x, rect.height - y),
          Math.hypot(rect.width - x, rect.height - y),
        ),
      );
      btn!.style.setProperty("--ripple-x", `${x}px`);
      btn!.style.setProperty("--ripple-y", `${y}px`);
      btn!.style.setProperty("--ripple-r", `${r}px`);
    }

    btn.addEventListener("mouseenter", onEnter);
    return () => btn.removeEventListener("mouseenter", onEnter);
  }, []);

  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      <span className="relative z-10 pointer-events-none inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
