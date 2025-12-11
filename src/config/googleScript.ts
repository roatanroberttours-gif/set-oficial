// ============================================
// CONFIGURACIÓN DE GOOGLE APPS SCRIPT
// ============================================

/**
 * INSTRUCCIONES:
 *
 * 1. Sigue las instrucciones en google-apps-script/README.md
 * 2. Despliega el script de Google como Web App
 * 3. Copia la URL generada (https://script.google.com/macros/s/ABC.../exec)
 * 4. Pégala abajo en GOOGLE_SCRIPT_URL
 */

export const GOOGLE_SCRIPT_CONFIG = {
  // 🔴 IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script
  GOOGLE_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbzYKBIP_aFyQJ8_V4fLf84n1HJkuccXxh9CWxFSWOLuS7fMNXhGDs5MLPxrFCkIGad6/exec",

  // Tiempo de espera para la petición (milisegundos)
  TIMEOUT: 10000,

  // Habilitar logs de debug
  DEBUG: true,
};

// Validar que la URL esté configurada
export function validateGoogleScriptConfig(): boolean {
  if (
    GOOGLE_SCRIPT_CONFIG.GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE"
  ) {
    console.warn(
      "⚠️ Google Script URL not configured. Please update src/config/googleScript.ts"
    );
    return false;
  }
  return true;
}
