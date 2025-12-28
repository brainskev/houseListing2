"use client";

import Image from "next/image";

export default function BricklyLogo({
  variant = "header", // 'header' | 'footer'
  theme = "auto", // 'auto' | 'light' | 'dark'
  size = "md", // 'sm' | 'md' | 'lg'
  withWordmark = true,
}) {
  const sizes = {
    sm: { icon: 24, text: "text-sm" },
    md: { icon: 28, text: "text-base" },
    lg: { icon: 32, text: "text-lg" },
  };
  const { icon, text } = sizes[size] || sizes.md;

  // Color handling: use currentColor so parent controls color
  const colorClass = theme === "light" ? "text-white" : theme === "dark" ? "text-slate-900" : "text-current";

  const Mark = (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={colorClass}
    >
      <g fill="currentColor">
        <rect rx="3" ry="3" x="6" y="6" width="20" height="14" />
        <rect rx="3" ry="3" x="6" y="25" width="20" height="14" />
        <rect rx="3" ry="3" x="6" y="44" width="20" height="14" />
        <rect rx="3" ry="3" x="28" y="6" width="30" height="14" />
        <rect rx="3" ry="3" x="28" y="44" width="30" height="14" />
        <rect rx="3" ry="3" x="28" y="25" width="18" height="14" />
      </g>
    </svg>
  );

  if (!withWordmark) {
    return <div className="inline-flex items-center" aria-label="Brickly">{Mark}</div>;
  }

  if (variant === "footer") {
    // Stacked for footer
    return (
      <div className={`inline-flex flex-col items-start ${colorClass}`} aria-label="Brickly">
        <div className="mb-2">{Mark}</div>
        <div className={`${text} font-semibold tracking-tight`}>Brickly</div>
        <div className="text-xs text-slate-500">Real Estate Hub</div>
      </div>
    );
  }

  // Default: horizontal for header
  return (
    <div className={`inline-flex items-center gap-2 ${colorClass}`} aria-label="Brickly">
      {Mark}
      <span className={`${text} font-semibold tracking-tight`}>Brickly</span>
    </div>
  );
}
