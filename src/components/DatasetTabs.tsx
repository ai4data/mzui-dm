import { useState } from "react"
import { 
  Info, 
  Table, 
  Users, 
  Star, 
  Link as LinkIcon,
  FileText,
  Lightbulb,
  BarChart3
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetMetadata } from "@/components/DatasetMetadata"
import { DataPreview } from "@/components/DataPreview"
// import { DataVisualization } from "@/components/DataVisualization"
import { RatingSummary } from "@/components/RatingSummary"
import { ReviewsList } from "@/components/ReviewsList"
import { ReviewDialog } from "@/components/ReviewDialog"
import { Button } from "@/components/ui/button"
import { Dataset } from "@/types"

interface DatasetTabsProps {
  dataset: Dataset
}

export function DatasetTabs({ dataset }: DatasetTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs 
      defaultValue="overview" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <TabsList className="grid grid-cols-6 md:w-fit">
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-1">
          <Table className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
        </TabsTrigger>
        <TabsTrigger value="visualize" className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Visualize</span>
        </TabsTrigger>
        <TabsTrigger value="usage" className="flex items-center gap-1">
          <Lightbulb className="h-4 w-4" />
          <span className="hidden sm:inline">Usage</span>
        </TabsTrigger>
        <TabsTrigger value="ratings" className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          <span className="hidden sm:inline">Ratings</span>
        </TabsTrigger>
        <TabsTrigger value="related" className="flex items-center gap-1">
          <LinkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Related</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <DatasetMetadata dataset={dataset} />
      </TabsContent>

      {/* Preview Tab */}
      <TabsContent value="preview" className="space-y-6">
        {dataset.preview ? (
          <DataPreview preview={dataset.preview} datasetName={dataset.name} />
        ) : (
          <div className="border rounded-lg p-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No preview available</h3>
              <p className="text-muted-foreground">
                A preview is not available for this dataset. Please download the dataset to view its contents.
              </p>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Visualize Tab */}
      <TabsContent value="visualize" className="space-y-6">
        <div className="border rounded-lg p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Data Visualization</h3>
            <p className="text-muted-foreground">
              Interactive charts and visualizations will be available soon. This feature is currently being enhanced.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* Usage Tab */}
      <TabsContent value="usage" className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-muted-foreground" />
            Usage & Applications
          </h2>
          
          <div className="space-y-6">
            {/* Business Use Cases */}
            <div>
              <h3 className="text-lg font-medium mb-3">Business Use Cases</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Customer Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        Analyze customer behavior patterns and preferences to improve targeting and personalization.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Business Intelligence</h4>
                      <p className="text-sm text-muted-foreground">
                        Generate insights and reports for strategic decision making and performance monitoring.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                      <Table className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Operational Reporting</h4>
                      <p className="text-sm text-muted-foreground">
                        Create operational dashboards and automated reports for daily business operations.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
                      <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Quality Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor and evaluate data quality metrics and compliance requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Information */}
            <div>
              <h3 className="text-lg font-medium mb-3">How to Access This Data</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Download</h4>
                    <p className="text-xs text-muted-foreground">
                      Export as CSV, Excel, or JSON format
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">API Access</h4>
                    <p className="text-xs text-muted-foreground">
                      Connect via REST API for real-time data
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Table className="h-5 w-5" />
                    </div>
                    <h4 className="font-medium mb-1">Direct Query</h4>
                    <p className="text-xs text-muted-foreground">
                      Query directly from BI tools
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Guidelines */}
            <div>
              <h3 className="text-lg font-medium mb-3">Usage Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Data Classification:</span> {dataset.dataClassification} - 
                      Follow appropriate security protocols when handling this data.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Update Frequency:</span> This dataset is updated regularly. 
                      Check the last updated date before using for critical decisions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-1 mt-0.5">
                    <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Best Practices:</span> Always validate data quality and 
                      completeness before using in production analyses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Ratings Tab */}
      <TabsContent value="ratings" className="space-y-6">
        {/* Header with Write Review Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6" />
              Ratings & Reviews
            </h2>
            <p className="text-muted-foreground mt-1">
              See what others think about this dataset and share your own experience
            </p>
          </div>
          <ReviewDialog
            datasetId={dataset.id}
            datasetName={dataset.name}
            onSubmit={async (review) => {
              // In a real app, this would call an API to submit the review
              console.log('Submitting review:', review)
              // For demo purposes, we'll just log it
              // You could update the dataset state here or refetch data
            }}
          />
        </div>

        {/* Rating Summary */}
        <RatingSummary 
          ratings={dataset.ratings || []}
          averageRating={dataset.metrics.averageRating}
        />

        {/* Reviews List */}
        {dataset.ratings && dataset.ratings.length > 0 ? (
          <ReviewsList
            reviews={dataset.ratings}
            onHelpful={(reviewId, helpful) => {
              // In a real app, this would call an API to mark review as helpful
              console.log(`Review ${reviewId} marked as ${helpful ? 'helpful' : 'not helpful'}`)
            }}
            onReport={(reviewId) => {
              // In a real app, this would call an API to report the review
              console.log(`Review ${reviewId} reported`)
              alert('Review reported. Thank you for helping maintain quality.')
            }}
          />
        ) : (
          <div className="border rounded-lg p-8">
            <div className="text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share your experience with this dataset
              </p>
              <ReviewDialog
                datasetId={dataset.id}
                datasetName={dataset.name}
                onSubmit={async (review) => {
                  console.log('Submitting first review:', review)
                }}
                trigger={
                  <Button>
                    <Star className="h-4 w-4 mr-2" />
                    Write First Review
                  </Button>
                }
              />
            </div>
          </div>
        )}
      </TabsContent>

      {/* Related Tab */}
      <TabsContent value="related" className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            Related Datasets
          </h2>
          
          {dataset.relatedDatasets && dataset.relatedDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataset.relatedDatasets.map(related => (
                <div key={related.id} className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{related.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {related.description}
                      </p>
                    </div>
                    {related.similarityScore && (
                      <div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                        {Math.round(related.similarityScore * 100)}% match
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{related.relationshipType}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No related datasets</h3>
              <p className="text-muted-foreground">
                There are no related datasets available for this dataset.
              </p>
            </div>
          )}
        </div>
      </TabsContent>


    </Tabs>
  )
}