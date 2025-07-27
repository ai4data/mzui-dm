import { useState } from "react"
import { 
  Star, 
  Download, 
  Eye, 
  Calendar, 
  Bookmark, 
  BookmarkCheck,
  MoreVertical,
  Shield,
  TrendingUp,
  Users
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Dataset } from "@/types"
import { formatDate, formatNumber } from "@/lib/dataTransforms"
import { getClassificationColor, getQualityScoreColor } from "@/lib/dataTransforms"
import { DatasetActions } from "./DatasetActions"

interface DatasetCardProps {
  dataset: Dataset
  onSelect?: (dataset: Dataset) => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  isBookmarked?: boolean
  showActions?: boolean
  compact?: boolean
}

export function DatasetCard({
  dataset,
  onSelect,
  onBookmark,
  onDownload,
  isBookmarked = false,
  showActions = true,
  compact = false
}: DatasetCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    onSelect?.(dataset)
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark?.(dataset.id)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(dataset.id)
  }

  return (
    <TooltipProvider>
      <Card 
        className={`hover:shadow-md transition-all duration-200 cursor-pointer group ${
          isHovered ? 'shadow-lg' : ''
        } ${compact ? 'h-auto' : 'h-full'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <CardHeader className={compact ? "pb-2" : "pb-3"}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'} line-clamp-2 group-hover:text-primary transition-colors`}>
                {dataset.name}
              </CardTitle>
              {!compact && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {dataset.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="secondary" 
                    className={`${getQualityScoreColor(dataset.metrics.qualityScore)} border-0`}
                  >
                    {dataset.metrics.qualityScore}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data Quality Score</p>
                </TooltipContent>
              </Tooltip>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCardClick}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBookmarkClick}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadClick}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={`space-y-${compact ? '2' : '3'}`}>
          {/* Owner Information */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={dataset.dataOwner.email ? `https://avatar.vercel.sh/${dataset.dataOwner.email}` : undefined} />
              <AvatarFallback className="text-xs">
                {dataset.dataOwner.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              By {dataset.dataOwner.name}
            </span>
            {dataset.dataOwner.department && (
              <Badge variant="outline" className="text-xs">
                {dataset.dataOwner.department}
              </Badge>
            )}
          </div>

          {/* Classification and Category */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getClassificationColor(dataset.dataClassification)}>
              <Shield className="mr-1 h-3 w-3" />
              {dataset.dataClassification}
            </Badge>
            <Badge variant="outline">
              {dataset.dataDomain}
            </Badge>
          </div>

          {/* Quality Metrics */}
          {!compact && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Quality Score</span>
                <span>{dataset.metrics.qualityScore}%</span>
              </div>
              <Progress value={dataset.metrics.qualityScore} className="h-1" />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {dataset.tags.slice(0, compact ? 2 : 4).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > (compact ? 2 : 4) && (
              <Badge variant="secondary" className="text-xs">
                +{dataset.tags.length - (compact ? 2 : 4)}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className={`pt-0 ${compact ? 'pb-3' : 'pb-4'}`}>
          {/* Stats Row */}
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-4">
              {/* Usage Stats */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatNumber(dataset.metrics.usageCount)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total views</p>
                </TooltipContent>
              </Tooltip>

              {/* Rating */}
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{dataset.metrics.averageRating.toFixed(1)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average rating</p>
                </TooltipContent>
              </Tooltip>

              {/* Data Elements Count */}
              {!compact && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{dataset.numberOfDataElements}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data elements</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Last Updated */}
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(dataset.updatedAt, 'relative')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated: {formatDate(dataset.updatedAt, 'long')}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Marketplace Action Buttons - Full Width Row */}
          {showActions && !compact && (
            <div className="flex justify-end w-full" onClick={(e) => e.stopPropagation()}>
              <DatasetActions dataset={dataset} variant="compact" />
            </div>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}