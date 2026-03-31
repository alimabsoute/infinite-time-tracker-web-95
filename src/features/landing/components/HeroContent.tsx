
import { motion } from "framer-motion";
import HeroTitle from "./hero/HeroTitle";
import HeroSubtitle from "./hero/HeroSubtitle";
import HeroDescription from "./hero/HeroDescription";
import HeroFeaturePills from "./hero/HeroFeaturePills";
import HeroActionButtons from "./hero/HeroActionButtons";

const HeroContent = () => {
  return (
    <motion.div 
      className="text-center lg:text-left relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <HeroTitle />
      <HeroSubtitle />
      <HeroDescription />
      <HeroFeaturePills />
      <HeroActionButtons />
    </motion.div>
  );
};

export default HeroContent;
