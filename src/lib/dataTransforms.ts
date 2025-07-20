import { Dataset, MaturityLevel, LifecycleStatus, ClassificationType } from "@/types"

// Transform raw dataset data from API to business-friendly format
export function transformDatasetForDisplay(rawDataset: any): Dataset {
  return {
    id: rawDataset.GDSId || rawDataset.id,
    technicalId: rawDataset.SourceSysId || rawDataset.technicalId,
    sourceSysId: rawDataset.SourceSysId || rawDataset.sourceSysId,
    sourceSysName: rawDataset.SourceSysName || rawDataset.sourceSysName,
    name: rawDataset.GoldenDataSetName || rawDataset.name || 'Unnamed Dataset',
    description: rawDataset.DataDescription || rawDataset.description || 'No description available',
    businessLine: rawDataset.BusinessLine || rawDataset.businessLine || 'Unknown',
    businessEntity: rawDataset.BusinessEntity || rawDataset.businessEntity || 'Unknown',
    maturity: mapMaturityLevel(rawDataset.Maturity || rawDataset.maturity),
    dataLifecycle: mapLifecycleStatus(rawDataset.DataLifecycle || rawDataset.dataLifecycle),
    location: rawDataset.Location || rawDataset.location || 'Unknown',
    dataDomain: rawDataset.dataDomain || rawDataset.DataDomain || 'General',
    dataSubDomain: rawDataset.DataSubDomain || rawDataset.dataSubDomain || 'General',
    dataExpert: rawDataset.DataExpert || rawDataset.dataExpert || 'Unknown',
    dataValidator: rawDataset.DataValidator || rawDataset.dataValidator || 'Unknown',
    dataOwner: {
      id: rawDataset.DataOwnerID || rawDataset.data_owner_id?.toString() || 'unknown',
      name: rawDataset.DataOwnerName || rawDataset.dataOwner?.name || 'Unknown Owner',
      email: rawDataset.dataOwner?.email,
      department: rawDataset.dataOwner?.department
    },
    dataSteward: {
      id: rawDataset.DataStewardID || rawDataset.data_steward_id?.toString() || 'unknown',
      name: rawDataset.DataStewardName || rawDataset.dataSteward?.name || 'Unknown Steward',
      email: rawDataset.dataSteward?.email,
      department: rawDataset.dataSteward?.department
    },
    dataClassification: mapClassificationType(rawDataset.DataClassification || rawDataset.dataClassification),
    legalGroundCollection: rawDataset.LegalGroundCollection || rawDataset.legalGroundCollection || 'Not specified',
    historicalData: parseBoolean(rawDataset.HistoricalData || rawDataset.historicalData),
    unlockedGDP: rawDataset.UnlockedGDP || rawDataset.unlockedGDP || 'Unknown',
    ciaRating: rawDataset.CIARating || rawDataset.ciaRating || 'Not rated',
    numberOfDataElements: parseInt(rawDataset.NbDataElements || rawDataset.numberOfDataElements || '0'),
    createdAt: parseDate(rawDataset.createdAt) || new Date(),
    updatedAt: parseDate(rawDataset.updatedAt) || new Date(),
    tags: rawDataset.tags || [],
    metrics: {
      qualityScore: calculateQualityScore(rawDataset),
      completeness: rawDataset.metrics?.completeness || 85,
      accuracy: rawDataset.metrics?.accuracy || 90,
      timeliness: rawDataset.metrics?.timeliness || 95,
      usageCount: rawDataset.metrics?.usageCount || 0,
      averageRating: rawDataset.metrics?.averageRating || 0
    },
    preview: rawDataset.preview,
    visualizations: rawDataset.visualizations || [],
    relatedDatasets: rawDataset.relatedDatasets || [],
    ratings: rawDataset.ratings || [],
    stories: rawDataset.stories || []
  }
}

