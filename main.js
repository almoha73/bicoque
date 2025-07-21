console.log('Script main.js chargé !');

// URL de base de l'API backend
const API_BASE_URL = '/api/articles';
const CATEGORIES_API_URL = '/api/categories';
const UPLOADS_BASE_URL = '/uploads/';

// Éléments du DOM pour l'ajout/édition d'articles
const travauxEntries = document.getElementById('travaux-entries');
const decouvertesEntries = document.getElementById('decouvertes-entries');
const addTravauxButton = document.getElementById('add-travaux');
const addDecouvertesButton = document.getElementById('add-decouvertes');

// Variables globales pour les rubriques (pour plus tard)
let categories = [];
let categoryContainers = new Map();

// Éléments du DOM pour la gestion des rubriques
const manageCategoriesButton = document.getElementById('manage-categories');
const categoriesModal = document.getElementById('categories-modal');
const categoriesCloseButton = categoriesModal ? categoriesModal.querySelector('.categories-close-button') : null;
const categoriesList = document.getElementById('categories-list');
const addCategoryForm = document.getElementById('add-category-form');
const newCategoryNameInput = document.getElementById('new-category-name');
const entryModal = document.getElementById('entry-modal');
const closeModalButton = entryModal.querySelector('.close-button');
const entryForm = document.getElementById('entry-form');
const entryIdInput = document.getElementById('entry-id');
const entryTypeInput = document.getElementById('entry-type');
const entryTitleInput = document.getElementById('entry-title');
const entryDateInput = document.getElementById('entry-date');
const entryContentInput = document.getElementById('entry-content');
const entryImageInput = document.getElementById('entry-image');
const entryZipInput = document.getElementById('entry-zip');
const existingImagesDiv = document.getElementById('existing-images');
const imagePreviewsDiv = document.getElementById('image-previews');
let selectedFiles = [];
let imagesToDelete = [];

// Éléments du DOM pour la page de lecture
const articlePage = document.getElementById('article-page');
const backToHomeButton = document.getElementById('back-to-home');
const articleTitle = document.getElementById('article-title');
const articleDate = document.getElementById('article-date');
const articleImages = document.getElementById('article-images');
const articleContent = document.getElementById('article-content');
const mainContent = document.querySelector('main');
const headerContent = document.querySelector('header');
const footerContent = document.querySelector('footer');

// Éléments du DOM pour le diaporama
const slideshowModal = document.getElementById('slideshow-modal');
const slideshowImage = document.getElementById('slideshow-image');
const slideshowClose = document.querySelector('.slideshow-close');
const slideshowPrev = document.querySelector('.slideshow-prev');
const slideshowNext = document.querySelector('.slideshow-next');
const slideshowCurrent = document.getElementById('slideshow-current');
const slideshowTotal = document.getElementById('slideshow-total');

// Variables globales pour le diaporama
let currentImageIndex = 0;
let currentImages = [];

const TRUNCATE_LENGTH = 150; // Longueur maximale du texte affiché dans la carte

// Fonction pour rendre les images d'un article
function renderArticleImages(images) {
  if (!images || images.length === 0) return '';
  
  if (images.length === 1) {
    return `<img src="${UPLOADS_BASE_URL}${images[0]}" alt="Image" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 5px;" />`;
  }
  
  // Pour plusieurs images, créer une galerie simple
  const imageElements = images.slice(0, 3).map(image => 
    `<img src="${UPLOADS_BASE_URL}${image}" alt="Image" style="width: 32%; height: 80px; object-fit: cover; margin: 1px; border-radius: 3px;" />`
  ).join('');
  
  const moreText = images.length > 3 ? `<span style="font-size: 0.8em; color: #666;">+${images.length - 3} autres</span>` : '';
  
  return `<div style="margin-bottom: 10px;">${imageElements}${moreText}</div>`;
}

