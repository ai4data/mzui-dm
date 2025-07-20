import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingInput({ 
  value, 
  onChange, 
  readonly = false, 
  size = "md",
  className 
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const isActive = rating <= (hoverRating || value)
        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isActive 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-muted-foreground",
                !readonly && "hover:text-yellow-400"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

interface RatingDisplayProps {
  rating: number
  count?: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function RatingDisplay({ 
  rating, 
  count, 
  size = "md", 
  showCount = true,
  className 
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted-foreground"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  )
}