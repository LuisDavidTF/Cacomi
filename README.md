# 🍽️ Culina Smart — Smart Recipe Planner

Culina Smart es una aplicación web moderna e inteligente para planificar comidas, gestionar tu despensa y generar recetas con IA. Construida con tecnologías de punta y optimizada para experiencia de escritorio y móvil con soporte offline completo.

## ✨ Features

- **🤖 IA Generativa de Recetas** — Genera recetas personalizadas usando Google Gemini (vía API propia en Koyeb).
- **📦 Gestión de Despensa (Pantry)** — Agrega, edita y elimina ingredientes con sincronización en tiempo real.
- **📋 CRUD de Recetas** — Crea, edita, consulta y elimina tus recetas favoritas.
- **🔐 Autenticación** — Registro e inicio de sesión seguros con sesiones basadas en cookies JWT (httpOnly) y autorización basada en roles (`ROLE_ADMIN`).
- **🛡️ Panel de Admin (Stealth Mode + Manual Training)** — Gestión administrativa oculta tras una ruta secreta. Incluye sistema auditado para entrenar la IA, revisar logs y moderar usuarios.
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

> [!IMPORTANT]
> **Seguridad Crítica**: Nunca uses el prefijo `PUBLIC_` para la URL de la API o el PIN de administración. Esto evita que los secretos se filtren al bundle de Javascript del cliente.

```sh
# URL de la API backend (Privada - Accesible vía BFF Proxy)
BACKEND_URL=https://api.tu-sitio.com

# Seguridad Administrativa (Privada)
ADMIN_PIN=1234 # Requerido para elevar privilegios en el panel de control
ADMIN_PATH_PREFIX=secreto-admin # Ruta oculta para entrar al panel

# URL base de la app
PUBLIC_SITE_URL=https://tu-sitio.com
```

---

## 📁 Estructura del Proyecto (Módulos Recientes)

- **`astro_src/components/admin`**: Módulo de administración, incluye `ReviewLogsBoard` para auditoría de IA y paneles de infraestructura.
- **`astro_src/lib/services`**: Capa de abstracción para servicios REST (Auth, Admin, Pantry).
- **`astro_src/middleware.ts`**: Gestión de seguridad basada en JWT Claims (`ROLE_ADMIN`), Stealth Mode y protección de rutas.
- **`src/pages/api/proxy`**: Backend-for-Frontend (BFF) que actúa como proxy para ocultar la infraestructura real.

---

## 🛡️ Seguridad y Auditoría

- **BFF Proxy Pattern**: Ninguna llamada directa a la API backend ocurre desde el navegador; todas pasan por un proxy seguro en el servidor.
- **Role-Based Access Control (RBAC)**: El Dashboard de Admin es inaccesible sin el claim `ROLE_ADMIN`.
- **Manual Training Loop**: Los logs de la IA no se inyectan directamente al modelo; pasan por una fase de revisión humana.
- **Headers de Seguridad**: CSP, X-Frame-Options, HSTS y más, aplicados globalmente vía Middleware.

---

## 📜 Legal

- [Términos y Condiciones](/terms)
- [Política de Privacidad](/privacy)

---

## 🤝 Contributing

¡Las contribuciones son bienvenidas!

1. Fork del proyecto
2. Crea tu rama: `git checkout -b feat/mi-feature`
3. Commit: `git commit -m 'feat(scope): descripción'` (Conventional Commits)
4. Push: `git push origin feat/mi-feature`
5. Abre un Pull Request