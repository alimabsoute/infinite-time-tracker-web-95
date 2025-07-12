
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { FoodProduct, FOOD_CATEGORIES } from '../../utils/foodManufacturerData';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  product: FoodProduct;
  onClick: (product: FoodProduct) => void;
}

const Bubble: React.FC<BubbleProps> = ({ position, size, color, product, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(product)}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        shininess={100}
      />
    </mesh>
  );
};

interface FoodBubbleChart3DProps {
  data: FoodProduct[];
  selectedCategory?: string;
  onBubbleClick?: (product: FoodProduct) => void;
}

const FoodBubbleChart3D: React.FC<FoodBubbleChart3DProps> = ({ 
  data, 
  selectedCategory, 
  onBubbleClick = () => {} 
}) => {
  const filteredData = useMemo(() => {
    return data.filter(product => 
      !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory
    );
  }, [data, selectedCategory]);

  const bubbles = useMemo(() => {
    const maxVolume = Math.max(...filteredData.map(p => p.productionVolume));
    const maxMargin = Math.max(...filteredData.map(p => p.profitMargin));
    const maxShare = Math.max(...filteredData.map(p => p.marketShare));

    return filteredData.map((product, index) => {
      const x = (product.productionVolume / maxVolume) * 8 - 4; // Scale to -4 to 4
      const y = (product.profitMargin / maxMargin) * 6 - 3; // Scale to -3 to 3
      const z = (Math.sin(index * 0.5) * 2); // Distribute in Z axis
      const size = (product.marketShare / maxShare) * 0.8 + 0.2; // Scale bubble size

      return {
        position: [x, y, z] as [number, number, number],
        size,
        color: FOOD_CATEGORIES[product.category as keyof typeof FOOD_CATEGORIES],
        product
      };
    });
  }, [filteredData]);

  return (
    <div className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {bubbles.map((bubble, index) => (
          <Bubble
            key={index}
            position={bubble.position}
            size={bubble.size}
            color={bubble.color}
            product={bubble.product}
            onClick={onBubbleClick}
          />
        ))}
        
        {/* Axis labels */}
        <Text
          position={[0, -4, 0]}
          fontSize={0.3}
          color="gray"
          anchorX="center"
          anchorY="middle"
        >
          Production Volume →
        </Text>
        
        <Text
          position={[-5, 0, 0]}
          fontSize={0.3}
          color="gray"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, Math.PI / 2]}
        >
          Profit Margin →
        </Text>
        
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default FoodBubbleChart3D;
