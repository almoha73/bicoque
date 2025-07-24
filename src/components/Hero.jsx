function Hero() {
  return (
    <section className="text-center py-8 md:py-12 lg:py-16 mb-12 animate-fade-in-up">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-palette-1 mb-4 md:mb-6">
        Suivez notre aventure, des rénovations à la découverte de la Corrèze.
      </h2>
      <p className="text-lg md:text-xl text-palette-2 max-w-3xl mx-auto leading-relaxed px-4 animate-slide-in-right"
         style={{ animationDelay: '300ms', animationFillMode: 'both' }}
      >
        Le carnet de bord de notre maison et de nos explorations locales.
      </p>
    </section>
  )
}

export default Hero