import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-forest text-cream shadow-[0_10px_24px_-12px_rgb(18_59_42/0.7)] hover:bg-forest-700 hover:shadow-[0_16px_30px_-12px_rgb(18_59_42/0.75)]",
        gold: "bg-gold text-white shadow-[0_10px_24px_-12px_rgb(184_138_59/0.8)] hover:bg-gold-dark",
        outline: "border border-forest/25 bg-transparent text-forest hover:border-forest hover:bg-forest hover:text-cream",
        cream: "bg-cream-50/90 text-forest backdrop-blur hover:bg-white shadow-soft",
        ghost: "text-forest hover:bg-forest/5",
        link: "rounded-none px-0 text-forest underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-[0.95rem]",
        icon: "size-10",
        "icon-sm": "size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
