
import React from "react";
import { Clock, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

// Mock screenshots for the app
const screenshots = [
  {
    title: "Timer Dashboard",
    description: "Track your time with a sleek, intuitive interface",
    image: "/screenshots/timer-dashboard.png",
    fallbackColor: "bg-blue-100",
    icon: <Clock className="h-16 w-16 text-blue-500/70" />
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity across days, weeks, and months",
    image: "/screenshots/calendar-view.png",
    fallbackColor: "bg-purple-100",
    icon: <Calendar className="h-16 w-16 text-purple-500/70" />
  },
  {
    title: "Analytics",
    description: "Get insights into how you spend your time",
    image: "/screenshots/analytics.png",
    fallbackColor: "bg-green-100",
    icon: <BarChart3 className="h-16 w-16 text-green-500/70" />
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const FadeInWhenVisible = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {children}
    </motion.div>
  );
};

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
                        {/* Use real screenshot if available, otherwise fallback */}
                        <div className={`w-full h-full ${screenshot.fallbackColor} relative flex items-center justify-center`}>
                          {screenshot.icon}
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
