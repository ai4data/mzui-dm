import { Star, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RatingDisplay } from "@/components/RatingInput"
import { DatasetRating } from "@/types"

interface RatingSummaryProps {
  ratings: DatasetRating[]
  averageRating: number
  className?: string
}

export function RatingSummary({ ratings, averageRating, className }: RatingSummaryProps) {
  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ratings.filter(r => Math.round(r.rating) === rating).length,
    percentage: ratings.length > 0 
      ? Math.round((ratings.filter(r => Math.round(r.rating) === rating).length / ratings.length) * 100)
      : 0
  }))

  // Calculate quality indicators
  const qualityMetrics = {
    excellent: ratings.filter(r => r.rating >= 4.5).length,
    good: ratings.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
    average: ratings.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
    poor: ratings.filter(r => r.rating < 2.5).length,
  }

  const getQualityBadge = () => {
    if (averageRating >= 4.5) return { label: "Excellent", variant: "default" as const, color: "bg-green-500" }
    if (averageRating >= 3.5) return { label: "Very Good", variant: "secondary" as const, color: "bg-blue-500" }
    if (averageRating >= 2.5) return { label: "Good", variant: "secondary" as const, color: "bg-yellow-500" }
    if (averageRating >= 1.5) return { label: "Fair", variant: "outline" as const, color: "bg-orange-500" }
    return { label: "Poor", variant: "destructive" as const, color: "bg-red-500" }
  }

  const qualityBadge = getQualityBadge()

  if (ratings.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
            <p className="text-muted-foreground">
              Be the first to rate this dataset and help others make informed decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Rating Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <RatingDisplay 
              rating={averageRating} 
              showCount={false}
              size="lg"
            />
            <div className="text-sm text-muted-foreground mt-2">
              {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={qualityBadge.variant} className="gap-1">
                <div className={`w-2 h-2 rounded-full ${qualityBadge.color}`} />
                {qualityBadge.label}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Overall Quality
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2" />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <div className="w-10 text-right">
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{qualityMetrics.excellent}</div>
            <div className="text-xs text-muted-foreground">Excellent</div>
            <div className="text-xs text-muted-foreground">(4.5+ stars)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{qualityMetrics.good}</div>
            <div className="text-xs text-muted-foreground">Very Good</div>
            <div className="text-xs text-muted-foreground">(3.5-4.4 stars)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{qualityMetrics.average}</div>
            <div className="text-xs text-muted-foreground">Good</div>
            <div className="text-xs text-muted-foreground">(2.5-3.4 stars)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{qualityMetrics.poor}</div>
            <div className="text-xs text-muted-foreground">Needs Work</div>
            <div className="text-xs text-muted-foreground">(&lt;2.5 stars)</div>
          </div>
        </div>

        {/* Recent Trend */}
        {ratings.length >= 5 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Trend</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {(() => {
                const recentRatings = ratings
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                const recentAverage = recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length
                const trend = recentAverage - averageRating
                
                if (Math.abs(trend) < 0.1) {
                  return "Rating has been consistent recently"
                } else if (trend > 0) {
                  return `Rating trending up (+${trend.toFixed(1)} from overall average)`
                } else {
                  return `Rating trending down (${trend.toFixed(1)} from overall average)`
                }
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}