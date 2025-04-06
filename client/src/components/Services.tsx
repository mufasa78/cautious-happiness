import React from 'react';
import { SERVICES } from '@/lib/constants';

interface ServicesProps {
  onScrollToSection: (sectionId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onScrollToSection }) => {
  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">My Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            I offer a comprehensive range of digital services to help businesses establish their online presence and achieve their goals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-primary text-3xl mb-4">
                <i className={`fas fa-${service.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              <button 
                onClick={() => onScrollToSection('hire')}
                className="text-primary font-medium hover:underline inline-flex items-center"
              >
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
