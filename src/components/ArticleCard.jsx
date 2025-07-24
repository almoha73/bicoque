function ArticleCard({ 
  article, 
  onEdit, 
  onDelete, 
  onRead, 
  onDragStart, 
  onDragEnd, 
  onDrop,
  isDragging,
  truncateContent 
}) {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', article.id)
    onDragStart(article.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    onDrop(article.id)
  }

  const renderImages = () => {
    const images = article.images || (article.image ? [article.image] : [])
    if (!images.length) return null

    // Gérer les chemins avec ou sans 'uploads/' au début
    const baseUrl = ''
    
    const getImageUrl = (imagePath) => {
      // Si le chemin commence déjà par 'uploads/', l'utiliser tel quel
      // Sinon, ajouter '/uploads/' au début
      return imagePath.startsWith('uploads/') ? `/${imagePath}` : `/uploads/${imagePath}`
    }

    if (images.length === 1) {
      return (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img 
            src={getImageUrl(images[0])} 
            alt="Image article"
            className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onRead(article)}
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
              className="w-full h-20 object-cover hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => onRead(article)}
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
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-move
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
    >
      {/* Drag handle */}
      <div className="bg-palette-1 text-palette-5 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm">⋮⋮ Glisser pour réorganiser</span>
      </div>

      <div className="p-6">
        {/* Actions */}
        <div className="flex justify-end gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(article)
            }}
            className="bg-palette-4 hover:bg-palette-3 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            title="Modifier"
          >
            ✏️ Modifier
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(article.id)
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            title="Supprimer"
          >
            🗑️ Supprimer
          </button>
        </div>

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
            <button
              onClick={() => onRead(article)}
              className="text-palette-3 hover:text-palette-2 font-medium mt-3 inline-block transition-colors"
            >
              Lire la suite →
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ArticleCard