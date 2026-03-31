
import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "PhynxTimer has transformed how I manage my day. I'm now much more aware of where my time goes.",
    author: "Sarah J.",
    role: "Freelance Designer",
    stars: 5
  },
  {
    quote: "The calendar view is amazing! I can easily see patterns in my productivity and adjust my schedule accordingly.",
    author: "Mark T.",
    role: "Project Manager",
    stars: 5
  },
  {
    quote: "I've tried many time tracking apps, but PhynxTimer stands out with its intuitive interface and useful insights.",
    author: "Alex R.",
    role: "Software Developer",
    stars: 4
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

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
        </FadeInWhenVisible>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <FadeInWhenVisible key={index}>
              <div className="bg-card rounded-xl p-6 shadow-sm border h-full flex flex-col">
                <div className="mb-4 flex">
                  {Array.from({ length: testimonial.stars }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6 flex-grow">"{testimonial.quote}"</blockquote>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
