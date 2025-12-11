# Google Apps Script - Private Tour Booking System

Sistema automatizado para enviar correos electrónicos y generar PDFs cuando se recibe una reserva de tour privado.

## 📋 Características

- ✅ Genera PDF profesional con logo de la empresa
- ✅ Envía email al cliente con confirmación de solicitud
- ✅ Envía email al administrador con todos los detalles
- ✅ PDFs adjuntos en ambos correos
- ✅ Diseño responsive para emails
- ✅ Incluye todas las opciones adicionales seleccionadas

## 🚀 Instalación Paso a Paso

### 1. Crear el Proyecto en Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Haz clic en "Nuevo proyecto"
3. Renombra el proyecto: "Private Tour Booking System"

### 2. Copiar el Código

1. Borra el código por defecto
2. Copia todo el contenido del archivo `Code.gs`
3. Pégalo en el editor

### 3. Configurar el Logo

1. Ve a [Google Drive](https://drive.google.com)
2. Crea una nueva carpeta llamada "logo" (o cualquier nombre)
3. Sube tu logo (recomendado: PNG con fondo transparente, 200x100px aprox.)
4. Renombra el archivo a `logo.png`
5. Abre la carpeta en Drive y copia el ID de la URL:
   ```
   https://drive.google.com/drive/folders/ESTE_ES_EL_ID
   ```
6. En el código, reemplaza `FOLDER_ID_HERE` con tu ID:
   ```javascript
   LOGO_FOLDER_ID: '1abc123XYZ456...',
   ```

### 4. Configurar Emails de Administrador

En el código, actualiza los emails de admin:

```javascript
ADMIN_EMAILS: ['admin@tuempresa.com', 'ventas@tuempresa.com'],
```

### 5. Configurar Información de la Empresa

```javascript
COMPANY_NAME: 'Tu Nombre de Empresa',
FROM_NAME: 'Tu Empresa - Sistema de Reservas'
```

### 6. Desplegar como Web App

1. Haz clic en **"Implementar"** → **"Nueva implementación"**
2. Configura:
   - **Tipo**: Web app
   - **Ejecutar como**: Yo (tu email)
   - **Quién puede acceder**: Cualquiera
3. Haz clic en **"Implementar"**
4. **Autoriza** la aplicación (Google te pedirá permisos)
5. **Copia la URL** generada (algo como: `https://script.google.com/macros/s/ABC.../exec`)

### 7. Configurar en el Frontend

1. Abre el archivo `src/components/PrivateTourBookingForm.tsx`
2. Busca la línea:
   ```typescript
   const googleScriptUrl = "YOUR_GOOGLE_SCRIPT_URL_HERE";
   ```
3. Reemplázala con tu URL:
   ```typescript
   const googleScriptUrl = "https://script.google.com/macros/s/ABC.../exec";
   ```

## 🧪 Probar el Sistema

### Opción 1: Función de Prueba (Recomendado)

1. En Google Apps Script, selecciona la función `testEmailSystem`
2. Haz clic en **"Ejecutar"**
3. Revisa los logs y tu correo

### Opción 2: Prueba Real

1. Ve a tu sitio web
2. Llena el formulario de booking
3. Envía la solicitud
4. Revisa ambos correos (cliente y admin)

## 📧 Contenido de los Emails

### Email al Cliente

- ✅ Saludo personalizado
- ✅ Resumen de la reserva
- ✅ Advertencia de que NO está confirmado
- ✅ Recordatorio de revisar SPAM/PROMOTIONS
- ✅ PDF adjunto con todos los detalles

### Email al Administrador

- ✅ Alerta de nueva reserva
- ✅ Todos los datos del cliente
- ✅ Tamaño del grupo
- ✅ Opciones adicionales seleccionadas
- ✅ Botón para responder directamente
- ✅ PDF adjunto

## 📄 Contenido del PDF

El PDF incluye:

- Logo de la empresa
- Título "PRIVATE TOUR BOOKING REQUEST"
- Fecha de envío
- Información del tour
- Datos del cliente
- Tamaño del grupo
- Opciones adicionales (con descripciones)
- Comentarios especiales
- Footer con aviso de confirmación pendiente

## 🔧 Solución de Problemas

### El logo no aparece

- Verifica que el `LOGO_FOLDER_ID` sea correcto
- Asegúrate de que el archivo se llame exactamente `logo.png`
- Verifica que el script tenga permisos para acceder a Drive

### No llegan los correos

- Revisa los logs en Apps Script (Ver → Registros)
- Verifica que los emails en `ADMIN_EMAILS` sean correctos
- Revisa la carpeta de SPAM

### Error "Unauthorized"

- Vuelve a desplegar la aplicación
- Asegúrate de haber autorizado todos los permisos

### Error de CORS en el frontend

- Esto es normal con `mode: 'no-cors'`
- El script seguirá funcionando aunque aparezca el error
- No afecta el envío de emails

## 🔐 Permisos Requeridos

El script necesita:

- ✅ Acceso a Gmail (para enviar correos)
- ✅ Acceso a Drive (para leer el logo y crear PDFs)
- ✅ Acceso a Documentos (para generar PDFs)

## 📝 Notas Importantes

1. **Límites de Google**:

   - 100 emails por día (cuenta gratuita)
   - 1,500 emails por día (Google Workspace)

2. **Tamaño del Logo**:

   - Recomendado: 200x100px
   - Formato: PNG con fondo transparente
   - Tamaño máximo: 1MB

3. **Tiempo de Respuesta**:
   - El script procesa en 2-5 segundos
   - Los emails llegan casi instantáneamente

## 🎨 Personalización

### Cambiar Colores del Email

Busca en el código los colores y cámbialos:

```javascript
// Teal: #0d9488
// Blue: #2563eb
// Red: #dc2626
```

### Modificar el PDF

Ajusta las funciones `addSection()` y `addField()` para cambiar estilos.

### Agregar Más Información

Puedes agregar campos adicionales en la función `generateBookingPDF()`.

## 📞 Soporte

Si tienes problemas:

1. Revisa los **Registros** en Apps Script
2. Usa la función `testEmailSystem()` para debug
3. Verifica que todos los IDs y configuraciones sean correctos

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2025
