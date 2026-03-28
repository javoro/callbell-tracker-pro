# callbell-seguimiento

Aplicación de escritorio para Windows que permite registrar, consultar, filtrar y exportar seguimientos de llamadas e interacciones con clientes. Opera completamente **offline**, sin base de datos ni servicios externos; toda la información se almacena en archivos locales (JSON).

## Requisitos

- **Node.js** LTS (v18 o v20 recomendado)
- **Windows** (desarrollo y build orientados a Windows)

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (Vite + Electron)
npm run dev
```

Se abrirá la ventana de Electron cargando la app desde el servidor de Vite (http://localhost:5173). Los datos se guardan en la carpeta de datos del usuario de Electron (por ejemplo `%APPDATA%/callbell-seguimiento/data/`).

## Build y empaquetado

```bash
# Compilar frontend y proceso principal de Electron
npm run build

# Generar instalador Windows (NSIS)
npm run dist
```

El instalador se genera en la carpeta `release/`.

## Estructura de datos local

- **data/** (en `userData` de Electron, no en la raíz del proyecto en producción):
  - `seguimientos.json` – listado de seguimientos
  - `catalogos.json` – catálogos (tema, motivo, vendedor, etc.)
  - `configuracion.json` – tipo de corte, fechas personalizadas, etc.
- **exports/** (en `userData`): carpeta por defecto para exportaciones Excel (si se configura).

En desarrollo, la ruta típica es:
`C:\Users\<usuario>\AppData\Roaming\callbell-seguimiento\data\`

## Funcionalidad principal

- **Pantalla principal**: listado de seguimientos, filtros, búsqueda rápida, botones para agregar, exportar, catálogos y configuración.
- **Periodo de corte**: al abrir se muestran los registros del periodo vigente (diario, semanal o personalizado).
- **Alta de seguimiento**: modal con formulario validado (contacto, celular, fecha, tema, motivo, vendedor, departamento, monto, cotizado, folio, etc.).
- **Catálogos**: administración de tema, motivo de contacto, compró, vendedor y departamento (alta, edición, activar/desactivar).
- **Configuración**: tipo de corte, rango personalizado, día de inicio de semana, carpeta de exportación por defecto.
- **Exportación Excel**: exportación del listado visible/filtrado a `.xlsx` con celular como texto y formato monetario.

## Validaciones y reglas configurables

- **Monto / Cotizado**: Monto = valor de compra; Cotizado = valor cotizado; ambos opcionales y numéricos. Definido en código y README para ajuste futuro.
- **Compró + folio/monto/departamento**: Si en el futuro el negocio exige folio, monto o departamento cuando "Compró" = Sí, la lógica puede centralizarse con un flag de configuración (p. ej. `requiereFolioSiCompro`); actualmente no es obligatorio.
- **Edición de seguimientos**: La columna de acciones en la tabla está preparada para conectar a un modal de edición y endpoint `seguimiento:update` en una próxima iteración.

## Scripts disponibles

| Script        | Descripción                                      |
|---------------|---------------------------------------------------|
| `npm run dev` | Desarrollo: compila Electron y lanza Vite + app  |
| `npm run build` | Compila frontend y proceso main                 |
| `npm run dist` | Build + instalador Windows (release/)            |
| `npm run pack` | Build + carpeta empaquetada sin instalador      |

## Tecnologías

- **Electron** – aplicación de escritorio
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** + componentes tipo **shadcn/ui**
- **Zustand** – estado global
- **react-hook-form** + **zod** – formularios y validaciones
- **exceljs** – exportación Excel
- **dayjs** – fechas
- **uuid** – identificadores únicos
- Persistencia con **fs/promises** en el proceso main (IPC seguro vía preload).
