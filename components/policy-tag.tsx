"use client"

import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"

// Utility function to concatenate class names conditionally
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface PolicyTagProps {
  tag: string
  isSelected: boolean
  onToggle: () => void
  onExpand?: () => void
  isExpanded?: boolean
  isSubTag?: boolean
}

export default function PolicyTag({
  tag,
  isSelected,
  onToggle,
  onExpand,
  isExpanded,
  isSubTag = false,
}: PolicyTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isSelected ? "bg-white text-black" : "bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]",
        isSubTag ? "border border-gray-700" : "",
      )}
    >
      <span className="mr-1">{tag}</span>

      {isSelected ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="ml-2 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="ml-2 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {!isSubTag && onExpand && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          className="ml-2 flex items-center justify-center"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  )
}
