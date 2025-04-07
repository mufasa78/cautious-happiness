import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileMenuProps {
  isOpen: boolean;
  onLinkClick: (sectionId: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onLinkClick }) => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
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
            
            {/* Mobile auth buttons */}
            {!user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="flex items-center justify-center gap-2 mt-2 w-full"
                    variant="outline"
                  >
                    <LogIn size={18} />
                    Choose Login
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLocation('/client/login')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Client Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/auth')} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Admin Login</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-2">
                {user.userType === 'admin' ? (
                  <Button 
                    onClick={() => setLocation('/admin')}
                    className="flex items-center justify-center gap-2 w-full"
                    variant="outline"
                  >
                    <Users size={18} />
                    Admin Panel
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setLocation('/client/dashboard')}
                    className="flex items-center justify-center gap-2 w-full"
                    variant="outline"
                  >
                    <User size={18} />
                    Client Dashboard
                  </Button>
                )}
                
                <Button 
                  onClick={() => logoutMutation.mutate()}
                  className="flex items-center justify-center gap-2 w-full"
                  variant="outline"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut size={18} />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            )}
            
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
