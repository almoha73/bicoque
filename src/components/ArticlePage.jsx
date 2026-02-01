import { useState, useEffect } from 'react'

function ArticlePage({ article, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSlideshow, setIsSlideshow] = useState(false)

  const media = article.images || (article.image ? [article.image] : [])

  const getMediaUrl = (mediaPath) => {
    // Si le chemin commence déjà par 'uploads/', l'utiliser tel quel
    // Sinon, ajouter '/uploads/' au début
    return mediaPath.startsWith('uploads/') ? `/${mediaPath}` : `/uploads/${mediaPath}`
  }

  const isVideo = (path) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv']
    return videoExtensions.some(ext => path.toLowerCase().endsWith(ext))
  }

  const isYouTube = (path) => {
    return path.startsWith('youtube:')
  }

  const getYouTubeId = (path) => {
    return path.replace('youtube:', '')
  }

  const isAnyVideo = (path) => {
    return isVideo(path) || isYouTube(path)
  }

  const images = media.filter(m => !isVideo(m))
  const videos = media.filter(m => isVideo(m))

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSlideshow) {
        switch (e.key) {
          case 'Escape':
            setIsSlideshow(false)
            break
          case 'ArrowLeft':
            previousMedia()
            break
          case 'ArrowRight':
            nextMedia()
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

  const previousMedia = () => {
    setCurrentImageIndex(prev =>
      prev === 0 ? media.length - 1 : prev - 1
    )
  }

  const nextMedia = () => {
    setCurrentImageIndex(prev =>
      prev === media.length - 1 ? 0 : prev + 1
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
    <div className="min-h-screen bg-gradient-to-br from-palette-5 to-white animate-fade-in">
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
              
              {media.length > 0 && (
                <button
                  onClick={scrollToPhotos}
                  className="bg-palette-3 hover:bg-palette-2 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  📸 Voir les médias ({media.length})
                </button>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700 mb-12">
              {formatContent(article.content)}
            </div>

            {/* Photos et Vidéos */}
            {media.length > 0 && (
              <section id="photos-section" className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-palette-1 mb-8">
                  Photos et vidéos ({media.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {media.map((item, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                      onClick={() => openSlideshow(index)}
                    >
                      {isYouTube(item) ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeId(item)}/hqdefault.jpg`}
                            alt={`Vidéo ${index + 1}`}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <span className="text-red-600 text-5xl drop-shadow-lg">
                              ▶
                            </span>
                          </div>
                        </>
                      ) : isVideo(item) ? (
                        <>
                          <video
                            src={getMediaUrl(item)}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                            <span className="text-white text-5xl drop-shadow-lg">
                              ▶
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={getMediaUrl(item)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                              🔍
                            </span>
                          </div>
                        </>
                      )}
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
            {media.length > 1 && (
              <>
                <button
                  onClick={previousMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-palette-4 transition-colors z-10"
                >
                  ‹
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-palette-4 transition-colors z-10"
                >
                  ›
                </button>
              </>
            )}

            {/* Image ou Vidéo */}
            {isYouTube(media[currentImageIndex]) ? (
              <iframe
                key={media[currentImageIndex]}
                src={`https://www.youtube.com/embed/${getYouTubeId(media[currentImageIndex])}?autoplay=1`}
                className="w-full max-w-4xl aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isVideo(media[currentImageIndex]) ? (
              <video
                key={media[currentImageIndex]}
                src={getMediaUrl(media[currentImageIndex])}
                className="max-w-full max-h-full object-contain"
                controls
                playsInline
                preload="auto"
              />
            ) : (
              <img
                src={getMediaUrl(media[currentImageIndex])}
                alt={`Photo ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Counter */}
            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-lg">
                {currentImageIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlePage