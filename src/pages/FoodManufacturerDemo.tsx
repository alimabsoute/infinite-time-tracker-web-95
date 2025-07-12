
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import FoodBubbleChart2D from '../components/food-demo/FoodBubbleChart2D';
import FoodBubbleChart3D from '../components/food-demo/FoodBubbleChart3D';
import CategoryFilter from '../components/food-demo/CategoryFilter';
import ChartLegend from '../components/food-demo/ChartLegend';
import ProductDetails from '../components/food-demo/ProductDetails';
import { generateFoodManufacturerData, FoodProduct } from '../utils/foodManufacturerData';

const FoodManufacturerDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<FoodProduct | null>(null);
  const [activeTab, setActiveTab] = useState<string>('2d');
  
  const foodData = generateFoodManufacturerData();

  const handleBubbleClick = (product: FoodProduct) => {
    setSelectedProduct(product);
  };

  // Calculate summary statistics
  const totalProducts = foodData.length;
  const avgProfitMargin = foodData.reduce((sum, p) => sum + p.profitMargin, 0) / totalProducts;
  const totalProduction = foodData.reduce((sum, p) => sum + p.productionVolume, 0);
  const topPerformer = foodData.reduce((max, p) => 
    p.profitMargin * p.marketShare > max.profitMargin * max.marketShare ? p : max
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Food Manufacturer Performance Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Interactive visualization of production volume, profit margins, and market share across food categories
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{avgProfitMargin.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">Avg Profit Margin</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{(totalProduction / 1000).toFixed(0)}K</div>
              <p className="text-sm text-gray-600">Total Production (tons)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{topPerformer.name}</div>
              <p className="text-sm text-gray-600">Top Performer</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Product Performance Analysis</CardTitle>
                  <CategoryFilter 
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="2d">2D Chart</TabsTrigger>
                    <TabsTrigger value="3d">3D Interactive</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="2d">
                    <FoodBubbleChart2D 
                      data={foodData} 
                      selectedCategory={selectedCategory}
                    />
                  </TabsContent>
                  
                  <TabsContent value="3d">
                    <FoodBubbleChart3D 
                      data={foodData} 
                      selectedCategory={selectedCategory}
                      onBubbleClick={handleBubbleClick}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Click and drag to rotate • Scroll to zoom • Click bubbles for details
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChartLegend />
            <ProductDetails product={selectedProduct} />
          </div>
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About This Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                This dashboard visualizes the performance of various food products across different categories. 
                Each bubble represents a product, with position indicating production volume (x-axis) and profit 
                margin (y-axis), while bubble size represents market share.
              </p>
              <ul className="mt-4 space-y-1">
                <li><strong>High-volume, high-margin products</strong> appear in the top-right quadrant</li>
                <li><strong>Niche products</strong> typically have smaller bubbles but may show high margins</li>
                <li><strong>Market leaders</strong> are represented by larger bubbles</li>
                <li><strong>Category filtering</strong> allows focused analysis of specific food segments</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodManufacturerDemo;
