# TripAdvisor Scraper

Este pequeño servicio usa Puppeteer para extraer reseñas visibles de una página de TripAdvisor y exponerlas vía HTTP en `/reviews`.

Carpeta: `tools/tripadvisor-scraper/`

## Instalación

Recomendado: node >= 18.

Desde la carpeta `tools/tripadvisor-scraper/`:

```bash
npm install
```

Nota: `puppeteer` descargará una versión de Chromium (~100+ MB). Si el entorno no permite descargas, considera usar `puppeteer-core` y apuntar a un Chrome/Chromium ya instalado.

## Ejecución

```bash
npm start
```

Por defecto arranca en `http://localhost:3000`.

## Uso

Haz peticiones GET a `/reviews` con query params:

- `url` (requerido): URL pública de la página de TripAdvisor que quieres raspar.
- `max` (opcional): máximo número de reseñas a devolver (máx 50). Por defecto 10.

Ejemplo:

```
GET http://localhost:3000/reviews?url=https://www.tripadvisor.com/Attraction_Review-g292019-d19846218-Reviews-Roatan_Robert_Tour-Roatan_Bay_Islands.html&max=10
```

La API devuelve JSON con `{ ok, source, count, reviews }`.

## Cache

Se mantiene una cache en memoria por URL para 5 minutos para evitar abrir Puppeteer en cada petición.

## Despliegue y seguridad

- Para producción, ejecuta esto detrás de un proxy y limita el acceso (CORS, autenticación), ya que el servicio puede consumir recursos (CPU/RAM) al lanzar Chromium.
- Ajusta `CACHE_TTL_MS` en `server.js` si deseas más o menos caché.

## Limitaciones

- TripAdvisor cambia su markup con frecuencia; el scraper usa selectores heurísticos y puede dejar de funcionar en el futuro. Si no extrae datos, abre la página en un navegador y comprueba los selectores.

## Licencia

MIT
