# Manual de usuario — Callbell Tracker PRO

**Versión del documento:** 1.0 (alineado con la aplicación v1.0.0)

Aplicación de escritorio para **Windows** que permite registrar, consultar, filtrar y exportar **seguimientos de llamadas e interacciones con clientes**. Funciona **sin conexión a internet** y **sin servidor**: los datos se guardan en archivos locales en su equipo.

---

## 1. Introducción

### 1.1 ¿Para qué sirve?

- Registrar cada contacto con datos como cliente, celular, fecha, tema, motivo, vendedor, departamento, montos y folio.
- Ver un listado filtrable acotado al **periodo de corte** vigente (día, semana o rango personalizado).
- Administrar listas desplegables (**catálogos**): temas, motivos, vendedores, etc.
- **Exportar** el listado visible a Excel y **importar** desde Excel con el mismo formato.
- Consultar **analíticas** (indicadores, embudo, tendencias, etc.) y exportarlas a Excel.

### 1.2 Requisitos

- **Windows** (la aplicación está pensada para este sistema).
- Si instala desde el instalador generado por el proyecto, no necesita instalar Node.js. Para desarrollo técnico, consulte el `README.md` del proyecto.

---

## 2. Inicio de la aplicación

Al abrir la aplicación se cargan automáticamente:

- Los seguimientos guardados.
- La configuración de corte y rutas.
- Los catálogos.

Si aparece un mensaje de error en pantalla, anote el texto; suele indicar un problema al leer los archivos de datos.

---

## 3. Pantalla principal

En la parte superior encontrará botones para cambiar de vista y acciones globales.

| Botón / acción        | Descripción |
|----------------------|-------------|
| **Seguimientos**     | Vista principal: filtros y tabla de registros. |
| **Analíticas**       | Paneles de indicadores y gráficos basados en todos los registros activos. |
| **Agregar seguimiento** | Abre el formulario de alta (solo en vista Seguimientos). |
| **Exportar Excel**   | Exporta a `.xlsx` **exactamente el listado que ve en la tabla** (tras filtros y periodo). Solo en vista Seguimientos. |
| **Importar Excel**   | Carga registros desde un archivo Excel con el formato de exportación. |
| **Catálogos**        | Administra temas, motivos, vendedores, etc. |
| **Configuración**    | Tipo de corte, fechas personalizadas, meta semanal, carpeta de exportación. |
| **Acerca de**        | Nombre de la aplicación y datos del desarrollador. |

---

## 4. Periodo activo

Debajo de la barra superior (en vista **Seguimientos**) verá una franja con el texto **Periodo activo**, con fechas de inicio y fin y, si aplica, la etiqueta de la semana (por ejemplo **S12**) o el tipo de corte.

**Comportamiento del listado:**

- Por defecto, la tabla muestra solo los seguimientos cuya **fecha** cae **dentro** de ese periodo.
- Si en los filtros indica **Fecha desde** o **Fecha hasta**, esas fechas **tienen prioridad**: deja de aplicarse el filtro automático por periodo para el rango y se usan sus fechas explícitas (junto con el resto de filtros).

---

## 5. Filtros (vista Seguimientos)

La barra de filtros permite acotar el listado. Los desplegables muestran solo ítems **activos** del catálogo correspondiente.

| Campo | Uso |
|-------|-----|
| **Búsqueda rápida** | Busca en contacto, celular, vendedor, tema y folio (texto libre). |
| **Fecha desde / hasta** | Límite inferior y superior por fecha del seguimiento. |
| **Contacto / Celular** | Filtro específico por esos campos. |
| **Tema, Vendedor, Departamento** | Filtran por el valor seleccionado. |
| **Motivo de compra o no compra** | Motivo del catálogo. |
| **Compró** | Opciones del catálogo “Compró”. |
| **Cotización/pedido** | Texto libre (coincidencia parcial). |
| **Folio factura** | Coincidencia parcial en el folio. |

Los registros se ordenan de **más reciente a más antiguo** (por fecha de creación o fecha del registro, según corresponda en los datos).

---

## 6. Tabla de seguimientos

### 6.1 Columnas

Incluye, entre otras: **Fecha**, **Periodo** (etiqueta de semana u otra derivada de la fecha), **Contacto**, **Celular**, **Tema**, **Motivo**, **Compró**, **Cotización/pedido**, **Vendedor**, **Monto**, **Cotizado**, **Folio factura**, **Departamento**.

- **Monto:** valor asociado a la compra (si lo registró).
- **Cotizado:** valor cotizado (si lo registró).

Los importes se muestran con formato monetario en pantalla.

### 6.2 Selección y eliminación

- Puede marcar filas con la casilla de la primera columna.
- La casilla del encabezado **selecciona o desmarca todas** las filas visibles.
- Con una o más filas seleccionadas aparece **Eliminar seleccionados** y **Desmarcar**.
- También puede eliminar un solo registro con el icono de papelera en la columna **Acciones** (la aplicación pedirá confirmación).

**Las eliminaciones no se pueden deshacer.** Conviene exportar o copiar respaldos de los archivos de datos si la información es crítica.

### 6.3 Edición

Use el icono de **lápiz** en **Acciones** para abrir el mismo formulario que en el alta, con los datos cargados. Guarde para aplicar los cambios.

---

## 7. Agregar o editar un seguimiento

Al pulsar **Agregar seguimiento** o **Editar** se abre un formulario modal.

### 7.1 Campos obligatorios

- **Contacto**
- **Celular**
- **Fecha**
- **Tema** (del catálogo, activo)
- **Motivo de compra o no compra** (catálogo)
- **Vendedor**
- **Departamento**

### 7.2 Campos opcionales

