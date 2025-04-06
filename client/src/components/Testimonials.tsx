import React from 'react';
import { TESTIMONIALS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';

const Testimonials: React.FC = () => {
  // Find the featured testimonial (UTUCars Africa)
  const featuredTestimonial = TESTIMONIALS.find((t) => t.featured);
  
  // Get the regular testimonials (excluding the featured one)
  const regularTestimonials = TESTIMONIALS.filter((t) => !t.featured);
  
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Client Testimonials</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here's what our clients have to say about working with us.
          </p>
        </div>
        
        {/* Featured Testimonial */}
        {featuredTestimonial && (
          <div className="mb-16">
            <Card className="overflow-hidden bg-white shadow-lg border-0">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="bg-gradient-to-br from-primary to-blue-600 p-8 md:p-12 text-white relative">
                    <div className="absolute top-8 left-8 opacity-20">
                      <QuoteIcon size={60} />
                    </div>
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-white text-lg md:text-xl font-medium italic mb-8">
                        "{featuredTestimonial.content}"
                      </p>
                      <div className="flex items-center">
                        <div className="mr-4 ring-4 ring-white/30 rounded-full">
                          <img 
                            src={featuredTestimonial.image} 
                            alt={featuredTestimonial.author}
                            className="w-16 h-16 rounded-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{featuredTestimonial.author}</h4>
                          <p className="text-white/80">{featuredTestimonial.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Featured Project: UTUCars Africa</h3>
                      <p className="text-gray-600 mb-6">
                        UTUCars Africa is a pioneering automotive platform built with React/Vite that revolutionizes how people buy, sell, and manage vehicles in Africa. Our flagship project features the market's best search and filtering system, allowing users to efficiently find vehicles with precise specifications.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>React/Vite frontend with blazing-fast performance</span>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Best-in-class search and filtering system for vehicles</span>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Secure payment integration and user authentication</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <a 
                          href="https://utucars.africa" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary font-medium hover:underline"
                        >
                          Visit UTUCars.Africa
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Regular Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularTestimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden bg-white shadow-md border-0 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="text-primary">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current inline-block" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="relative mb-6">
                  <div className="absolute -top-2 -left-2 text-primary opacity-20">
                    <QuoteIcon size={24} />
                  </div>
                  <p className="text-gray-600 italic relative">
                    "{testimonial.content}"
                  </p>
                </div>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
