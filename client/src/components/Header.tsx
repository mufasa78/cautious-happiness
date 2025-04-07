import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CodeIcon, LogIn, LogOut, Settings, User, Users } from 'lucide-react';
import { MobileMenu } from './ui/mobile-menu';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from './ui/dropdown-menu';

const Header: React.FC = () => {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation('/');
    // Give time for page to load before scrolling to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };
  
  const handleAdminLogin = () => {
    setLocation('/auth');
  };
  
  const handleClientLogin = () => {
    setLocation('/client/login');
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleAdminPanel = () => {
    setLocation('/admin');
  };
  
  const handleClientDashboard = () => {
    setLocation('/client/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a 
          href="/" 
          className="text-2xl font-bold text-primary flex items-center gap-2"
          onClick={handleHomeNavigation}
        >
          <span className="text-3xl"><CodeIcon size={32} /></span>
          <span>Mufasa</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('about')} 
            className="font-medium hover:text-primary transition"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('services')} 
            className="font-medium hover:text-primary transition"
          >
            Services
          </button>
          <button 
            onClick={() => scrollToSection('portfolio')} 
            className="font-medium hover:text-primary transition"
          >
            Portfolio
          </button>
          <button 
            onClick={() => scrollToSection('contact')} 
            className="font-medium hover:text-primary transition"
          >
            Contact
          </button>
          
          {/* Auth navigation section */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.userType === 'admin' ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAdminPanel}
                  className="flex items-center gap-1 font-medium"
                >
                  <Settings size={16} />
                  Admin
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleClientDashboard}
                  className="flex items-center gap-1 font-medium"
                >
                  <Settings size={16} />
                  Dashboard
                </Button>
              )}
              <Button 
                size="sm"
                variant="ghost" 
                onClick={handleLogout}
                className="flex items-center gap-1 font-medium"
                disabled={logoutMutation.isPending}
              >
                <LogOut size={16} />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex items-center gap-1 font-medium"
                >
                  <LogIn size={16} />
                  Choose Login
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleClientLogin} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Client Login</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAdminLogin} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Admin Login</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <button 
            onClick={() => scrollToSection('hire')} 
            className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Hire Me
          </button>
        </div>
        
        {/* Mobile Navigation Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            user.userType === 'admin' ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAdminPanel}
                className="flex items-center gap-1 font-medium"
              >
                <Settings size={16} />
                Admin
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleClientDashboard}
                className="flex items-center gap-1 font-medium"
              >
                <Settings size={16} />
                Dashboard
              </Button>
            )
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="flex items-center gap-1 font-medium"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleClientLogin} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Client Login</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAdminLogin} className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Admin Login</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="text-dark"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onLinkClick={scrollToSection} 
      />
    </header>
  );
};

export default Header;
