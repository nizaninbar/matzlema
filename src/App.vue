
<template>
  <div class="app">
    <!-- <h1>דו\"ח צילום צנרת</h1> -->
    <div class="layout">
      <SectionForm @add-section="addSection" />


      <SectionList :sections="sections" />
    </div>
  </div>
</template>


<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue';
import SectionForm from './components/SectionForm.vue';
import SectionList from './components/SectionList.vue';








const hasUnsavedChanges = ref(true) // set to true if something changes

function handleBeforeUnload(e) {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = '' // This triggers the browser's default dialog
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 

const sections = ref([]);
function addSection(section) {
  sections.value.push(section);
}
provide('sections', sections);
</script>

<style scoped>
.layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  height: 100vh;
  padding: 20px;
}

.layout > *:first-child {
  flex: 1; /* הטופס */
  min-width: 300px;
}

.layout > *:last-child {
  flex: 2; /* רשימת המקטעים */
}
</style>
