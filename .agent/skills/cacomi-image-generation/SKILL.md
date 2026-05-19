---
name: cacomi-image-generation
description: "Reglas para generar imágenes de la marca Cacomi, asegurando la inclusión del logo oficial."
---

# Generación de Imágenes para Cacomi

Cuando se te solicite generar imágenes para el proyecto Cacomi (ya sea para artículos de blog, la revista recomendada, portadas de recetas u otros elementos gráficos de la aplicación), DEBES seguir obligatoriamente las siguientes reglas:

## 1. Inclusión del Logo Oficial (CRÍTICO)
TODAS las imágenes generadas deben integrar de forma visible, elegante y orgánica el logotipo oficial de Cacomi. 
- Debes utilizar la herramienta `generate_image`.
- Debes incluir **obligatoriamente** el path absoluto del logo oficial en el array `ImagePaths`: `c:\Users\luis_\Documentos\Proyectos (Antigravity)\smart-recipe-planner\public\images\brand\logo_about.png`.
- En el prompt de texto, debes instruir a la IA generativa para que posicione o integre el logotipo de manera sutil pero clara (ej. "en una esquina", "como marca de agua en la madera de la mesa", "en un sticker sobre el tupper", etc.).

## 2. Obligatoriedad en Artículos y Revistas
Cada vez que se genere un **nuevo artículo de blog** o una **nueva edición de la revista semanal**, debes:
- Generar obligatoriamente una imagen de portada para dicho artículo.
- En caso de generar la "Revista Semanal" o seleccionar "Artículos Recomendados", los **3 artículos recomendados** SIEMPRE deben contar con una imagen. Si no la tienen, debes generarla automáticamente y asignarla en su *frontmatter* bajo la clave `image`.

## 3. Estilo Visual de la Marca
- **Cálido y Minimalista:** Utiliza tonos que vayan acorde con la paleta de la aplicación (blancos cremosos, naranjas suaves, colores orgánicos de vegetales).
- **Alta Calidad:** Asegúrate de solicitar iluminación estilo estudio, sombras suaves y texturas realistas de alimentos o interfaces tecnológicas.

## 4. Almacenamiento
- Una vez que la herramienta `generate_image` retorne la imagen (guardada en `.gemini/antigravity/brain/...`), DEBES mover o copiar la imagen al directorio público del repositorio: `public/images/blog/` (o el directorio correspondiente).
- Actualiza el código fuente (ej. archivos Markdown `.md` o `.astro`) para hacer referencia a la nueva ruta web (ej. `/images/blog/mi-imagen.webp`).
