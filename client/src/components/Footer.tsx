import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-gold">Fade</span> & Blade
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Where traditional craftsmanship meets modern style. Book your appointment today and experience the art of premium grooming.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Hours</h4>
            <div className="space-y-2 text-gray-300 font-mono text-sm">
              <div className="flex justify-between">
                <span>Mon - Fri</span>
                <span>09:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>09:00 - 17:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gold mr-3 flex-shrink-0" />
                <span className="text-sm">
                  123 Main Street<br />Downtown, City 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-gold mr-3" />
                <span className="text-sm">(555) 123-FADE</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gold mr-3" />
                <span className="text-sm">hello@fadeandblade.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Fade & Blade. All rights reserved. Crafted with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
