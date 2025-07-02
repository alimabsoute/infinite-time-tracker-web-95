
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { FadeInWhenVisible } from "./Animation";
import { screenshots } from "./carousel/ScreenshotData";
import CarouselBackground from "./carousel/CarouselBackground";
import CarouselHeader from "./carousel/CarouselHeader";
import CarouselSlide from "./carousel/CarouselSlide";
import CarouselControls from "./carousel/CarouselControls";

const ScreenshotCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // When we can't scroll next (at the last slide), go back to the first slide
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
      <CarouselBackground />

      <div className="container mx-auto px-4 relative z-10">
        <CarouselHeader />
        
        <FadeInWhenVisible>
          <Carousel className="max-w-6xl mx-auto" setApi={setApi}>
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                  <CarouselSlide screenshot={screenshot} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselControls />
          </Carousel>
        </FadeInWhenVisible>
      </div>
    </section>
  );
};

export default ScreenshotCarousel;
