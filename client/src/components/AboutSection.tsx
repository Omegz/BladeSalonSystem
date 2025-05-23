export default function AboutSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-charcoal mb-6">
              Craftsmanship Meets <span className="text-gold">Innovation</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At Fade & Blade, we believe every haircut is an art form. Our master barbers combine time-honored techniques with modern styling to deliver cuts that are both timeless and contemporary.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Step into our shop and experience the perfect fusion of vintage barbershop tradition and cutting-edge style. We're not just cutting hair – we're crafting confidence.
            </p>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">15+</div>
                <div className="text-sm text-gray-500 font-mono">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">2.5K+</div>
                <div className="text-sm text-gray-500 font-mono">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">25+</div>
                <div className="text-sm text-gray-500 font-mono">Awards Won</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Professional barber tools"
              className="rounded-xl shadow-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Barbering tools detail"
              className="rounded-xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
