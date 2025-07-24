function Header() {
  return (
    <header className="bg-palette-1 text-palette-5 shadow-lg">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            <a href="/" className="hover:text-palette-4 transition-colors">
              🏡 Journal de la Bicoque
            </a>
          </h1>
        </div>
      </div>
    </header>
  )
}

export default Header