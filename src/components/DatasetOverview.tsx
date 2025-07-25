import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Download, 
  Calendar,
  Database,
  Shield,
  Users,
  BarChart3,
  Activity,
  Info,
  Building2,
  FileText
} from "lucide-react"
import { Dataset } from "@/types"

// Extensible component sections for future enhancements
interface OverviewSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  component: React.ComponentType<{ dataset: Dataset }>
  order: number
  enabled: boolean
}

interface DatasetOverviewProps {
  dataset: Dataset
}

export function DatasetOverview({ dataset }: DatasetOverviewProps) {
  const metrics = dataset.metrics

  // Calculate overall health score
  const healthScore = Math.round(
    (metrics.qualityScore + metrics.accuracy + metrics.timeliness + metrics.completeness) / 4
  )

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Get quality score color
  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dataset Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive information and key performance indicators
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Info className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      <Separator />

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overall Health Score */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Health Score</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Radial Progress Circle */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - healthScore / 100)}`}
                  className={healthScore >= 90 ? "text-green-500" : healthScore >= 70 ? "text-yellow-500" : "text-red-500"}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthScore}%</div>
                  <div className="text-xs text-muted-foreground">Health</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Badge className={getQualityColor(healthScore)}>
              {healthScore >= 90 ? "Excellent" : healthScore >= 70 ? "Good" : "Needs Attention"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Quality Metrics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Quality Score</span>
              <span className="font-medium">{metrics.qualityScore}%</span>
            </div>
            <Progress 
              value={metrics.qualityScore} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(metrics.qualityScore)} 0%, ${getProgressColor(metrics.qualityScore)} ${metrics.qualityScore}%, #e5e7eb ${metrics.qualityScore}%)`
              }}
            />
          </div>

          {/* Completeness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Completeness</span>
              <span className="font-medium">{metrics.completeness}%</span>
            </div>
            <Progress 
              value={metrics.completeness} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(metrics.completeness)} 0%, ${getProgressColor(metrics.completeness)} ${metrics.completeness}%, #e5e7eb ${metrics.completeness}%)`
              }}
            />
          </div>

          {/* Accuracy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Accuracy</span>
              <span className="font-medium">{metrics.accuracy}%</span>
            </div>
            <Progress 
              value={metrics.accuracy} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(metrics.accuracy)} 0%, ${getProgressColor(metrics.accuracy)} ${metrics.accuracy}%, #e5e7eb ${metrics.accuracy}%)`
              }}
            />
          </div>

          {/* Timeliness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Timeliness</span>
              <span className="font-medium">{metrics.timeliness}%</span>
            </div>
            <Progress 
              value={metrics.timeliness} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(metrics.timeliness)} 0%, ${getProgressColor(metrics.timeliness)} ${metrics.timeliness}%, #e5e7eb ${metrics.timeliness}%)`
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total Views</span>
            </div>
            <span className="text-lg font-semibold">{formatNumber(metrics.usageCount)}</span>
          </div>

          {/* Average Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Average Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-lg font-semibold">{metrics.averageRating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(metrics.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Data Elements */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Data Elements</span>
            </div>
            <span className="text-lg font-semibold">{formatNumber(dataset.numberOfDataElements)}</span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last Updated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(dataset.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Information */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Dataset Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Business Line</label>
                  <p className="text-sm text-muted-foreground">{dataset.businessLine}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data Domain</label>
                  <p className="text-sm text-muted-foreground">{dataset.dataDomain}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Maturity Level</label>
                  <Badge variant="outline">{dataset.maturity}</Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Classification</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge className={
                      dataset.dataClassification === 'Public' ? 'bg-green-100 text-green-800' :
                      dataset.dataClassification === 'Internal' ? 'bg-blue-100 text-blue-800' :
                      dataset.dataClassification === 'Confidential' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {dataset.dataClassification}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Ownership</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Data Owner</label>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{dataset.dataOwner.name}</p>
                  </div>
                  {dataset.dataOwner.department && (
                    <p className="text-xs text-muted-foreground ml-6">{dataset.dataOwner.department}</p>
                  )}
                </div>
                
                {dataset.dataSteward && (
                  <div>
                    <label className="text-sm font-medium">Data Steward</label>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{dataset.dataSteward.name}</p>
                    </div>
                    {dataset.dataSteward.department && (
                      <p className="text-xs text-muted-foreground ml-6">{dataset.dataSteward.department}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Technical Details</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Technical ID</label>
                  <p className="text-sm text-muted-foreground font-mono">{dataset.technicalId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Source System</label>
                  <p className="text-sm text-muted-foreground">{dataset.sourceSysName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Historical Data</label>
                  <Badge variant={dataset.historicalData ? "default" : "secondary"}>
                    {dataset.historicalData ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}