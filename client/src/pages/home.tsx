import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    scrollToSection("booking");
  };

  const handleBookNowClick = () => {
    scrollToSection("booking");
  };

  const clearSelectedService = () => {
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen">
      <Navigation onSectionClick={scrollToSection} currentSection={currentSection} />
      
      <div id="home">
        <HeroSection onBookNowClick={handleBookNowClick} />
      </div>
      
      <AboutSection />
      
      <div id="services">
        <ServicesSection onServiceSelect={handleServiceSelect} />
      </div>
      
      <div id="booking">
        <BookingSection selectedService={selectedService} onServiceClear={clearSelectedService} />
      </div>
      
      <Footer />
    </div>
  );
}