// Map technical maturity levels to business-friendly terms
function mapMaturityLevel(maturity: string): MaturityLevel {
  const maturityMap: Record<string, MaturityLevel> = {
    'Draft': MaturityLevel.DRAFT,
    'Prepared for distribution': MaturityLevel.PREPARED,
    'Published': MaturityLevel.PUBLISHED,
    'Deprecated': MaturityLevel.DEPRECATED,
    'draft': MaturityLevel.DRAFT,
    'prepared': MaturityLevel.PREPARED,
    'published': MaturityLevel.PUBLISHED,
    'deprecated': MaturityLevel.DEPRECATED
  }
  
  return maturityMap[maturity] || MaturityLevel.DRAFT
}

// Map technical lifecycle status to business-friendly terms
function mapLifecycleStatus(lifecycle: string): LifecycleStatus {
  const lifecycleMap: Record<string, LifecycleStatus> = {
    'Active': LifecycleStatus.ACTIVE,
    'Archived': LifecycleStatus.ARCHIVED,
    'Deprecated': LifecycleStatus.DEPRECATED,
    'active': LifecycleStatus.ACTIVE,
    'archived': LifecycleStatus.ARCHIVED,
    'deprecated': LifecycleStatus.DEPRECATED
  }
  
  return lifecycleMap[lifecycle] || LifecycleStatus.ACTIVE
}

// Map technical classification to business-friendly terms
function mapClassificationType(classification: string): ClassificationType {
  const classificationMap: Record<string, ClassificationType> = {
    'Public': ClassificationType.PUBLIC,
    'Internal': ClassificationType.INTERNAL,
    'Confidential': ClassificationType.CONFIDENTIAL,
    'Sensitive personal data': ClassificationType.SENSITIVE,
    'Restricted': ClassificationType.RESTRICTED,
    'public': ClassificationType.PUBLIC,
    'internal': ClassificationType.INTERNAL,
    'confidential': ClassificationType.CONFIDENTIAL,
    'sensitive': ClassificationType.SENSITIVE,
    'restricted': ClassificationType.RESTRICTED
  }
  
  return classificationMap[classification] || ClassificationType.INTERNAL
}

// Calculate overall quality score based on various metrics
function calculateQualityScore(rawDataset: any): number {
  // Base score calculation
  let score = 70 // Base score
  
  // Add points for completeness
  if (rawDataset.DataDescription && rawDataset.DataDescription.length > 50) score += 10
  if (rawDataset.DataOwnerName && rawDataset.DataOwnerName !== 'Unknown') score += 5
  if (rawDataset.DataStewardName && rawDataset.DataStewardName !== 'Unknown') score += 5
  if (rawDataset.tags && rawDataset.tags.length > 0) score += 5
  if (rawDataset.NbDataElements && parseInt(rawDataset.NbDataElements) > 0) score += 5
  
  // Ensure score is within bounds
  return Math.min(Math.max(score, 0), 100)
}

// Parse boolean values from various formats
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1'
  }
  return false
}

// Parse date from various formats
function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null
  if (dateValue instanceof Date) return dateValue
  
  const parsed = new Date(dateValue)
  return isNaN(parsed.getTime()) ? null : parsed
}

// Format dates for display
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'relative') {
    return formatRelativeTime(dateObj)
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' }
  
  return dateObj.toLocaleDateString('en-US', options)
}

// Format relative time (e.g., "2 days ago", "3 hours ago")
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// Format numbers for display (e.g., 1234 -> "1.2K")
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
}

// Get business-friendly category names
export function getBusinessFriendlyCategory(technicalCategory: string): string {
  const categoryMap: Record<string, string> = {
    'risk_management': 'Risk Management',
    'customer_data': 'Customer Analytics',
    'financial_data': 'Financial Insights',
    'hr_data': 'Human Resources',
    'operational_data': 'Operations',
    'compliance_data': 'Compliance & Governance',
    'market_data': 'Market Intelligence'
  }
  
  return categoryMap[technicalCategory] || technicalCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Get classification color for UI display
export function getClassificationColor(classification: ClassificationType): string {
  const colorMap: Record<ClassificationType, string> = {
    [ClassificationType.PUBLIC]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    [ClassificationType.INTERNAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    [ClassificationType.CONFIDENTIAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    [ClassificationType.SENSITIVE]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    [ClassificationType.RESTRICTED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
  }
  
  return colorMap[classification] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
}

// Get quality score color for UI display
export function getQualityScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 dark:text-green-400'
  if (score >= 75) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 60) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}