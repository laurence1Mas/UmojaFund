import { CheckCircle2 } from "lucide-react"

interface CheckCircleProps {
  size?: number
  className?: string
  filled?: boolean
  animated?: boolean
}

export function CheckCircle({ size = 24, className = "", filled = true, animated = false }: CheckCircleProps) {
  return (
    <div className={`inline-flex items-center justify-center ${animated ? "animate-pulse" : ""}`}>
      <CheckCircle2
        size={size}
        className={`text-green-500 ${filled ? "fill-green-500" : ""} ${className}`}
        strokeWidth={1.5}
      />
    </div>
  )
}

// Alternative: Custom SVG inline component (plus léger)
export function CheckCircleInline({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-green-500 ${className}`}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// Version avec étiquette
interface CheckCircleWithLabelProps {
  label: string
  size?: number
  className?: string
}

export function CheckCircleWithLabel({ label, size = 20, className = "" }: CheckCircleWithLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle size={size} className={className} />
      <span className="text-gray-700 font-medium">{label}</span>
    </div>
  )
}
