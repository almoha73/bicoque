import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import ArticleList from './components/ArticleList'
import ArticleModal from './components/ArticleModal'
import ArticlePage from './components/ArticlePage'
import CategoryModal from './components/CategoryModal'
import './index.css'

function App() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [currentArticle, setCurrentArticle] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
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

  const openModal = (article = null, type = null) => {
    setCurrentArticle(article || { type })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setCurrentArticle(null)
    setIsModalOpen(false)
  }

  const openArticlePage = (article) => {
    setCurrentArticle(article)
    setIsArticlePageOpen(true)
  }

  const closeArticlePage = () => {
    setCurrentArticle(null)
    setIsArticlePageOpen(false)
  }

  const saveArticle = async (articleData) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulation en développement
        if (articleData.id) {
          const updatedArticles = articles.map(article => 
            article.id === articleData.id ? { ...article, ...articleData } : article
          )
          setArticles(updatedArticles)
        } else {
          const newArticle = {
            ...articleData,
            id: Date.now().toString(),
            images: [],
            order: articles.length
          }
          setArticles([...articles, newArticle])
        }
        closeModal()
        alert('Article sauvegardé ! (Mode développement - pas de persistence)')
      } else {
        // Production - vraies APIs
        const url = articleData.id ? `/api/articles/${articleData.id}` : '/api/articles'
        const method = articleData.id ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articleData)
        })

        if (response.ok) {
          await loadArticles()
          closeModal()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const deleteArticle = async (articleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulation en développement
        const updatedArticles = articles.filter(article => article.id !== articleId)
        setArticles(updatedArticles)
        alert('Article supprimé ! (Mode développement - pas de persistence)')
      } else {
        // Production - vraies APIs
        const response = await fetch(`/api/articles/${articleId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await loadArticles()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const reorderArticles = async (draggedId, targetId) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulation du drag & drop
        const draggedIndex = articles.findIndex(a => a.id === draggedId)
        const targetIndex = articles.findIndex(a => a.id === targetId)
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const newArticles = [...articles]
          const [draggedArticle] = newArticles.splice(draggedIndex, 1)
          newArticles.splice(targetIndex, 0, draggedArticle)
          
          newArticles.forEach((article, index) => {
            article.order = index
          })
          
          setArticles(newArticles)
        }
      } else {
        // Production - vraies APIs
        const response = await fetch('/api/articles/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draggedId, targetId })
        })

        if (response.ok) {
          await loadArticles()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error)
    }
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
      <Header onManageCategories={() => setIsCategoryModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Hero />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palette-3"></div>
          </div>
        ) : (
          <ArticleList 
            articles={articles}
            categories={categories}
            onEdit={openModal}
            onDelete={deleteArticle}
            onRead={openArticlePage}
            onAdd={openModal}
            onReorder={reorderArticles}
          />
        )}
      </main>

      <footer className="bg-palette-1 text-palette-5 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 La Bicoque. Tous droits réservés.</p>
        </div>
      </footer>

      {isModalOpen && (
        <ArticleModal
          article={currentArticle}
          categories={categories}
          onSave={saveArticle}
          onClose={closeModal}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          categories={categories}
          onClose={() => setIsCategoryModalOpen(false)}
          onUpdate={() => {
            loadCategories()
            loadArticles()
          }}
        />
      )}
    </div>
  )
}

export default App