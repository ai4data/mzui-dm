import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter 
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart,
  Send,
  Database
} from 'lucide-react'

export function DatasetCart() {
  const { state, removeFromCart, closeCart, clearCart } = useCart()

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'urgent':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'access':
        return 'Data Access'
      case 'download':
        return 'Download'
      case 'api':
        return 'API Access'
      case 'consultation':
        return 'Consultation'
      default:
        return type
    }
  }

  const handleSubmitRequest = () => {
    // Here you would typically send the request to your backend
    console.log('Submitting data requests:', state.items)
    // For now, we'll just clear the cart and show a success message
    clearCart()
    closeCart()
    // You could show a toast notification here
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Data Request Cart
          </SheetTitle>
          <SheetDescription>
            Review your data requests before submitting
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Add datasets to your cart to request access
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <Card key={item.dataset.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.dataset.name}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {item.dataset.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.dataset.businessLine}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.dataset.dataDomain}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.dataset.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Request Type:</span>
                        <Badge variant="outline" className="text-xs">
                          {getRequestTypeLabel(item.requestType)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Priority:</span>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(item.priority)}
                          <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {item.businessJustification && (
                        <div className="mt-2">
                          <span className="text-xs font-medium">Business Justification:</span>
                          <p className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded-sm">
                            {item.businessJustification}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Added:</span>
                        <span>{item.addedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <SheetFooter className="border-t pt-4">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total Requests:</span>
                <Badge variant="secondary">{state.items.length}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={handleSubmitRequest}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Requests
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}