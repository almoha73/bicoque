import { promises as fs } from 'fs';
import path from 'path';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

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

// Helper pour écrire les articles
async function writeArticles(articles) {
  await fs.mkdir(path.dirname(ARTICLES_FILE), { recursive: true });
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

// Configuration CORS
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { draggedId, targetId } = req.body;
    const articles = await readArticles();
    
    // Trouver les index des articles
    const draggedIndex = articles.findIndex(article => article.id === draggedId);
    const targetIndex = articles.findIndex(article => article.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return res.status(404).json({ error: 'Articles non trouvés' });
    }
    
    // Réorganiser les articles
    const [draggedArticle] = articles.splice(draggedIndex, 1);
    articles.splice(targetIndex, 0, draggedArticle);
    
    // Mettre à jour les index d'ordre
    articles.forEach((article, index) => {
      article.order = index;
    });
    
    await writeArticles(articles);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la réorganisation' });
  }
}