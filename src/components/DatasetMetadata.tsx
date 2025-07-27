import {
  Calendar,
  Clock,
  Database,
  FileText,
  Globe,
  HardDrive,
  Info,
  Lock,
  Shield,
  Tag,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Dataset } from "@/types"
import { formatDate, getClassificationColor } from "@/lib/dataTransforms"

// Generate avatar URL using a placeholder service
const getAvatarUrl = (name: string) => {
  // Using DiceBear API for consistent, professional-looking avatars
  const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, ''))
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
}

interface DatasetMetadataProps {
  dataset: Dataset
}

export function DatasetMetadata({ dataset }: DatasetMetadataProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ownership Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              Ownership & Governance
            </CardTitle>
            <CardDescription>
              Information about data ownership and governance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Data Owner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Owner</span>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={getAvatarUrl(dataset.dataOwner.name)} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {dataset.dataOwner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{dataset.dataOwner.name}</span>
                  {dataset.dataOwner.department && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {dataset.dataOwner.department}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Data Steward */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Steward</span>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={getAvatarUrl(dataset.dataSteward.name)} />
                    <AvatarFallback className="text-xs bg-green-100 text-green-600">
                      {dataset.dataSteward.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{dataset.dataSteward.name}</span>
                  {dataset.dataSteward.department && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {dataset.dataSteward.department}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Data Expert */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Expert</span>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={getAvatarUrl(dataset.dataExpert)} />
                    <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                      {dataset.dataExpert.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{dataset.dataExpert}</span>
                </div>
              </div>

              {/* Data Validator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Validator</span>
                </div>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={getAvatarUrl(dataset.dataValidator)} />
                    <AvatarFallback className="text-xs bg-amber-100 text-amber-600">
                      {dataset.dataValidator.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{dataset.dataValidator}</span>
                </div>
              </div>

              {/* Business Line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Business Line</span>
                </div>
                <span className="text-sm font-medium">{dataset.businessLine}</span>
              </div>

              {/* Business Entity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Business Entity</span>
                </div>
                <span className="text-sm font-medium">{dataset.businessEntity}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2 text-muted-foreground" />
              Technical Information
            </CardTitle>
            <CardDescription>
              Technical details about the dataset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Technical ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Technical ID</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium font-mono bg-muted px-2 py-1 rounded">
                      {dataset.technicalId}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Unique technical identifier for this dataset</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Source System */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Source System</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">{dataset.sourceSysName}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {dataset.sourceSysId}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Source system identifier</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Location</span>
                </div>
                <span className="text-sm font-medium">{dataset.location}</span>
              </div>

              {/* Data Elements */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Data Elements</span>
                </div>
                <span className="text-sm font-medium">{dataset.numberOfDataElements?.toLocaleString() || '0'}</span>
              </div>

              {/* Historical Data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Historical Data</span>
                </div>
                <Badge variant={dataset.historicalData ? "default" : "outline"}>
                  {dataset.historicalData ? "Yes" : "No"}
                </Badge>
              </div>

              {/* Created & Updated */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Created / Updated</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatDate(dataset.createdAt, 'short')}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(dataset.updatedAt, 'short')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Quality */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-muted-foreground" />
              Data Quality
            </CardTitle>
            <CardDescription>
              Quality metrics and assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Quality Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Quality</span>
                <span className="text-sm font-medium">{dataset.metrics.qualityScore}%</span>
              </div>
              <Progress value={dataset.metrics.qualityScore} className="h-2" />
            </div>

            {/* Completeness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center">
                      Completeness
                      <Info className="h-3 w-3 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of required fields that contain valid data</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm">{dataset.metrics.completeness}%</span>
              </div>
              <Progress value={dataset.metrics.completeness} className="h-1.5" />
            </div>

            {/* Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center">
                      Accuracy
                      <Info className="h-3 w-3 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of values that match expected patterns and ranges</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm">{dataset.metrics.accuracy}%</span>
              </div>
              <Progress value={dataset.metrics.accuracy} className="h-1.5" />
            </div>

            {/* Timeliness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center">
                      Timeliness
                      <Info className="h-3 w-3 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How up-to-date the data is relative to business needs</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm">{dataset.metrics.timeliness}%</span>
              </div>
              <Progress value={dataset.metrics.timeliness} className="h-1.5" />
            </div>

            {/* CIA Rating */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">CIA Rating</span>
              </div>
              <Badge variant="outline">{dataset.ciaRating}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Classification & Compliance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Lock className="h-5 w-5 mr-2 text-muted-foreground" />
              Classification & Compliance
            </CardTitle>
            <CardDescription>
              Data classification and compliance information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Classification */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Classification</span>
              </div>
              <Badge className={getClassificationColor(dataset.dataClassification)}>
                {dataset.dataClassification}
              </Badge>
            </div>

            {/* Data Domain */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Data Domain</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{dataset.dataDomain}</div>
                <div className="text-xs text-muted-foreground">{dataset.dataSubDomain}</div>
              </div>
            </div>

            {/* Legal Ground Collection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center">
                      Legal Ground
                      <Info className="h-3 w-3 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Legal basis for data collection and processing</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">{dataset.legalGroundCollection}</span>
            </div>

            {/* Maturity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Maturity</span>
              </div>
              <Badge variant={dataset.maturity === 'Published' ? 'default' : 'outline'}>
                {dataset.maturity}
              </Badge>
            </div>

            {/* Lifecycle Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Lifecycle Status</span>
              </div>
              <Badge
                variant={dataset.dataLifecycle === 'Active' ? 'default' : 'destructive'}
                className={dataset.dataLifecycle === 'Deprecated' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 hover:bg-orange-100/80 dark:hover:bg-orange-900/80' : ''}
              >
                {dataset.dataLifecycle}
              </Badge>
            </div>

            {/* Unlocked GDP */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center">
                      Unlocked GDP
                      <Info className="h-3 w-3 ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GDP compliance status</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">{dataset.unlockedGDP}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tags & Categories */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Tag className="h-5 w-5 mr-2 text-muted-foreground" />
              Tags & Categories
            </CardTitle>
            <CardDescription>
              Tags and categories for this dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dataset.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
              {dataset.tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags available</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}