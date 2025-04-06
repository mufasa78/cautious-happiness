import React from 'react';

interface AboutProps {
  onScrollToSection: (sectionId: string) => void;
}

const About: React.FC<AboutProps> = ({ onScrollToSection }) => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
              alt="Professional profile" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">About Me</h2>
            <p className="text-gray-700 mb-4">
              I'm a passionate web developer with expertise in creating modern, responsive, and user-friendly websites and applications. 
              With years of experience in the industry, I've helped businesses of all sizes establish their online presence and achieve their digital goals.
            </p>
            <p className="text-gray-700 mb-6">
              My approach combines technical excellence with creative problem-solving to deliver solutions that not only look great but also perform exceptionally well.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-primary mr-2"></i>
                <span>Web Development</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-primary mr-2"></i>
                <span>UI/UX Design</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-primary mr-2"></i>
                <span>E-commerce Solutions</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check-circle text-primary mr-2"></i>
                <span>CMS Development</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => onScrollToSection('contact')}
                className="text-primary font-semibold hover:underline"
              >
                Contact Me
              </button>
              <a href="#" className="text-primary font-semibold hover:underline">
                Download Resume <i className="fas fa-download ml-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
