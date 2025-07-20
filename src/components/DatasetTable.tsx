import { useState } from "react"
import {
  ArrowUpDown,
  MoreVertical,
  Filter,
  Plus,
  Star,
  Download,
  Bookmark,
  Eye,
  Calendar
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dataset } from "@/types"
import { formatDate, formatNumber } from "@/lib/dataTransforms"
import { getClassificationColor, getQualityScoreColor } from "@/lib/dataTransforms"

interface DatasetTableProps {
  datasets: Dataset[]
  loading?: boolean
  onDatasetSelect?: (dataset: Dataset) => void
  onBookmark?: (datasetId: string) => void
  onDownload?: (datasetId: string) => void
  selectedDatasets?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export function DatasetTable({
  datasets,
  loading = false,
  onDatasetSelect,
  onBookmark,
  onDownload,
  selectedDatasets = [],
  onSelectionChange
}: DatasetTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'quality' | 'usage'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterClassification, setFilterClassification] = useState<string>('all')

  // Calculate pagination
  const totalPages = Math.ceil(datasets.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentDatasets = datasets.slice(startIndex, endIndex)

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(datasets.map(d => d.id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectDataset = (datasetId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedDatasets, datasetId])
    } else {
      onSelectionChange?.(selectedDatasets.filter(id => id !== datasetId))
    }
  }

  const isAllSelected = selectedDatasets.length === datasets.length && datasets.length > 0
  const isSomeSelected = selectedDatasets.length > 0 && selectedDatasets.length < datasets.length

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header with filters and controls */}
      <div className="flex items-center justify-between gap-4">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Datasets</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
            <TabsTrigger value="high-quality">High Quality</TabsTrigger>
            <TabsTrigger value="add-dataset" asChild>
              <button>
                <Plus className="h-4 w-4" />
              </button>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <span className="text-muted-foreground text-sm">Category:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="customer">Customer Data</SelectItem>
              <SelectItem value="financial">Financial Data</SelectItem>
              <SelectItem value="risk">Risk Management</SelectItem>
              <SelectItem value="hr">HR Data</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterClassification} onValueChange={setFilterClassification}>
            <SelectTrigger className="w-[140px]">
              <span className="text-muted-foreground text-sm">Classification:</span>
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
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="!border-0">
              <TableHead className="w-12 rounded-l-lg px-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead className="text-right">Quality</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="rounded-r-lg" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="px-4">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-6 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : currentDatasets.length > 0 ? (
              currentDatasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedDatasets.includes(dataset.id)}
                      onCheckedChange={(checked) => handleSelectDataset(dataset.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium cursor-pointer hover:text-primary" onClick={() => onDatasetSelect?.(dataset)}>
                        {dataset.name}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {dataset.description}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {dataset.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={dataset.dataOwner.email ? `https://avatar.vercel.sh/${dataset.dataOwner.email}` : undefined} />
                        <AvatarFallback className="text-xs">
                          {dataset.dataOwner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{dataset.dataOwner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getClassificationColor(dataset.dataClassification)}>
                      {dataset.dataClassification}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Progress value={dataset.metrics.qualityScore} className="w-16 h-2" />
                      <span className={`text-sm font-medium ${getQualityScoreColor(dataset.metrics.qualityScore)}`}>
                        {dataset.metrics.qualityScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm">
                      <div className="flex items-center justify-end space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(dataset.metrics.usageCount)}</span>
                      </div>
                      <div className="flex items-center justify-end space-x-1 text-muted-foreground">
                        <Star className="h-3 w-3" />
                        <span>{dataset.metrics.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(dataset.updatedAt, 'relative')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDatasetSelect?.(dataset)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onBookmark?.(dataset.id)}>
                          <Bookmark className="mr-2 h-4 w-4" />
                          Bookmark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload?.(dataset.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No datasets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {selectedDatasets.length} of {datasets.length} dataset(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm font-medium">Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              ⟪
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              ⟨
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              ⟩
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              ⟫
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}