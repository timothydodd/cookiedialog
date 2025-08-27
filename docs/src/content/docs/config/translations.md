---
title: Translations & Localization
description: How to customize text and add multi-language support to CookieDialog
---

# Translations & Localization

CookieDialog supports full text customization and multi-language setups through the `texts` configuration option.

## Default Text Labels

These are the default English labels used by CookieDialog:

```javascript
{
  title: 'Cookie Preferences',
  description: 'We use cookies to improve your experience on our website.',
  acceptAll: 'Accept All',
  rejectAll: 'Reject All', 
  manageSettings: 'Manage Settings',
  save: 'Save Preferences',
  close: 'Close',
  necessary: 'Necessary',
  analytics: 'Analytics',
  marketing: 'Marketing',
  privacyPolicy: 'Privacy Policy'
}
```

## Basic Text Customization

Override any text by providing a `texts` object:

```javascript
CookieDialog.init({
  texts: {
    title: 'Cookie Settings',
    description: 'This website uses cookies to enhance your browsing experience.',
    acceptAll: 'Accept All Cookies',
    rejectAll: 'Only Essential'
  }
});
```

## Multi-Language Support

### Method 1: Dynamic Language Detection

```javascript
// Detect user's language
const userLang = navigator.language.substring(0, 2);

const translations = {
  en: {
    title: 'Cookie Preferences',
    description: 'We use cookies to improve your experience.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All'
  },
  es: {
    title: 'Preferencias de Cookies',
    description: 'Utilizamos cookies para mejorar su experiencia.',
    acceptAll: 'Aceptar Todas',
    rejectAll: 'Rechazar Todas'
  },
  fr: {
    title: 'Préférences des Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience.',
    acceptAll: 'Tout Accepter',
    rejectAll: 'Tout Rejeter'
  }
};

CookieDialog.init({
  texts: translations[userLang] || translations.en
});
```

### Method 2: Server-Side Language

```javascript
// Assuming you have a server-side language variable
const serverLang = '{{ user_language }}'; // PHP, JSP, etc.

const getTexts = (lang) => {
  switch(lang) {
    case 'de':
      return {
        title: 'Cookie-Einstellungen',
        description: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.',
        acceptAll: 'Alle Akzeptieren',
        rejectAll: 'Alle Ablehnen'
      };
    case 'it':
      return {
        title: 'Impostazioni Cookie',
        description: 'Utilizziamo i cookie per migliorare la tua esperienza.',
        acceptAll: 'Accetta Tutti',
        rejectAll: 'Rifiuta Tutti'
      };
    default:
      return {}; // Use defaults
  }
};

CookieDialog.init({
  texts: getTexts(serverLang)
});
```

## Complete Translation Examples

### Spanish

```javascript
CookieDialog.init({
  texts: {
    title: 'Configuración de Cookies',
    description: 'Utilizamos cookies para mejorar su experiencia en nuestro sitio web.',
    acceptAll: 'Aceptar Todas',
    rejectAll: 'Rechazar Opcionales',
    manageSettings: 'Gestionar Configuración',
    save: 'Guardar Preferencias',
    close: 'Cerrar',
    necessary: 'Necesarias',
    analytics: 'Analíticas',
    marketing: 'Marketing',
    privacyPolicy: 'Política de Privacidad'
  }
});
```

### German

```javascript
CookieDialog.init({
  texts: {
    title: 'Cookie-Einstellungen',
    description: 'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.',
    acceptAll: 'Alle Akzeptieren',
    rejectAll: 'Optionale Ablehnen',
    manageSettings: 'Einstellungen Verwalten',
    save: 'Einstellungen Speichern',
    close: 'Schließen',
    necessary: 'Notwendig',
    analytics: 'Analytisch',
    marketing: 'Marketing',
    privacyPolicy: 'Datenschutzrichtlinie'
  }
});
```

### French

```javascript
CookieDialog.init({
  texts: {
    title: 'Paramètres des Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
    acceptAll: 'Tout Accepter',
    rejectAll: 'Rejeter les Optionnels',
    manageSettings: 'Gérer les Paramètres',
    save: 'Sauvegarder les Préférences',
    close: 'Fermer',
    necessary: 'Nécessaires',
    analytics: 'Analytiques',
    marketing: 'Marketing',
    privacyPolicy: 'Politique de Confidentialité'
  }
});
```

## Category Descriptions

You can also translate category descriptions:

```javascript
CookieDialog.init({
  categories: [
    {
      id: 'necessary',
      name: 'Esenciales',
      required: true,
      description: 'Necesarias para el funcionamiento básico del sitio web'
    },
    {
      id: 'analytics',
      name: 'Analíticas',
      required: false,
      description: 'Nos ayudan a entender cómo los visitantes usan nuestro sitio'
    }
  ]
});
```

## Advanced Multi-Language Setup

For complex multi-language sites, create a translation helper:

```javascript
class CookieDialogTranslations {
  constructor() {
    this.translations = {
      en: {
        texts: {
          title: 'Cookie Preferences',
          description: 'We use cookies to improve your experience.',
          acceptAll: 'Accept All',
          rejectAll: 'Reject All'
        },
        categories: [
          { id: 'necessary', name: 'Necessary', required: true },
          { id: 'analytics', name: 'Analytics', required: false }
        ]
      },
      es: {
        texts: {
          title: 'Preferencias de Cookies',
          description: 'Utilizamos cookies para mejorar su experiencia.',
          acceptAll: 'Aceptar Todas',
          rejectAll: 'Rechazar Todas'
        },
        categories: [
          { id: 'necessary', name: 'Necesarias', required: true },
          { id: 'analytics', name: 'Analíticas', required: false }
        ]
      }
    };
  }

  init(language = 'en') {
    const config = this.translations[language] || this.translations.en;
    
    CookieDialog.init({
      texts: config.texts,
      categories: config.categories
    });
  }
}

// Usage
const translator = new CookieDialogTranslations();
translator.init(navigator.language.substring(0, 2));
```

## RTL Language Support

For right-to-left languages like Arabic or Hebrew, you may need custom CSS:

```css
.cookiedialog[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

.cookiedialog[dir="rtl"] .cookiedialog-buttons {
  flex-direction: row-reverse;
}
```

Then apply the direction:

```javascript
CookieDialog.init({
  texts: {
    title: 'تفضيلات ملفات تعريف الارتباط',
    description: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك.',
    acceptAll: 'قبول الكل',
    rejectAll: 'رفض الاختيارية'
  }
});

// Set direction on dialog element
document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.querySelector('.cookiedialog');
  if (dialog) dialog.setAttribute('dir', 'rtl');
});
```