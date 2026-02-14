'use client'

import React from 'react'
import { Star } from 'lucide-react'

interface RatingsProps {
  rating?: number
  outOf?: number
  showValue?: boolean
}

const Ratings: React.FC<RatingsProps> = ({
  rating = 0,
  outOf = 5,
  showValue = true,
}) => {
  // Safety guard — avoid garbage input
  const safeRating = Math.max(0, Math.min(rating, outOf))
  const fullStars = Math.floor(safeRating)
  const hasHalfStar = safeRating % 1 >= 0.5
  const emptyStars = outOf - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, index) => (
        <Star
          key={`full-${index}`}
          size={16}
          className="fill-yellow-400 text-yellow-400"
        />
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <Star
          size={16}
          className="fill-yellow-400/50 text-yellow-400"
        />
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <Star
          key={`empty-${index}`}
          size={16}
          className="text-yellow-400"
        />
      ))}

      {showValue && (
        <span className="ml-1 text-xs text-gray-600 font-medium">
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default Ratings
