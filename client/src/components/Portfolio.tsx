import React, { useState } from 'react';
import { PORTFOLIO_ITEMS } from '@/lib/constants';

interface PortfolioProps {
  onScrollToSection: (sectionId: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onScrollToSection }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProjects = activeFilter === 'all' 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(project => project.category === activeFilter);

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">My Portfolio</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out some of my recent projects and see how I've helped clients achieve their digital goals.
          </p>
        </div>
        
        <div className="flex mb-8 justify-center">
          <div className="flex flex-wrap space-x-2 bg-white rounded-lg p-2 shadow">
            <button 
              className={`px-4 py-2 rounded-md ${activeFilter === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${activeFilter === 'web' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveFilter('web')}
            >
              Web Development
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${activeFilter === 'ecommerce' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveFilter('ecommerce')}
            >
              E-commerce
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${activeFilter === 'design' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveFilter('design')}
            >
              UI/UX Design
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div key={index} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={project.image}
                  alt={project.title} 
                  className="w-full h-64 object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold">{project.title}</h3>
                  <p className="text-gray-200 mb-4">{project.description}</p>
                  <div className="flex space-x-3">
                    <a href="#" className="text-white bg-primary px-3 py-1 rounded text-sm">View Project</a>
                    <a href="#" className="text-white bg-gray-900 px-3 py-1 rounded text-sm border border-white">Details</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => onScrollToSection('hire')}
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
