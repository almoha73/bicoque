console.log('Script main-static.js chargé !');

// Données statiques (à la place de l'API)
const staticCategories = [
  { id: 'achats', name: 'Achat de la maison', order: 0 },
  { id: 'travaux', name: 'Travaux', order: 1 },
  { id: 'decouvertes', name: 'Nos découvertes en Corrèze', order: 2 }
];

const staticArticles = [
  {
    id: '1',
    title: 'Première visite',
    date: '2025-05-14',
    content: 'Première découverte de la maison que nous allions acheter. Première impression très positive malgré le travail à prévoir.',
    type: 'achats',
    images: [
      'premiere-visite/20250514_153021.jpg',
      'premiere-visite/20250514_153043.jpg',
      'premiere-visite/20250514_164259.jpg',
      'premiere-visite/20250514_164308.jpg',
      'premiere-visite/Screenshot_20250514_195125_Photos.jpg'
    ]
  },
  {
    id: '2',
    title: 'Deuxième visite',
    date: '2025-07-02',
    content: 'Deuxième visite de la maison pour prendre des mesures et faire le tour complet de la propriété.',
    type: 'achats',
    images: [
      'deuxieme-visite/IMG-20250702-WA0004.jpg',
      'deuxieme-visite/IMG-20250702-WA0005.jpg',
      'deuxieme-visite/PXL_20250702_114923342.jpg',
      'deuxieme-visite/PXL_20250702_114931247.jpg',
      'deuxieme-visite/PXL_20250702_114937169.jpg',
      'deuxieme-visite/PXL_20250702_115026825.jpg'
    ]
  },
  {
    id: '3',
    title: 'Signature de l\'acte définitif',
    date: '2025-07-22',
    content: 'Grande journée ! Avant de nous rendre chez le notaire, nous avons déposé quelques affaires et la remorque dans la maison. Après la signature tant attendue, nous avons fait un arrêt à Marcillac pour acheter de quoi célébrer - arrivées juste à temps avant la fermeture à 12h30 !\n\nApéritif improvisé au vin rouge dans des mugs, faute de verres. L\'après-midi a été consacrée au grand ménage et au débarras des nombreux cartons laissés par l\'ancienne propriétaire. Orange est venu installer la box internet à 15h30, puis Erten le maçon a fait le tour de la propriété avec nous pour évaluer les futurs travaux.\n\nBonne surprise : nous avons découvert deux lits de camp très confortables dans la maison ! Installés devant le cantou pour notre première nuit, avec Vaya notre chien sur le canapé. Nuit très paisible dans notre nouvelle maison.',
    type: 'achats',
    images: [
      'signature/PXL_20250722_104917935.MP.jpg',
      'signature/PXL_20250722_111435673.MP.jpg',
      'signature/PXL_20250722_111626001.jpg',
      'signature/PXL_20250722_145019702.jpg',
      'signature/PXL_20250722_145031281.jpg',
      'signature/PXL_20250722_204441173.jpg',
      'signature/PXL_20250722_204450868.jpg'
    ]
  },
  {
    id: '4',
    title: 'Première journée à la bicoque',
    date: '2025-07-23',
    content: 'Réveil en douceur après une excellente première nuit dans notre nouvelle maison ! La journée a commencé avec quelques contretemps : le technicien pour l\'entretien de la fosse septique, initialement prévu le matin, a d\'abord reporté à l\'après-midi puis finalement annulé. Rendez-vous pris pour demain matin... si tout va bien cette fois !\n\nLa matinée a été consacrée à une magnifique balade dans les bois avec Vaya. Quel bonheur de découvrir que le sentier commence directement au bout de notre jardin ! La nature corrézienne nous offre un spectacle somptueux.\n\nNous avons continué le grand débarras, remplissant la remorque pour un aller-retour à la déchetterie. Pause déjeuner bien méritée au lac de Marsillac : menu complet avec quart de vin rouge pour 18 euros, un excellent rapport qualité-prix ! L\'après-midi devait voir la visite du maçon, mais lui aussi a annulé - ce sera pour août.\n\nLa soirée s\'est achevée paisiblement devant le cantou, bercée par le bruit de la pluie et de l\'orage. Premiers moments de sérénité dans notre bicoque !',
    type: 'travaux',
    images: [
      'premiere-journee/PXL_20250723_052538130.jpg',
      'premiere-journee/PXL_20250723_074817945.jpg',
      'premiere-journee/PXL_20250723_075539967.jpg',
      'premiere-journee/PXL_20250723_125650126.jpg',
      'premiere-journee/PXL_20250723_163437347.jpg',
      'premiere-journee/PXL_20250723_165121744.jpg'
    ]
  },
  {
    id: '5',
    title: 'Découverte test',
    date: '2025-01-21', 
    content: 'Ceci est un article de test pour les découvertes.',
    type: 'decouvertes',
    images: []
  }
];

