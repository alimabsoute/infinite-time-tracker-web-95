
import React from "react";
import { Clock, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { FadeInWhenVisible } from "./Animation";

// App screenshots with actual images
const screenshots = [
  {
    title: "Timer Dashboard",
    description: "Track your time with a sleek, intuitive interface",
    image: "/screenshots/timer-dashboard.jpg",
    fallbackColor: "bg-blue-100",
    icon: <Clock className="h-16 w-16 text-blue-500/70" />
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity across days, weeks, and months",
    image: "/screenshots/calendar-view.jpg", 
    fallbackColor: "bg-purple-100",
    icon: <Calendar className="h-16 w-16 text-purple-500/70" />
  },
  {
    title: "Analytics",
    description: "Get insights into how you spend your time",
    image: "/screenshots/analytics.jpg",
    fallbackColor: "bg-green-100",
    icon: <BarChart3 className="h-16 w-16 text-green-500/70" />
  }
];

const ScreenshotCarousel = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-bold text-center mb-12">See TimeKeeper in Action</h2>
        </FadeInWhenVisible>
        
        <FadeInWhenVisible>
          <Carousel className="max-w-4xl mx-auto">
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/1">
                  <Card className="overflow-hidden border shadow-md">
                    <CardContent className="p-0">
                      <div className="aspect-video w-full overflow-hidden">
                        <div className="relative w-full h-full">
                          {/* Image with fallback */}
                          <div className="w-full h-full">
                            <img 
                              src={screenshot.image} 
                              alt={screenshot.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Show fallback on error
                                target.style.display = 'none';
                                target.parentElement?.classList.add(screenshot.fallbackColor);
                                const iconElement = target.parentElement?.querySelector('.fallback-icon');
                                if (iconElement) {
                                  iconElement.classList.remove('hidden');
                                }
                              }}
                            />
                            <div className={`fallback-icon hidden absolute inset-0 flex items-center justify-center`}>
                              {screenshot.icon}
                            </div>
                          </div>
                          
                          {/* Caption overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex flex-col items-center justify-end p-6">
                            <h3 className="text-xl font-semibold mb-2">{screenshot.title}</h3>
                            <p className="text-center text-muted-foreground">{screenshot.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </FadeInWhenVisible>
      </div>
    </section>
  );
};

export default ScreenshotCarousel;
