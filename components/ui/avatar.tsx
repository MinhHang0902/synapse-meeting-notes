"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar wrapper
 * - Dùng size="sm" | "md" | "lg" hoặc className để custom kích thước
 */
export type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClass =
      size === "sm"
        ? "h-8 w-8 text-xs"
        : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-10 w-10 text-sm";

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full bg-gray-100 align-middle",
          "ring-1 ring-black/5",
          sizeClass,
          className
        )}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

/**
 * Ảnh trong avatar
 * - Tự ẩn nếu lỗi hoặc chưa load (để Fallback hiển thị)
 */
export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onError, onLoad, ...props }, ref) => {
    const [ok, setOk] = React.useState(false);

    return (
      <img
        ref={ref}
        className={cn("h-full w-full object-cover", !ok && "hidden", className)}
        onLoad={(e) => {
          setOk(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setOk(false);
          onError?.(e as any);
        }}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

/**
 * Nội dung dự phòng (initials, icon, …)
 * - Tự căn giữa
 */
export type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "absolute inset-0 grid place-items-center select-none text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
AvatarFallback.displayName = "AvatarFallback";
