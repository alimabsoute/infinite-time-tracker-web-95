
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Target, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">About PhynxTimer</h1>
          <p className="text-xl text-muted-foreground">
            Empowering productivity through intelligent time tracking
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              At PhynxTimer, we believe that understanding how you spend your time is the key to 
              unlocking your full potential. Our mission is to provide you with the most intuitive 
              and powerful time tracking tools that help you focus on what matters most, boost your 
              productivity, and achieve your goals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Why Choose PhynxTimer?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <Clock className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Precise Time Tracking</h3>
                  <p className="text-muted-foreground">
                    Track your time with millisecond precision and get detailed insights 
                    into how you spend your day.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Target className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Goal-Oriented</h3>
                  <p className="text-muted-foreground">
                    Set deadlines and track progress towards your goals with visual 
                    progress indicators and analytics.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Zap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Start tracking instantly with our streamlined interface designed 
                    for speed and efficiency.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Users className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">User-Centric Design</h3>
                  <p className="text-muted-foreground">
                    Built with user feedback and designed to integrate seamlessly 
                    into your existing workflow.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg leading-relaxed mb-4">
              PhynxTimer was born from the frustration of using complex, bloated time tracking 
              tools that got in the way of actual work. We wanted something simple, beautiful, 
              and powerful – a tool that would help us understand our productivity patterns 
              without becoming a distraction itself.
            </p>
            <p className="text-lg leading-relaxed">
              Today, PhynxTimer helps thousands of professionals, freelancers, and teams track 
              their time more effectively, make data-driven decisions about their work, and 
              ultimately achieve better work-life balance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
            <p className="text-lg leading-relaxed">
              Your data privacy and security are our top priorities. We use industry-standard 
              encryption to protect your information, and we never sell your data to third parties. 
              You own your data, and you can export or delete it at any time.
            </p>
          </section>

          <section className="text-center bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-6">
              Join thousands of users who have already discovered the power of effective time tracking.
            </p>
            <Link to="/signup">
              <Button size="lg">
                Start Your Free Trial
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
