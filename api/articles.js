import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper pour s'assurer que les dossiers existent
async function ensureDirectories() {
  try {
    await fs.mkdir(path.dirname(ARTICLES_FILE), { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
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
      const form = formidable({
        uploadDir: UPLOADS_DIR,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      const [fields, files] = await form.parse(req);
      
      const articles = await readArticles();
      const newArticle = {
        id: Date.now().toString(),
        title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
        date: Array.isArray(fields.date) ? fields.date[0] : fields.date,
        content: Array.isArray(fields.content) ? fields.content[0] : fields.content,
        type: Array.isArray(fields.type) ? fields.type[0] : fields.type,
        images: files.images ? (Array.isArray(files.images) ? files.images.map(f => path.basename(f.filepath)) : [path.basename(files.images.filepath)]) : [],
        order: articles.length,
      };
      
      // Maintenir la compatibilité avec l'ancien champ image
      newArticle.image = newArticle.images.length > 0 ? newArticle.images[0] : null;
      
      articles.push(newArticle);
      await writeArticles(articles);
      
      return res.status(201).json(newArticle);
    }

    if (req.method === 'PUT') {
      const articleId = req.query.id;
      if (!articleId) {
        return res.status(400).json({ error: 'ID manquant' });
      }

      const form = formidable({
        uploadDir: UPLOADS_DIR,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024,
      });

      const [fields, files] = await form.parse(req);
      
      const articles = await readArticles();
      let updatedArticle = null;

      const updatedArticles = articles.map((article) => {
        if (article.id === articleId) {
          let existingImages = article.images || (article.image ? [article.image] : []);
          
          // Supprimer les images marquées pour suppression
          if (fields.imagesToDelete) {
            const imagesToDelete = JSON.parse(Array.isArray(fields.imagesToDelete) ? fields.imagesToDelete[0] : fields.imagesToDelete);
            existingImages = existingImages.filter(img => !imagesToDelete.includes(img));
            
            // Supprimer physiquement les fichiers
            for (const imgFilename of imagesToDelete) {
              try {
                await fs.unlink(path.join(UPLOADS_DIR, imgFilename));
              } catch (error) {
                console.error('Erreur suppression image:', error);
              }
            }
          }
          
          // Ajouter les nouvelles images
          const newImages = files.images ? (Array.isArray(files.images) ? files.images.map(f => path.basename(f.filepath)) : [path.basename(files.images.filepath)]) : [];
          const allImages = [...existingImages, ...newImages];
          
          updatedArticle = {
            ...article,
            title: (Array.isArray(fields.title) ? fields.title[0] : fields.title) || article.title,
            date: (Array.isArray(fields.date) ? fields.date[0] : fields.date) || article.date,
            content: (Array.isArray(fields.content) ? fields.content[0] : fields.content) || article.content,
            type: (Array.isArray(fields.type) ? fields.type[0] : fields.type) || article.type,
            images: allImages,
            image: allImages.length > 0 ? allImages[0] : null,
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
        // Supprimer toutes les images associées
        const imagesToDelete = articleToDelete.images || (articleToDelete.image ? [articleToDelete.image] : []);
        for (const imgFilename of imagesToDelete) {
          try {
            await fs.unlink(path.join(UPLOADS_DIR, imgFilename));
          } catch (error) {
            console.error('Erreur suppression image:', error);
          }
        }
        
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