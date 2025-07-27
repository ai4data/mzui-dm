import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Dataset } from '@/types'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddToCartDialog } from './AddToCartDialog'
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  Database, 
  Download, 
  Key, 
  MessageSquare,
  ChevronDown,
  Zap
} from 'lucide-react'

interface DatasetActionsProps {
  dataset: Dataset
  variant?: 'default' | 'compact'
  className?: string
}

export function DatasetActions({ dataset, variant = 'default', className }: DatasetActionsProps) {
  const { isInCart, addToCart, openCart } = useCart()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const inCart = isInCart(dataset.id)

  const handleQuickAdd = (requestType: 'access' | 'download' | 'api' | 'consultation') => {
    addToCart({
      dataset,
      requestType,
      priority: 'standard',
      businessJustification: `Quick request for ${requestType} to ${dataset.name}`
    })
    openCart()
  }

  const handleCustomRequest = () => {
    setShowAddDialog(true)
  }

  if (variant === 'compact') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          {inCart ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openCart}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-green-600" />
              In Cart
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add to Cart
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleQuickAdd('access')}>
                  <Database className="h-4 w-4 mr-2" />
                  Quick Access
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAdd('download')}>
                  <Download className="h-4 w-4 mr-2" />
                  Quick Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCustomRequest}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Custom Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <AddToCartDialog 
          dataset={dataset}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      </>
    )
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {inCart ? (
          <Button 
            variant="outline" 
            onClick={openCart}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4 text-green-600" />
            Added to Cart
          </Button>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Request
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => handleQuickAdd('access')}>
                  <Database className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Data Access</span>
                    <span className="text-xs text-muted-foreground">Read-only access</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAdd('download')}>
                  <Download className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Download</span>
                    <span className="text-xs text-muted-foreground">Get a copy</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAdd('api')}>
                  <Key className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>API Access</span>
                    <span className="text-xs text-muted-foreground">Programmatic access</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAdd('consultation')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span>Consultation</span>
                    <span className="text-xs text-muted-foreground">Talk to experts</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleCustomRequest} className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </>
        )}
      </div>

      <AddToCartDialog 
        dataset={dataset}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  )
}