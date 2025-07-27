import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Dataset } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Download, 
  Key, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react'

interface AddToCartDialogProps {
  dataset: Dataset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToCartDialog({ dataset, open, onOpenChange }: AddToCartDialogProps) {
  const { addToCart, openCart } = useCart()
  const [requestType, setRequestType] = useState<'access' | 'download' | 'api' | 'consultation'>('access')
  const [priority, setPriority] = useState<'standard' | 'urgent' | 'critical'>('standard')
  const [businessJustification, setBusinessJustification] = useState('')

  const requestTypes = [
    {
      value: 'access' as const,
      label: 'Data Access',
      description: 'Request read-only access to the dataset',
      icon: Database,
      recommended: true
    },
    {
      value: 'download' as const,
      label: 'Download',
      description: 'Download a copy of the dataset',
      icon: Download,
      recommended: false
    },
    {
      value: 'api' as const,
      label: 'API Access',
      description: 'Programmatic access via API endpoints',
      icon: Key,
      recommended: false
    },
    {
      value: 'consultation' as const,
      label: 'Consultation',
      description: 'Schedule a consultation with data experts',
      icon: MessageSquare,
      recommended: false
    }
  ]

  const priorities = [
    {
      value: 'standard' as const,
      label: 'Standard',
      description: '5-7 business days',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      value: 'urgent' as const,
      label: 'Urgent',
      description: '2-3 business days',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      value: 'critical' as const,
      label: 'Critical',
      description: '24-48 hours',
      icon: AlertCircle,
      color: 'text-red-600'
    }
  ]

  const handleAddToCart = () => {
    addToCart({
      dataset,
      requestType,
      priority,
      businessJustification: businessJustification.trim()
    })
    
    // Reset form
    setRequestType('access')
    setPriority('standard')
    setBusinessJustification('')
    
    // Close dialog and open cart
    onOpenChange(false)
    openCart()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Request Dataset Access
          </DialogTitle>
          <DialogDescription>
            Configure your request for "{dataset.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{dataset.businessLine}</Badge>
              <Badge variant="secondary">{dataset.dataDomain}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {dataset.description}
            </p>
          </div>

          {/* Request Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Request Type</Label>
            <RadioGroup value={requestType} onValueChange={(value: any) => setRequestType(value)}>
              {requestTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div key={type.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <div className="flex-1 flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={type.value} className="text-sm font-medium cursor-pointer">
                            {type.label}
                          </Label>
                          {type.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority Level</Label>
            <RadioGroup value={priority} onValueChange={(value: any) => setPriority(value)}>
              {priorities.map((priorityOption) => {
                const Icon = priorityOption.icon
                return (
                  <div key={priorityOption.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={priorityOption.value} id={priorityOption.value} />
                    <div className="flex-1 flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${priorityOption.color}`} />
                      <div className="flex-1">
                        <Label htmlFor={priorityOption.value} className="text-sm font-medium cursor-pointer">
                          {priorityOption.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {priorityOption.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {/* Business Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm font-medium">
              Business Justification
            </Label>
            <Textarea
              id="justification"
              placeholder="Please explain how this dataset will be used and the business value it will provide..."
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              A clear business justification helps expedite the approval process
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart} disabled={!businessJustification.trim()}>
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}