import React from 'react';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onScrollToSection }) => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Transforming Ideas into Digital Reality
          </h1>
          <p className="text-lg md:text-xl mb-10">
            I build professional websites and applications that help businesses grow. Let's create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onScrollToSection('portfolio')}
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              View My Work
            </button>
            <button 
              onClick={() => onScrollToSection('hire')}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition"
            >
              Hire Me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
