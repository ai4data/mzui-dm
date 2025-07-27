import React from 'react'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'

interface CartButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function CartButton({ variant = 'ghost', size = 'default', className }: CartButtonProps) {
  const { getCartItemCount, toggleCart } = useCart()
  const itemCount = getCartItemCount()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleCart}
      className={`relative ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}
      <span className="sr-only">
        Shopping cart with {itemCount} items
      </span>
    </Button>
  )
}