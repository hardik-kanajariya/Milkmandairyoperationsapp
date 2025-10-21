// Product storefront component for consumer portal

import { useState } from 'react';
import { Search, Filter, Plus, Minus, ShoppingCart } from 'lucide-react';
import { products, Product } from '../../lib/sample-data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useCart } from '../../hooks/useCart';
import { ImageWithFallback } from '../figma/ImageWithFallback';



interface ProductStorefrontProps {
  onNavigate?: (view: string) => void;
}

export const ProductStorefront = ({ onNavigate }: ProductStorefrontProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { getItemQuantity, updateQuantity, addItem, getCartSummary } = useCart();
  
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const cartSummary = getCartSummary();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCartQuantity = (productId: string) => {
    return getItemQuantity(productId);
  };

  const updateCartQuantity = (productId: string, change: number) => {
    const currentQuantity = getItemQuantity(productId);
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      updateQuantity(productId, 0);
    } else if (currentQuantity === 0 && change > 0) {
      addItem(productId, change);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const quantity = getCartQuantity(product.id);
    
    return (
      <Card className="overflow-hidden">
        <div className="aspect-square relative bg-muted">
          <ImageWithFallback
            src={`https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&crop=center`}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.fatContent && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product.fatContent}% Fat
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {product.packSize} {product.unit}
            </span>
            <span className="font-bold text-lg">₹{product.price}</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
          
          {quantity > 0 ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateCartQuantity(product.id, -1)}
              >
                <Minus size={16} />
              </Button>
              <span className="font-medium px-4">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateCartQuantity(product.id, 1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => updateCartQuantity(product.id, 1)}
            >
              <Plus size={16} className="mr-2" />
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Fresh Dairy Products</h1>
          <p className="text-muted-foreground">Farm-fresh quality delivered to your doorstep</p>
        </div>
        {cartSummary.totalItems > 0 && (
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => onNavigate?.('cart')}>
              <ShoppingCart size={16} className="mr-2" />
              Cart ({cartSummary.totalItems})
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {/* Cart Summary (Mobile) */}
      {cartSummary.totalItems > 0 && (
        <div className="fixed bottom-16 left-4 right-4 md:hidden">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{cartSummary.totalItems} items</p>
                  <p className="text-sm text-muted-foreground">Total: ₹{cartSummary.totalPrice}</p>
                </div>
                <Button onClick={() => onNavigate?.('cart')}>
                  View Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};