// Variables globales
let categories = staticCategories;
let categoryContainers = new Map();

// Variables pour la navigation et le diaporama
let currentImages = [];
let currentImageIndex = 0;

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM complètement chargé');
  renderArticles();
});

// Fonction pour créer les sections dynamiquement
function loadAndRenderCategories() {
  const categoriesContainer = document.querySelector('main .container') || document.querySelector('main');
  
  // Supprimer les anciennes sections fixes
  const oldSections = categoriesContainer.querySelectorAll('section:not(#hero)');
  oldSections.forEach(section => section.remove());
  
  // Créer une section pour chaque rubrique
  categories.forEach(category => {
    const section = document.createElement('section');
    section.id = category.id;
    
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    
    const title = document.createElement('h3');
    title.textContent = category.name;
    
    sectionHeader.appendChild(title);
    
    const entriesContainer = document.createElement('div');
    entriesContainer.className = 'entries-container';
    entriesContainer.id = `${category.id}-entries`;
    
    section.appendChild(sectionHeader);
    section.appendChild(entriesContainer);
    categoriesContainer.appendChild(section);
    
    // Sauvegarder la référence du container
    categoryContainers.set(category.id, entriesContainer);
  });
}

// Fonction pour normaliser le chemin d'une image
function getImagePath(imagePath) {
  // Si l'image commence déjà par "uploads/", ne pas ajouter le préfixe
  if (imagePath.startsWith('uploads/')) {
    return `/${imagePath}`;
  }
  // Sinon, ajouter le préfixe /uploads/
  return `/uploads/${imagePath}`;
}

// Fonction pour rendre les images d'un article
function renderArticleImages(images) {
  if (!images || images.length === 0) return '';
  
  if (images.length === 1) {
    return `<img src="${getImagePath(images[0])}" alt="Image" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 5px;" />`;
  }
  
  // Pour plusieurs images, créer une galerie simple
  const imageElements = images.slice(0, 3).map(image => 
    `<img src="${getImagePath(image)}" alt="Image" style="width: 32%; height: 80px; object-fit: cover; margin: 1px; border-radius: 3px;" />`
  ).join('');
  
  const moreText = images.length > 3 ? `<span style="font-size: 0.8em; color: #666;">+${images.length - 3} autres</span>` : '';
  
  return `<div style="margin-bottom: 10px;">${imageElements}${moreText}</div>`;
}

// Fonction pour formater la date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric'
  };
  return date.toLocaleDateString('fr-FR', options);
}

// Fonction pour rendre les articles
function renderArticles() {
  // Charger les rubriques et créer les sections
  loadAndRenderCategories();
  
  staticArticles.forEach(article => {
    const articleCard = document.createElement('article');
    articleCard.classList.add('card');
    articleCard.dataset.id = article.id;

    const truncatedContent = article.content.length > 150
      ? article.content.substring(0, 150) + '...'
      : article.content;

    articleCard.innerHTML = `
      <h4>${article.title}</h4>
      <p class="date">${formatDate(article.date)}</p>
      ${renderArticleImages(article.images)}
      <p>${truncatedContent}</p>
      ${article.content.length > 150 ? `<a href="#" class="read-more" data-id="${article.id}">Lire la suite...</a>` : ''}
    `;

    // Ajouter événement de clic sur toute la carte
    articleCard.addEventListener('click', (event) => {
      // Ne pas déclencher si on clique sur "Lire la suite"
      if (!event.target.classList.contains('read-more')) {
        openArticlePage(article);
      }
    });

    // Ajouter l'article à la bonne section
    const categoryContainer = categoryContainers.get(article.type);
    if (categoryContainer) {
      categoryContainer.appendChild(articleCard);
    }
  });

  // Attacher les écouteurs d'événements aux liens "Lire la suite"
  document.querySelectorAll('.read-more').forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const articleId = event.target.dataset.id;
      const article = staticArticles.find(a => a.id === articleId);
      if (article) {
        openArticlePage(article);
      }
    });
  });
}

