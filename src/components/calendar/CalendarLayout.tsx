
import { ReactNode } from "react";
import Header from "../Header";
import AuthHeader from "../AuthHeader";
import { motion } from "framer-motion";

interface CalendarLayoutProps {
  children: ReactNode;
  title: string;
  actionButtons?: ReactNode;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  children,
  title,
  actionButtons
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <AuthHeader />
      
      <motion.div 
        className="container mx-auto px-4 pb-20 max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-2xl font-bold" 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h1>
          
          {actionButtons && (
            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {actionButtons}
            </motion.div>
          )}
        </div>
        
        {children}
      </motion.div>
    </div>
  );
};

export default CalendarLayout;
