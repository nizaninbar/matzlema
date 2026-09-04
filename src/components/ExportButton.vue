<template>
  <button @click="exportToPDF" class="export-button">ייצוא לדוח PDF</button>
</template>

<script>
export default {
  props: {
    // The browser uses document.title as the suggested PDF filename, so this
    // string becomes the saved file's name.
    message: { type: String, required: true },
  },
  methods: {
    exportToPDF() {
      document.title = this.message
      window.print()
    },
  },
}
</script>

<style scoped>
.export-button {
  background-color: #28a745;
  color: white;
  font-size: 16px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin: 20px auto;
  display: block;
}

.export-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
}
</style>
