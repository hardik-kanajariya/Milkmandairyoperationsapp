// Shopping cart component for consumer portal

import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { products } from '../../lib/sample-data';
import { useCart } from '../../hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';

interface ShoppingCartProps {
  onNavigate?: (view: string) => void;
}

export const ShoppingCart = ({ onNavigate }: ShoppingCartProps) => {
  const { items, updateQuantity, removeItem, clearCart, getCartSummary } = useCart();
  const cartSummary = getCartSummary();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <ShoppingBag size={64} className="text-muted-foreground" />
        <h2>Your cart is empty</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Start shopping to add fresh dairy products to your cart
        </p>
        <Button onClick={() => onNavigate?.('storefront')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  const CartItem = ({ item }: { item: typeof items[0] }) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;

    const itemTotal = product.price * item.quantity;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
              <ImageWithFallback
                src={`https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&crop=center`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.packSize} {product.unit}
                  </p>
                  {product.fatContent && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.fatContent}% Fat
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{itemTotal}</p>
                  <p className="text-sm text-muted-foreground">₹{product.price} each</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate?.('storefront')}
          className="md:hidden"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1>Shopping Cart</h1>
          <p className="text-muted-foreground">{cartSummary.totalItems} items in your cart</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2>Items</h2>
            <Button variant="ghost" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
          
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartSummary.totalItems} items)</span>
                  <span>₹{cartSummary.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{cartSummary.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {cartSummary.deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₹${cartSummary.deliveryFee}`
                    )}
                  </span>
                </div>
                {cartSummary.subtotal < 500 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{500 - cartSummary.subtotal} more for free delivery
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{cartSummary.totalPrice}</span>
              </div>
              
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onNavigate?.('storefront')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};