import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all disabled:pointer-events-none disabled:opacity-50 border border-black rounded-md hover:opacity-80",

  {
    variants: {
      variant: {
        red: "bg-[#F96666] text-black hover:opacity-80",
        green: "bg-[#A7F586] text-black hover:opacity-80",
        orange: "bg-[#E59C53] text-black hover:bg-transparent",
      },
      size: {
        default: "h-6 px-4 py-1 w-[30%]",
        sm: "h-7 px-2 text-xs",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "orange",
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