- **Compró**
- **Cotización o pedido**
- **Monto** y **Cotizado** (números; pueden dejarse vacíos)
- **Folio factura**

Si el formulario muestra errores de validación, revise los mensajes junto a cada campo antes de guardar.

---

## 8. Catálogos

En **Catálogos** puede administrar cinco tipos de listas:

1. Tema  
2. Motivo de compra o no compra  
3. Compró  
4. Vendedor  
5. Departamento  

**Acciones habituales:**

- Escribir un nombre en **Nuevo nombre** y pulsar **Agregar** (o Enter).
- **Editar** el nombre de un ítem existente.
- **Activar / desactivar** ítems: los inactivos no aparecen en formularios ni filtros, pero puede verlos con **Ver inactivos**.
- **Eliminar** un ítem del catálogo (con confirmación).

Los valores nuevos que lleguen por **importación Excel** pueden crearse automáticamente en catálogos si no existían (la importación informa cuántos elementos se agregaron).

---

## 9. Configuración

En **Configuración** puede definir:

### 9.1 Tipo de corte

- **Diario:** el periodo activo es el día de hoy.
- **Semanal:** de **lunes a domingo**, con etiqueta de semana del año tipo **S01** … **S53** (semana ISO).
- **Personalizado:** indique **Fecha inicio** y **Fecha fin** del periodo que desea ver por defecto en el listado.

Pulse **Guardar** para aplicar. El periodo mostrado en la barra azul se actualizará según lo guardado.

### 9.2 Meta de ventas semanal (opcional)

Valor numérico usado en la sección de **Analíticas** para comparar el desempeño con una meta. Puede dejarse vacío.

### 9.3 Carpeta de exportación por defecto (opcional)

Puede indicar una ruta de carpeta como referencia para exportaciones. Si no se usa o el cuadro de guardado del sistema pide otra ubicación, elija la carpeta al exportar.

---

## 10. Exportar a Excel (seguimientos)

1. Ajuste **filtros** y compruebe que la tabla muestra exactamente lo que desea exportar.  
2. Pulse **Exportar Excel**.  
3. Elija nombre y ubicación del archivo `.xlsx`.  

El archivo incluye columnas alineadas con los encabezados definidos por la aplicación (contacto, celular, tema, fecha, periodo, motivos, compró, cotización, vendedor, montos, folio, departamento). El celular se exporta como texto para evitar que Excel altere ceros o formato.

---

## 11. Importar desde Excel

1. Pulse **Importar Excel**.  
2. **Seleccionar** un archivo `.xlsx`.  
3. Elija el **Periodo (semana)** al que deben asociarse los registros importados (lista **S01**–**S53**).  
4. Pulse **Importar**.  

**Requisitos del archivo:**

- Debe tener el **mismo formato que la exportación**: mismos encabezados y **mismo orden** de columnas.

La aplicación informará cuántos registros se importaron, cuántas filas se omitieron y si se añadieron entradas nuevas a catálogos. Las filas sin fecha válida o sin contacto/celular pueden no importarse.

---

## 12. Analíticas

En la vista **Analíticas** verá resúmenes calculados a partir de los **seguimientos activos** (no solo los del periodo de la tabla principal): por ejemplo comparativas de semana actual vs anterior, KPIs, embudo, tendencias, ranking de vendedores, pipeline abierto e indicadores de calidad de datos.

- **Exportar a Excel:** genera un libro con el conjunto de métricas exportables; el sistema le pedirá dónde guardar el archivo (nombre sugerido con fecha y hora).

La **meta semanal** configurada en **Configuración** puede usarse en los bloques que comparan con objetivos.

---

## 13. Dónde se guardan los datos (respaldo)

En uso normal con la aplicación empaquetada, los datos suelen estar en la carpeta de usuario de la aplicación, por ejemplo:

`C:\Users\<su_usuario>\AppData\Roaming\callbell-seguimiento\`

Ahí encontrará, entre otros:

| Archivo / carpeta | Contenido |
|-------------------|-----------|
| `data\seguimientos.json` | Todos los seguimientos. |
| `data\catalogos.json` | Catálogos. |
| `data\configuracion.json` | Corte, meta, rutas, etc. |
| `exports\` | Carpeta posible para exportaciones (según configuración y uso). |

Para **respaldo**, copie la carpeta `data` (y si lo desea `exports`) a un lugar seguro. Para **restaurar**, cierre la aplicación y vuelva a colocar los archivos en la misma estructura.

**No edite manualmente** los JSON a menos que sepa lo que hace; un error de sintaxis puede impedir que la aplicación abra los datos.

---

## 14. Preguntas frecuentes

**¿Por qué no veo registros antiguos?**  
Probablemente el **periodo activo** o los **filtros** limitan la vista. Vacíe fechas “desde/hasta” en filtros para volver al comportamiento por periodo, o amplíe el periodo en **Configuración** (p. ej. personalizado).

**¿La exportación incluye todo el historial?**  
No automáticamente: exporta **lo que está visible en la tabla** en ese momento. Para todo el historial, ajuste filtros y periodo hasta que el listado muestre lo necesario, o exporte por partes.

**¿Necesito internet?**  
No para el uso diario; la aplicación es local.

**¿Puedo deshacer un borrado?**  
No desde la aplicación. Depende de un respaldo previo de los archivos en `data`.

---

## 15. Soporte y créditos

Desde **Acerca de** puede ver el nombre comercial **Callbell Tracker PRO** y la referencia al desarrollador indicada en la aplicación.

Para aspectos técnicos de compilación, scripts y estructura del proyecto, consulte el archivo **README.md** en la raíz del repositorio.

---

*Fin del manual de usuario.*
