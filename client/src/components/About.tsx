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
              <a 
                href="/resume.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center shadow-md"
              >
                View Resume <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
