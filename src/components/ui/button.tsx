import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center whitespace-nowrap uppercase " +
    "transition-colors duration-(--dur-base) ease-(--ease-out) outline-none " +
    "disabled:pointer-events-none disabled:opacity-40 " +
    "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold",
  {
    variants: {
      variant: {
        solid: "bg-ink text-paper hover:bg-ink/85",
        outline: "border border-ink/20 hover:border-ink",
        light: "border border-white/50 text-white hover:bg-white hover:text-ink",
        ghost: "text-ink/70 hover:text-ink",
      },
      size: {
        sm: "px-6 py-2.5 text-[10px] tracking-[0.24em]",
        md: "px-10 py-3.5 text-[11px] tracking-[0.28em]",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}

export { button as buttonVariants };
