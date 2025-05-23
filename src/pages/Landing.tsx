
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Calendar, BarChart3, CheckCircle2, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

// Mock screenshots for the app
const screenshots = [
  {
    title: "Timer Dashboard",
    description: "Track your time with a sleek, intuitive interface",
    image: "/screenshots/timer-dashboard.png",
    fallbackColor: "bg-blue-100"
  },
  {
    title: "Calendar View",
    description: "Visualize your productivity across days, weeks, and months",
    image: "/screenshots/calendar-view.png",
    fallbackColor: "bg-purple-100"
  },
  {
    title: "Analytics",
    description: "Get insights into how you spend your time",
    image: "/screenshots/analytics.png",
    fallbackColor: "bg-green-100"
  }
];

// Features for the feature section
const features = [
  { 
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Time Tracking",
    description: "Effortlessly track time spent on any task or project with a single click"
  },
  { 
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Calendar Integration",
    description: "Visualize your productivity patterns with our integrated calendar view"
  },
  { 
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Detailed Analytics",
    description: "Gain insights into how you spend your time with comprehensive charts and reports"
  },
  { 
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Team Collaboration",
    description: "Share timers and reports with your team for better project management"
  }
];

// Pricing plans
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    features: ["5 active timers", "7-day history", "Basic reports"],
    recommended: false
  },
  {
    name: "Pro",
    price: "9.99",
    features: ["Unlimited timers", "Full history", "Advanced analytics", "Calendar integration", "Priority support"],
    recommended: true
  },
  {
    name: "Team",
    price: "29.99",
    features: ["Everything in Pro", "Team sharing", "Admin dashboard", "Usage reports", "API access"],
    recommended: false
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
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

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/20"></div>
          <div className="absolute bottom-40 right-20 w-60 h-60 rounded-full bg-primary/10"></div>
          <div className="absolute top-40 right-40 w-20 h-20 rounded-full bg-accent/20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div 
              className="max-w-xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div className="mb-6 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <h1 className="text-4xl md:text-6xl font-bold">TimeKeeper</h1>
                </div>
              </motion.div>
              
              <motion.h2 
                className="text-2xl md:text-3xl font-medium mb-6 text-foreground/80"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Track your time, boost your productivity
              </motion.h2>
              
              <motion.p 
                className="text-lg mb-8 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                TimeKeeper helps you understand how you spend your time, 
                so you can focus on what matters most. Effortless tracking, 
                powerful insights, and beautiful visualizations.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Link to="/signup">
                  <Button size="lg" className="rounded-full">
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative overflow-hidden rounded-2xl shadow-2xl border border-muted"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {/* Hero image/animation */}
              <div className="w-full max-w-md overflow-hidden">
                {/* If you have a real app screenshot, use it here */}
                {/* Fallback animated placeholder */}
                <div className="aspect-video w-full bg-card p-4 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-4 w-1/3 bg-muted rounded"></div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <motion.div 
                      className="h-8 w-3/4 bg-accent/20 rounded"
                      animate={{ width: ["60%", "75%", "68%"] }}
                      transition={{ repeat: Infinity, duration: 5, repeatType: "reverse", ease: "easeInOut" }}
                    ></motion.div>
                    <motion.div 
                      className="h-8 w-1/2 bg-primary/30 rounded"
                      animate={{ width: ["40%", "50%", "45%"] }}
                      transition={{ repeat: Infinity, duration: 7, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
                    ></motion.div>
                    <motion.div 
                      className="h-8 w-2/3 bg-secondary/40 rounded"
                      animate={{ width: ["55%", "65%", "60%"] }}
                      transition={{ repeat: Infinity, duration: 6, repeatType: "reverse", ease: "easeInOut", delay: 1 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Screenshots Carousel */}
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
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <h2 className="text-3xl font-bold text-center mb-16">Powerful Features</h2>
          </FadeInWhenVisible>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="flex flex-col items-center text-center bg-card rounded-xl p-6 shadow-sm border transition-all hover:shadow-md"
              >
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <h2 className="text-3xl font-bold text-center mb-4">Pricing Plans</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose the plan that works best for you and start tracking your time more effectively today.
            </p>
          </FadeInWhenVisible>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <FadeInWhenVisible key={index}>
                <div className={`relative bg-card rounded-xl p-6 shadow-sm border h-full flex flex-col ${
                  plan.recommended ? 'border-primary shadow-md' : ''
                }`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      Recommended
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-5">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/signup" className="mt-auto">
                    <Button 
                      variant={plan.recommended ? "default" : "outline"} 
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
          </FadeInWhenVisible>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "TimeKeeper has transformed how I manage my day. I'm now much more aware of where my time goes.",
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
                quote: "I've tried many time tracking apps, but TimeKeeper stands out with its intuitive interface and useful insights.",
                author: "Alex R.",
                role: "Software Developer",
                stars: 4
              }
            ].map((testimonial, index) => (
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
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <FadeInWhenVisible>
            <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Time?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have improved their productivity with TimeKeeper.
              Sign up today for free and start tracking your time more effectively.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="rounded-full">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Clock className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-semibold">TimeKeeper</span>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/calendar" className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/signup" className="text-muted-foreground hover:text-primary transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} TimeKeeper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
