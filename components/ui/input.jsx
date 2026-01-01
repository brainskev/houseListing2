import React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm transition-[color,box-shadow,border-color] placeholder:text-slate-400 selection:bg-brand-600 selection:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        "aria-invalid:border-red-500 aria-invalid:outline-red-500",
        className
      )}
      {...props}
    />
  );
}

export { Input };
