---
title: Vue.js Integration
description: How to integrate CookieDialog with Vue.js applications
---

# Vue.js Integration

CookieDialog integrates seamlessly with Vue.js applications using composition API, options API, or Pinia.

## Vue 3 Composition API

```vue
<template>
  <div class="app">
    <header>
      <h1>My Vue App</h1>
      <button @click="showCookieSettings">Cookie Settings</button>
    </header>
    
    <main>
      <AnalyticsComponent v-if="hasAnalyticsConsent" />
      <div v-else>Analytics disabled</div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AnalyticsComponent from './components/AnalyticsComponent.vue'

const consent = ref(null)
const dialog = ref(null)

const hasAnalyticsConsent = computed(() => {
  return consent.value?.categories?.analytics || false
})

const showCookieSettings = () => {
  dialog.value?.show()
}

onMounted(() => {
  dialog.value = CookieDialog.init({
    position: 'bottom',
    theme: 'light',
    categories: [
      { id: 'necessary', name: 'Essential', required: true },
      { id: 'analytics', name: 'Analytics', required: false },
      { id: 'marketing', name: 'Marketing', required: false }
    ],
    onAccept: (consentData) => {
      consent.value = consentData
      console.log('Consent accepted:', consentData)
    },
    onReject: (consentData) => {
      consent.value = consentData
      console.log('Consent rejected:', consentData)
    },
    onChange: (consentData) => {
      consent.value = consentData
    }
  })

  // Get existing consent
  const existingConsent = dialog.value.getConsent()
  if (existingConsent) {
    consent.value = existingConsent
  }
})

onUnmounted(() => {
  dialog.value?.destroy()
})
</script>
```

## Vue 2 Options API

```vue
<template>
  <div class="app">
    <nav>
      <button @click="showSettings">Cookie Preferences</button>
    </nav>
    
    <GoogleAnalytics v-if="analyticsEnabled" />
    <FacebookPixel v-if="marketingEnabled" />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      consent: null,
      dialog: null
    }
  },
  
  computed: {
    analyticsEnabled() {
      return this.consent?.categories?.analytics || false
    },
    
    marketingEnabled() {
      return this.consent?.categories?.marketing || false
    }
  },
  
  methods: {
    showSettings() {
      this.dialog?.show()
    },
    
    handleAccept(consentData) {
      this.consent = consentData
      this.$emit('consent-changed', consentData)
    },
    
    handleReject(consentData) {
      this.consent = consentData
      this.$emit('consent-changed', consentData)
    }
  },
  
  mounted() {
    this.dialog = CookieDialog.init({
      position: 'bottom',
      categories: [
        { id: 'necessary', name: 'Essential', required: true },
        { id: 'analytics', name: 'Analytics', required: false },
        { id: 'marketing', name: 'Marketing', required: false }
      ],
      onAccept: this.handleAccept,
      onReject: this.handleReject,
      onChange: (consentData) => {
        this.consent = consentData
      }
    })
    
    // Check for existing consent
    const existingConsent = this.dialog.getConsent()
    if (existingConsent) {
      this.consent = existingConsent
    }
  },
  
  beforeDestroy() {
    this.dialog?.destroy()
  }
}
</script>
```

## Composable for Reusability

Create a Vue 3 composable:

```js
// composables/useCookieConsent.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useCookieConsent(config = {}) {
  const consent = ref(null)
  const isLoading = ref(true)
  const dialog = ref(null)

  const showSettings = () => {
    dialog.value?.show()
  }

  const resetConsent = () => {
    dialog.value?.resetConsent()
    consent.value = null
  }

  const getCategoryConsent = (category) => {
    return consent.value?.categories?.[category] || false
  }

  onMounted(() => {
    dialog.value = CookieDialog.init({
      ...config,
      onAccept: (consentData) => {
        consent.value = consentData
        config.onAccept?.(consentData)
      },
      onReject: (consentData) => {
        consent.value = consentData
        config.onReject?.(consentData)
      },
      onChange: (consentData) => {
        consent.value = consentData
        config.onChange?.(consentData)
      }
    })
    
    // Load analytics after CookieDialog initialization
    const hasExistingConsent = dialog.value.hasConsent()
    const existingConsent = hasExistingConsent ? dialog.value.getConsent() : null
    
    // Initialize analytics services with current consent
    initializeAnalytics(existingConsent)
    
    if (existingConsent) {
      consent.value = existingConsent
    }
    isLoading.value = false
  })

  onUnmounted(() => {
    dialog.value?.destroy()
  })

  return {
    consent: readonly(consent),
    isLoading: readonly(isLoading),
    showSettings,
    resetConsent,
    getCategoryConsent
  }
}
```

