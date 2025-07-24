function ArticleCard({ article, onRead, truncateContent }) {
  const getImageUrl = (imagePath) => {
    // Si le chemin commence déjà par 'uploads/', l'utiliser tel quel
    // Sinon, ajouter '/uploads/' au début
    return imagePath.startsWith('uploads/') ? `/${imagePath}` : `/uploads/${imagePath}`
  }

  const renderImages = () => {
    const images = article.images || (article.image ? [article.image] : [])
    if (!images.length) return null

    if (images.length === 1) {
      return (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img 
            src={getImageUrl(images[0])} 
            alt="Image article"
            className="w-full h-48 object-cover hover:scale-105 transition-transform"
          />
        </div>
      )
    }

    const displayImages = images.slice(0, 3)
    return (
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
          {displayImages.map((image, index) => (
            <img 
              key={index}
              src={getImageUrl(image)} 
              alt={`Image ${index + 1}`}
              className="w-full h-20 object-cover hover:opacity-80 transition-opacity"
            />
          ))}
        </div>
        {images.length > 3 && (
          <p className="text-xs text-palette-2 mt-2 text-center">
            +{images.length - 3} autres photos
          </p>
        )}
      </div>
    )
  }

  const truncatedContent = truncateContent(article.content)
  const hasMore = article.content.length > 150

  return (
    <article
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-[1.02]"
      onClick={() => onRead(article)}
    >
      <div className="p-6">
        {/* Title and date */}
        <h4 className="text-xl font-bold text-palette-1 mb-2 group-hover:text-palette-2 transition-colors">
          {article.title}
        </h4>
        <p className="text-palette-2 text-sm mb-4 font-medium">
          {new Date(article.date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* Images */}
        {renderImages()}

        {/* Content */}
        <div className="text-gray-700 leading-relaxed">
          <p className="whitespace-pre-line">{truncatedContent}</p>
          
          {hasMore && (
            <span className="text-palette-3 hover:text-palette-2 font-medium mt-3 inline-block transition-colors">
              Lire la suite →
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ArticleCard