
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FoodProduct, FOOD_CATEGORIES } from '../../utils/foodManufacturerData';

interface FoodBubbleChart2DProps {
  data: FoodProduct[];
  selectedCategory?: string;
}

const FoodBubbleChart2D: React.FC<FoodBubbleChart2DProps> = ({ data, selectedCategory }) => {
  const chartData = useMemo(() => {
    return data
      .filter(product => !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory)
      .map(product => ({
        x: product.productionVolume,
        y: product.profitMargin,
        z: product.marketShare * 20, // Scale for bubble size
        name: product.name,
        category: product.category,
        brand: product.brand,
        marketShare: product.marketShare,
        region: product.region,
        color: FOOD_CATEGORIES[product.category as keyof typeof FOOD_CATEGORIES]
      }));
  }, [data, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-lg">{data.name}</p>
          <p className="text-sm text-gray-600 mb-2">{data.brand} • {data.category}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Production Volume:</span> {data.x.toLocaleString()} tons/year</p>
            <p><span className="font-medium">Profit Margin:</span> {data.y.toFixed(1)}%</p>
            <p><span className="font-medium">Market Share:</span> {data.marketShare.toFixed(1)}%</p>
            <p><span className="font-medium">Region:</span> {data.region}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Production Volume"
            label={{ value: 'Production Volume (tons/year)', position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Profit Margin"
            label={{ value: 'Profit Margin (%)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FoodBubbleChart2D;
