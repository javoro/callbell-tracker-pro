# Instrucciones globales — Callbell Tracker PRO

## Publicar nueva versión

Cuando el usuario diga **"publica una nueva versión"** (o variantes similares como "crear release", "nueva versión", "publicar versión"), sigue este flujo exacto:

### Flujo obligatorio

1. **Leer la versión actual** ejecutando:
   ```
   node -p "require('./package.json').version"
   ```

2. **Preguntar al usuario dos cosas antes de hacer nada:**
   - ¿Qué número de versión quieres publicar? (mostrar la actual como referencia, ej: "actual: 1.0.0")
   - ¿Cuál es la descripción de los cambios de esta versión? (se usará en el mensaje del commit)

3. **Esperar respuesta del usuario** con ambos datos antes de continuar.

4. **Ejecutar en orden** una vez confirmados los datos:
   - Actualizar `"version"` en `package.json` al nuevo número
   - `git add .`
   - `git commit -m "release: v<nueva_version> — <descripcion>"`
   - `git push`
   - `git tag v<nueva_version>`
   - `git push origin v<nueva_version>`

5. **Confirmar** al usuario que el tag fue creado y que GitHub Actions está compilando el instalador. Recordar que en ~10 minutos aparecerá en la pestaña Releases de `github.com/javoro/callbell-tracker-pro/releases`.

### Reglas importantes
- **Nunca** crear el tag sin antes preguntar la versión y la descripción.
- **Nunca** saltarse el `git push` antes del tag.
- El formato del tag siempre es `v` seguido del número (ej: `v1.0.1`, `v2.0.0`).
- Si el usuario solo da el número sin "v", añadirlo automáticamente.
