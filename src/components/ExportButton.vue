<template>
  <button @click="exportToPDF" class="export-button">
    ייצוא לדוח PDF
  </button>
</template>

<script setup>
import html2pdf from 'html2pdf.js';

function exportToPDF() {
  document.title = 'דו"ח 7073 , אתר: ראשון';
  window.print();
  // const element = document.getElementById('pdf-content');
  // html2pdf()
  //   .set({
  //     margin: 0.5,
  //     filename: 'דו"ח.pdf',
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  //   })
  //   .from(element)
  //   .save();
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
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin: 0 100px;
}

.export-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
}
</style>