import { useState, useMemo } from "react"
import { BarChart3, PieChart, LineChart as LineChartIcon, TrendingUp, Eye, EyeOff, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { DatasetPreview } from "@/types"

interface DataVisualizationProps {
  preview: DatasetPreview
  datasetName: string
}

interface ChartData {
  name: string
  value: number
  count?: number
  fill?: string
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DataVisualization({ preview }: DataVisualizationProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar')
  const [showRawData, setShowRawData] = useState(false)

  // Get numeric and categorical columns
  const numericColumns = preview.columns.filter(col =>
    col.dataType.toLowerCase().includes('number') ||
    col.dataType.toLowerCase().includes('int') ||
    col.dataType.toLowerCase().includes('float') ||
    col.dataType.toLowerCase().includes('decimal')
  )

  const categoricalColumns = preview.columns.filter(col =>
    col.dataType.toLowerCase().includes('string') ||
    col.dataType.toLowerCase().includes('text') ||
    col.dataType.toLowerCase().includes('varchar')
  )

  const visualizableColumns = [...numericColumns, ...categoricalColumns]

  // Generate chart data based on selected column
  const chartData = useMemo(() => {
    if (!selectedColumn) return []

    const columnIndex = preview.columns.findIndex(col => col.name === selectedColumn)
    if (columnIndex === -1) return []

    const values = preview.sampleData.map(row => row[columnIndex]).filter(val => val !== null && val !== undefined)

    if (numericColumns.some(col => col.name === selectedColumn)) {
      // For numeric columns, create distribution bins
      const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val))
      if (numericValues.length === 0) return []

      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      const binCount = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(numericValues.length))))
      const binSize = (max - min) / binCount || 1

      const bins: ChartData[] = []
      for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binSize
        const binEnd = min + (i + 1) * binSize
        const count = numericValues.filter(val => val >= binStart && (i === binCount - 1 ? val <= binEnd : val < binEnd)).length

        bins.push({
          name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
          value: count,
          count: count,
          fill: CHART_COLORS[i % CHART_COLORS.length]
        })
      }
      return bins
    } else {
      // For categorical columns, count occurrences
      const counts = new Map<string, number>()
      values.forEach(val => {
        const key = String(val)
        counts.set(key, (counts.get(key) || 0) + 1)
      })

      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 categories
        .map(([name, count], index) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          value: count,
          count: count,
          fill: CHART_COLORS[index % CHART_COLORS.length]
        }))
    }
  }, [selectedColumn, preview, numericColumns])

  // Chart configuration
  const chartConfig = useMemo(() => {
    const config: any = {}
    chartData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })
    return config
  }, [chartData])

  // Auto-select first available column
  if (!selectedColumn && visualizableColumns.length > 0) {
    setSelectedColumn(visualizableColumns[0].name)
  }

  const selectedColumnInfo = preview.columns.find(col => col.name === selectedColumn)
  const isNumeric = numericColumns.some(col => col.name === selectedColumn)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Visualization
          </CardTitle>
          <CardDescription>
            Explore your data through interactive charts and graphs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Column</label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a column to visualize" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        Numeric Columns
                      </div>
                      {numericColumns.map((column) => (
                        <SelectItem key={column.name} value={column.name}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {column.dataType}
                            </Badge>
                            {column.businessName || column.name}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {categoricalColumns.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        Categorical Columns
                      </div>
                      {categoricalColumns.map((column) => (
                        <SelectItem key={column.name} value={column.name}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {column.dataType}
                            </Badge>
                            {column.businessName || column.name}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <Select value={chartType} onValueChange={(value: 'bar' | 'pie' | 'line') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                  {isNumeric && (
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        Line Chart
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRawData(!showRawData)}
              >
                {showRawData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showRawData ? 'Hide' : 'Show'} Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      {selectedColumn && chartData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedColumnInfo?.businessName || selectedColumnInfo?.name}
            </CardTitle>
            <CardDescription>
              {isNumeric ? 'Distribution of values' : 'Frequency of categories'}
              {selectedColumnInfo?.description && ` • ${selectedColumnInfo.description}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={chartType} onValueChange={(value: string) => setChartType(value as 'bar' | 'pie' | 'line')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bar" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Bar
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Pie
                </TabsTrigger>
                <TabsTrigger value="line" disabled={!isNumeric} className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Line
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bar" className="mt-6">
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="pie" className="mt-6">
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <RechartsPieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="line" className="mt-6">
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </TabsContent>
            </Tabs>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{chartData.length}</div>
                <div className="text-sm text-muted-foreground">
                  {isNumeric ? 'Bins' : 'Categories'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {chartData.reduce((sum, item) => sum + item.value, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Count</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Max Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
            </div>

            {/* Raw Data Table */}
            {showRawData && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Raw Data</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Category</th>
                          <th className="px-4 py-2 text-left font-medium">Count</th>
                          <th className="px-4 py-2 text-left font-medium">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((item, index) => {
                          const total = chartData.reduce((sum, d) => sum + d.value, 0)
                          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
                          return (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 font-mono">{item.value}</td>
                              <td className="px-4 py-2">{percentage}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Visualizable Data</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {visualizableColumns.length === 0
                ? "This dataset doesn't contain columns suitable for visualization. Numeric or categorical columns are required."
                : "Select a column from the dropdown above to create a visualization."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { DataVisualization }