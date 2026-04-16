# 🍽️ Culina Smart — Smart Recipe Planner

Culina Smart es una aplicación web moderna e inteligente para planificar comidas, gestionar tu despensa y generar recetas con IA. Construida con tecnologías de punta y optimizada para experiencia de escritorio y móvil con soporte offline completo.

## ✨ Features

- **🤖 IA Generativa de Recetas** — Genera recetas personalizadas usando Google Gemini (vía API propia en Koyeb).
- **📦 Gestión de Despensa (Pantry)** — Agrega, edita y elimina ingredientes con sincronización en tiempo real. Funciona offline con IndexedDB (Dexie.js).
- **📋 CRUD de Recetas** — Crea, edita, consulta y elimina tus recetas favoritas.
- **🔐 Autenticación** — Registro e inicio de sesión seguros con sesiones basadas en cookies JWT (httpOnly) y autorización basada en roles (`ROLE_ADMIN`).
- **🛡️ Panel de Admin (Manual Training)** — Sistema avanzado de entrenamiento y auditoría para la IA. Permite revisar, editar y validar los registros de entrenamiento generados por el modelo antes de su consolidación.
- **📅 Planificador Semanal (Beta)** — Organiza tus menús semanales de forma inteligente con un dashboard de usuario integrado (En desarrollo activo).
- **📱 PWA** — Instalable en móvil y escritorio. Soporte offline con Service Worker.
- **🌙 Modo Oscuro** — Tema claro/oscuro con persistencia de preferencia.
- **⚡ SSR + Edge Ready** — Renderizado en servidor con Astro 6.
- **🗺️ SEO** — Sitemap dinámico, canonical URLs, Open Graph y meta tags optimizados.

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 6](https://astro.build/) (SSR, Islands Architecture) |
| UI | [React 19](https://react.dev/) (Islands) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Componentes | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Estado | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Base de datos local | [Dexie.js](https://dexie.org/) (IndexedDB) |
| Iconos | [Lucide React](https://lucide.dev/) |
| PWA | [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro) |

---

## 🚀 Getting Started

### Instalación

```sh
git clone https://github.com/LuisDavidTF/smart-recipe-planner.git
cd smart-recipe-planner
npm install
```

### Variables de Entorno (.env.local)

```sh
# URL de la API backend (Koyeb/Spring Boot)
PUBLIC_API_URL=https://api.tu-sitio.com

# Seguridad Administrativa
PUBLIC_ADMIN_PIN=1234 # Requerido para elevar privilegios en el panel de control

# URL base de la app
PUBLIC_SITE_URL=https://tu-sitio.com
```

---

## 📁 Estructura del Proyecto (Módulos Recientes)

- **`astro_src/components/admin`**: Módulo de administración, incluye `ReviewLogsBoard` para auditoría de IA y paneles de infraestructura.
- **`astro_src/lib/services`**: Capa de abstracción para servicios REST (Auth, Admin, Pantry).
- **`astro_src/middleware.ts`**: Gestión de seguridad basada en JWT Claims (`ROLE_ADMIN`) y protección de rutas.

---

## 🛡️ Seguridad y Auditoría

- **Role-Based Access Control (RBAC)**: El Dashboard de Admin es inaccesible sin el claim `ROLE_ADMIN` inyectado en el JWT desde el backend.
- **Manual Training Loop**: Los logs de la IA no se inyectan directamente al modelo; pasan por una fase de revisión humana en el Dashboard de Admin para garantizar calidad nutricional y coherencia de costos.
- **Privacidad PII**: El panel de revisión anonimiza datos sensibles del usuario mientras permite ver métricas clave (edad, peso, meta) para validar el plan.

---

## 🤝 Contributing

Sigue el estilo de **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

---

## 📜 Legal

- [Términos y Condiciones](/terms)
- [Política de Privacidad](/privacy)

---

## 🤝 Contributing

¡Las contribuciones son bienvenidas!

1. Fork del proyecto
2. Crea tu rama: `git checkout -b feat/mi-feature`
3. Commit: `git commit -m 'feat(scope): descripción'`
4. Push: `git push origin feat/mi-feature`
5. Abre un Pull Request

Sigue el estilo de **Conventional Commits**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.