// Fonction pour ouvrir la page de détail d'un article
function openArticlePage(article) {
  const mainContent = document.querySelector('main');
  const headerContent = document.querySelector('header');
  const footerContent = document.querySelector('footer');
  const articlePage = document.getElementById('article-page');
  const articleTitle = document.getElementById('article-title');
  const articleDate = document.getElementById('article-date');
  const articleContent = document.getElementById('article-content');
  const articleImages = document.getElementById('article-images');

  // Masquer le contenu principal
  mainContent.style.display = 'none';
  headerContent.style.display = 'none';
  footerContent.style.display = 'none';
  
  // Afficher la page article
  articlePage.style.display = 'block';
  
  // Remplir le contenu
  articleTitle.textContent = article.title;
  articleDate.textContent = formatDate(article.date);
  
  // Formatter le contenu avec des paragraphes
  const formattedContent = article.content
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
  
  articleContent.innerHTML = formattedContent;
  
  // Afficher toutes les images/vidéos avec possibilité de cliquer
  displayFullMediaGallery(article.images || []);
}

// Fonction pour afficher la galerie complète de médias
function displayFullMediaGallery(medias) {
  const articleImages = document.getElementById('article-images');
  currentImages = medias;
  
  if (medias.length === 0) {
    articleImages.innerHTML = '';
    return;
  }
  
  const mediaElements = medias.map((media, index) => {
    const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(media);
    
    if (isVideo) {
      return `<video src="${getImagePath(media)}" data-index="${index}" class="gallery-media" controls style="width: min(200px, 45vw); height: min(150px, 35vw); object-fit: cover; border-radius: 5px; cursor: pointer;" />`;
    } else {
      return `<img src="${getImagePath(media)}" data-index="${index}" class="gallery-media" style="width: min(200px, 45vw); height: min(150px, 35vw); object-fit: cover; border-radius: 5px; cursor: pointer;" />`;
    }
  }).join('');
  
  articleImages.innerHTML = `
    <div style="text-align: center; margin: 20px 0;">
      <button id="view-slideshow" class="slideshow-btn">📸 Voir en diaporama</button>
    </div>
    <div class="media-gallery" style="text-align: center; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; max-width: 100%;">${mediaElements}</div>
  `;
  
  // Ajouter les événements de clic pour chaque média
  articleImages.querySelectorAll('.gallery-media').forEach((media, index) => {
    media.addEventListener('click', () => openSlideshow(index));
  });
  
  // Ajouter l'événement pour le bouton diaporama
  document.getElementById('view-slideshow').addEventListener('click', () => openSlideshow(0));
}

// Fonction pour fermer la page de détail
function closeArticlePage() {
  const mainContent = document.querySelector('main');
  const headerContent = document.querySelector('header');
  const footerContent = document.querySelector('footer');
  const articlePage = document.getElementById('article-page');
  
  // Masquer la page article
  articlePage.style.display = 'none';
  
  // Afficher le contenu principal
  mainContent.style.display = 'block';
  headerContent.style.display = 'block';
  footerContent.style.display = 'block';
}