// Fonction pour récupérer et afficher les articles
async function renderArticles() {
  try {
    // Charger les rubriques et créer les sections
    await loadAndRenderCategories();
    
    const response = await fetch(API_BASE_URL);
    const articles = await response.json();

    articles.forEach(article => {
      const articleCard = document.createElement('article');
      articleCard.classList.add('card');
      articleCard.dataset.id = article.id;

      const truncatedContent = article.content.length > TRUNCATE_LENGTH
        ? article.content.substring(0, TRUNCATE_LENGTH) + '...'
        : article.content;

      articleCard.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="card-actions">
          <button class="edit-button" data-id="${article.id}">Modifier</button>
          <button class="delete-button" data-id="${article.id}">Supprimer</button>
        </div>
        <h4>${article.title}</h4>
        <p class="date">${article.date}</p>
        ${renderArticleImages(article.images || (article.image ? [article.image] : []))}
        <p>${truncatedContent}</p>
        ${article.content.length > TRUNCATE_LENGTH ? `<a href="#" class="read-more" data-id="${article.id}">Lire la suite...</a>` : ''}
      `;

      // Rendre la carte draggable
      articleCard.draggable = true;
      articleCard.setAttribute('data-id', article.id);

      // Ajouter l'article à la bonne section
      const categoryContainer = categoryContainers.get(article.type);
      if (categoryContainer) {
        categoryContainer.appendChild(articleCard);
      }
    });

    // Attacher les écouteurs d'événements aux nouveaux boutons
    document.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', handleEditArticle);
    });
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', handleDeleteArticle);
    });
    document.querySelectorAll('.read-more').forEach(button => {
      button.addEventListener('click', handleReadMore);
    });

    // Attacher les écouteurs d'événements pour le drag & drop
    setupDragAndDrop();

  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error);
  }
}

// === FONCTIONS POUR LA GESTION DES RUBRIQUES ===

// Charger les rubriques et créer les sections dynamiquement
async function loadAndRenderCategories() {
  try {
    const response = await fetch(CATEGORIES_API_URL);
    categories = await response.json();
    
    // Vider les containers existants
    categoryContainers.clear();
    
    // Récupérer ou créer le container principal
    let categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
      // Si pas de container categories, utiliser main
      categoriesContainer = document.querySelector('main .container') || document.querySelector('main');
      // Supprimer les anciennes sections fixes
      const oldSections = categoriesContainer.querySelectorAll('section');
      oldSections.forEach(section => section.remove());
    } else {
      categoriesContainer.innerHTML = '';
    }
    
    
    // Créer une section pour chaque rubrique
    categories.forEach(category => {
      const section = document.createElement('section');
      section.id = category.id;
      
      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'section-header';
      
      const title = document.createElement('h3');
      title.textContent = category.name;
      
      const addButton = document.createElement('button');
      addButton.className = 'add-button';
      addButton.textContent = '+';
      addButton.addEventListener('click', () => openModal({ type: category.id }));
      
      sectionHeader.appendChild(title);
      sectionHeader.appendChild(addButton);
      
      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'entries-container';
      entriesContainer.id = `${category.id}-entries`;
      
      section.appendChild(sectionHeader);
      section.appendChild(entriesContainer);
      categoriesContainer.appendChild(section);
      
      // Sauvegarder la référence du container
      categoryContainers.set(category.id, entriesContainer);
    });
    
  } catch (error) {
    console.error('Erreur lors du chargement des rubriques pour l\'affichage:', error);
  }
}


// Charger et afficher les rubriques dans la modale
async function loadCategories() {
  try {
    const response = await fetch(CATEGORIES_API_URL);
    categories = await response.json();
    renderCategoriesInModal();
  } catch (error) {
    console.error('Erreur lors du chargement des rubriques:', error);
  }
}

// Afficher les rubriques dans la modale de gestion
function renderCategoriesInModal() {
  if (!categoriesList) return;
  
  categoriesList.innerHTML = '';
  
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
      <span class="category-name">${category.name}</span>
      <div class="category-actions">
        <button class="edit-category-btn" data-id="${category.id}" title="Modifier">✏️</button>
        <button class="delete-category-btn" data-id="${category.id}" title="Supprimer">🗑️</button>
      </div>
    `;
    
    categoriesList.appendChild(categoryItem);
  });
  
  // Attacher les écouteurs d'événements
  categoriesList.querySelectorAll('.edit-category-btn').forEach(btn => {
    btn.addEventListener('click', handleEditCategory);
  });
  
  categoriesList.querySelectorAll('.delete-category-btn').forEach(btn => {
    btn.addEventListener('click', handleDeleteCategory);
  });
}

// Ouvrir la modale de gestion des rubriques
function openCategoriesModal() {
  console.log('openCategoriesModal appelée');
  console.log('categoriesModal:', categoriesModal);
  console.log('categoriesModal.style.display avant:', categoriesModal.style.display);
  if (categoriesModal) {
    categoriesModal.style.display = 'block';
    console.log('categoriesModal.style.display après:', categoriesModal.style.display);
    loadCategories();
  } else {
    console.error('categoriesModal non trouvé');
  }
}

// Fermer la modale de gestion des rubriques
function closeCategoriesModal() {
  if (categoriesModal) {
    categoriesModal.style.display = 'none';
  }
}

// Ajouter une nouvelle rubrique
async function handleAddCategory(event) {
  event.preventDefault();
  
  const name = newCategoryNameInput.value.trim();
  if (!name) return;
  
  try {
    const response = await fetch(CATEGORIES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (response.ok) {
      newCategoryNameInput.value = '';
      loadCategories();
      // Recharger l'affichage et le formulaire
      loadCategoriesInForm();
      renderArticles();
    } else {
      alert('Erreur lors de la création de la rubrique');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la rubrique:', error);
    alert('Erreur réseau lors de l\'ajout de la rubrique');
  }
}

// Modifier une rubrique
function handleEditCategory(event) {
  const categoryId = event.target.dataset.id;
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    const newName = prompt('Nouveau nom de la rubrique:', category.name);
    if (newName && newName.trim() !== category.name) {
      updateCategory(categoryId, newName.trim());
    }
  }
}

// Mettre à jour une rubrique
async function updateCategory(id, name) {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (response.ok) {
      loadCategories();
      loadCategoriesInForm();
      renderArticles();
    } else {
      alert('Erreur lors de la modification de la rubrique');
    }
  } catch (error) {
    console.error('Erreur lors de la modification de la rubrique:', error);
    alert('Erreur réseau lors de la modification de la rubrique');
  }
}

// Supprimer une rubrique
async function handleDeleteCategory(event) {
  const categoryId = event.target.dataset.id;
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category && confirm(`Êtes-vous sûr de vouloir supprimer la rubrique "${category.name}" ?`)) {
    try {
      const response = await fetch(`${CATEGORIES_API_URL}/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadCategories();
        loadCategoriesInForm();
        renderArticles();
      } else {
        const errorText = await response.text();
        alert(`Erreur: ${errorText}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la rubrique:', error);
      alert('Erreur réseau lors de la suppression de la rubrique');
    }
  }
}

// Charger les rubriques dans le formulaire d'ajout d'article
async function loadCategoriesInForm() {
  try {
    const response = await fetch(CATEGORIES_API_URL);
    const categoriesData = await response.json();
    
    // Mettre à jour le select du formulaire
    const entryTypeSelect = document.getElementById('entry-type');
    if (entryTypeSelect) {
      entryTypeSelect.innerHTML = '';
      categoriesData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        entryTypeSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des rubriques dans le formulaire:', error);
  }
}

// Fonction pour ouvrir la modal d'ajout/édition
async function openModal(article = {}) {
  entryModal.style.display = 'block';
  entryIdInput.value = article.id || '';
  
  // Charger les rubriques dans le formulaire
  await loadCategoriesInForm();
  
  entryTypeInput.value = article.type || 'travaux';
  entryTitleInput.value = article.title || '';
  entryDateInput.value = article.date || '';
  entryContentInput.value = article.content || '';

  // Réinitialiser les variables
  selectedFiles = [];
  imagesToDelete = [];
  
  // Gérer l'affichage des images existantes
  displayExistingImages(article.images || []);
  
  // Réinitialiser les champs de fichier
  entryImageInput.value = '';
  entryZipInput.value = '';
  imagePreviewsDiv.innerHTML = '';
}

// Fonction pour fermer la modal d'ajout/édition
function closeModal() {
  entryModal.style.display = 'none';
  entryForm.reset();
  selectedFiles = [];
  imagesToDelete = [];
  existingImagesDiv.innerHTML = '';
  imagePreviewsDiv.innerHTML = '';
}

// Fonction pour afficher les images existantes avec possibilité de suppression
function displayExistingImages(images) {
  existingImagesDiv.innerHTML = '';
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = 'display: inline-block; position: relative; margin: 5px;';
      
      const img = document.createElement('img');
      img.src = `${UPLOADS_BASE_URL}${image}`;
      img.style.cssText = 'width: 100px; height: 100px; object-fit: cover; border-radius: 4px;';
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '×';
      deleteButton.type = 'button';
      deleteButton.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;';
      deleteButton.onclick = () => removeExistingImage(image, imageContainer);
      
      imageContainer.appendChild(img);
      imageContainer.appendChild(deleteButton);
      existingImagesDiv.appendChild(imageContainer);
    });
  }
}

