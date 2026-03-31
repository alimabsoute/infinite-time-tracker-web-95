
import { motion } from "framer-motion";
import { BarChart3, Calendar, Clock } from "lucide-react";

const FeatureHighlights = () => {
  return (
    <motion.div
      className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-primary/10 p-3 mb-2">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm">Time Tracking</p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-accent/10 p-3 mb-2">
          <Calendar className="h-5 w-5 text-accent" />
        </div>
        <p className="text-sm">Calendar View</p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-emerald-500/10 p-3 mb-2">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-sm">Analytics</p>
      </div>
    </motion.div>
  );
};

export default FeatureHighlights;
