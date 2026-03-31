
export interface FoodProduct {
  id: string;
  name: string;
  category: string;
  productionVolume: number; // tons per year
  profitMargin: number; // percentage
  marketShare: number; // percentage
  brand: string;
  launchYear: number;
  region: string;
}

export const FOOD_CATEGORIES = {
  'Dairy': '#3B82F6', // Blue
  'Beverages': '#10B981', // Green  
  'Snacks': '#F59E0B', // Orange
  'Frozen Foods': '#8B5CF6', // Purple
  'Bakery': '#EF4444', // Red
  'Meat & Poultry': '#6366F1', // Indigo
  'Condiments': '#EC4899', // Pink
  'Cereals': '#84CC16', // Lime
} as const;

export const generateFoodManufacturerData = (): FoodProduct[] => {
  const products: FoodProduct[] = [
    // Dairy Products
    {
      id: 'dairy-1',
      name: 'Premium Greek Yogurt',
      category: 'Dairy',
      productionVolume: 45000,
      profitMargin: 28.5,
      marketShare: 12.3,
      brand: 'DairyFresh',
      launchYear: 2018,
      region: 'North America'
    },
    {
      id: 'dairy-2', 
      name: 'Organic Whole Milk',
      category: 'Dairy',
      productionVolume: 125000,
      profitMargin: 15.2,
      marketShare: 8.7,
      brand: 'NaturalFarms',
      launchYear: 2015,
      region: 'North America'
    },
    {
      id: 'dairy-3',
      name: 'Artisan Cheese Selection',
      category: 'Dairy',
      productionVolume: 18000,
      profitMargin: 42.1,
      marketShare: 3.2,
      brand: 'CheeseWorks',
      launchYear: 2020,
      region: 'Europe'
    },

    // Beverages
    {
      id: 'beverage-1',
      name: 'Energy Drink Plus',
      category: 'Beverages',
      productionVolume: 89000,
      profitMargin: 35.8,
      marketShare: 18.5,
      brand: 'PowerBoost',
      launchYear: 2019,
      region: 'Global'
    },
    {
      id: 'beverage-2',
      name: 'Sparkling Water',
      category: 'Beverages', 
      productionVolume: 156000,
      profitMargin: 22.4,
      marketShare: 14.2,
      brand: 'BubbleLife',
      launchYear: 2017,
      region: 'North America'
    },
    {
      id: 'beverage-3',
      name: 'Cold Brew Coffee',
      category: 'Beverages',
      productionVolume: 34000,
      profitMargin: 31.7,
      marketShare: 6.8,
      brand: 'CaffeineRush',
      launchYear: 2021,
      region: 'North America'
    },

    // Snacks
    {
      id: 'snack-1',
      name: 'Protein Bars',
      category: 'Snacks',
      productionVolume: 67000,
      profitMargin: 38.9,
      marketShare: 22.1,
      brand: 'FitSnack',
      launchYear: 2016,
      region: 'Global'
    },
    {
      id: 'snack-2',
      name: 'Organic Potato Chips',
      category: 'Snacks',
      productionVolume: 92000,
      profitMargin: 26.3,
      marketShare: 9.4,
      brand: 'CrunchTime',
      launchYear: 2019,
      region: 'North America'
    },
    {
      id: 'snack-3',
      name: 'Mixed Nuts Premium',
      category: 'Snacks',
      productionVolume: 28000,
      profitMargin: 44.6,
      marketShare: 5.7,
      brand: 'NutHaven',
      launchYear: 2018,
      region: 'Europe'
    },

    // Frozen Foods
    {
      id: 'frozen-1',
      name: 'Gourmet Pizza',
      category: 'Frozen Foods',
      productionVolume: 78000,
      profitMargin: 29.2,
      marketShare: 16.8,
      brand: 'FrozenChef',
      launchYear: 2017,
      region: 'North America'
    },
    {
      id: 'frozen-2',
      name: 'Vegetable Medley',
      category: 'Frozen Foods',
      productionVolume: 134000,
      profitMargin: 18.5,
      marketShare: 11.3,
      brand: 'GreenFields',
      launchYear: 2015,
      region: 'Global'
    },
    {
      id: 'frozen-3',
      name: 'Ice Cream Premium',
      category: 'Frozen Foods',
      productionVolume: 56000,
      profitMargin: 33.7,
      marketShare: 13.9,
      brand: 'CreamDream',
      launchYear: 2020,
      region: 'North America'
    },

    // Bakery
    {
      id: 'bakery-1',
      name: 'Artisan Sourdough',
      category: 'Bakery',
      productionVolume: 23000,
      profitMargin: 36.4,
      marketShare: 4.2,
      brand: 'BreadWorks',
      launchYear: 2019,
      region: 'Europe'
    },
    {
      id: 'bakery-2',
      name: 'Whole Grain Muffins',
      category: 'Bakery',
      productionVolume: 41000,
      profitMargin: 31.8,
      marketShare: 7.5,
      brand: 'MorningTreat',
      launchYear: 2018,
      region: 'North America'
    },
    {
      id: 'bakery-3',
      name: 'Danish Pastries',
      category: 'Bakery',
      productionVolume: 19000,
      profitMargin: 41.2,
      marketShare: 3.8,
      brand: 'EuropeanBake',
      launchYear: 2021,
      region: 'Europe'
    },

    // Meat & Poultry
    {
      id: 'meat-1',
      name: 'Free-Range Chicken',
      category: 'Meat & Poultry',
      productionVolume: 167000,
      profitMargin: 21.3,
      marketShare: 19.7,
      brand: 'FarmFresh',
      launchYear: 2016,
      region: 'North America'
    },
    {
      id: 'meat-2',
      name: 'Grass-Fed Beef',
      category: 'Meat & Poultry',
      productionVolume: 89000,
      profitMargin: 25.7,
      marketShare: 8.9,
      brand: 'RangeBeef',
      launchYear: 2017,
      region: 'North America'
    },
    
    // Condiments
    {
      id: 'condiment-1',
      name: 'Gourmet Hot Sauce',
      category: 'Condiments',
      productionVolume: 12000,
      profitMargin: 48.3,
      marketShare: 2.1,
      brand: 'SpiceKing',
      launchYear: 2020,
      region: 'North America'
    },
    {
      id: 'condiment-2',
      name: 'Organic Ketchup',
      category: 'Condiments',
      productionVolume: 35000,
      profitMargin: 33.6,
      marketShare: 6.2,
      brand: 'PureTaste',
      launchYear: 2018,
      region: 'Global'
    },

    // Cereals
    {
      id: 'cereal-1',
      name: 'Protein Granola',
      category: 'Cereals',
      productionVolume: 54000,
      profitMargin: 34.2,
      marketShare: 10.5,
      brand: 'HealthyStart',
      launchYear: 2019,
      region: 'North America'
    },
    {
      id: 'cereal-2',
      name: 'Ancient Grain Mix',
      category: 'Cereals',
      productionVolume: 31000,
      profitMargin: 39.1,
      marketShare: 4.7,
      brand: 'GrainHarvest',
      launchYear: 2020,
      region: 'Global'
    }
  ];

  return products;
};
