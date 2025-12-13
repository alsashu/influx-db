# Vue.js 3 -- Complete Interview Question Bank (10+ Years Experience)

## **1. Basic Level Questions**

### **1. What is Vue.js?**

Vue.js is a progressive JavaScript framework for building user
interfaces. It is lightweight, flexible, and focuses on the view layer.

### **2. What's new in Vue 3 compared to Vue 2?**

-   Composition API
-   Fragment, Teleport, Suspense
-   Proxy‑based reactivity
-   Better TypeScript support
-   Faster rendering

### **3. What is the Composition API?**

A set of APIs (e.g., `setup()`, `ref`, `reactive`) that allows logical
grouping and better reuse of components.

### **4. What is the difference between `ref` and `reactive`?**

-   `ref` → used for primitives & returns `.value`
-   `reactive` → used for objects & deep reactive

### **5. What are Lifecycle Hooks in Vue 3?**

-   `onMounted`
-   `onUpdated`
-   `onUnmounted`
-   `onBeforeMount`, `onBeforeUpdate`, etc.

------------------------------------------------------------------------

## **2. Intermediate Level**

### **1. Explain Vue reactivity.**

Vue 3 uses ES6 Proxies to intercept get/set operations and track
dependencies, enabling efficient rendering.

### **2. What are `computed` properties?**

Cached values evaluated based on reactive dependencies.

### **3. What is `watch` vs `watchEffect`?**

-   `watch` → specific sources\
-   `watchEffect` → runs immediately, tracks everything inside

### **4. What is Teleport?**

Used to render an element outside its parent DOM hierarchy.

``` html
<teleport to="#modals">
  <Modal />
</teleport>
```

### **5. What is Suspense in Vue 3?**

Handles async components with fallback UI.

------------------------------------------------------------------------

## **3. Advanced Level**

### **1. Explain Virtual DOM in Vue.**

Vue converts templates into VDOM nodes, compares them during updates
(diffing), and patches only changed parts.

### **2. How does Vue handle performance optimization?**

-   Tree-shaking
-   Compile-time optimization
-   Patch flags
-   Lazy loading components
-   Memoization via `v-memo`

### **3. What is Server-Side Rendering (SSR)?**

Rendering pages on the server for performance and SEO. Vue uses **Nuxt
3** or **Vite SSR**.

### **4. Explain Vuex vs Pinia.**

Pinia (Vue 3's recommended store): - Modular by default - TypeScript
friendly - DevTools integration - No mutations → only state & actions

### **5. Explain custom directives.**

Direct DOM manipulation logic.

``` js
app.directive('focus', {
  mounted(el) { el.focus(); }
})
```

------------------------------------------------------------------------

## **4. Machine Test / Coding Round Questions**

### **1. Create a Todo app using Composition API.**

``` vue
<script setup>
import { ref } from 'vue'

const todos = ref([])
const newTodo = ref('')

const addTodo = () => {
  todos.value.push({ id: Date.now(), text: newTodo.value })
  newTodo.value = ''
}
</script>

<template>
  <input v-model="newTodo" />
  <button @click="addTodo">Add</button>
  <ul>
    <li v-for="t in todos" :key="t.id">{{ t.text }}</li>
  </ul>
</template>
```

### **2. Debounce Search Input (Reusable Composable)**

``` js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 500) {
  const debounced = ref(value.value)

  watch(value, () => {
    clearTimeout(timer)
    timer = setTimeout(() => debounced.value = value.value, delay)
  })

  return debounced
}
```

### **3. Create a custom directive for infinite scroll.**

``` js
export default {
  mounted(el, binding) {
    el.addEventListener('scroll', () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        binding.value()
      }
    })
  }
}
```

### **4. Create a reusable pagination component.**

-   Props: page, pageSize, total
-   Emits: page-change

### **5. API Integration Test (Axios + Composition API)**

``` vue
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])

onMounted(async () => {
  const res = await axios.get('/api/users')
  users.value = res.data
})
</script>

<template>
  <div v-for="u in users" :key="u.id">{{ u.name }}</div>
</template>
```

------------------------------------------------------------------------

## **5. Scenario-Based Questions (10+ Years Level)**

### **1. How do you structure a large-scale Vue 3 application?**

-   Use atomic design
-   Use composables
-   Use Pinia stores
-   Use feature-based folder structure
-   Lazy load pages and modules

### **2. How do you optimize bundle size in Vue 3?**

-   Code splitting
-   Dynamic imports
-   Remove unused components
-   Use Vite build analyzer
-   Tree-shaking with `script setup`

### **3. How do you handle complex forms?**

-   Use `vee-validate`
-   Use composable-based reusable validation
-   Use schema-based validation (Yup/Zod)

### **4. Explain micro‑frontend architecture in Vue.**

-   Each module is an independently deployed Vue app
-   Shared libraries via module federation
-   Communication via events or shared stores

### **5. How do you secure a Vue SPA?**

-   Token handling (HttpOnly cookies preferred)
-   Route guards
-   Authorization roles on frontend + backend
-   Input sanitization
-   CSP, CORS, HTTPS

------------------------------------------------------------------------

## **6. High-Level System Design Questions**

### **1. How would you design a dashboard with real‑time updates?**

-   WebSockets / SignalR
-   Polling fallbacks
-   Virtualized lists for large datasets

### **2. How to build a performance-heavy canvas/graphics tool (like railway design)?**

-   Separate UI and canvas state
-   Use requestAnimationFrame
-   Use OffscreenCanvas for heavy tasks
-   Use Web Workers for computation
-   Use throttling and diff-based rendering

------------------------------------------------------------------------

## **7. Behavioral & Thought Process Questions**

### **1. How do you mentor junior Vue developers?**

-   Pair programming
-   Code reviews
-   Creating composable libraries
-   Teaching Vue patterns

### **2. How do you keep yourself updated?**

-   Vue RFCs
-   Vite releases
-   Evan You's updates
-   Community libraries

------------------------------------------------------------------------

## **8. Additional Deep-Dive Questions**

-   What are patch flags in Vue?
-   How does Vue optimize template compilation?
-   Explain hydration in SSR.
-   How does Vue handle async rendering?
-   Difference between shallowRef and shallowReactive?
-   What is defineExpose and defineEmits?
-   What is script setup and why is it preferred?

------------------------------------------------------------------------

**End of Document**
