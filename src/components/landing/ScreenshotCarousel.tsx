
import React from "react";
import { Clock, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { FadeInWhenVisible } from "./Animation";
import RealisticTimerDisplay from "./RealisticTimerDisplay";
import RealisticCalendarView from "./RealisticCalendarView";

// App screenshots with realistic components
const screenshots = [
  {
    title: "Timer Dashboard",
    description: "Track multiple timers with customizable categories and beautiful progress indicators",
    component: <RealisticTimerDisplay />,
    icon: <Clock className="h-5 w-5 text-primary" />,
    feature: "Track multiple projects simultaneously"
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity with an interactive calendar showing daily activity levels",
    component: <RealisticCalendarView />,
    icon: <Calendar className="h-5 w-5 text-primary" />,
    feature: "See your monthly productivity patterns"
  },
  {
    title: "Analytics Dashboard",
    description: "Get detailed insights into how you spend your time with advanced charts and metrics",
    image: "/lovable-uploads/e4b39c63-d261-4756-9c9a-b26aaf39d02f.png",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    feature: "Analyze your productivity habits"
  }
];

const ScreenshotCarousel = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Enhanced background elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
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
        
        <FadeInWhenVisible>
          <Carousel className="max-w-6xl mx-auto">
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
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
                            {screenshot.component ? (
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
                            ) : (
                              <motion.img 
                                src={screenshot.image} 
                                alt={screenshot.title}
                                className="w-full h-full object-cover rounded-lg shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
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
          </Carousel>
        </FadeInWhenVisible>
      </div>
    </section>
  );
};

export default ScreenshotCarousel;
