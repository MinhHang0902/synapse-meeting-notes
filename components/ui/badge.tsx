"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
                secondary:
                    "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                outline:
                    "text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    children?: React.ReactNode;
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
    const classes = [badgeVariants({ variant }), className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export { Badge, badgeVariants };