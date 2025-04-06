import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileMenuProps {
  isOpen: boolean;
  onLinkClick: (sectionId: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onLinkClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-md"
        >
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <button 
              onClick={() => onLinkClick('about')}
              className="font-medium py-2 hover:text-primary transition text-left"
            >
              About
            </button>
            <button 
              onClick={() => onLinkClick('services')}
              className="font-medium py-2 hover:text-primary transition text-left"
            >
              Services
            </button>
            <button 
              onClick={() => onLinkClick('portfolio')}
              className="font-medium py-2 hover:text-primary transition text-left"
            >
              Portfolio
            </button>
            <button 
              onClick={() => onLinkClick('contact')}
              className="font-medium py-2 hover:text-primary transition text-left"
            >
              Contact
            </button>
            <button 
              onClick={() => onLinkClick('hire')}
              className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-600 transition text-center my-2"
            >
              Hire Me
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
