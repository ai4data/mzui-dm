import { useState } from "react"
import { Grid, List, Filter, SortAsc, SortDesc } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetCard } from "./DatasetCard"
import { Dataset } from "@/types"

interface DatasetGridProps {
  datasets: Dataset[]
  loading?: boolean
  onDatasetSelect?: (dataset: Dataset) => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  bookmarkedDatasets?: string[]
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  showViewToggle?: boolean
  showFilters?: boolean
  compact?: boolean
}

export function DatasetGrid({
  datasets,
  loading = false,
  onDatasetSelect,
  onBookmark,
  onDownload,
  bookmarkedDatasets = [],
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true,
  showFilters = true,
  compact = false
}: DatasetGridProps) {
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'quality' | 'usage'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterClassification, setFilterClassification] = useState<string>('all')

  // Apply filters and sorting
  const filteredAndSortedDatasets = datasets
    .filter(dataset => {
      if (filterCategory !== 'all' && !dataset.dataDomain.toLowerCase().includes(filterCategory)) {
        return false
      }
      if (filterClassification !== 'all' && dataset.dataClassification.toLowerCase() !== filterClassification) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'quality':
          comparison = a.metrics.qualityScore - b.metrics.qualityScore
          break
        case 'usage':
          comparison = a.metrics.usageCount - b.metrics.usageCount
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`grid gap-4 ${
      viewMode === 'grid' 
        ? compact 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1'
    }`}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-muted animate-pulse rounded-lg h-64" />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Controls */}
      {(showFilters || showViewToggle) && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filters */}
          {showFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <span className="text-muted-foreground text-sm">Category:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterClassification} onValueChange={setFilterClassification}>
                <SelectTrigger className="w-[140px]">
                  <span className="text-muted-foreground text-sm">Level:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="sensitive">Sensitive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <span className="text-muted-foreground text-sm">Sort:</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* View Toggle */}
          {showViewToggle && onViewModeChange && (
            <Tabs value={viewMode} onValueChange={(value: any) => onViewModeChange(value)}>
              <TabsList>
                <TabsTrigger value="grid">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      )}

      {/* Results Count */}
      {/* Dataset count removed - now shown in parent DatasetsPage component */}

      {/* Dataset Grid/List */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredAndSortedDatasets.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? compact 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onSelect={onDatasetSelect}
              onBookmark={onBookmark}
              onDownload={onDownload}
              isBookmarked={bookmarkedDatasets.includes(dataset.id)}
              compact={compact || viewMode === 'list'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Filter className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No datasets found</h3>
            <p className="text-sm">Try adjusting your filters or search criteria.</p>
          </div>
        </div>
      )}
    </div>
  )
}