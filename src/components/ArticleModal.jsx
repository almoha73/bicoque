import { useState, useEffect } from 'react'

function ArticleModal({ article, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    title: '',
    date: '',
    content: ''
  })

  useEffect(() => {
    if (article) {
      setFormData({
        id: article.id || '',
        type: article.type || (categories[0]?.id || ''),
        title: article.title || '',
        date: article.date || new Date().toISOString().split('T')[0],
        content: article.content || ''
      })
    }
  }, [article, categories])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-palette-1 text-palette-5 p-6 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold">
            {article?.id ? 'Modifier l\'article' : 'Nouvel article'}
          </h2>
          <button
            onClick={onClose}
            className="text-palette-5 hover:text-palette-4 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-palette-1 mb-2">
              Catégorie
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palette-3 focus:border-transparent transition-all"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-palette-1 mb-2">
              Titre
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palette-3 focus:border-transparent transition-all"
              placeholder="Entrez le titre de l'article..."
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-palette-1 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palette-3 focus:border-transparent transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-palette-1 mb-2">
              Contenu
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palette-3 focus:border-transparent transition-all resize-none"
              placeholder="Rédigez votre article..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-palette-3 hover:bg-palette-2 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {article?.id ? 'Mettre à jour' : 'Créer l\'article'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArticleModal