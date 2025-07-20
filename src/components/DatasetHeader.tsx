import { useState } from "react"
import { 
  Share2, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  ChevronLeft,
  Shield,
  Calendar,
  Users,
  Star,
  Eye,
  BarChart3,
  FileText,
  MoreHorizontal
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
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
import { formatDate, formatNumber, getClassificationColor, getQualityScoreColor } from "@/lib/dataTransforms"

interface DatasetHeaderProps {
  dataset: Dataset
  onBack?: () => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  onShare?: (datasetId: string) => void
  isBookmarked?: boolean
}

export function DatasetHeader({
  dataset,
  onBack,
  onBookmark,
  onDownload,
  onShare,
  isBookmarked = false
}: DatasetHeaderProps) {
  const handleBookmarkClick = () => {
    onBookmark?.(dataset.id)
  }

  const handleDownloadClick = () => {
    onDownload?.(dataset.id)
  }

  const handleShareClick = () => {
    onShare?.(dataset.id)
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/datasets">Datasets</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/datasets/domain/${dataset.dataDomain.toLowerCase().replace(/\s+/g, '-')}`}>
              {dataset.dataDomain}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {dataset.name}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back Button */}
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>
      )}

      {/* Main Header Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        {/* Optional Banner/Thumbnail */}
        {dataset.visualizations?.length > 0 && dataset.visualizations[0].type === 'chart' && (
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-primary/40" />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Dataset Icon/Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="h-16 w-16 rounded-lg border">
                <AvatarImage src={dataset.dataOwner.email ? `https://avatar.vercel.sh/${dataset.dataOwner.email}` : undefined} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {dataset.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Dataset Info */}
            <div className="flex-1 space-y-4">
              {/* Title and Actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{dataset.name}</h1>
                  <p className="text-muted-foreground mt-1">{dataset.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBookmarkClick}
                          className={isBookmarked ? 'text-yellow-600' : ''}
                        >
                          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadClick}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download dataset</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShareClick}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share dataset</p>
                      </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Export metadata
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View usage statistics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </div>
              </div>

              {/* Tags and Classification */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getClassificationColor(dataset.dataClassification)}>
                  <Shield className="mr-1 h-3 w-3" />
                  {dataset.dataClassification}
                </Badge>
                <Badge variant="outline">
                  {dataset.dataDomain}
                </Badge>
                <Badge variant="outline">
                  {dataset.dataSubDomain}
                </Badge>
                <Badge variant="secondary" className={getQualityScoreColor(dataset.metrics.qualityScore)}>
                  Quality: {dataset.metrics.qualityScore}%
                </Badge>
                {dataset.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {dataset.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dataset.tags.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Owner</span>
                  <div className="flex items-center mt-1">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={dataset.dataOwner.email ? `https://avatar.vercel.sh/${dataset.dataOwner.email}` : undefined} />
                      <AvatarFallback className="text-xs">
                        {dataset.dataOwner.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{dataset.dataOwner.name}</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{formatDate(dataset.updatedAt, 'short')}</span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Rating</span>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="text-sm">{dataset.metrics.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({dataset.ratings?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Usage</span>
                  <div className="flex items-center mt-1">
                    <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">{formatNumber(dataset.metrics.usageCount)}</span>
                    <span className="text-xs text-muted-foreground ml-1">views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}