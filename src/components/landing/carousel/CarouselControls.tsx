
import React from "react";
import { motion } from "framer-motion";
import { CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const CarouselControls = () => {
  return (
    <div className="flex justify-center gap-4 mt-10">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <CarouselPrevious className="static transform-none mx-2 bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg" />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <CarouselNext className="static transform-none mx-2 bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg" />
      </motion.div>
    </div>
  );
};

export default CarouselControls;
