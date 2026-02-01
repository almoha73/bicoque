import { useState, useRef, useEffect } from 'react'

function SearchBar({ articles, onSelectArticle }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // Normalise le texte : minuscules, sans accents, sans tirets
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[-_]/g, ' ') // Remplace tirets et underscores par des espaces
      .replace(/\s+/g, ' ') // Normalise les espaces multiples
  }

  // Recherche dans les articles
  const searchArticles = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    const normalizedQuery = normalizeText(searchQuery)
    const words = normalizedQuery.split(' ').filter(w => w.length > 0)

    const matches = articles.filter(article => {
      const normalizedTitle = normalizeText(article.title)
      const normalizedContent = normalizeText(article.content)
      const searchText = `${normalizedTitle} ${normalizedContent}`

      // Tous les mots doivent être présents
      return words.every(word => searchText.includes(word))
    })

    setResults(matches)
    setIsOpen(matches.length > 0)
  }

  // Gère le changement de texte
  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    searchArticles(value)
  }

  // Sélectionne un article
  const handleSelect = (article) => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    onSelectArticle(article)
  }

  // Ferme les résultats si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un article (ex: collonges, randonnée, vaya...)"
          className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-palette-4/30 focus:border-palette-3 focus:outline-none bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 text-gray-700 placeholder-gray-400"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-palette-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-palette-4/20 overflow-hidden max-h-96 overflow-y-auto">
          <div className="px-4 py-2 bg-palette-5 border-b border-palette-4/20">
            <span className="text-sm text-palette-2 font-medium">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </span>
          </div>
          {results.map((article) => (
            <button
              key={article.id}
              onClick={() => handleSelect(article)}
              className="w-full px-4 py-3 text-left hover:bg-palette-5 transition-colors duration-200 border-b border-palette-4/10 last:border-b-0"
            >
              <div className="font-semibold text-palette-1 text-sm">
                {article.title}
              </div>
              <div className="text-xs text-palette-2 mt-1">
                {new Date(article.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {article.content.substring(0, 100)}...
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si pas de résultats */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-palette-4/20 overflow-hidden">
          <div className="px-4 py-6 text-center text-gray-500">
            Aucun article trouvé pour "{query}"
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
