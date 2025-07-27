import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

// Generate avatar URL using a placeholder service
const getAvatarUrl = (name: string) => {
  // Using DiceBear API for consistent, professional-looking avatars
  const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, ''))
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

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
  const metrics = dataset.metrics || {
    qualityScore: 0,
    completeness: 0,
    accuracy: 0,
    timeliness: 0,
    usageCount: 0,
    averageRating: 0
  }

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

  // Generate random avatar URL for users
  const getAvatarUrl = (name: string) => {
    const seed = name?.toLowerCase().replace(/\s+/g, '') || 'default'
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
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

      {/* Quality Metrics - Horizontal Progress Bars */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Quality Metrics</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Quality</span>
              <span className="text-sm font-semibold">{healthScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  healthScore >= 90 ? 'bg-orange-500' : healthScore >= 70 ? 'bg-orange-400' : 'bg-orange-300'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>

          {/* Quality Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">Quality Score</span>
              </div>
              <span className="text-sm font-semibold">{metrics.qualityScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${metrics.qualityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <span className="text-sm font-semibold">{metrics.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                style={{ width: `${metrics.accuracy}%` }}
              ></div>
            </div>
          </div>

          {/* Timeliness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">Timeliness</span>
              </div>
              <span className="text-sm font-semibold">{metrics.timeliness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${metrics.timeliness}%` }}
              ></div>
            </div>
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
            <span className="text-lg font-semibold">{formatNumber(dataset.numberOfDataElements || 0)}</span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Last Updated</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dataset.updatedAt ? new Date(dataset.updatedAt).toLocaleDateString() : 'Unknown'}
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
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Owner</label>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={getAvatarUrl(dataset.dataOwner?.name || 'Unknown')} 
                        alt={dataset.dataOwner?.name || 'Unknown'} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {(dataset.dataOwner?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{dataset.dataOwner?.name || 'Unknown'}</p>
                      {dataset.dataOwner?.department && (
                        <p className="text-xs text-muted-foreground">{dataset.dataOwner.department}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {dataset.dataSteward && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Steward</label>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getAvatarUrl(dataset.dataSteward?.name || 'Unknown')} 
                          alt={dataset.dataSteward?.name || 'Unknown'} 
                        />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {(dataset.dataSteward?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{dataset.dataSteward?.name || 'Unknown'}</p>
                        {dataset.dataSteward?.department && (
                          <p className="text-xs text-muted-foreground">{dataset.dataSteward.department}</p>
                        )}
                      </div>
                    </div>
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
                    {dataset.createdAt ? new Date(dataset.createdAt).toLocaleDateString() : 'Unknown'}
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