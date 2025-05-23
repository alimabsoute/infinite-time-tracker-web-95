
import React from "react";
import { Clock, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { FadeInWhenVisible } from "./Animation";
import AnimatedDashboard from "./AnimatedDashboard";

// App screenshots with actual images
const screenshots = [
  {
    title: "Timer Dashboard",
    description: "Track multiple timers with customizable categories and deadlines",
    image: null,
    fallbackColor: "bg-blue-100",
    icon: <Clock className="h-16 w-16 text-blue-500/70" />,
    isAnimated: true
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity across days, weeks, and months",
    image: "/lovable-uploads/28eb3aee-75f0-45d2-8754-f301d50dd6a1.png",
    fallbackColor: "bg-purple-100",
    icon: <Calendar className="h-16 w-16 text-purple-500/70" />,
    isAnimated: false
  },
  {
    title: "Analytics",
    description: "Get detailed insights into how you spend your time",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1600&h=900&q=80",
    fallbackColor: "bg-green-100",
    icon: <BarChart3 className="h-16 w-16 text-green-500/70" />,
    isAnimated: false
  }
];

const ScreenshotCarousel = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">See VigliaFlux in Action</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Powerful features to help you make the most of your time and boost productivity
          </p>
        </FadeInWhenVisible>
        
        <FadeInWhenVisible>
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                  <div className="p-1">
                    <Card className="overflow-hidden border-0 shadow-lg bg-transparent">
                      <CardContent className="p-0">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                          <div className="p-6 md:p-8 flex flex-col order-2 md:order-1">
                            <h3 className="text-2xl font-bold mb-3">{screenshot.title}</h3>
                            <p className="text-muted-foreground mb-6">{screenshot.description}</p>
                            <div className="mt-auto">
                              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2">
                                {index === 0 ? 
                                  <Clock className="h-5 w-5 text-primary" /> : 
                                  index === 1 ? 
                                  <Calendar className="h-5 w-5 text-primary" /> : 
                                  <BarChart3 className="h-5 w-5 text-primary" />
                                }
                                <span className="ml-2 text-sm font-medium">
                                  {index === 0 ? 
                                    "Track multiple projects" : 
                                    index === 1 ? 
                                    "See your monthly progress" : 
                                    "Analyze your habits"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="aspect-video overflow-hidden rounded-xl shadow-md order-1 md:order-2">
                            <div className="relative w-full h-full">
                              {screenshot.isAnimated ? (
                                <AnimatedDashboard />
                              ) : (
                                <img 
                                  src={screenshot.image} 
                                  alt={screenshot.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-8">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </FadeInWhenVisible>
      </div>
    </section>
  );
};

export default ScreenshotCarousel;
