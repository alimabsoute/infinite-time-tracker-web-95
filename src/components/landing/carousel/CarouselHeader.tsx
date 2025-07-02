
import React from "react";
import { motion } from "framer-motion";
import { FadeInWhenVisible } from "../Animation";

const CarouselHeader = () => {
  return (
    <FadeInWhenVisible>
      <motion.div
        whileInView={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          See PhynxTimer in Action
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Powerful features designed to help you make the most of your time and boost productivity
        </p>
      </motion.div>
    </FadeInWhenVisible>
  );
};

export default CarouselHeader;
