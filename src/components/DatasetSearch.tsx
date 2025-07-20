import { useState, useEffect } from "react"
import { Search, Database, Clock, Star, Tag, Building2, User } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dataset, Organization, User as UserType } from "@/types"
import { formatDate } from "@/lib/dataTransforms"

interface SearchResult {
  datasets: Dataset[]
  organizations: Organization[]
  users: UserType[]
  tags: string[]
  recentSearches: string[]
}

interface DatasetSearchProps {
  onDatasetSelect?: (dataset: Dataset) => void
  onOrganizationSelect?: (organization: Organization) => void
  onUserSelect?: (user: UserType) => void
  onTagSelect?: (tag: string) => void
  onSearchSubmit?: (query: string) => void
  placeholder?: string
  showTrigger?: boolean
}

export function DatasetSearch({
  onDatasetSelect,
  onOrganizationSelect,
  onUserSelect,
  onTagSelect,
  onSearchSubmit,
  placeholder = "Search datasets, organizations, or tags...",
  showTrigger = true
}: DatasetSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({
    datasets: [],
    organizations: [],
    users: [],
    tags: [],
    recentSearches: []
  })
  const [loading, setLoading] = useState(false)

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string): Promise<SearchResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock data - replace with actual API calls
    const mockDatasets: Dataset[] = [
      {
        id: "1",
        name: "Customer Analytics Dataset",
        description: "Comprehensive customer behavior data",
        technicalId: "CUST_001",
        sourceSysId: "SYS001",
        sourceSysName: "Analytics DB",
        businessLine: "Marketing",
        businessEntity: "Customer Intelligence",
        maturity: "Published" as any,
        dataLifecycle: "Active" as any,
        location: "Global",
        dataDomain: "Customer Data",
        dataSubDomain: "Behavioral Analytics",
        dataExpert: "John Smith",
        dataValidator: "Jane Doe",
        dataOwner: { id: "1", name: "Analytics Team" },
        dataSteward: { id: "1", name: "Data Steward" },
        dataClassification: "Internal" as any,
        legalGroundCollection: "Analytics",
        historicalData: true,
        unlockedGDP: "Yes",
        ciaRating: "High",
        numberOfDataElements: 150,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["customer", "analytics", "behavior"],
        metrics: {
          qualityScore: 95,
          completeness: 98,
          accuracy: 94,
          timeliness: 96,
          usageCount: 1234,
          averageRating: 4.8
        },
        visualizations: [],
        relatedDatasets: [],
        ratings: [],
        stories: []
      }
    ]

    const mockOrganizations = [
      {
        id: "1",
        name: "Data Analytics Corp",
        description: "Leading analytics provider",
        logoUrl: "/logos/analytics.png",
        verified: true,
        datasets: ["1"],
        members: ["1"],
        createdAt: new Date(),
        metrics: {
          datasetCount: 45,
          averageDatasetRating: 4.6,
          activeUsers: 12
        }
      }
    ]

    const mockTags = ["customer", "analytics", "finance", "risk", "marketing"]
    const mockRecentSearches = ["customer data", "financial metrics", "risk assessment"]

    return {
      datasets: mockDatasets.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
      organizations: mockOrganizations.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      users: [],
      tags: mockTags.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      recentSearches: mockRecentSearches.filter(search => 
        search.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  }

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        datasets: [],
        organizations: [],
        users: [],
        tags: [],
        recentSearches: ["customer data", "financial metrics", "risk assessment"] // Show recent searches when no query
      })
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const searchResults = await performSearch(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (callback: () => void) => {
    callback()
    setOpen(false)
    setQuery("")
  }

  const handleSearchSubmit = () => {
    if (query.trim()) {
      onSearchSubmit?.(query)
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <>
      {showTrigger && (
        <Button
          variant="outline"
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          {placeholder}
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {/* Recent Searches */}
          {!query && results.recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {results.recentSearches.map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => handleSelect(() => {
                    setQuery(search)
                    onSearchSubmit?.(search)
                  })}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Datasets */}
          {results.datasets.length > 0 && (
            <CommandGroup heading="Datasets">
              {results.datasets.slice(0, 5).map((dataset) => (
                <CommandItem
                  key={dataset.id}
                  onSelect={() => handleSelect(() => onDatasetSelect?.(dataset))}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <Database className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{dataset.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {dataset.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {dataset.metrics.qualityScore}%
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        {dataset.metrics.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
              {results.datasets.length > 5 && (
                <CommandItem onSelect={handleSearchSubmit}>
                  <Search className="mr-2 h-4 w-4" />
                  View all {results.datasets.length} datasets
                </CommandItem>
              )}
            </CommandGroup>
          )}

          {/* Organizations */}
          {results.organizations.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Organizations">
                {results.organizations.slice(0, 3).map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(() => onOrganizationSelect?.(org))}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={org.logoUrl} />
                        <AvatarFallback>
                          <Building2 className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center">
                          {org.name}
                          {org.verified && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {org.metrics.datasetCount} datasets
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tags">
                {results.tags.slice(0, 8).map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => handleSelect(() => onTagSelect?.(tag))}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    #{tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Search Action */}
          {query && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={handleSearchSubmit}>
                  <Search className="mr-2 h-4 w-4" />
                  Search for "{query}"
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}