// Fonction pour supprimer une image existante
function removeExistingImage(imagePath, container) {
  imagesToDelete.push(imagePath);
  container.remove();
}

// Fonction pour prévisualiser les nouvelles images
function previewNewImages(files) {
  imagePreviewsDiv.innerHTML = '';
  Array.from(files).forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = 'display: inline-block; position: relative; margin: 5px;';
      
      const img = document.createElement('img');
      img.style.cssText = 'width: 100px; height: 100px; object-fit: cover; border-radius: 4px;';
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '×';
      deleteButton.type = 'button';
      deleteButton.style.cssText = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;';
      deleteButton.onclick = () => removeNewImage(index, imageContainer);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      imageContainer.appendChild(img);
      imageContainer.appendChild(deleteButton);
      imagePreviewsDiv.appendChild(imageContainer);
    }
  });
}

// Fonction pour supprimer une nouvelle image
function removeNewImage(index, container) {
  selectedFiles = selectedFiles.filter((_, i) => i !== index);
  container.remove();
  updateFileInput();
}

// Fonction pour mettre à jour le champ de fichier
function updateFileInput() {
  const dt = new DataTransfer();
  selectedFiles.forEach(file => dt.items.add(file));
  entryImageInput.files = dt.files;
}

// Fonction pour extraire les images d'un ZIP
async function extractImagesFromZip(zipFile) {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipFile);
    const imageFiles = [];
    
    for (const [filename, file] of Object.entries(contents.files)) {
      if (!file.dir && /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
        const blob = await file.async('blob');
        const imageFile = new File([blob], filename, { type: `image/${filename.split('.').pop().toLowerCase()}` });
        imageFiles.push(imageFile);
      }
    }
    
    return imageFiles;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du ZIP:', error);
    alert('Erreur lors de l\'extraction du fichier ZIP. Assurez-vous qu\'il contient des images valides.');
    return [];
  }
}