// Fonctions pour le diaporama
function openSlideshow(mediaIndex) {
  console.log('openSlideshow appelée - Index:', mediaIndex);
  console.log('currentImages:', currentImages);
  
  if (currentImages.length === 0) {
    console.error('Aucune image disponible pour le diaporama');
    return;
  }
  
  currentImageIndex = mediaIndex;
  const slideshowModal = document.getElementById('slideshow-modal');
  const currentMedia = currentImages[currentImageIndex];
  const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(currentMedia);
  
  // Créer l'élément média approprié
  const mediaElement = isVideo 
    ? `<video src="${getImagePath(currentMedia)}" controls autoplay style="
        max-width: 95vw; 
        max-height: 85vh; 
        object-fit: contain;
        margin: 0 auto;
        display: block;
      ">`
    : `<img src="${getImagePath(currentMedia)}" style="
        max-width: 95vw; 
        max-height: 85vh; 
        object-fit: contain;
        margin: 0 auto;
        display: block;
      ">`;
  
  // Remplacer complètement le contenu de la modal
  slideshowModal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 10000;">
      <button onclick="closeSlideshowModal()" style="position: absolute; top: 20px; right: 20px; color: white; background: none; border: none; font-size: 30px; cursor: pointer; z-index: 10001;">&times;</button>
      
      <button onclick="previousMedia()" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: white; background: rgba(0,0,0,0.5); border: none; font-size: 30px; cursor: pointer; padding: 15px 10px; border-radius: 5px; z-index: 10001;">&#10094;</button>
      
      ${mediaElement}
      
      <button onclick="nextMedia()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: white; background: rgba(0,0,0,0.5); border: none; font-size: 30px; cursor: pointer; padding: 15px 10px; border-radius: 5px; z-index: 10001;">&#10095;</button>
      
      <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0,0,0,0.7); padding: 8px 15px; border-radius: 20px; font-size: 14px;">
        ${currentImageIndex + 1} / ${currentImages.length}
      </div>
    </div>
  `;
  
  slideshowModal.style.display = 'block';
}

function closeSlideshowModal() {
  const slideshowModal = document.getElementById('slideshow-modal');
  slideshowModal.style.display = 'none';
}

// Rendre les fonctions accessibles globalement
window.closeSlideshowModal = closeSlideshowModal;
window.previousMedia = previousMedia;
window.nextMedia = nextMedia;

function updateSlideshowContent() {
  if (currentImages.length === 0) return;
  
  const slideshowContent = document.getElementById('slideshow-content');
  const slideshowCurrent = document.getElementById('slideshow-current');
  const slideshowTotal = document.getElementById('slideshow-total');
  const currentMedia = currentImages[currentImageIndex];
  
  console.log('Diaporama - Index:', currentImageIndex, 'Media:', currentMedia);
  console.log('URL complète:', `/uploads/${currentMedia}`);
  
  const isVideo = /\.(mp4|webm|ogg|mov|avi)$/i.test(currentMedia);
  
  if (isVideo) {
    slideshowContent.innerHTML = `
      <video src="${getImagePath(currentMedia)}" controls autoplay 
             style="max-width: 90vw; max-height: 80vh; object-fit: contain;"
             onload="console.log('Video chargée')" 
             onerror="console.error('Erreur chargement video:', this.src)">
      </video>
    `;
  } else {
    slideshowContent.innerHTML = `
      <img src="${getImagePath(currentMedia)}" alt="Image du diaporama" 
           style="width: 80vw; height: 60vh; background: red; border: 5px solid yellow; position: relative; z-index: 10001;"
           onload="console.log('Image chargée:', this.src, 'Dimensions:', this.naturalWidth + 'x' + this.naturalHeight)" 
           onerror="console.error('Erreur chargement image:', this.src)">
    `;
  }
  
  console.log('HTML inséré dans slideshow-content:', slideshowContent.innerHTML);
  console.log('Élément slideshow-content:', slideshowContent);
  
  slideshowCurrent.textContent = currentImageIndex + 1;
  slideshowTotal.textContent = currentImages.length;
  
  // Gérer la visibilité des boutons précédent/suivant
  const slideshowPrev = document.querySelector('.slideshow-prev');
  const slideshowNext = document.querySelector('.slideshow-next');
  slideshowPrev.style.display = currentImages.length > 1 ? 'block' : 'none';
  slideshowNext.style.display = currentImages.length > 1 ? 'block' : 'none';
}

function previousMedia() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  openSlideshow(currentImageIndex); // Recrée la modal avec la nouvelle image
}

function nextMedia() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  openSlideshow(currentImageIndex); // Recrée la modal avec la nouvelle image
}

// Ajouter les événements après le DOM
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('back-to-home');
  if (backButton) {
    backButton.addEventListener('click', closeArticlePage);
  }
  
  // Événements du diaporama
  const slideshowClose = document.querySelector('.slideshow-close');
  const slideshowPrev = document.querySelector('.slideshow-prev');
  const slideshowNext = document.querySelector('.slideshow-next');
  const slideshowModal = document.getElementById('slideshow-modal');
  
  if (slideshowClose) {
    slideshowClose.addEventListener('click', closeSlideshowModal);
  }
  
  if (slideshowPrev) {
    slideshowPrev.addEventListener('click', previousMedia);
  }
  
  if (slideshowNext) {
    slideshowNext.addEventListener('click', nextMedia);
  }
  
  // Fermer le diaporama en cliquant en dehors
  if (slideshowModal) {
    slideshowModal.addEventListener('click', (event) => {
      if (event.target === slideshowModal) {
        closeSlideshowModal();
      }
    });
  }
  
  // Navigation au clavier
  document.addEventListener('keydown', (event) => {
    const slideshowModal = document.getElementById('slideshow-modal');
    if (slideshowModal.style.display === 'block') {
      switch(event.key) {
        case 'Escape':
          closeSlideshowModal();
          break;
        case 'ArrowLeft':
          previousMedia();
          break;
        case 'ArrowRight':
          nextMedia();
          break;
      }
    }
  });
});