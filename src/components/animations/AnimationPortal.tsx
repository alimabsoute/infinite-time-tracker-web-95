
import React from 'react';
import { createPortal } from 'react-dom';

interface AnimationPortalProps {
  children: React.ReactNode;
}

const AnimationPortal: React.FC<AnimationPortalProps> = ({ children }) => {
  return createPortal(children, document.body);
};

export default AnimationPortal;