// Fonction pour ouvrir la page de lecture
function openArticlePage(article) {
  // Masquer le contenu principal
  mainContent.style.display = 'none';
  headerContent.style.display = 'none';
  footerContent.style.display = 'none';
  
  // Afficher la page article
  articlePage.style.display = 'block';
  
  // Remplir le contenu
  articleTitle.textContent = article.title;
  articleDate.textContent = article.date;
  
  // Formatter le contenu avec des paragraphes et des sauts de ligne
  const formattedContent = article.content
    .split('\n\n')  // Séparer les paragraphes (double saut de ligne)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
  
  articleContent.innerHTML = formattedContent;
  
  // Afficher toutes les images avec possibilité de cliquer
  const images = article.images || (article.image ? [article.image] : []);
  currentImages = images; // Stocker pour le diaporama
  
  // Ajouter le bouton à côté du titre si il y a des images
  if (images.length > 0) {
    const photoButton = `<button id="go-to-photos" class="photo-button-header">📸 Voir les photos (${images.length})</button>`;
    articleTitle.insertAdjacentHTML('afterend', photoButton);
    
    const imageGallery = images.map((image, index) => 
      `<img src="${UPLOADS_BASE_URL}${image}" alt="Image de l'article" data-index="${index}" class="gallery-image" />`
    ).join('');
    
    articleImages.innerHTML = `<div id="image-gallery-container">${imageGallery}</div>`;
    
    // Ajouter les écouteurs d'événements pour chaque image
    articleImages.querySelectorAll('.gallery-image').forEach((img, index) => {
      img.addEventListener('click', () => openSlideshow(index));
    });
    
    // Ajouter l'écouteur pour le bouton "Voir les photos"
    document.getElementById('go-to-photos').addEventListener('click', scrollToPhotos);
  } else {
    articleImages.innerHTML = '';
  }
  
  // Changer l'URL sans recharger la page
  history.pushState({ articleId: article.id }, article.title, `#article/${article.id}`);
}

// Fonctions pour le diaporama
function openSlideshow(imageIndex) {
  if (currentImages.length === 0) return;
  
  currentImageIndex = imageIndex;
  slideshowModal.style.display = 'block';
  updateSlideshowImage();
}

function closeSlideshowModal() {
  slideshowModal.style.display = 'none';
}

function updateSlideshowImage() {
  if (currentImages.length === 0) return;
  
  slideshowImage.src = `${UPLOADS_BASE_URL}${currentImages[currentImageIndex]}`;
  slideshowCurrent.textContent = currentImageIndex + 1;
  slideshowTotal.textContent = currentImages.length;
  
  // Gérer la visibilité des boutons précédent/suivant
  slideshowPrev.style.display = currentImages.length > 1 ? 'block' : 'none';
  slideshowNext.style.display = currentImages.length > 1 ? 'block' : 'none';
}

function previousImage() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  updateSlideshowImage();
}

function nextImage() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  updateSlideshowImage();
}

// Fonction pour faire défiler jusqu'aux photos
function scrollToPhotos() {
  const imageGalleryContainer = document.getElementById('image-gallery-container');
  if (imageGalleryContainer) {
    imageGalleryContainer.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Variables globales pour le drag & drop
let draggedElement = null;
let draggedArticleId = null;

// Configuration du drag & drop
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.card');
  console.log(`Configuration drag & drop pour ${cards.length} cartes`);
  
  cards.forEach((card, index) => {
    console.log(`Carte ${index}: ID = ${card.dataset.id}`);
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
  });
}

// Gestion du début du drag
function handleDragStart(e) {
  console.log('Drag start:', e.currentTarget.dataset.id);
  draggedElement = e.currentTarget;
  draggedArticleId = e.currentTarget.dataset.id;
  e.currentTarget.classList.add('dragging');
  
  // Données à transférer
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedArticleId);
}

// Gestion de la fin du drag
function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  
  // Nettoyer les classes des autres éléments
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('drag-over');
  });
}

// Gestion du survol pendant le drag
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  e.dataTransfer.dropEffect = 'move';
  return false;
}

// Gestion de l'entrée dans une zone de drop
function handleDragEnter(e) {
  if (e.currentTarget !== draggedElement) {
    e.currentTarget.classList.add('drag-over');
  }
}

// Gestion de la sortie d'une zone de drop
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

// Gestion du drop
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  
  const dropTarget = e.currentTarget;
  const dropTargetId = dropTarget.dataset.id;
  
  console.log('Drop:', draggedArticleId, 'sur', dropTargetId);
  
  if (draggedElement !== dropTarget && draggedArticleId && dropTargetId) {
    // Réorganiser les articles
    reorderArticles(draggedArticleId, dropTargetId);
  }
  
  return false;
}

// Fonction pour réorganiser les articles
async function reorderArticles(draggedId, targetId) {
  try {
    const response = await fetch('/api/articles/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        draggedId: draggedId,
        targetId: targetId
      }),
    });
    
    if (response.ok) {
      // Recharger les articles pour refléter le nouvel ordre
      renderArticles();
    } else {
      console.error('Erreur lors de la réorganisation:', response.statusText);
    }
  } catch (error) {
    console.error('Erreur réseau lors de la réorganisation:', error);
  }
}

// Fonction pour fermer la page de lecture
function closeArticlePage() {
  // Nettoyer le bouton photo s'il existe
  const existingPhotoButton = document.getElementById('go-to-photos');
  if (existingPhotoButton) {
    existingPhotoButton.remove();
  }
  
  // Masquer la page article
  articlePage.style.display = 'none';
  
  // Afficher le contenu principal
  mainContent.style.display = 'block';
  headerContent.style.display = 'block';
  footerContent.style.display = 'block';
  
  // Retourner à l'URL d'accueil
  history.pushState(null, 'Journal de la Bicoque', '/');
}

// Gérer l'ajout/édition d'un article
async function handleFormSubmit(event) {
  event.preventDefault();

  const id = entryIdInput.value;
  const type = entryTypeInput.value;
  const title = entryTitleInput.value;
  const date = entryDateInput.value;
  const content = entryContentInput.value;

  const formData = new FormData();
  formData.append('type', type);
  formData.append('title', title);
  formData.append('date', date);
  formData.append('content', content);
  
  // Ajouter les nouvelles images
  selectedFiles.forEach((file, index) => {
    formData.append('images', file);
  });
  
  // Ajouter les images à supprimer
  if (imagesToDelete.length > 0) {
    formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
  }

  try {
    let response;
    if (id) {
      // Modifier un article existant
      response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Ajouter un nouvel article
      response = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });
    }

    if (response.ok) {
      closeModal();
      renderArticles(); // Recharger les articles après succès
    } else {
      console.error('Erreur lors de la soumission de l\'article:', response.statusText);
      alert('Erreur lors de la soumission de l\'article.');
    }
  } catch (error) {
    console.error('Erreur réseau lors de la soumission de l\'article:', error);
    alert('Erreur réseau lors de la soumission de l\'article.');
  }
}

