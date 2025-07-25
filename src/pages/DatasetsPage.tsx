import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Table as TableIcon, Grid } from "lucide-react"
import { DatasetTable } from "@/components/DatasetTable"
import { DatasetGrid } from "@/components/DatasetGrid"
import { Dataset } from "@/types"

// Real API service function
async function getDatasets(page: number = 1, limit: number = 20, search?: string, businessLine?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  
  if (search) {
    params.append('search', search)
  }
  
  if (businessLine) {
    params.append('business_line', businessLine)
  }
  
  const response = await fetch(`http://localhost:8000/api/datasets?${params}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export function DatasetsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarkedDatasets, setBookmarkedDatasets] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Get URL parameters and listen for changes
  const [businessLineFilter, setBusinessLineFilter] = useState<string | null>(null)

  useEffect(() => {
    // Function to read URL parameters
    const updateFiltersFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search)
      setBusinessLineFilter(urlParams.get('business_line'))
    }

    // Initial load
    updateFiltersFromURL()

    // Listen for URL changes (for navigation without page reload)
    const handlePopState = () => {
      updateFiltersFromURL()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Load datasets
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        setLoading(true)
        setCurrentPage(1) // Reset to page 1 when filters change
        setTotalCount(0) // Reset total count immediately when filters change
        
        const response = await getDatasets(1, 10, searchQuery || undefined, businessLineFilter || undefined)
        setDatasets(response.datasets)
        
        // Store pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1)
          setHasMore(response.pagination.page < response.pagination.pages)
          setTotalCount(response.pagination.total || 0)
        }
      } catch (error) {
        console.error('Failed to load datasets:', error)
        setTotalCount(0) // Reset on error too
      } finally {
        setLoading(false)
      }
    }

    loadDatasets()
  }, [businessLineFilter, searchQuery]) // Re-run when businessLineFilter or searchQuery changes
  
  // Function to load more datasets
  const loadMoreDatasets = async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      
      const response = await getDatasets(
        nextPage, 
        20, 
        searchQuery || undefined, 
        businessLineFilter || undefined
      )
      
      // Append new datasets to existing ones
      setDatasets(prev => [...prev, ...response.datasets])
      setCurrentPage(nextPage)
      
      // Update pagination info
      if (response.pagination) {
        setTotalPages(response.pagination.pages || 1)
        setHasMore(nextPage < response.pagination.pages)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more datasets:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Since we're now doing server-side filtering, we don't need client-side filtering
  const filteredDatasets = datasets

  const handleDatasetSelect = (dataset: Dataset) => {
    // Navigate to dataset detail page with DatasetOverview
    navigate(`/datasets/${dataset.id}`)
  }

  const handleBookmark = (datasetId: string) => {
    setBookmarkedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    )
  }

  const handleDownload = (datasetId: string) => {
    console.log('Download dataset:', datasetId)
    // TODO: Implement download functionality
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse Datasets</h1>
        <p className="text-muted-foreground">
          {businessLineFilter 
            ? `Showing datasets from ${businessLineFilter} domain`
            : 'Discover and explore our comprehensive collection of business datasets.'
          }
        </p>
        {businessLineFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                window.history.pushState({}, '', '/datasets')
                setBusinessLineFilter(null)
              }}
            >
              {businessLineFilter} ✕
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets, tags, or descriptions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : 
            businessLineFilter ? 
              `Showing ${filteredDatasets.length} of ${totalCount} ${businessLineFilter} datasets` :
              `Showing ${filteredDatasets.length} of ${totalCount} total datasets`
          }
        </p>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Table</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Dataset Views */}
      <Tabs value={viewMode}>
        <TabsContent value="grid" className="mt-0">
          <DatasetGrid
            datasets={filteredDatasets}
            loading={loading}
            onDatasetSelect={handleDatasetSelect}
            onBookmark={handleBookmark}
            onDownload={handleDownload}
            bookmarkedDatasets={bookmarkedDatasets}
            viewMode="grid"
            showViewToggle={false}
            showFilters={true}
          />
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <DatasetTable
            datasets={filteredDatasets}
            loading={loading}
            onDatasetSelect={handleDatasetSelect}
            onBookmark={handleBookmark}
            onDownload={handleDownload}
            selectedDatasets={bookmarkedDatasets}
            onSelectionChange={setBookmarkedDatasets}
          />
        </TabsContent>
      </Tabs>

      {/* Load More Button */}
      {!loading && filteredDatasets.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={loadMoreDatasets}
            disabled={loadingMore || !hasMore}
          >
            {loadingMore ? 'Loading...' : hasMore ? 'Load More Datasets' : 'No More Datasets'}
          </Button>
        </div>
      )}
    </div>
  )
}