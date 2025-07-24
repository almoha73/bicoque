function Header({ onManageCategories }) {
  return (
    <header className="bg-palette-1 text-palette-5 shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-0">
            <a href="/" className="hover:text-palette-4 transition-colors">
              🏡 Journal de la Bicoque
            </a>
          </h1>
          <button
            onClick={onManageCategories}
            className="bg-palette-3 hover:bg-palette-2 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            Gérer les rubriques
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header