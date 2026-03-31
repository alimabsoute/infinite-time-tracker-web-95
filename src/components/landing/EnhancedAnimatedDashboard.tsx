
import { motion } from "framer-motion";
import DashboardHeader from "./dashboard/DashboardHeader";
import StatsOverview from "./dashboard/StatsOverview";
import ActiveTimersSection from "./dashboard/ActiveTimersSection";
import DashboardStats from "./dashboard/DashboardStats";
import FloatingParticles from "./dashboard/FloatingParticles";
import AnimatedGrid from "./dashboard/AnimatedGrid";

const EnhancedAnimatedDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatedGrid />
      
      <div className="relative z-10">
        <DashboardHeader variants={itemVariants} />
        <StatsOverview variants={itemVariants} />
        <ActiveTimersSection variants={itemVariants} />
        <DashboardStats variants={itemVariants} />
      </div>

      <FloatingParticles />
    </motion.div>
  );
};

export default EnhancedAnimatedDashboard;
