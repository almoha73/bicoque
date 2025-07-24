import ArticleCard from './ArticleCard'

function ArticleList({ articles, categories, onRead }) {

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
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-palette-1">
                {category.name}
              </h3>
            </div>

            {categoryArticles.length === 0 ? (
              <div className="text-center py-12 text-palette-2">
                <p className="text-lg">Aucun article dans cette catégorie pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <ArticleCard
                      article={article}
                      onRead={onRead}
                      truncateContent={truncateContent}
                    />
                  </div>
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