# 🍽️ Culina Smart — Smart Recipe Planner

Culina Smart es una aplicación web moderna e inteligente para planificar comidas, gestionar tu despensa y generar recetas con IA. Construida con tecnologías de punta y optimizada para experiencia de escritorio y móvil con soporte offline completo.

## ✨ Features

- **🤖 IA Generativa de Recetas** — Genera recetas personalizadas usando Google Gemini (vía API propia en Koyeb).
- **📦 Gestión de Despensa (Pantry)** — Agrega, edita y elimina ingredientes con sincronización en tiempo real. Funciona offline con IndexedDB (Dexie.js) y sincroniza automáticamente al recuperar conexión.
- **📋 CRUD de Recetas** — Crea, edita, consulta y elimina tus recetas favoritas.
- **🔐 Autenticación** — Registro e inicio de sesión seguros con sesiones basadas en cookies JWT (httpOnly) y autorización basada en roles (`ROLE_ADMIN`).
- **🛡️ Panel de Admin (Stealth Mode)** — Gestión administrativa oculta tras una ruta secreta, accesible solo para usuarios con privilegios elevados.
- **📅 Planificador Semanal** — (En Desarrollo) Organiza tus menús semanales de forma inteligente (Próximamente).
- **📱 PWA** — Instalable en móvil y escritorio. Soporte offline con Service Worker.
- **🌙 Modo Oscuro** — Tema claro/oscuro con persistencia de preferencia.
- **⚡ SSR + Edge Ready** — Renderizado en servidor con Astro 6, deployable en Cloudflare Pages o Vercel.
- **🗺️ SEO** — Sitemap dinámico, canonical URLs, Open Graph y meta tags optimizados.
- **⚖️ Legal** — Política de Privacidad, Términos y Condiciones y consentimiento de cookies integrados.

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Astro 6](https://astro.build/) (SSR, Islands Architecture) |
| UI | [React 19](https://react.dev/) (Islands) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com/) |
| Componentes | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Estado | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| Base de datos local | [Dexie.js](https://dexie.org/) (IndexedDB) |
| Iconos | [Lucide React](https://lucide.dev/) |
| PWA | [@vite-pwa/astro](https://vite-pwa-org.netlify.app/frameworks/astro) |
| Lenguaje | TypeScript 5 |

### Infraestructura

| Servicio | Rol |
|---------|-----|
| [Cloudflare Pages](https://pages.cloudflare.com/) | Hosting principal (Edge Workers) |
| [Vercel](https://vercel.com/) | Hosting alternativo |
| [Koyeb](https://koyeb.com/) | Backend API (recetas, auth, pantry) |
| [Google Analytics](https://analytics.google.com/) | Analítica de uso |
| [Google AdSense](https://adsense.google.com/) | Publicidad |

---

## 🚀 Getting Started

### Requisitos

- Node.js **v20** o superior
- npm

### Instalación

```sh
git clone https://github.com/LuisDavidTF/smart-recipe-planner.git
cd smart-recipe-planner
npm install
```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```sh
# URL de la API backend (Koyeb)
PUBLIC_API_URL=https://tu-api.com

# URL base de la app
PUBLIC_SITE_URL=https://tu-sitio.com

# Habilitar anuncios (true/false)
PUBLIC_ENABLE_ADS=false

# (Opcional) Para purgar caché de Cloudflare en builds
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Desarrollo local

```sh
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📁 Estructura del Proyecto

```
smart-recipe-planner/
├── astro_src/
│   ├── components/
│   │   ├── pantry/         # Gestión de despensa (CRUD + sync offline)
│   │   ├── recipes/        # Tarjetas, feed y formularios de recetas
│   │   ├── ui/             # Componentes reutilizables (botones, modals, etc.)
│   │   ├── auth/           # Formularios de autenticación
│   │   ├── ads/            # Componentes de anuncios (AdSense)
│   │   └── shadcn/         # Primitivas UI (shadcn/ui)
│   ├── hooks/
│   │   ├── useApiClient.js # Cliente HTTP autenticado
│   │   ├── usePantry.ts    # Lógica de despensa + sync offline
│   │   ├── useRecipeFeed.js
│   │   └── useRecipeForm.js
│   ├── layouts/            # Layout principal (Astro)
│   ├── lib/
│   │   ├── db.ts           # Schema IndexedDB (Dexie)
│   │   ├── utils.ts        # Utilidades generales
│   │   └── services/       # Capa de servicios API
│   ├── middleware.ts        # Auth guard + security headers + CSRF
│   ├── pages/
│   │   ├── api/            # API endpoints SSR (Astro)
│   │   ├── index.astro     # Landing page
│   │   ├── pantry.astro    # Página de despensa
│   │   ├── create-recipe.astro
│   │   ├── edit-recipe/    # Edición dinámica
│   │   ├── recipes/        # Detalle de receta
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── settings.astro
│   │   ├── terms.astro     # Términos y Condiciones
│   │   ├── privacy.astro   # Política de Privacidad
│   │   └── ~offline.astro  # Página offline (PWA)
│   └── utils/              # Utilidades de cliente
├── public/                 # Íconos PWA, manifest
├── astro.config.mjs        # Config Astro (adaptadores Cloudflare/Vercel)
├── wrangler.toml           # Config Cloudflare Pages
├── tailwind.config.mjs
└── tsconfig.json
```

---

## 🚢 Deployment

### Cloudflare Pages (Producción)

1. Conecta tu repositorio en el dashboard de Cloudflare Pages.
2. Configura el build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. En **Settings > Functions > Compatibility Flags**, agrega:
   - `nodejs_compat`
4. Agrega las variables de entorno en **Settings > Environment variables**.

> La app detecta automáticamente el entorno con `VERCEL=1`. Si esa variable no está presente, usa el adaptador de Cloudflare.

### Vercel

1. Conecta tu repositorio en Vercel.
2. Define la variable de entorno `VERCEL=1` en el dashboard de Vercel.
3. Agrega el resto de variables de entorno.
4. Deploy automático en cada push a `main`.

---

## 🔒 Seguridad

- Sesiones con cookies `httpOnly` + `SameSite=Strict`.
- Autorización robusta basada en roles (Claims de JWT) para acceso administrativo.
- **Stealth URLs**: Rutas administrativas protegidas por prefijos dinámicos y secretos definidos en variables de entorno.
- Headers de seguridad aplicados en middleware: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy`.
- Protección básica CSRF en rutas API para mutaciones.

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