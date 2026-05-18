---
name: "archivos-locales"
description: "Convención para el uso de la carpeta archivos_locales_no_git, destinada a archivos de trabajo, datos exportados y recursos temporales que no deben subirse al repositorio."
---

# Archivos Locales (archivos_locales_no_git)

## Propósito
La carpeta `archivos_locales_no_git` ubicada en la raíz del proyecto sirve como un espacio de trabajo seguro para intercambiar archivos entre el usuario y el agente de IA.

Estos archivos pueden ser:
- Exportaciones de datos (ej. CSVs de Google Search Console, reportes de analíticas).
- Archivos de configuración locales que no deben compartirse con el equipo.
- Tokens temporales, credenciales o llaves de servicio (Service Accounts) necesarias para tareas específicas.
- Archivos de prueba (imágenes, documentos) que solo se necesitan temporalmente.

## Reglas de Uso
1. **NO hacer commits de esta carpeta**: La carpeta está registrada en `.gitignore`. Nunca intentes forzar su inclusión en Git.
2. **Uso como fuente de datos**: Al solicitar análisis (ej. "analiza estos datos"), primero verifica si los archivos están en `archivos_locales_no_git`.
3. **Manejo de secretos**: Si el usuario proporciona un archivo JSON con credenciales, recuérdale siempre ponerlo en esta carpeta por seguridad, para garantizar que no se filtre en el repositorio.
4. **Limpieza**: Aconseja al usuario borrar archivos de esta carpeta cuando la tarea o análisis haya finalizado, especialmente si contienen datos sensibles.
