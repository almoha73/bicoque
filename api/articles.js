import { promises as fs } from 'fs';
import path from 'path';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// Helper pour s'assurer que les dossiers existent
async function ensureDirectories() {
  try {
    await fs.mkdir(path.dirname(ARTICLES_FILE), { recursive: true });
  } catch (error) {
    console.error('Erreur création dossiers:', error);
  }
}

// Helper pour lire les articles
async function readArticles() {
  try {
    await ensureDirectories();
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
  await ensureDirectories();
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
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
      const articles = await readArticles();
      
      // Trier par ordre
      articles.forEach((article, index) => {
        if (article.order === undefined) {
          article.order = index;
        }
      });
      
      articles.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return res.status(200).json(articles);
    }

    if (req.method === 'POST') {
      const { type, title, date, content } = req.body;
      
      const articles = await readArticles();
      const newArticle = {
        id: Date.now().toString(),
        title,
        date,
        content,
        type,
        images: [],
        order: articles.length,
      };
      
      // Maintenir la compatibilité avec l'ancien champ image
      newArticle.image = null;
      
      articles.push(newArticle);
      await writeArticles(articles);
      
      return res.status(201).json(newArticle);
    }

    if (req.method === 'PUT') {
      const articleId = req.query.id;
      if (!articleId) {
        return res.status(400).json({ error: 'ID manquant' });
      }

      const { type, title, date, content } = req.body;
      
      const articles = await readArticles();
      let updatedArticle = null;

      const updatedArticles = articles.map((article) => {
        if (article.id === articleId) {
          // Conserver les images existantes
          const existingImages = article.images || [];
          
          updatedArticle = {
            ...article,
            title: title || article.title,
            date: date || article.date,
            content: content || article.content,
            type: type || article.type,
            images: existingImages,
            image: existingImages.length > 0 ? existingImages[0] : null,
          };
          return updatedArticle;
        }
        return article;
      });

      if (updatedArticle) {
        await writeArticles(updatedArticles);
        return res.status(200).json(updatedArticle);
      } else {
        return res.status(404).json({ error: 'Article non trouvé' });
      }
    }

    if (req.method === 'DELETE') {
      const articleId = req.query.id;
      if (!articleId) {
        return res.status(400).json({ error: 'ID manquant' });
      }

      const articles = await readArticles();
      const articleToDelete = articles.find(article => article.id === articleId);
      
      if (articleToDelete) {
        const newArticles = articles.filter((article) => article.id !== articleId);
        await writeArticles(newArticles);
        return res.status(204).end();
      } else {
        return res.status(404).json({ error: 'Article non trouvé' });
      }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('Erreur API articles:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}