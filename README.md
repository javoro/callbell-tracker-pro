# Callbell Tracker Pro

Aplicación web para administrar seguimientos de Callbell. Permite registrar, actualizar y eliminar seguimientos de contactos, con soporte para estado (Pendiente, En Progreso, Completado) y niveles de prioridad.

## Funcionalidades

- **Dashboard** con estadísticas en tiempo real (total, pendientes, en progreso, completados)
- **Filtros** por estado del seguimiento
- **Crear** nuevos seguimientos con contacto, título, notas, estado, prioridad y fecha límite
- **Editar** seguimientos existentes
- **Eliminar** seguimientos
- **API REST** (`/api/follow-ups`) para operaciones CRUD

## Stack tecnológico

- [Next.js 16](https://nextjs.org/) con App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- Almacenamiento en archivo JSON local

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```