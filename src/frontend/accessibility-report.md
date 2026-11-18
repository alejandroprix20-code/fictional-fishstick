# Reporte de accesibilidad - Comercial Nazareth

## Evidencia implementada

- HTML semántico en las cinco páginas.
- Enlace para saltar al contenido principal.
- Navegación, secciones y formularios con nombres accesibles.
- Imágenes informativas con texto alternativo.
- Etiquetas asociadas a todos los campos del formulario.
- Regiones `aria-live` para mensajes y resultados dinámicos.
- Controles Bootstrap con atributos ARIA.
- Diseño responsive y soporte para `prefers-reduced-motion`.

## Comprobación final

Ejecutar `npm start`, abrir `http://localhost:3000` y generar el reporte HTML desde
Chrome DevTools > Lighthouse > Accessibility. También se recomienda revisar las cinco
páginas con WAVE y navegación por teclado.

El reporte detallado del análisis de código se encuentra en
`reports/accessibility-report.md` en la raíz del proyecto completo.
