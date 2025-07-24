import { useState, useEffect } from 'react'

function ArticlePage({ article, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSlideshow, setIsSlideshow] = useState(false)

  const images = article.images || (article.image ? [article.image] : [])
  const baseUrl = '/uploads/'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSlideshow) {
        switch (e.key) {
          case 'Escape':
            setIsSlideshow(false)
            break
          case 'ArrowLeft':
            previousImage()
            break
          case 'ArrowRight':
            nextImage()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSlideshow, currentImageIndex])

  const openSlideshow = (index) => {
    setCurrentImageIndex(index)
    setIsSlideshow(true)
  }

  const previousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const scrollToPhotos = () => {
    const photosSection = document.getElementById('photos-section')
    if (photosSection) {
      photosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const formatContent = (content) => {
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map((paragraph, index) => (
        <p key={index} className="mb-4 leading-relaxed">
          {paragraph.replace(/\n/g, ' ')}
        </p>
      ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-palette-5 to-white">
      {/* Header */}
      <header className="bg-palette-1 text-palette-5 shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-palette-4 hover:text-palette-5 transition-colors mb-4"
          >
            ← Retour au journal
          </button>
        </div>
      </header>

      {/* Article */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8 lg:p-12">
            {/* Title and date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-palette-1 mb-4">
                  {article.title}
                </h1>
                <p className="text-palette-2 text-lg font-medium">
                  {new Date(article.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {images.length > 0 && (
                <button
                  onClick={scrollToPhotos}
                  className="bg-palette-3 hover:bg-palette-2 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  📸 Voir les photos ({images.length})
                </button>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700 mb-12">
              {formatContent(article.content)}
            </div>

            {/* Photos */}
            {images.length > 0 && (
              <section id="photos-section" className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-palette-1 mb-8">
                  Photos ({images.length})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={() => openSlideshow(index)}
                    >
                      <img
                        src={`${baseUrl}${image}`}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>

      {/* Slideshow Modal */}
      {isSlideshow && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={() => setIsSlideshow(false)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-palette-4 transition-colors z-10"
            >
              ×
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-palette-4 transition-colors z-10"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-palette-4 transition-colors z-10"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={`${baseUrl}${images[currentImageIndex]}`}
              alt={`Photo ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlePage