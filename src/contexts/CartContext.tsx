import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Dataset } from '@/types'

export interface CartItem {
  dataset: Dataset
  requestType: 'access' | 'download' | 'api' | 'consultation'
  priority: 'standard' | 'urgent' | 'critical'
  businessJustification: string
  addedAt: Date
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'addedAt'> }
  | { type: 'REMOVE_FROM_CART'; payload: string } // dataset id
  | { type: 'UPDATE_ITEM'; payload: { datasetId: string; updates: Partial<CartItem> } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }

const initialState: CartState = {
  items: [],
  isOpen: false
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        item => item.dataset.id === action.payload.dataset.id
      )
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...action.payload,
          addedAt: new Date()
        }
        return { ...state, items: updatedItems }
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { ...action.payload, addedAt: new Date() }]
        }
      }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.dataset.id !== action.payload)
      }
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.dataset.id === action.payload.datasetId
            ? { ...item, ...action.payload.updates }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return { ...state, items: [] }
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, 'addedAt'>) => void
  removeFromCart: (datasetId: string) => void
  updateItem: (datasetId: string, updates: Partial<CartItem>) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  isInCart: (datasetId: string) => boolean
  getCartItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addToCart = (item: Omit<CartItem, 'addedAt'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item })
  }

  const removeFromCart = (datasetId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: datasetId })
  }

  const updateItem = (datasetId: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { datasetId, updates } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' })
  }

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' })
  }

  const isInCart = (datasetId: string) => {
    return state.items.some(item => item.dataset.id === datasetId)
  }

  const getCartItemCount = () => {
    return state.items.length
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateItem,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        isInCart,
        getCartItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}