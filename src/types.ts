// Legacy Product interface (keeping for backward compatibility)
export interface Product {
  id: number
  title: string
  description: string
  price: number
  image: string
  category: string
}

// Data Marketplace Types

export enum MaturityLevel {
  DRAFT = 'Draft',
  PREPARED = 'Prepared for distribution',
  PUBLISHED = 'Published',
  DEPRECATED = 'Deprecated'
}

export enum LifecycleStatus {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  DEPRECATED = 'Deprecated'
}

export enum ClassificationType {
  PUBLIC = 'Public',
  INTERNAL = 'Internal',
  CONFIDENTIAL = 'Confidential',
  SENSITIVE = 'Sensitive personal data',
  RESTRICTED = 'Restricted'
}

export enum UserRole {
  VIEWER = 'viewer',
  CONTRIBUTOR = 'contributor',
  ADMIN = 'admin'
}

export interface DataOwner {
  id: string
  name: string
  email?: string
  department?: string
}

export interface DataSteward {
  id: string
  name: string
  email?: string
  department?: string
}

export interface DatasetMetrics {
  qualityScore: number
  completeness: number
  accuracy: number
  timeliness: number
  usageCount: number
  averageRating: number
}

export interface DatasetPreview {
  columns: Array<{
    name: string
    businessName: string
    description: string
    dataType: string
    sampleValues: any[]
  }>
  sampleData: any[][]
  rowCount: number
}

export interface DatasetVisualization {
  id: string
  type: 'chart' | 'graph' | 'map' | 'table'
  title: string
  description: string
  config: any
}

export interface RelatedDataset {
  id: string
  name: string
  description: string
  relationshipType: 'similar' | 'derived' | 'parent' | 'child'
  similarityScore?: number
}

export interface DatasetRating {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface DataStory {
  id: string
  title: string
  author: string
  createdAt: Date
  summary: string
  content: string
  visualizations: DatasetVisualization[]
  datasets: string[] // Dataset IDs used in the story
}

export interface Dataset {
  id: string
  technicalId: string
  sourceSysId: string
  sourceSysName: string
  name: string
  description: string
  businessLine: string
  businessEntity: string
  maturity: MaturityLevel
  dataLifecycle: LifecycleStatus
  location: string
  dataDomain: string
  dataSubDomain: string
  dataExpert: string
  dataValidator: string
  dataOwner: DataOwner
  dataSteward: DataSteward
  dataClassification: ClassificationType
  legalGroundCollection: string
  historicalData: boolean
  unlockedGDP: string
  ciaRating: string
  numberOfDataElements: number
  createdAt: Date
  updatedAt: Date
  tags: string[]
  metrics: DatasetMetrics
  preview?: DatasetPreview
  visualizations: DatasetVisualization[]
  relatedDatasets: RelatedDataset[]
  ratings: DatasetRating[]
  stories: DataStory[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'grid' | 'list'
  emailNotifications: boolean
  categoriesOfInterest: string[]
}

export interface User {
  id: string
  name: string
  email: string
  organization: string
  role: UserRole
  preferences: UserPreferences
  favorites: string[] // Dataset IDs
  recentlyViewed: Array<{
    datasetId: string
    viewedAt: Date
  }>
  interests: string[] // Categories or tags
}

export interface Organization {
  id: string
  name: string
  description: string
  logoUrl: string
  website?: string
  verified: boolean
  datasets: string[] // Dataset IDs
  members: string[] // User IDs
  createdAt: Date
  metrics: {
    datasetCount: number
    averageDatasetRating: number
    activeUsers: number
  }
}

// Search and Filter Types
export interface SearchFilters {
  categories?: string[]
  classifications?: ClassificationType[]
  maturity?: MaturityLevel[]
  qualityRange?: {
    min: number
    max: number
  }
  dateRange?: {
    start: Date
    end: Date
  }
  organizations?: string[]
  tags?: string[]
}

export interface SearchResult {
  datasets: Dataset[]
  totalCount: number
  facets: {
    categories: Array<{ name: string; count: number }>
    classifications: Array<{ name: string; count: number }>
    organizations: Array<{ name: string; count: number }>
    tags: Array<{ name: string; count: number }>
  }
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

// Component Props Types
export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface DatasetCardProps {
  dataset: Dataset
  onSelect?: (datasetId: string) => void
  showActions?: boolean
}

export interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  initialQuery?: string
  placeholder?: string
}

// Form Types
export interface DatasetFormData {
  name: string
  description: string
  businessLine: string
  businessEntity: string
  dataDomain: string
  dataSubDomain: string
  dataClassification: ClassificationType
  tags: string[]
}

export interface UserProfileFormData {
  name: string
  email: string
  organization: string
  preferences: UserPreferences
}
