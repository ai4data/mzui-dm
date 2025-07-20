import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { DatasetHeader } from "@/components/DatasetHeader"
import { DatasetTabs } from "@/components/DatasetTabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Dataset } from "@/types"
import { getDatasetById } from "@/services/datasetService"

export function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const data = await getDatasetById(id)
        setDataset(data)
        
        // Check if dataset is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedDatasets') || '[]')
        setIsBookmarked(bookmarks.includes(id))
      } catch (err) {
        console.error('Error fetching dataset:', err)
        setError('Failed to load dataset details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchDataset()
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  const handleBookmark = (datasetId: string) => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedDatasets') || '[]')
    
    if (isBookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarks.filter((id: string) => id !== datasetId)
      localStorage.setItem('bookmarkedDatasets', JSON.stringify(updatedBookmarks))
      setIsBookmarked(false)
    } else {
      // Add to bookmarks
      const updatedBookmarks = [...bookmarks, datasetId]
      localStorage.setItem('bookmarkedDatasets', JSON.stringify(updatedBookmarks))
      setIsBookmarked(true)
    }
  }

  const handleDownload = (datasetId: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading dataset ${datasetId}`)
    alert(`Downloading dataset ${datasetId}`)
  }

  const handleShare = (datasetId: string) => {
    // In a real application, this would open a share dialog
    const url = `${window.location.origin}/datasets/${datasetId}`
    
    if (navigator.share) {
      navigator.share({
        title: dataset?.name || 'Dataset',
        text: dataset?.description || 'Check out this dataset',
        url
      }).catch(err => console.error('Error sharing:', err))
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err))
    }
  }

  if (loading) {
    return <DatasetDetailSkeleton />
  }

  if (error || !dataset) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground">{error || 'Dataset not found'}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={handleBack}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-8">
      <DatasetHeader
        dataset={dataset}
        onBack={handleBack}
        onBookmark={handleBookmark}
        onDownload={handleDownload}
        onShare={handleShare}
        isBookmarked={isBookmarked}
      />
      
      {/* Dataset Tabs with Overview, Preview, Visualization, etc. */}
      <DatasetTabs dataset={dataset} />
    </div>
  )
}

function DatasetDetailSkeleton() {
  return (
    <div className="container py-6 space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Back Button Skeleton */}
      <Skeleton className="h-8 w-32" />
      
      {/* Header Card Skeleton */}
      <div className="border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Skeleton */}
          <Skeleton className="h-16 w-16 rounded-lg" />
          
          {/* Content Skeleton */}
          <div className="flex-1 space-y-4">
            {/* Title and Actions */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            
            {/* Tags Skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-16" />
            </div>
            
            {/* Metrics Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <Skeleton className="h-64 w-full" />
    </div>
  )
}