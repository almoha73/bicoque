import ArticleCard from './ArticleCard'

function ArticleList({ articles, categories, onRead }) {

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // 1. Group articles by year, then by category
  const groupedByYear = articles.reduce((acc, article) => {
    const year = new Date(article.date).getFullYear();
    const categoryId = article.type;

    if (!acc[year]) {
      acc[year] = {};
    }

    if (!acc[year][categoryId]) {
      const categoryInfo = categories.find(c => c.id === categoryId);
      acc[year][categoryId] = {
        ...categoryInfo,
        articles: []
      };
    }

    acc[year][categoryId].articles.push(article);
    return acc;
  }, {});

  // 2. Convert the grouped object into a sorted array for rendering, now with summaries
  const sortedAndGroupedData = Object.keys(groupedByYear)
    .sort((a, b) => b - a) // Sort years in descending order
    .map(year => {
      const yearCategories = Object.values(groupedByYear[year])
        .filter(category => category.id)
        .sort((a, b) => (b.order || 0) - (a.order || 0)) // Plus récent en premier
        .map(category => ({
          ...category,
          // Sort articles within each category by date (newest first)
          articles: category.articles.sort((a, b) => new Date(b.date) - new Date(a.date))
        }));
      
      const totalArticles = yearCategories.reduce((sum, cat) => sum + cat.articles.length, 0);

      return {
        year,
        categories: yearCategories,
        totalArticles: totalArticles,
        totalCategories: yearCategories.length,
      };
    });

  return (
    <>
      {/* --- Navigation by Year --- */}
      <nav className="mb-16">
        <h2 className="text-center text-3xl font-bold text-palette-1 mb-8">Sommaire par Année</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sortedAndGroupedData.map(({ year, totalArticles, totalCategories }, index) => (
            <a
              key={year}
              href={`#year-${year}`}
              className="block bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/90 @container animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="font-bold text-palette-1 text-3xl @[7rem]:text-5xl">{year}</div>
              <div className="text-palette-2 text-xs @[7rem]:text-sm mt-1">
                {totalArticles} article{totalArticles > 1 ? 's' : ''}<br/>
                dans {totalCategories} rubrique{totalCategories > 1 ? 's' : ''}
              </div>
            </a>
          ))}
          {/* Bonus */}
          <a
            href="#bonus"
            className="block bg-gradient-to-br from-palette-3 to-palette-2 rounded-xl shadow-lg p-4 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 @container animate-fade-in-up"
            style={{ animationDelay: `${sortedAndGroupedData.length * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="font-bold text-white text-3xl @[7rem]:text-5xl">Bonus</div>
            <div className="text-white/80 text-xs @[7rem]:text-sm mt-1">
              Musique<br/>et surprises
            </div>
          </a>
        </div>
      </nav>

      {/* --- Article List by Year --- */}
      <div className="space-y-16">
        {sortedAndGroupedData.map(({ year, categories: yearCategories }) => (
          <div key={year} id={`year-${year}`} className="scroll-mt-24">
            <h2 className="text-4xl md:text-5xl font-bold text-palette-1/80 mb-8 py-2">{year}</h2>
            <div className="space-y-12">
              {yearCategories.map(category => (
                <section key={category.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
                  <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-palette-1">
                      {category.name}
                    </h3>
                  </div>

                  {category.articles.length === 0 ? (
                    <div className="text-center py-12 text-palette-2">
                      <p className="text-lg">Aucun article dans cette catégorie pour le moment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {category.articles.map((article, index) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Section Bonus --- */}
      <div id="bonus" className="scroll-mt-24 mt-16">
        <h2 className="text-4xl md:text-5xl font-bold text-palette-1/80 mb-8 py-2">Bonus</h2>
        <div className="space-y-12">
          <section className="bg-gradient-to-br from-palette-3/20 to-palette-2/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-palette-1">
                Musique maison
              </h3>
              <p className="text-palette-2 mt-2">Créations musicales inspirées par la bicoque</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* O' Ruisseau */}
              <div className="bg-white/80 rounded-xl p-6 shadow-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-palette-3 to-palette-2 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    🎵
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-palette-1 mb-2">O' Ruisseau</h4>
                    <p className="text-palette-2 text-sm mb-4">Une chanson sur notre petit ruisseau préféré, où nous aimons tant nous promener avec Vaya</p>
                    <audio
                      controls
                      className="w-full"
                      preload="metadata"
                    >
                      <source src="/uploads/audio/O' Ruisseau .mp3" type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <p className="text-xs text-gray-400 mt-2">Créé avec Suno AI</p>
                  </div>
                </div>
              </div>

              {/* Whispering Pines */}
              <div className="bg-white/80 rounded-xl p-6 shadow-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-palette-2 to-palette-1 rounded-full flex items-center justify-center text-3xl shadow-lg">
                    🌲
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-palette-1 mb-2">Whispering Pines</h4>
                    <p className="text-palette-2 text-sm mb-4">Les murmures des pins corréziens qui entourent la bicoque</p>
                    <audio
                      controls
                      className="w-full"
                      preload="metadata"
                    >
                      <source src="/uploads/audio/Whispering Pines .mp3" type="audio/mpeg" />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <p className="text-xs text-gray-400 mt-2">Créé avec Suno AI</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default ArticleList