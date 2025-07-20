import { useState } from "react"
import { Star, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RatingInput } from "@/components/RatingInput"
import { useAuth } from "@/contexts/AuthContext"

interface ReviewDialogProps {
  datasetId: string
  datasetName: string
  onSubmit: (review: { rating: number; comment: string }) => Promise<void>
  trigger?: React.ReactNode
}

export function ReviewDialog({ 
  datasetId, 
  datasetName, 
  onSubmit, 
  trigger 
}: ReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      setError("Please provide a review with at least 10 characters")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onSubmit({ rating, comment: comment.trim() })
      
      // Reset form and close dialog
      setRating(0)
      setComment("")
      setOpen(false)
    } catch (err) {
      setError("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setRating(0)
    setComment("")
    setError("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with "{datasetName}" to help other users make informed decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Overall Rating</Label>
            <div className="flex items-center gap-4">
              <RatingInput
                value={rating}
                onChange={setRating}
                size="lg"
              />
              <div className="text-sm text-muted-foreground">
                {rating === 0 && "Select a rating"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-3">
            <Label htmlFor="review-comment" className="text-base font-medium">
              Your Review
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience with this dataset. What did you use it for? How was the data quality? Any tips for other users?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 10 characters</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name || 'Anonymous'}</div>
              <div className="text-xs text-muted-foreground">
                Your review will be public and associated with your profile
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}