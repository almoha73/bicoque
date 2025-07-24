import { useState, useEffect } from 'react'

function CategoryModal({ categories, onClose, onUpdate }) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setLoading(true)
    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulation en développement
        setNewCategoryName('')
        alert(`Catégorie "${newCategoryName.trim()}" ajoutée ! (Mode développement - pas de persistence)`)
        onUpdate()
      } else {
        // Production - vraies APIs
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName.trim() })
        })

        if (response.ok) {
          setNewCategoryName('')
          onUpdate()
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      alert('Erreur lors de l\'ajout de la catégorie')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = async (category) => {
    const newName = prompt('Nouveau nom de la catégorie:', category.name)
    if (!newName || newName.trim() === category.name) return

    setLoading(true)
    try {
      // Simulation en développement
      alert(`Catégorie renommée en "${newName.trim()}" ! (Mode développement - pas de persistence)`)
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      alert('Erreur lors de la modification de la catégorie')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return
    }

    setLoading(true)
    try {
      // Simulation en développement
      alert(`Catégorie "${category.name}" supprimée ! (Mode développement - pas de persistence)`)
      onUpdate()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la catégorie')
    } finally {
      setLoading(false)
    }
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
            Gérer les catégories
          </h2>
          <button
            onClick={onClose}
            className="text-palette-5 hover:text-palette-4 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add new category */}
          <form onSubmit={handleAddCategory} className="mb-8">
            <h3 className="text-lg font-semibold text-palette-1 mb-4">
              Ajouter une nouvelle catégorie
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nom de la catégorie..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-palette-3 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newCategoryName.trim()}
                className="bg-palette-3 hover:bg-palette-2 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>

          {/* Existing categories */}
          <div>
            <h3 className="text-lg font-semibold text-palette-1 mb-4">
              Catégories existantes
            </h3>
            
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune catégorie pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-palette-1 flex-1">
                      {category.name}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        disabled={loading}
                        className="bg-palette-4 hover:bg-palette-3 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryModal