const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dossier pour les uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Dossier pour les données des articles
const ARTICLES_FILE = path.join(__dirname, 'articles.json');
if (!fs.existsSync(ARTICLES_FILE)) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify([]));
}

// Fichier pour les rubriques
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');
if (!fs.existsSync(CATEGORIES_FILE)) {
  const defaultCategories = [
    { id: 'travaux', name: 'Travaux & Achats', order: 0 },
    { id: 'decouvertes', name: 'Nos découvertes en Corrèze', order: 1 }
  ];
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
}

// Configuration de Multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Servir les images statiques
app.use('/uploads', express.static(UPLOADS_DIR));

// Servir les fichiers statiques du frontend (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '..')));

// Route pour servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Helper pour lire/écrire les articles
const readArticles = () => {
  const data = fs.readFileSync(ARTICLES_FILE);
  return JSON.parse(data);
};

const writeArticles = (articles) => {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
};

// Helper pour lire/écrire les rubriques
const readCategories = () => {
  const data = fs.readFileSync(CATEGORIES_FILE);
  return JSON.parse(data);
};

const writeCategories = (categories) => {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
};

// Routes API

// GET tous les articles
app.get('/api/articles', (req, res) => {
  const articles = readArticles();
  
  // Trier par ordre (ajouter un ordre par défaut pour les articles existants)
  articles.forEach((article, index) => {
    if (article.order === undefined) {
      article.order = index;
    }
  });
  
  // Trier par ordre
  articles.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  res.json(articles);
});

// POST un nouvel article (avec upload d'images multiples)
app.post('/api/articles', upload.array('images'), (req, res) => {
  const articles = readArticles();
  const newArticle = {
    id: Date.now().toString(),
    title: req.body.title,
    date: req.body.date,
    content: req.body.content,
    type: req.body.type,
    images: req.files ? req.files.map(file => file.filename) : [],
    // Maintenir la compatibilité avec l'ancien champ image
    image: req.files && req.files.length > 0 ? req.files[0].filename : null,
    order: articles.length, // Nouvel article à la fin
  };
  articles.push(newArticle);
  writeArticles(articles);
  res.status(201).json(newArticle);
});

// PUT mettre à jour un article (avec gestion des images multiples)
app.put('/api/articles/:id', upload.array('images'), (req, res) => {
  try {
    const articles = readArticles();
    const { id } = req.params;
    let updatedArticle = null;

    const updatedArticles = articles.map((article) => {
      if (article.id === id) {
        // Commencer avec les images existantes (ou un tableau vide)
        let existingImages = article.images || (article.image ? [article.image] : []);
        
        // Supprimer les images marquées pour suppression
        if (req.body.imagesToDelete) {
          const imagesToDelete = JSON.parse(req.body.imagesToDelete);
          existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
          
          // Supprimer physiquement les fichiers
          imagesToDelete.forEach(imgFilename => {
            const imgPath = path.join(UPLOADS_DIR, imgFilename);
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
          });
        }
        
        // Ajouter les nouvelles images
        const newImages = req.files ? req.files.map(file => file.filename) : [];
        const allImages = [...existingImages, ...newImages];
        
        updatedArticle = {
          ...article,
          title: req.body.title || article.title,
          date: req.body.date || article.date,
          content: req.body.content || article.content,
          type: req.body.type || article.type,
          images: allImages,
          // Maintenir la compatibilité avec l'ancien champ image
          image: allImages.length > 0 ? allImages[0] : null,
        };
        return updatedArticle;
      }
      return article;
    });

    writeArticles(updatedArticles);
    if (updatedArticle) {
      res.json(updatedArticle);
    } else {
      res.status(404).send('Article non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).send('Erreur serveur lors de la mise à jour');
  }
});

// DELETE un article
app.delete('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const { id } = req.params;
  const articleToDelete = articles.find(article => article.id === id);
  
  if (articleToDelete) {
    // Supprimer toutes les images associées
    const imagesToDelete = articleToDelete.images || (articleToDelete.image ? [articleToDelete.image] : []);
    imagesToDelete.forEach(imgFilename => {
      const imgPath = path.join(UPLOADS_DIR, imgFilename);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });
    
    // Supprimer l'article de la liste
    const newArticles = articles.filter((article) => article.id !== id);
    writeArticles(newArticles);
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Article non trouvé');
  }
});

// POST réorganiser les articles
app.post('/api/articles/reorder', (req, res) => {
  try {
    const { draggedId, targetId } = req.body;
    const articles = readArticles();
    
    // Trouver les index des articles
    const draggedIndex = articles.findIndex(article => article.id === draggedId);
    const targetIndex = articles.findIndex(article => article.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return res.status(404).send('Articles non trouvés');
    }
    
    // Réorganiser les articles
    const [draggedArticle] = articles.splice(draggedIndex, 1);
    articles.splice(targetIndex, 0, draggedArticle);
    
    // Mettre à jour les index d'ordre
    articles.forEach((article, index) => {
      article.order = index;
    });
    
    writeArticles(articles);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error);
    res.status(500).send('Erreur serveur lors de la réorganisation');
  }
});

// === ROUTES POUR LES RUBRIQUES ===

// GET toutes les rubriques
app.get('/api/categories', (req, res) => {
  const categories = readCategories();
  categories.sort((a, b) => (a.order || 0) - (b.order || 0));
  res.json(categories);
});

// POST créer une nouvelle rubrique
app.post('/api/categories', (req, res) => {
  try {
    const categories = readCategories();
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).send('Le nom de la rubrique est requis');
    }
    
    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      order: categories.length
    };
    
    categories.push(newCategory);
    writeCategories(categories);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la rubrique:', error);
    res.status(500).send('Erreur serveur');
  }
});

// PUT modifier une rubrique
app.put('/api/categories/:id', (req, res) => {
  try {
    const categories = readCategories();
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).send('Le nom de la rubrique est requis');
    }
    
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return res.status(404).send('Rubrique non trouvée');
    }
    
    categories[categoryIndex].name = name.trim();
    writeCategories(categories);
    res.json(categories[categoryIndex]);
  } catch (error) {
    console.error('Erreur lors de la modification de la rubrique:', error);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE supprimer une rubrique
app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier s'il y a des articles dans cette rubrique
    const articles = readArticles();
    const articlesInCategory = articles.filter(article => article.type === id);
    
    if (articlesInCategory.length > 0) {
      return res.status(400).send(`Impossible de supprimer une rubrique contenant ${articlesInCategory.length} article(s)`);
    }
    
    const categories = readCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length === categories.length) {
      return res.status(404).send('Rubrique non trouvée');
    }
    
    writeCategories(filteredCategories);
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de la rubrique:', error);
    res.status(500).send('Erreur serveur');
  }
});

// POST réorganiser les rubriques
app.post('/api/categories/reorder', (req, res) => {
  try {
    const { draggedId, targetId } = req.body;
    const categories = readCategories();
    
    const draggedIndex = categories.findIndex(cat => cat.id === draggedId);
    const targetIndex = categories.findIndex(cat => cat.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return res.status(404).send('Rubriques non trouvées');
    }
    
    // Réorganiser les rubriques
    const [draggedCategory] = categories.splice(draggedIndex, 1);
    categories.splice(targetIndex, 0, draggedCategory);
    
    // Mettre à jour les ordres
    categories.forEach((category, index) => {
      category.order = index;
    });
    
    writeCategories(categories);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la réorganisation des rubriques:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
});
