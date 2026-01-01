import React from "react";
import { cn } from "@/lib/utils";

function Select({ children, defaultValue, onValueChange, value: controlledValue, open: controlledOpen, onOpenChange, ...props }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const [selectedLabel, setSelectedLabel] = React.useState("");
  const containerRef = React.useRef(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const handleValueChange = (newValue, label) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    setSelectedLabel(label);
    onValueChange?.(newValue);
    handleOpenChange(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        handleOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative z-[9999]" {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            open,
            setOpen: handleOpenChange,
            value,
            selectedLabel,
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            open,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

function SelectTrigger({ className, children, open, setOpen, value, selectedLabel, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-slate-200 rounded-md bg-white shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        className
      )}
      onClick={() => setOpen?.(!open)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === SelectValue) {
          return React.cloneElement(child, { value, selectedLabel });
        }
        return child;
      })}
      <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </button>
  );
}

function SelectValue({ placeholder, children, value, selectedLabel }) {
  // Display selectedLabel if available, otherwise the value, or finally the placeholder
  const displayValue = selectedLabel || value || placeholder || "Select...";
  console.log('SelectValue:', { selectedLabel, value, displayValue });
  return <span>{displayValue}</span>;
}

function SelectContent({ children, open, onValueChange }) {
  if (!open) return null;
  return (
    <div className="absolute top-full left-0 right-0 z-[99999] mt-1 border border-slate-200 rounded-md bg-white shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { onValueChange });
        }
        return child;
      })}
    </div>
  );
}

function SelectItem({ value, children, onValueChange }) {
  return (
    <button
      type="button"
      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline-none"
      onClick={() => {
        onValueChange?.(value, children);
      }}
    >
      {children}
    </button>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
