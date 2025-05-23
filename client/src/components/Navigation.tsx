import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import { Link } from "wouter";

interface NavigationProps {
  onSectionClick: (section: string) => void;
  currentSection: string;
}

export default function Navigation({ onSectionClick, currentSection }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "booking", label: "Book Now", highlight: true },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-charcoal">
              <span className="text-gold">Fade</span> & Blade
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionClick(item.id)}
                  className={`${
                    item.highlight
                      ? "bg-gold hover:bg-gold-dark text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                      : `text-charcoal hover:text-gold transition-colors duration-200 ${
                          currentSection === item.id ? "text-gold font-medium" : ""
                        }`
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link href="/admin">
                <button className="text-gray-500 hover:text-charcoal transition-colors duration-200">
                  <Shield className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-charcoal hover:text-gold"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSectionClick(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`${
                  item.highlight
                    ? "block bg-gold text-white px-4 py-2 rounded-lg text-center w-full"
                    : "block text-charcoal hover:text-gold transition-colors w-full text-left"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link href="/admin">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-charcoal hover:text-gold transition-colors w-full text-left"
              >
                Admin
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
