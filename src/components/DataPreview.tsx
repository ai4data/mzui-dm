import { useState } from "react"
import { ChevronLeft, ChevronRight, Download, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatasetPreview } from "@/types"

interface DataPreviewProps {
  preview: DatasetPreview
  datasetName: string
}

export function DataPreview({ preview, datasetName }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filter data based on search term
  const filteredData = preview.sampleData.filter(row =>
    row.some(cell => 
      String(cell).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Sort data if a column is selected
  const sortedData = sortColumn 
    ? [...filteredData].sort((a, b) => {
        const columnIndex = preview.columns.findIndex(col => col.name === sortColumn)
        if (columnIndex === -1) return 0
        
        const aVal = a[columnIndex]
        const bVal = b[columnIndex]
        
        // Handle different data types
        let comparison = 0
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal
        } else {
          comparison = String(aVal).localeCompare(String(bVal))
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
    : filteredData

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnName)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleExport = () => {
    // Create CSV content
    const headers = preview.columns.map(col => col.businessName || col.name).join(',')
    const rows = sortedData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    
    const csvContent = `${headers}\n${rows}`
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${datasetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preview.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Data Preview
            </CardTitle>
            <CardDescription>
              Showing {paginatedData.length} of {sortedData.length} rows
              {searchTerm && ` (filtered from ${preview.sampleData.length} total)`}
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Preview
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in preview data..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="pl-8"
            />
          </div>
          <Select value={pageSize.toString()} onValueChange={(value) => {
            setPageSize(parseInt(value))
            setCurrentPage(1)
          }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Column Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{preview.columns.length}</div>
            <div className="text-sm text-muted-foreground">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{preview.rowCount.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Rows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{sortedData.length.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Filtered Rows</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {preview.columns.map((column, index) => (
                    <TableHead 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50 select-none"
                      onClick={() => handleSort(column.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {column.businessName || column.name}
                          </div>
                          {column.businessName && column.businessName !== column.name && (
                            <div className="text-xs text-muted-foreground font-normal">
                              {column.name}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center ml-2">
                          <Badge variant="outline" className="text-xs">
                            {column.dataType}
                          </Badge>
                          {sortColumn === column.name && (
                            <div className="text-xs text-primary mt-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => (
                    <TableRow key={startIndex + rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="max-w-xs">
                          <div className="truncate" title={String(cell)}>
                            {cell === null || cell === undefined ? (
                              <span className="text-muted-foreground italic">null</span>
                            ) : (
                              String(cell)
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={preview.columns.length} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm ? 'No matching data found' : 'No data available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Column Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Column Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preview.columns.map((column, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{column.businessName || column.name}</h4>
                    {column.businessName && column.businessName !== column.name && (
                      <p className="text-sm text-muted-foreground">Technical: {column.name}</p>
                    )}
                  </div>
                  <Badge variant="outline">{column.dataType}</Badge>
                </div>
                
                {column.description && (
                  <p className="text-sm text-muted-foreground mb-3">{column.description}</p>
                )}
                
                {column.sampleValues && column.sampleValues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Sample Values:</p>
                    <div className="flex flex-wrap gap-1">
                      {column.sampleValues.slice(0, 3).map((value, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {String(value)}
                        </Badge>
                      ))}
                      {column.sampleValues.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{column.sampleValues.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}