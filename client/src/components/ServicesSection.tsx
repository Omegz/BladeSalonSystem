import { Button } from "@/components/ui/button";
import { Scissors, Zap, Crown } from "lucide-react";
import { SERVICES } from "@shared/schema";

interface ServicesSectionProps {
  onServiceSelect: (service: string) => void;
}

export default function ServicesSection({ onServiceSelect }: ServicesSectionProps) {
  const serviceConfig = [
    {
      key: "haircut",
      icon: Scissors,
      ...SERVICES.haircut,
      description: "Precision haircut tailored to your face shape and personal style. Includes consultation, wash, and styling.",
    },
    {
      key: "shave",
      icon: Zap,
      ...SERVICES.shave,
      description: "Traditional straight razor shave with hot towel treatment, premium oils, and aftercare.",
    },
    {
      key: "combo",
      icon: Crown,
      ...SERVICES.combo,
      description: "Complete grooming package: signature cut, classic shave, styling, and premium finishing touches.",
      popular: true,
      savings: 15,
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional grooming services tailored to your style and lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceConfig.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.key}
                className={`bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative ${
                  service.popular ? "border-2 border-gold" : "border border-gray-200"
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gold text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${
                      service.popular
                        ? "bg-gold bg-opacity-20 group-hover:bg-opacity-30"
                        : "bg-gold bg-opacity-10 group-hover:bg-opacity-20"
                    }`}
                  >
                    <IconComponent className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal mb-4">{service.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-charcoal">${service.price}</span>
                    <span className="text-gray-500 font-mono ml-2">{service.duration} min</span>
                    {service.savings && (
                      <div className="text-sm text-green-600 font-medium">Save ${service.savings}</div>
                    )}
                  </div>
                  <Button
                    onClick={() => onServiceSelect(service.key)}
                    className={`w-full py-3 rounded-lg transition-colors duration-200 ${
                      service.popular
                        ? "bg-gold hover:bg-gold-dark text-white"
                        : "bg-charcoal hover:bg-gray-800 text-white"
                    }`}
                  >
                    Select Service
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
