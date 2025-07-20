import { useState } from "react"
import { Filter, X, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { SearchFilters, ClassificationType, MaturityLevel } from "@/types"

interface DatasetFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  availableCategories?: Array<{ name: string; count: number }>
  availableOrganizations?: Array<{ name: string; count: number }>
  availableTags?: Array<{ name: string; count: number }>
  compact?: boolean
}

export function DatasetFilters({
  filters,
  onFiltersChange,
  availableCategories = [],
  availableOrganizations = [],
  availableTags = [],
  compact = false
}: DatasetFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Helper function to update filters
  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  // Helper function to toggle array values
  const toggleArrayValue = <T,>(array: T[] = [], value: T): T[] => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.categories?.length) count += filters.categories.length
    if (filters.classifications?.length) count += filters.classifications.length
    if (filters.maturity?.length) count += filters.maturity.length
    if (filters.organizations?.length) count += filters.organizations.length
    if (filters.tags?.length) count += filters.tags.length
    if (filters.qualityRange) count += 1
    if (filters.dateRange) count += 1
    return count
  }

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({})
  }

  // Remove specific filter
  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'category':
        updateFilters({
          categories: filters.categories?.filter(c => c !== value)
        })
        break
      case 'classification':
        updateFilters({
          classifications: filters.classifications?.filter(c => c !== value as ClassificationType)
        })
        break
      case 'maturity':
        updateFilters({
          maturity: filters.maturity?.filter(m => m !== value as MaturityLevel)
        })
        break
      case 'organization':
        updateFilters({
          organizations: filters.organizations?.filter(o => o !== value)
        })
        break
      case 'tag':
        updateFilters({
          tags: filters.tags?.filter(t => t !== value)
        })
        break
      case 'quality':
        updateFilters({ qualityRange: undefined })
        break
      case 'date':
        updateFilters({ dateRange: undefined })
        break
    }
  }

  const activeFilterCount = getActiveFilterCount()

  // Compact filter display (for mobile or small spaces)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <FilterContent
              filters={filters}
              updateFilters={updateFilters}
              toggleArrayValue={toggleArrayValue}
              availableCategories={availableCategories}
              availableOrganizations={availableOrganizations}
              availableTags={availableTags}
              removeFilter={removeFilter}
              clearAllFilters={clearAllFilters}
              activeFilterCount={activeFilterCount}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  // Full filter sidebar
  return (
    <div className="w-64 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      <FilterContent
        filters={filters}
        updateFilters={updateFilters}
        toggleArrayValue={toggleArrayValue}
        availableCategories={availableCategories}
        availableOrganizations={availableOrganizations}
        availableTags={availableTags}
        removeFilter={removeFilter}
        clearAllFilters={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  )
}

// Shared filter content component
function FilterContent({
  filters,
  updateFilters,
  toggleArrayValue,
  availableCategories,
  availableOrganizations,
  availableTags,
  removeFilter,
  clearAllFilters,
  activeFilterCount
}: {
  filters: SearchFilters
  updateFilters: (updates: Partial<SearchFilters>) => void
  toggleArrayValue: <T>(array: T[], value: T) => T[]
  availableCategories: Array<{ name: string; count: number }>
  availableOrganizations: Array<{ name: string; count: number }>
  availableTags: Array<{ name: string; count: number }>
  removeFilter: (type: string, value?: string) => void
  clearAllFilters: () => void
  activeFilterCount: number
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    classifications: true,
    maturity: false,
    quality: false,
    organizations: false,
    tags: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="p-4 space-y-4">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {filters.categories?.map(category => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('category', category)}
                />
              </Badge>
            ))}
            {filters.classifications?.map(classification => (
              <Badge key={classification} variant="secondary" className="text-xs">
                {classification}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('classification', classification)}
                />
              </Badge>
            ))}
            {filters.maturity?.map(maturity => (
              <Badge key={maturity} variant="secondary" className="text-xs">
                {maturity}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('maturity', maturity)}
                />
              </Badge>
            ))}
            {filters.organizations?.map(org => (
              <Badge key={org} variant="secondary" className="text-xs">
                {org}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('organization', org)}
                />
              </Badge>
            ))}
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('tag', tag)}
                />
              </Badge>
            ))}
            {filters.qualityRange && (
              <Badge variant="secondary" className="text-xs">
                Quality: {filters.qualityRange.min}-{filters.qualityRange.max}%
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('quality')}
                />
              </Badge>
            )}
          </div>
          <Separator />
        </div>
      )}

      {/* Categories */}
      <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium">Categories</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.categories ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {availableCategories.length > 0 ? (
            availableCategories.map(category => (
              <div key={category.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.name}`}
                  checked={filters.categories?.includes(category.name) || false}
                  onCheckedChange={() => updateFilters({
                    categories: toggleArrayValue(filters.categories, category.name)
                  })}
                />
                <Label htmlFor={`category-${category.name}`} className="text-sm flex-1">
                  {category.name}
                </Label>
                <span className="text-xs text-muted-foreground">{category.count}</span>
              </div>
            ))
          ) : (
            ['Customer Data', 'Financial Data', 'Risk Management', 'HR Data', 'Operations'].map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories?.includes(category) || false}
                  onCheckedChange={() => updateFilters({
                    categories: toggleArrayValue(filters.categories, category)
                  })}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Classifications */}
      <Collapsible open={openSections.classifications} onOpenChange={() => toggleSection('classifications')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium">Data Classification</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.classifications ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {Object.values(ClassificationType).map(classification => (
            <div key={classification} className="flex items-center space-x-2">
              <Checkbox
                id={`classification-${classification}`}
                checked={filters.classifications?.includes(classification) || false}
                onCheckedChange={() => updateFilters({
                  classifications: toggleArrayValue(filters.classifications, classification)
                })}
              />
              <Label htmlFor={`classification-${classification}`} className="text-sm">
                {classification}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Quality Range */}
      <Collapsible open={openSections.quality} onOpenChange={() => toggleSection('quality')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium">Quality Score</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.quality ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-2">
          <div className="px-2">
            <Slider
              value={[filters.qualityRange?.min || 0, filters.qualityRange?.max || 100]}
              onValueChange={([min, max]) => updateFilters({
                qualityRange: { min, max }
              })}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{filters.qualityRange?.min || 0}%</span>
              <span>{filters.qualityRange?.max || 100}%</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Organizations */}
      <Collapsible open={openSections.organizations} onOpenChange={() => toggleSection('organizations')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <span className="font-medium">Organizations</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${openSections.organizations ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          {availableOrganizations.length > 0 ? (
            availableOrganizations.slice(0, 5).map(org => (
              <div key={org.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`org-${org.name}`}
                  checked={filters.organizations?.includes(org.name) || false}
                  onCheckedChange={() => updateFilters({
                    organizations: toggleArrayValue(filters.organizations, org.name)
                  })}
                />
                <Label htmlFor={`org-${org.name}`} className="text-sm flex-1">
                  {org.name}
                </Label>
                <span className="text-xs text-muted-foreground">{org.count}</span>
              </div>
            ))
          ) : (
            ['Analytics Corp', 'Finance Inc', 'Data Solutions'].map(org => (
              <div key={org} className="flex items-center space-x-2">
                <Checkbox
                  id={`org-${org}`}
                  checked={filters.organizations?.includes(org) || false}
                  onCheckedChange={() => updateFilters({
                    organizations: toggleArrayValue(filters.organizations, org)
                  })}
                />
                <Label htmlFor={`org-${org}`} className="text-sm">
                  {org}
                </Label>
              </div>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}