import React, { useState } from 'react';
import { SERVICES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideArrowRight, LucideArrowLeft, LucideCheck, LucideChevronDown, LucideCode, LucideLayoutDashboard, LucideLayers, LucideMonitor, LucideServer, LucideShoppingCart, LucideSmartphone, LucideZap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServicesProps {
  onScrollToSection: (sectionId: string) => void;
}

// Map service icons to Lucide components
const getServiceIcon = (iconName: string) => {
  switch (iconName) {
    case 'laptop-code':
      return <LucideCode className="h-6 w-6" />;
    case 'layer-group':
      return <LucideLayers className="h-6 w-6" />;
    case 'mobile-alt':
      return <LucideSmartphone className="h-6 w-6" />;
    case 'shopping-cart':
      return <LucideShoppingCart className="h-6 w-6" />;
    case 'paint-brush':
      return <LucideLayoutDashboard className="h-6 w-6" />;
    case 'rocket':
      return <LucideZap className="h-6 w-6" />;
    case 'server':
      return <LucideServer className="h-6 w-6" />;
    default:
      return <LucideMonitor className="h-6 w-6" />;
  }
};

const Services: React.FC<ServicesProps> = ({ onScrollToSection }) => {
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a comprehensive range of web development and design services using modern frameworks like Next.js, Astro, Svelte, React, Python, and Vue to build stunning, high-performance websites and applications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((service, index) => (
            <Card key={index} className="overflow-hidden h-full flex flex-col border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-primary text-white rounded-bl-lg opacity-90">
                  <span className="text-sm font-semibold">
                    {service.technologies.length} Technologies
                  </span>
                </div>
                <div className="text-primary text-3xl mb-4 p-2 rounded-full bg-primary/10 inline-flex w-14 h-14 items-center justify-center">
                  {getServiceIcon(service.icon)}
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {service.technologies.slice(0, 3).map((tech, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {service.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{service.technologies.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <LucideCheck className="h-4 w-4 mr-1 text-primary" /> Key Features
                  </h4>
                  <ul className="space-y-1">
                    {service.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start">
                        <span className="text-primary mr-1.5 mt-0.5 text-xs">•</span>
                        <span className="line-clamp-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={() => {
                        setSelectedService(service);
                        setActiveTab('overview');
                      }}
                    >
                      Learn More
                      <LucideChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    {selectedService && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-2xl">
                            <div className="text-primary bg-primary/10 p-2 rounded-full">
                              {getServiceIcon(selectedService.icon)}
                            </div>
                            {selectedService.title}
                          </DialogTitle>
                          <DialogDescription className="text-base">
                            {selectedService.description}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                          <TabsList className="grid grid-cols-3 w-full">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="technologies">Technologies</TabsTrigger>
                            <TabsTrigger value="casestudy">Case Study</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="pt-4 pb-2">
                            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                            <ul className="space-y-2">
                              {selectedService.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                  <LucideCheck className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            
                            <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-100">
                              <h4 className="font-medium mb-2">Who is this service for?</h4>
                              <p className="text-gray-600 text-sm">
                                This service is ideal for businesses looking to {selectedService.title.toLowerCase()} with modern technologies and best practices. Whether you're a startup looking to establish your online presence or an established company aiming to upgrade your digital assets, we have the expertise to deliver exceptional results.
                              </p>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="technologies" className="pt-4 pb-2">
                            <h3 className="text-lg font-semibold mb-3">Technologies We Use</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {selectedService.technologies.map((tech, i) => (
                                <Badge key={i} className="px-3 py-1">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                            
                            <h4 className="font-medium mb-2">Why We Choose These Technologies</h4>
                            <p className="text-gray-600 mb-4">
                              We carefully select cutting-edge technologies that provide the best balance of performance, developer experience, and long-term maintainability. Our tech stack enables us to create fast, scalable, and secure solutions that stand the test of time.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <h5 className="font-medium text-primary mb-2">Frontend Excellence</h5>
                                <p className="text-sm text-gray-600">
                                  Our frontend technologies deliver exceptional user experiences with optimized performance and beautiful interfaces.
                                </p>
                              </div>
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <h5 className="font-medium text-primary mb-2">Backend Reliability</h5>
                                <p className="text-sm text-gray-600">
                                  Our backend stack ensures reliable, secure, and scalable infrastructure for your applications.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="casestudy" className="pt-4 pb-2">
                            <h3 className="text-lg font-semibold mb-3">Success Story</h3>
                            <div className="bg-primary/5 p-5 rounded-lg mb-4">
                              <p className="text-gray-700 italic">
                                "{selectedService.caseStudy}"
                              </p>
                            </div>
                            
                            <h4 className="font-medium mb-2">The Approach</h4>
                            <p className="text-gray-600 mb-4">
                              For this project, we leveraged our expertise in {selectedService.technologies.slice(0, 3).join(', ')} to deliver a solution that exceeded our client's expectations. By focusing on {selectedService.features[0].toLowerCase()} and {selectedService.features[1].toLowerCase()}, we were able to create a {selectedService.title.toLowerCase()} that truly made a difference.
                            </p>
                            
                            {/* Project URL if available */}
                            {'projectUrl' in selectedService && selectedService.projectUrl && (
                              <div className="mt-4 mb-6">
                                <h4 className="font-medium mb-2">View Live Project</h4>
                                <a
                                  href={selectedService.projectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center bg-primary/10 px-4 py-2 rounded-md text-primary hover:bg-primary/20 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Visit {selectedService.projectUrl.replace(/^https?:\/\//, '')}
                                </a>
                              </div>
                            )}
                            
                            <div className="border-t border-gray-100 pt-4 mt-4">
                              <h4 className="font-medium mb-2">Ready to achieve similar results?</h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Contact us today to discuss how we can help you with your {selectedService.title.toLowerCase()} needs.
                              </p>
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between mt-6">
                          <DialogClose asChild>
                            <Button variant="outline">
                              <LucideArrowLeft className="h-4 w-4 mr-2" />
                              Back
                            </Button>
                          </DialogClose>
                          <Button onClick={() => {
                            setSelectedService(null);
                            onScrollToSection('hire');
                          }}>
                            Get Started
                            <LucideArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button onClick={() => onScrollToSection('hire')}>
                  Get Started
                  <LucideArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-6 sm:p-10 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
              <p className="text-gray-600 mb-6">
                We specialize in creating tailored web solutions using modern frameworks like Next.js, Astro, Svelte, React, Python, and Vue. Tell us about your project, and we'll help bring your vision to life with the perfect technology stack.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <LucideCheck className="h-5 w-5 mr-2 text-primary" />
                  <span>Free initial consultation and project assessment</span>
                </li>
                <li className="flex items-center">
                  <LucideCheck className="h-5 w-5 mr-2 text-primary" />
                  <span>Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-center">
                  <LucideCheck className="h-5 w-5 mr-2 text-primary" />
                  <span>Ongoing support and maintenance options</span>
                </li>
              </ul>
              <Button onClick={() => onScrollToSection('hire')} size="lg" className="mt-2">
                Start Your Project
                <LucideArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
            <div className="hidden lg:block bg-gradient-to-br from-primary/10 to-blue-500/10 p-6 rounded-xl">
              <h4 className="font-semibold text-xl mb-4">Our Technology Stack</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from(new Set(SERVICES.flatMap(s => s.technologies))).slice(0, 12).map((tech, index) => (
                  <div key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