## Pinia Store

For state management with Pinia:

```js
// stores/cookieConsent.js
import { defineStore } from 'pinia'

export const useCookieConsentStore = defineStore('cookieConsent', {
  state: () => ({
    consent: null,
    dialog: null,
    isLoading: true
  }),

  getters: {
    hasConsent: (state) => state.consent !== null,
    
    getCategoryConsent: (state) => {
      return (category) => state.consent?.categories?.[category] || false
    },

    analyticsEnabled: (state) => {
      return state.consent?.categories?.analytics || false
    },

    marketingEnabled: (state) => {
      return state.consent?.categories?.marketing || false
    }
  },

  actions: {
    initDialog(config = {}) {
      this.dialog = CookieDialog.init({
        ...config,
        onAccept: (consentData) => {
          this.consent = consentData
          config.onAccept?.(consentData)
        },
        onReject: (consentData) => {
          this.consent = consentData
          config.onReject?.(consentData)
        },
        onChange: (consentData) => {
          this.consent = consentData
          config.onChange?.(consentData)
        }
      })
      
      // Load analytics after CookieDialog initialization
      const hasExistingConsent = this.dialog.hasConsent()
      const existingConsent = hasExistingConsent ? this.dialog.getConsent() : null
      
      // Initialize analytics services with current consent
      this.initializeAnalytics(existingConsent)
      
      if (existingConsent) {
        this.consent = existingConsent
      }
      this.isLoading = false
    },

    showSettings() {
      this.dialog?.show()
    },

    resetConsent() {
      this.dialog?.resetConsent()
      this.consent = null
    },

    destroyDialog() {
      this.dialog?.destroy()
      this.dialog = null
    }
  }
})
```

Using the Pinia store:

```vue
<template>
  <div class="app">
    <button @click="cookieStore.showSettings()">
      Cookie Settings
    </button>
    
    <div v-if="cookieStore.analyticsEnabled">
      Analytics is enabled
    </div>
  </div>
</template>

<script setup>
import { useCookieConsentStore } from '@/stores/cookieConsent'
import { onMounted, onUnmounted } from 'vue'

const cookieStore = useCookieConsentStore()

onMounted(() => {
  cookieStore.initDialog({
    position: 'bottom',
    categories: [
      { id: 'necessary', name: 'Essential', required: true },
      { id: 'analytics', name: 'Analytics', required: false }
    ]
  })
})

onUnmounted(() => {
  cookieStore.destroyDialog()
})
</script>
```

## Plugin for Global Usage

Create a Vue plugin:

```js
// plugins/cookieDialog.js
export default {
  install(app, options = {}) {
    let dialog = null

    app.config.globalProperties.$cookieDialog = {
      init(config) {
        if (!dialog) {
          dialog = CookieDialog.init({ ...options, ...config })
        }
        return dialog
      },
      
      show() {
        return dialog?.show()
      },
      
      getConsent() {
        return dialog?.getConsent()
      },
      
      getCategoryConsent(category) {
        return dialog?.getCategoryConsent(category)
      }
    }

    app.provide('cookieDialog', app.config.globalProperties.$cookieDialog)
  }
}
```

Register the plugin:

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import CookieDialogPlugin from './plugins/cookieDialog'

const app = createApp(App)

app.use(CookieDialogPlugin, {
  position: 'bottom',
  theme: 'light'
})

app.mount('#app')
```