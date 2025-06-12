<template>
  <div id="pdf-content" class="report">
    <!-- Header -->
    <div class="report-header">
      <div class="logo-container">
        <img src="../assets/mazlema.png" alt="לוגו" class="logo" />
      </div>
      <div class="header-fields">
        <div class="field">
          <label>שם לקוח:</label>
          <input v-model="customerName" />
        </div>
        <div class="field">
          <label>תאריך:</label>
          <input type="date" v-model="reportDate" />
        </div>
        <div class="field">
          <label>מיקום:</label>
          <input v-model="location" />
        </div>
      </div>
    </div>


    <!-- Sections Title -->
    <h2>רשימת מקטעים</h2>

    <!-- Sections List -->
    <div class="sections-list">
      <div v-for="(section, i) in sections" :key="i" class="section-card page-break-avoid">
        <div class="section-row">
          <div class="field">
            <label>מתא</label>
            <input v-model="section.from" />
          </div>
          <div class="field">
            <label>לתא</label>
            <input v-model="section.to" />
          </div>
          <div class="field">
            <label>קוטר (מ"מ)</label>
            <input v-model="section.diameter" type="number" />
          </div>
          <div class="field">
            <label>סוג</label>
            <select v-model="section.pipeType">
              <option value="PVC">PVC</option>
              <option value="PE">PE</option>
              <option value="פיברגלס">פיברגלס</option>
              <option value="ברזל">ברזל</option>
              <option value="אחר">אחר</option>
            </select>
          </div>
        </div>

        <div class="section-row">
          <div class="field">
            <label>אורך (מ')</label>
            <input v-model="section.length" type="number" />
          </div>
          <div class="field">
            <label>כיוון</label>
            <input v-model="section.direction" />
          </div>
        </div>

        <div class="field full-width">
          <label>תיאור</label>
          <textarea v-model="section.status" rows="3"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { inject, ref } from 'vue';

const sections = inject('sections');
const customerName = ref('');
const reportDate = ref(new Date().toISOString().substr(0, 10));
const location = ref('');
</script>

<style scoped>
.report {
  max-width: 800px;
  margin: auto;
  font-size: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: 90vh;
}

.report-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo-container {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.logo {
  width: 120px;
  height: auto;
}

.header-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  width: 100%;
}


.field {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
}

.field label {
  font-weight: bold;
  margin-bottom: 4px;
}

input,
select,
textarea {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.2;
  height: auto;
  box-sizing: border-box;
  vertical-align: middle;
}

input,
select {
  height: 30px;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9f9f9;
}

.section-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.full-width {
  width: 100%;
}

</style>