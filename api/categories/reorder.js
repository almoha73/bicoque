import { promises as fs } from 'fs';
import path from 'path';

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json');

// Helper pour lire les rubriques
async function readCategories() {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Helper pour écrire les rubriques
async function writeCategories(categories) {
  await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
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
    const categories = await readCategories();
    
    const draggedIndex = categories.findIndex(cat => cat.id === draggedId);
    const targetIndex = categories.findIndex(cat => cat.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return res.status(404).json({ error: 'Rubriques non trouvées' });
    }
    
    // Réorganiser les rubriques
    const [draggedCategory] = categories.splice(draggedIndex, 1);
    categories.splice(targetIndex, 0, draggedCategory);
    
    // Mettre à jour les ordres
    categories.forEach((category, index) => {
      category.order = index;
    });
    
    await writeCategories(categories);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la réorganisation des rubriques:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}