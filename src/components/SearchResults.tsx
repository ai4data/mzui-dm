import { useState, useCallback } from "react"
import { Search, SortAsc, SortDesc, Filter, Lightbulb, Clock, Star, Tag, AlertCircle } from "lucide-react"
import { Bookmark, BookmarkCheck, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetGrid } from "./DatasetGrid"
import { DatasetFilters } from "./DatasetFilters"
import { Dataset, SearchFilters, SearchResult } from "@/types"
import { formatDate, getClassificationColor, getQualityScoreColor } from "@/lib/dataTransforms"

interface SearchResultsProps {
  searchQuery: string
  searchResult: SearchResult
  loading?: boolean
  onDatasetSelect?: (dataset: Dataset) => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  bookmarkedDatasets?: string[]
  onFiltersChange?: (filters: SearchFilters) => void
  filters?: SearchFilters
}

export function SearchResults({
  searchQuery,
  searchResult,
  loading = false,
  onDatasetSelect,
  onBookmark,
  onDownload,
  bookmarkedDatasets = [],
  onFiltersChange,
  filters = {}
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'updated' | 'quality' | 'usage'>('relevance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Highlight search terms in text with improved multi-term support
  const highlightText = useCallback((text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text

    // Split the query into individual terms for better highlighting
    const terms = query.trim().split(/\\s+/).filter(term => term.length > 1)
    
    if (terms.length === 0) return text
    
    // Create a regex pattern that matches any of the terms
    // Properly escape special regex characters in search terms
    const escapedTerms = terms.map(term => 
      term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')
    )
    
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = text.split(pattern)
    
    return parts.map((part, index) => {
      // Check if this part matches any of our search terms (case insensitive)
      const isMatch = terms.some(term => 
        part.toLowerCase() === term.toLowerCase()
      )
      
      return isMatch ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    })
  }, [])

  // Generate search suggestions based on the query
  const generateSearchSuggestions = (query: string): string[] => {
    if (!query) return []
    
    // Extract terms from the query
    const terms = query.trim().split(/\\s+/).filter(term => term.length > 1)
    
    // Generate variations and combinations
    const suggestions: string[] = []
    
    // Add suggestions with similar terms from our dataset
    const allTerms = new Set<string>()
    searchResult.facets?.tags.forEach(tag => allTerms.add(tag.name))
    searchResult.facets?.categories.forEach(cat => allTerms.add(cat.name))
    
    // Find similar terms to each query term
    terms.forEach(term => {
      const similarTerms = Array.from(allTerms)
        .filter(t => t.toLowerCase().includes(term.toLowerCase()) || 
                    t.toLowerCase().startsWith(term.toLowerCase().substring(0, 3)))
        .slice(0, 3)
      
      // Replace the term in the original query with similar terms
      similarTerms.forEach(similarTerm => {
        const newQuery = query.replace(new RegExp(term, 'gi'), similarTerm)
        if (newQuery !== query) {
          suggestions.push(newQuery)
        }
      })
    })
    
    // Add broader category suggestions
    if (searchResult.facets?.categories.length) {
      const topCategories = searchResult.facets.categories
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
      
      topCategories.forEach(category => {
        suggestions.push(`${category.name} ${terms[0] || ''}`)
      })
    }
    
    // Add suggestions with fewer terms (if multiple terms exist)
    if (terms.length > 1) {
      suggestions.push(terms[0])
      suggestions.push(terms[terms.length - 1])
    }
    
    // Return unique suggestions, limited to 5
    return Array.from(new Set(suggestions)).slice(0, 5)
  }

  // Create highlighted datasets
  const highlightedDatasets = searchResult.datasets.map(dataset => ({
    ...dataset,
    highlightedName: highlightText(dataset.name, searchQuery),
    highlightedDescription: highlightText(dataset.description, searchQuery),
    // Also highlight tags
    highlightedTags: dataset.tags.map(tag => ({
      tag,
      highlighted: highlightText(tag, searchQuery)
    }))
  }))

  // Sort datasets
  const sortedDatasets = [...highlightedDatasets].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'relevance':
        // Enhanced relevance scoring based on query matches
        const aScore = (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 3 : 0) +
                      (a.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                      (a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 2 : 0) +
                      (a.dataDomain.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0) +
                      (a.dataOwner.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0)
        const bScore = (b.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 3 : 0) +
                      (b.description.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 0) +
                      (b.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ? 2 : 0) +
                      (b.dataDomain.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0) +
                      (b.dataOwner.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0)
        comparison = bScore - aScore
        break
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

  // No results state with enhanced suggestions
  if (!loading && searchResult.datasets.length === 0) {
    const searchSuggestions = generateSearchSuggestions(searchQuery)
    
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            No datasets found for "{searchQuery}". Try adjusting your search terms or filters.
          </p>
          
          {/* Search suggestions */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Suggestions:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your spelling</li>
              <li>• Try more general keywords</li>
              <li>• Use different search terms</li>
              <li>• Remove some filters</li>
            </ul>
            
            {/* Suggested searches */}
            {searchSuggestions.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Try these searches instead:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange?.({
                        ...filters,
                        searchQuery: suggestion
                      })}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Popular categories */}
            {searchResult.facets?.categories.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Browse popular categories:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {searchResult.facets.categories.slice(0, 5).map(category => (
                    <Button
                      key={category.name}
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange?.({
                        ...filters,
                        categories: [...(filters.categories || []), category.name]
                      })}
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">
          Search Results for "{searchQuery}"
        </h1>
        <p className="text-muted-foreground">
          {loading ? 'Searching...' : `Found ${searchResult.totalCount} datasets`}
        </p>
      </div>

      {/* Search Facets */}
      {searchResult.facets && (
        <div className="space-y-4">
          <h3 className="font-medium">Related Categories</h3>
          <div className="flex flex-wrap gap-2">
            {searchResult.facets.categories.slice(0, 8).map(category => (
              <Button
                key={category.name}
                variant="outline"
                size="sm"
                onClick={() => onFiltersChange?.({
                  ...filters,
                  categories: [...(filters.categories || []), category.name]
                })}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <span className="text-muted-foreground text-sm">Sort by:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {sortedDatasets.length} results
        </p>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && onFiltersChange && (
          <div className="w-64 flex-shrink-0">
            <DatasetFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              availableCategories={searchResult.facets?.categories}
              availableOrganizations={searchResult.facets?.organizations}
              availableTags={searchResult.facets?.tags}
            />
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Search Tips */}
          {searchQuery.length < 3 && (
            <Alert className="mb-4">
              <AlertDescription>
                Try using more specific search terms for better results.
              </AlertDescription>
            </Alert>
          )}

          {/* Dataset Results */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedDatasets.map((dataset) => (
              <HighlightedDatasetCard
                key={dataset.id}
                dataset={dataset}
                searchQuery={searchQuery}
                onSelect={onDatasetSelect}
                onBookmark={onBookmark}
                onDownload={onDownload}
                isBookmarked={bookmarkedDatasets.includes(dataset.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Load More */}
      {!loading && sortedDatasets.length < searchResult.totalCount && (
        <div className="flex justify-center">
          <Button variant="outline">
            Load More Results ({searchResult.totalCount - sortedDatasets.length} remaining)
          </Button>
        </div>
      )}
    </div>
  )
}

// Custom DatasetCard component with highlighting
export function HighlightedDatasetCard({
  dataset,
  searchQuery,
  onSelect,
  onBookmark,
  onDownload,
  isBookmarked = false
}: {
  dataset: Dataset & { 
    highlightedName?: React.ReactNode; 
    highlightedDescription?: React.ReactNode;
    highlightedTags?: Array<{tag: string; highlighted: React.ReactNode}>;
  }
  searchQuery: string
  onSelect?: (dataset: Dataset) => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  isBookmarked?: boolean
}) {
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

  // Highlight text function for inline use
  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text

    const terms = query.trim().split(/\\s+/).filter(term => term.length > 1)
    if (terms.length === 0) return text
    
    const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'))
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
    const parts = text.split(pattern)
    
    return parts.map((part, index) => {
      const isMatch = terms.some(term => part.toLowerCase() === term.toLowerCase())
      return isMatch ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    })
  }

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 cursor-pointer group ${
        isHovered ? 'shadow-lg' : ''
      } h-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {dataset.highlightedName || dataset.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {dataset.highlightedDescription || dataset.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge 
              variant="secondary" 
              className={`${getQualityScoreColor(dataset.metrics.qualityScore)} border-0`}
            >
              {dataset.metrics.qualityScore}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Owner Information */}
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
            {dataset.dataOwner.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm text-muted-foreground">
            By {highlightText(dataset.dataOwner.name, searchQuery)}
          </span>
        </div>

        {/* Classification and Category */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getClassificationColor(dataset.dataClassification)}>
            {dataset.dataClassification}
          </Badge>
          <Badge variant="outline">
            {highlightText(dataset.dataDomain, searchQuery)}
          </Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {dataset.highlightedTags ? (
            dataset.highlightedTags.map(({tag, highlighted}) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className={`text-xs ${
                  tag.toLowerCase().includes(searchQuery.toLowerCase())
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : ''
                }`}
              >
                {highlighted}
              </Badge>
            ))
          ) : (
            dataset.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {highlightText(tag, searchQuery)}
              </Badge>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{dataset.metrics.averageRating.toFixed(1)}</span>
            </div>
            
            {/* Last Updated */}
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(dataset.updatedAt, 'relative')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={isBookmarked ? 'text-yellow-600' : ''}
              onClick={handleBookmarkClick}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadClick}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}