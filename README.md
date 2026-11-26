# CIVIA — interfaz web

Proyecto independiente de escucha y gestión ciudadana en Neiva. No acredita carácter oficial de la Alcaldía ni integración con su radicación. Captura, análisis y atención son procesos distintos; un borrador o una asignación en CIVIA no envían comunicaciones externas.

Next.js 16.4.6, React 19.2.8, TypeScript, SCSS Modules y Leaflet. Usar Node.js 24 y las versiones de `package-lock.json`.

## Desarrollo local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

FastAPI debe estar disponible en el servidor en `http://127.0.0.1:8000/api/v1`. Configurar `CIVIA_BACKEND_API_URL` para cambiarlo. El navegador consulta `/api/backend` y `/assets` en el mismo origen; no recibe claves de proveedores ni el JWT. La cookie se marca Secure en producción, que requiere HTTPS.

No establecer `CIVIA_PUBLIC_ORIGIN` en desarrollo local. En un despliegue detrás de un proxy TLS, configurarlo con el origen público HTTPS exacto, sin barra final. Compose lo configura desde `CIVIA_DOMAIN`.

## Verificación y producción

```bash
npx tsc --noEmit
npm run lint -- src
npm run build -- --webpack
```

El Dockerfile usa salida `standalone`, incluye los recursos estáticos y ejecuta el servidor como usuario sin privilegios. El despliegue necesita ambos repositorios como directorios hermanos.

- [Arquitectura y lógica del negocio](../backend-civia/docs/PROYECTO_CIVIA.md).
- [Seguimiento de tareas](../backend-civia/docs/SEGUIMIENTO.md).
- [Preparación de producción y evidencias](../backend-civia/docs/PREPARACION_PRODUCCION_20261125.md).
- [Instalación, copias y reversión](../backend-civia/deploy/README.md).

La documentación central vive en el backend; en GitHub, consultar [sus documentos](https://github.com/sebasdev404/backend-civia/tree/main/docs) para la versión publicada. Un build local correcto no equivale a tener el servicio desplegado.
