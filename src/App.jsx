import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ArticleList from './components/ArticleList'
import ArticlePage from './components/ArticlePage'
import './index.css'

function App() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [currentArticle, setCurrentArticle] = useState(null)
  const [isArticlePageOpen, setIsArticlePageOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Charger les données au démarrage
  useEffect(() => {
    loadArticles()
    loadCategories()
  }, [])

  const loadArticles = async () => {
    try {
      // En développement, utilise les fichiers JSON statiques
      // En production, utilise les APIs Vercel
      const endpoint = process.env.NODE_ENV === 'development' 
        ? '/api/articles.json' 
        : '/api/articles'
      
      const response = await fetch(endpoint)
      const data = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      // En développement, utilise les fichiers JSON statiques
      // En production, utilise les APIs Vercel
      const endpoint = process.env.NODE_ENV === 'development' 
        ? '/api/categories.json' 
        : '/api/categories'
        
      const response = await fetch(endpoint)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const openArticlePage = (article) => {
    setCurrentArticle(article)
    setIsArticlePageOpen(true)
  }

  const closeArticlePage = () => {
    setCurrentArticle(null)
    setIsArticlePageOpen(false)
  }

  if (isArticlePageOpen && currentArticle) {
    return (
      <ArticlePage 
        article={currentArticle} 
        onClose={closeArticlePage} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-palette-5 to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Hero />
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-palette-5"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-palette-3 absolute top-0 left-0" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <p className="text-palette-2 mt-4 animate-pulse-gentle">Chargement de votre journal...</p>
          </div>
        ) : (
          <ArticleList 
            articles={articles}
            categories={categories}
            onRead={openArticlePage}
          />
        )}
      </main>

      <footer className="bg-palette-1 text-palette-5 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 La Bicoque. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

export default App