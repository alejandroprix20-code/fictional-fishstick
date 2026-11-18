# Comercial Nazareth

Aplicación web responsive para una tienda local de abarrotes de Ascope, Perú.

## Ejecutar

```bash
brew install node
cd + ruta de la carpeta donde se encuentra el archivo : cd "/Users/alejandro/Library/Mobile Documents/com~apple~CloudDocs/Programacion_Web/Proyecto_Web_Final"

npm install
npm start
```

Abrir `http://localhost:3000`. No abrir los archivos mediante `file://`, porque el
catálogo dinámico y el formulario necesitan las rutas de Express.

## Estructura de entrega

```text
src/
├── frontend/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── *.html
└── backend/
    ├── app.js
    ├── server.js
    ├── routes/
    ├── utils/
    └── data/
```

## Funcionalidades

- Diseño semántico, responsive y basado en Bootstrap.
- Búsqueda, filtros, carrusel, detalles dinámicos y carrito local.
- Validación del formulario en cliente y servidor.
- API Express para productos, categorías y contactos.
- Persistencia de productos y contactos en archivos JSON.
- Evidencia de accesibilidad en `reports/accessibility-report.md`.

## API

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`
- `POST /api/contacts`
