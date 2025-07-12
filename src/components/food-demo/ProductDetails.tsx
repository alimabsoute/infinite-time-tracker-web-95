
import React from 'react';
import { FoodProduct } from '../../utils/foodManufacturerData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ProductDetailsProps {
  product: FoodProduct | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  if (!product) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Click on a bubble to view product details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {product.name}
          <Badge variant="secondary">{product.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Brand Information</h4>
          <p className="text-sm"><strong>Brand:</strong> {product.brand}</p>
          <p className="text-sm"><strong>Launch Year:</strong> {product.launchYear}</p>
          <p className="text-sm"><strong>Region:</strong> {product.region}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Production Volume:</span>
              <span className="text-sm font-medium">{product.productionVolume.toLocaleString()} tons/year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Profit Margin:</span>
              <span className="text-sm font-medium">{product.profitMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Market Share:</span>
              <span className="text-sm font-medium">{product.marketShare.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Market Position</h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className={`p-2 rounded ${
              product.profitMargin > 35 ? 'bg-green-100 text-green-800' :
              product.profitMargin > 25 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Profitability: {product.profitMargin > 35 ? 'High' : product.profitMargin > 25 ? 'Medium' : 'Low'}
            </div>
            <div className={`p-2 rounded ${
              product.marketShare > 15 ? 'bg-blue-100 text-blue-800' :
              product.marketShare > 8 ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Market Position: {product.marketShare > 15 ? 'Leader' : product.marketShare > 8 ? 'Strong' : 'Niche'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetails;
