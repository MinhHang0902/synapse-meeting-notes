import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/index"

const buttonVariants = cva(
  // BASE (v0 clean)
  [
    "inline-flex items-center justify-center gap-2 select-none",
    "whitespace-nowrap rounded-md",
    "text-sm font-medium leading-none",
    "transition-colors duration-150",
    "outline-none focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-zinc-900/10",
    "disabled:pointer-events-none disabled:opacity-50",
    // svg sizing
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    // toggle on (giữ xám nhạt giống v0)
    "data-[state=on]:bg-neutral-500 data-[state=on]:text-white",
  ].join(" "),
  {
    variants: {
      variant: {
        // ĐEN → hover xám đậm → active xám nhạt
        default:
          "bg-zinc-950 text-white hover:bg-zinc-800 active:bg-neutral-500 shadow-sm",

        // Đỏ chuẩn (ít dùng)
        destructive:
          "bg-red-600 text-white hover:bg-red-600/90 active:bg-red-500 shadow-sm",

        // viền mảnh, hover đen + chữ trắng, active xám nhạt
        outline:
          "border border-zinc-300 bg-white text-zinc-900 shadow-sm hover:bg-zinc-900 hover:text-white active:bg-neutral-500 active:text-white",

        // xám nhạt subtle
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 shadow-sm",

        // ghost nhẹ
        ghost:
          "bg-transparent text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200",

        // link
        link: "text-zinc-900 underline underline-offset-4 hover:opacity-80",
      },
      size: {
        // thấp hơn: h-8, padding gọn như v0
        default: "h-8 px-3.5",
        sm: "h-7 px-3 gap-1.5",
        lg: "h-9 px-5",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
