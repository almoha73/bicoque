#!/usr/bin/env python3
import os
from PIL import Image

def optimize_image(input_path, output_path, max_width=1920, quality=85):
    """Optimise une image en réduisant sa taille et sa qualité"""
    try:
        with Image.open(input_path) as img:
            # Convertir en RGB si nécessaire
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Redimensionner si l'image est trop large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # Sauvegarder avec compression
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            # Vérifier les tailles
            original_size = os.path.getsize(input_path)
            optimized_size = os.path.getsize(output_path)
            reduction = ((original_size - optimized_size) / original_size) * 100
            
            print(f"✅ {os.path.basename(input_path)}: {original_size//1024}KB → {optimized_size//1024}KB (-{reduction:.1f}%)")
            return True
            
    except Exception as e:
        print(f"❌ Erreur avec {input_path}: {e}")
        return False

def optimize_folder(folder_path):
    """Optimise toutes les images d'un dossier"""
    print(f"\n🔄 Optimisation du dossier: {folder_path}")
    
    # Créer un dossier de sauvegarde
    backup_folder = folder_path + "_backup"
    os.makedirs(backup_folder, exist_ok=True)
    
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            input_path = os.path.join(folder_path, filename)
            backup_path = os.path.join(backup_folder, filename)
            
            # Sauvegarder l'original
            if not os.path.exists(backup_path):
                import shutil
                shutil.copy2(input_path, backup_path)
            
            # Optimiser (remplacer l'original)
            optimize_image(input_path, input_path)

if __name__ == "__main__":
    # Optimiser tous les dossiers (sauf les backups)
    folders_to_optimize = [
        "public/uploads/deuxieme-visite",
        "public/uploads/premiere-visite"
    ]
    
    for folder in folders_to_optimize:
        if os.path.exists(folder):
            optimize_folder(folder)
    
    print("\n🎉 Optimisation terminée !")