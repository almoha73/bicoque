import { promises as fs } from 'fs';
import path from 'path';

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');
const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// Helper pour s'assurer que les dossiers existent
async function ensureDirectories() {
  try {
    await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
  } catch (error) {
    console.error('Erreur création dossiers:', error);
  }
}

// Helper pour lire les rubriques
async function readCategories() {
  try {
    await ensureDirectories();
    const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultCategories = [
        { id: 'travaux', name: 'Travaux & Achats', order: 0 },
        { id: 'decouvertes', name: 'Nos découvertes en Corrèze', order: 1 }
      ];
      await writeCategories(defaultCategories);
      return defaultCategories;
    }
    throw error;
  }
}

// Helper pour écrire les rubriques
async function writeCategories(categories) {
  await ensureDirectories();
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// Helper pour lire les articles
async function readArticles() {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Configuration CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const categories = await readCategories();
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      const { name } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Le nom de la rubrique est requis' });
      }
      
      const categories = await readCategories();
      const newCategory = {
        id: Date.now().toString(),
        name: name.trim(),
        order: categories.length
      };
      
      categories.push(newCategory);
      await writeCategories(categories);
      return res.status(201).json(newCategory);
    }

    if (req.method === 'PUT') {
      const categoryId = req.query.id;
      const { name } = req.body;
      
      if (!categoryId) {
        return res.status(400).json({ error: 'ID manquant' });
      }
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Le nom de la rubrique est requis' });
      }
      
      const categories = await readCategories();
      const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
      
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Rubrique non trouvée' });
      }
      
      categories[categoryIndex].name = name.trim();
      await writeCategories(categories);
      return res.status(200).json(categories[categoryIndex]);
    }

    if (req.method === 'DELETE') {
      const categoryId = req.query.id;
      
      if (!categoryId) {
        return res.status(400).json({ error: 'ID manquant' });
      }
      
      // Vérifier s'il y a des articles dans cette rubrique
      const articles = await readArticles();
      const articlesInCategory = articles.filter(article => article.type === categoryId);
      
      if (articlesInCategory.length > 0) {
        return res.status(400).json({ 
          error: `Impossible de supprimer une rubrique contenant ${articlesInCategory.length} article(s)` 
        });
      }
      
      const categories = await readCategories();
      const filteredCategories = categories.filter(cat => cat.id !== categoryId);
      
      if (filteredCategories.length === categories.length) {
        return res.status(404).json({ error: 'Rubrique non trouvée' });
      }
      
      await writeCategories(filteredCategories);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('Erreur API categories:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}