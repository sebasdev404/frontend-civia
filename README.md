# 🏛️ CIVIA - Frontend (Plataforma de Inteligencia Urbana y Participación Ciudadana)

Interfaz de usuario web moderna de alta fidelidad para la Alcaldía de Neiva, construida con **Next.js 15 (App Router)**, **TypeScript**, **SCSS Modules**, **Leaflet** y sincronización en tiempo real con **FastAPI**.

---

## 🚀 Requisitos Previos

- **Node.js**: v18.18+ o v20+ recomendado.
- **npm** (v9+) o **pnpm** / **yarn**.
- **Backend de CIVIA**: Ejecutándose en `http://localhost:8000`.

---

## 📦 Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de Variables de Entorno:**
   Copia el archivo de ejemplo a `.env.local` si necesitas cambiar la URL del backend (por defecto apunta a `http://localhost:8000/api/v1`):
   ```bash
   cp .env.example .env.local
   ```
   Contenido de `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

---

## 🏃‍♂️ Ejecución

### Modo Desarrollo (con Turbopack para máxima velocidad):
```bash
npm run dev
```

### Modo Producción (Optimizado):
```bash
npm run build
npm run start
```

La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

---

## 👥 Cuentas de Acceso Rápido (Modo Demo / Presentación)

En la pantalla de inicio de sesión (`/login`), dispones de selectores de 1 clic con credenciales pre-cargadas:

| Rol | Usuario Demo | Cargo |
| :--- | :--- | :--- |
| **Alcalde** | `alcalde@civia.gov.co` | Johan Steed Ortiz Morales (Control Estratégico y Cuadro de Mando Integral) |
| **Operador / Enlace** | `operador@civia.gov.co` | María Camila Rivas (Bandeja de Entrada, Supervisión IA y Despacho) |
| **Administrador** | `admin@civia.gov.co` | Ing. Juan Sebastián Perdomo (Configuraciones, Webhooks y Modelos IA) |

*Contraseña para todos los roles:* `123456`

---

## 🌟 Principales Módulos del Frontend

1. **Dashboard Estratégico (`/dashboard`):**
   - KPI cards ejecutivos (Casos Totales, Tasa de Resolución, Tiempo Promedio, Índice de Confianza).
   - Mapa de calor de Neiva en vivo con Leaflet y selector de comunas.
   - Acciones rápidas según el rol activo.

2. **Bandeja de Casos y Publicaciones Ciudadanas (`/cases`):**
   - **Pestaña 1: Publicaciones en Redes Ciudadanas:** Muestra las publicaciones oficiales y comunitarias con métricas de engagement (Likes, Alcance, Comentarios, Compartidos) y botón de sincronización Meta en vivo.
   - **Drawer de Detalle de Publicación:** Cobertura del 100% de comentarios ciudadanos, con pestañas de filtrado (`Todos`, `Casos Clasificados por IA`, `Aportes / Opinión`).
   - **Pestaña 2: Casos Radicados y Resueltos:** Lista de radicados formales con trazabilidad institucional.
   - **Pestaña 3: Supervisión de Triaje IA & Excepciones:** Centro de despacho con botón `⚡ Auto-Despachar Todo con IA (1 Clic)`.

3. **Detalle de Caso (`/cases/[id]`):**
   - Vista 360 del incidente: canal de origen, radicado oficial, resumen de IA, nivel de prioridad, coordenadas y seguimiento de resolución.

4. **Configuración y Parámetros del Sistema (`/settings`):**
   - Integración Meta Graph API (Webhooks, tokens permanentes, sincronización manual).
   - Umbrales de confianza del modelo de clasificación NLP.
   - Gestión de comunas y dependencias de despacho.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15 (App Router, Server Components + Client Components)
- **Lenguaje:** TypeScript 5
- **Estilos:** SCSS Modules (`.module.scss`) con variables globales y diseño responsive
- **Iconografía:** Lucide React
- **Mapas:** Leaflet / React-Leaflet con capas de OpenStreetMap y ESRI
- **Manejo de Estado:** Context API (`AuthContext`) con fallback resiliente para presentaciones
