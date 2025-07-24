import { useState } from 'react'
import ArticleCard from './ArticleCard'

function ArticleList({ articles, categories, onEdit, onDelete, onRead, onAdd, onReorder }) {
  const [draggedId, setDraggedId] = useState(null)

  const handleDragStart = (articleId) => {
    setDraggedId(articleId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleDrop = (targetId) => {
    if (draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId)
    }
    setDraggedId(null)
  }

  const getArticlesByCategory = (categoryId) => {
    return articles.filter(article => article.type === categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-12">
      {categories.map(category => {
        const categoryArticles = getArticlesByCategory(category.id)
        
        return (
          <section key={category.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h3 className="text-2xl md:text-3xl font-bold text-palette-1">
                {category.name}
              </h3>
              <button
                onClick={() => onAdd(null, category.id)}
                className="bg-palette-3 hover:bg-palette-2 text-white w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all hover:scale-105 shadow-md"
                title={`Ajouter un article dans ${category.name}`}
              >
                +
              </button>
            </div>

            {categoryArticles.length === 0 ? (
              <div className="text-center py-12 text-palette-2">
                <p className="text-lg">Aucun article dans cette catégorie pour le moment.</p>
                <button
                  onClick={() => onAdd(null, category.id)}
                  className="mt-4 text-palette-3 hover:text-palette-2 font-medium"
                >
                  Ajoutez le premier article →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRead={onRead}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    isDragging={draggedId === article.id}
                    truncateContent={truncateContent}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

export default ArticleList