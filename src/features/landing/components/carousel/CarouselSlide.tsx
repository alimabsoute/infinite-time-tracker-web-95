
import { motion } from "framer-motion";
import { Card, CardContent } from "@shared/components/ui/card";
import { ScreenshotItem } from "./ScreenshotData";

interface CarouselSlideProps {
  screenshot: ScreenshotItem;
  index: number;
}

const CarouselSlide = ({ screenshot, index }: CarouselSlideProps) => {
  return (
    <motion.div 
      className="p-2"
      whileInView={{ 
        rotateY: [5, 0, -5, 0],
        scale: [0.98, 1, 0.98, 1]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: index * 0.5 
      }}
    >
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background to-background/95 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="p-8 md:p-12 flex flex-col order-2 md:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.h3 
                className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
                animate={{ 
                  textShadow: [
                    "0 0 0px currentColor",
                    "0 0 20px currentColor",
                    "0 0 0px currentColor"
                  ] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {screenshot.title}
              </motion.h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                {screenshot.description}
              </p>
              <motion.div 
                className="mt-auto"
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-accent/10 p-4 border border-primary/20">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    {screenshot.icon}
                  </motion.div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    {screenshot.feature}
                  </span>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative overflow-hidden rounded-xl order-1 md:order-2 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02, rotateY: 2 }}
            >
              <motion.div
                whileInView={{ 
                  rotateX: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {screenshot.component}
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarouselSlide;
