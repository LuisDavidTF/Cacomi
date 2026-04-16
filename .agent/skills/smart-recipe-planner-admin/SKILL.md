---
name: smart-recipe-planner-admin
description: Estándares y patrones de seguridad, integración con Koyeb, Recharts y moderación para el Panel de Administrador.
---

# Smart Recipe Planner - Admin Panel Standards

Este skill define los lineamientos estrictos y seguros que deben seguirse al desarrollar cualquier característica del Panel de Administrador de Culina Smart Recipe Planner.

## 1. Seguridad de Datos Sensibles y Roles
- **Acceso Restricto**: El panel es exclusivo para el rol de `ADMIN`.
- **Admin Token de Corta Duración**: Debido a la sensibilidad de los datos, NO se recomendará usar indefinidamente el JWT normal. Se debe implementar (en colaboración con el backend) un flujo donde el administrador solicite una "Elevación de Privilegios" que devuelva un Token de Administrador de muy corta duración (ej. 15-30 minutos).
- **Protección de Rutas**: Todas las rutas dentro de `/admin/*` deben estar protegidas en Astro mediante Middleware y en React mediante un `AdminGuard`.
- **Cero Exposición de Credenciales**: NUNCA exponer API Keys de servicios externos (como Koyeb) en el frontend.

## 2. Observabilidad e Integración con Koyeb
- **Arquitectura de Proxy**: El frontend NO debe conectarse directamente a la API de Koyeb. El backend en Java será el encargado de comunicarse con Koyeb (haciendo uso de la Koyeb API REST: `/v1/streams/logs/query` o `tail`) e inyectar su API Key.
- **Visualizador de Logs**: Crear un componente de UI similar a una terminal, que consuma los logs desde el backend proxy (`/api/admin/sys/logs`) y permita autoscroll, filtrado y pausa.
- **Métricas de Sistema (CPU/RAM)**: Consumir métricas desde Koyeb a través de nuestro backend y mostrarlas gráficamente.

## 3. Visualización de Datos con Recharts
- **Librería Estándar**: Usar `recharts` para las gráficas del dashboard (uso de servidor, estadísticas de usuarios, reportes).
- **Diseño Premium**: Las gráficas deben respetar la paleta de colores de Culina (tailwind 4), soportar Dark/Light mode automáticos, y poseer tooltips interactivos y animaciones fluidas (ease-in-out).

## 4. Gestión de Jobs (Tareas en Segundo Plano)
- **Control Total**: Proveer una interfaz para visualizar los *Jobs* del backend (ej. limpieza de BD, envío de correos).
- **Acciones Rápidas**: Incluir botones para:
  - Disparar manualmente (Run Now)
  - Detener/Cancelar ejecución (Stop)
  - Activar/Desactivar programación (Toggle Schedule)
- **Feedback en Tiempo Real**: Mostrar el estado último del Job (Éxito, Fallo, En progreso) con badges visuales.

## 5. Moderación de Contenido y Gestión de Usuarios
- **Reportes de Usuarios**: Panel para analizar los tickets o reportes de uso inadecuado.
- **Acciones Destructivas**: Posibilidad para eliminar usuarios, sus recetas o cualquier contenido. Toda acción de eliminación debe estar precedida de un `AlertDialog` (Double Confirmation) porque las acciones son de gran impacto legal y de base de datos.
- **Logs de Auditoría**: Toda acción del administrador se asume registrada en el backend.

## 6. Internacionalización (i18n)
- Al igual que en la app normal, TODOS los textos del panel de admin deben venir de nuestro diccionario global (`SettingsContext` o traducciones de Astro). NO hardcodear textos.