// Gérer la modification d'un article
async function handleEditArticle(event) {
  const articleId = event.target.dataset.id;
  try {
    const response = await fetch(`${API_BASE_URL}`);
    const articles = await response.json();
    const articleToEdit = articles.find(article => article.id === articleId);
    if (articleToEdit) {
      openModal(articleToEdit);
    } else {
      alert('Article non trouvé pour modification.');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article pour modification:', error);
  }
}

// Gérer la suppression d'un article
async function handleDeleteArticle(event) {
  const articleId = event.target.dataset.id;
  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/${articleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        renderArticles(); // Recharger les articles après suppression
      } else {
        console.error('Erreur lors de la suppression de l\'article:', response.statusText);
        alert('Erreur lors de la suppression de l\'article.');
      }
    } catch (error) {
      console.error('Erreur réseau lors de la suppression de l\'article:', error);
      alert('Erreur réseau lors de la suppression de l\'article.');
    }
  }
}

// Gérer le clic sur "Lire la suite..."
async function handleReadMore(event) {
  event.preventDefault(); // Empêcher le comportement par défaut du lien
  const articleId = event.target.dataset.id;
  try {
    const response = await fetch(`${API_BASE_URL}`);
    const articles = await response.json();
    const articleToRead = articles.find(article => article.id === articleId);
    if (articleToRead) {
      openArticlePage(articleToRead);
    } else {
      alert('Article non trouvé pour lecture.');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article pour lecture:', error);
  }
}


// Écouteurs d'événements pour la modal d'ajout/édition
if (addTravauxButton) addTravauxButton.addEventListener('click', () => openModal({ type: 'travaux' }));
if (addDecouvertesButton) addDecouvertesButton.addEventListener('click', () => openModal({ type: 'decouvertes' }));
closeModalButton.addEventListener('click', closeModal);
entryForm.addEventListener('submit', handleFormSubmit);

// Écouteurs d'événements pour la gestion des rubriques
if (manageCategoriesButton) {
  manageCategoriesButton.addEventListener('click', function(event) {
    console.log('Clic détecté sur le bouton gérer les rubriques');
    event.preventDefault();
    openCategoriesModal();
  });
  console.log('Écouteur ajouté au bouton gérer les rubriques');
} else {
  console.error('Bouton manage-categories non trouvé');
}

if (categoriesCloseButton) {
  categoriesCloseButton.addEventListener('click', closeCategoriesModal);
}

if (addCategoryForm) {
  addCategoryForm.addEventListener('submit', handleAddCategory);
}

// Écouteurs pour la gestion des images
entryImageInput.addEventListener('change', (e) => {
  selectedFiles = Array.from(e.target.files);
  previewNewImages(selectedFiles);
});

entryZipInput.addEventListener('change', async (e) => {
  const zipFile = e.target.files[0];
  if (zipFile) {
    const extractedImages = await extractImagesFromZip(zipFile);
    selectedFiles = [...selectedFiles, ...extractedImages];
    previewNewImages(selectedFiles);
    updateFileInput();
  }
});

// Écouteurs d'événements pour la page de lecture
backToHomeButton.addEventListener('click', closeArticlePage);

// Écouteurs d'événements pour le diaporama
slideshowClose.addEventListener('click', closeSlideshowModal);
slideshowPrev.addEventListener('click', previousImage);
slideshowNext.addEventListener('click', nextImage);

// Navigation au clavier pour le diaporama
document.addEventListener('keydown', (event) => {
  if (slideshowModal.style.display === 'block') {
    switch(event.key) {
      case 'Escape':
        closeSlideshowModal();
        break;
      case 'ArrowLeft':
        previousImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  }
});

// Fermer le diaporama en cliquant en dehors de l'image
slideshowModal.addEventListener('click', (event) => {
  if (event.target === slideshowModal) {
    closeSlideshowModal();
  }
});

// Fermer la modal si l'utilisateur clique en dehors
window.addEventListener('click', (event) => {
  if (event.target === entryModal) {
    closeModal();
  }
});

// Gérer la navigation du navigateur
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.articleId) {
    // L'utilisateur navigue vers un article
    // On pourrait recharger l'article ici si nécessaire
  } else {
    // L'utilisateur revient à la page d'accueil
    closeArticlePage();
    closeSlideshowModal();
  }
});

// Rendre les articles et charger les rubriques au chargement de la page
renderArticles();
loadCategoriesInForm();

// Debug: vérifier si les éléments existent
console.log('manageCategoriesButton:', document.getElementById('manage-categories'));
console.log('categoriesModal:', document.getElementById('categories-modal'));