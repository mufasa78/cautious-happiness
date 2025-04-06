import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import ClientOnboarding from '@/components/ClientOnboarding';

const HomePage: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Layout>
      <Hero onScrollToSection={scrollToSection} />
      <About onScrollToSection={scrollToSection} />
      <Services onScrollToSection={scrollToSection} />
      <Portfolio onScrollToSection={scrollToSection} />
      <Testimonials />
      <Contact />
      <ClientOnboarding />
    </Layout>
  );
};

export default HomePage;
