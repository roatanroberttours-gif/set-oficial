# 🏝️ Roatan East Hidden Gem - Sitio Web de Tours

Una página web moderna y responsive para **Roatan East Hidden Gem**, empresa de tours turísticos especializada en manglares y aventuras naturales en Roatán, Honduras.

## 🌟 Características Principales

### ✨ Funcionalidades Implementadas

- **🌍 Sistema de Idiomas**: Toggle entre Español e Inglés con contexto React
- **📱 Diseño Responsive**: Optimizado para móviles, tablets y desktop
- **🎨 UI/UX Moderna**: Diseño atractivo con gradientes tropicales y animaciones
- **🚤 Catálogo de Tours**: Integración con Google Sheets API para contenido dinámico
- **📅 Sistema de Reservas**: Modal multi-paso con integración PayPal
- **📸 Galería Interactiva**: Lightbox con categorías y filtros
- **💬 Contacto Múltiple**: WhatsApp, email, formulario y redes sociales
- **⚡ Optimización**: Lazy loading, code splitting y rendimiento optimizado

### 📄 Páginas Implementadas

1. **Home** (`/`) - Hero, servicios destacados, experiencias, galería, contacto
2. **Services** (`/services`) - Catálogo completo con filtros y búsqueda
3. **Service Detail** (`/service/:id`) - Página individual de cada tour
4. **Gallery** (`/gallery`) - Galería completa con filtros por categoría
5. **Contact** (`/contact`) - Información de contacto y FAQ

## 🛠️ Tecnologías Utilizadas

### Frontend Stack
- **React 18.3** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **TailwindCSS** - Estilos utilitarios
- **React Router** - Navegación SPA

### Librerías Principales
- **@react-google-maps/api** - Integración con Google Maps
- **@paypal/react-paypal-js** - Pagos con PayPal
- **lucide-react** - Iconografía moderna
- **axios** - Cliente HTTP
- **framer-motion** - Animaciones avanzadas

### APIs Integradas
- **Google Sheets API** - Contenido dinámico de tours
- **PayPal SDK** - Procesamiento de pagos
- **WhatsApp Business API** - Comunicación directa

## 🚀 Configuración y Desarrollo

### Prerrequisitos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación y Ejecución
```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm dev

# Build producción
pnpm build

# Vista previa build
pnpm preview
```

## 📊 Datos y Contenido

### Google Sheets Estructura
El sitio consume datos de Google Sheets con las siguientes hojas:

1. **Productos** - Tours y servicios
   - `id, name, description, personPrice, price, image, duration, category`

2. **Experience** - Testimonios y experiencias
   - `id, title, description, image, rating, testimonial, author`

3. **Gallery** - Fotos de la galería
   - `id, image, title, description, category`

## 🌐 Información de Contacto

- **Teléfono**: +504 3226-7504
- **Email**: rteastendexp@gmail.com
- **WhatsApp**: +504 3226-7504
- **Ubicación**: Roatán Este, Bay Islands, Honduras

## 🚀 Sitio en Producción

**URL**: https://s69d5pqy9r.space.minimax.io

### Características del Deployment
- **Build Optimizado**: ~300KB JS + ~90KB CSS (gzipped)
- **Performance**: Carga rápida y optimizada
- **Responsive**: Funciona perfectamente en todos los dispositivos
- **Funcionalidades**: Todas las características principales operativas

## 🎨 Diseño y Branding

### Paleta de Colores
- **Primary**: Teal (#14b8a6) - Aguas tropicales
- **Secondary**: Blue (#3b82f6) - Cielo caribeño
- **Accent**: Green (#10b981) - Naturaleza

### Características de UI/UX
- **Mobile-First**: Diseño optimizado para móviles
- **Animaciones**: Transiciones suaves y efectos visuales
- **Accesibilidad**: Contraste adecuado y navegación clara
- **Velocidad**: Carga rápida con lazy loading

---

**Desarrollado con ❤️ para la conservación y turismo sostenible de Roatán**

🌊 *"Donde cada aventura cuenta una historia"* 🌊
