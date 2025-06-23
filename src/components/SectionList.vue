<template>
  <div class="container">
    <div id="pdf-content" class="report">
      <!-- Header -->
      <div class="report-header page-break-avoid">
        <div class="logo-container">
          <img src="../assets/mazlema.png" alt="לוגו" class="logo" />
        </div>
        <h2>דו"ח צילום צנרת מס'<br/>{{ reportNumber }}</h2>
        <table >
          <thead>
            <td>מספר דו"ח</td>
            <td>מיקום</td>
            <td>&nbsp;ייעוד הצינור&nbsp;</td>
            <td>שם לקוח</td>
            <td>תאריך</td>
            <td>פרטים נוספים</td>
          </thead>
          <tr>
            <td><input v-model="reportNumber" /></td>
            <td><input v-model="location" /></td>
            <td>
              <select v-model="pipePurpose">
                <option value="מים">מים</option>
                <option value="ביוב">ביוב</option>
                <option value="ניקוז">ניקוז</option>
                <option value="השחלה">השחלה</option>
              </select>
            </td>
            <td><input v-model="customerName" /></td>
            <td><input type="date" v-model="reportDate" /></td>
            <td><input v-model="additionalInfo" /></td>
          </tr>
        </table>

        <table>
          <thead>
            <td>צלם מוסמך</td>
            <td>מס' תעודה</td>
            <td>כתובת</td>
            <td>מיקוד</td>
            <td>טל'</td>
            <td>טלפקס</td>
            <td>דוא"ל</td>
            <td>ע.מ</td>
          </thead>
          <tr>
            <td>דוד כהן</td>
            <td>23774</td>
            <td>הירדן 2, מושב ישרש</td>
            <td>76838</td>
            <td>054-6655305</td>
            <td>08-6168321</td>
            <td>office@matzlema.co.il</td>
            <td>035920024</td>
          </tr>
        </table>
        <!-- <div class="header-title">
          <div class="header-line"><span class="label">צלם מוסמך:</span><span class="value">דוד כהן</span></div>
          <div class="header-line"><span class="label">מס׳ תעודה:</span><span class="value">23774</span></div>
          <div class="header-line"><span class="label">כתובת:</span><span class="value">הירדן 2, מושב ישרש</span></div>
          <div class="header-line"><span class="label">מיקוד:</span><span class="value">76838</span></div>
          <div class="header-line"><span class="label">טל':</span><span class="value">054-6655305</span></div>
          <div class="header-line"><span class="label">טלפקס:</span><span class="value">08-6168321</span></div>
          <div class="header-line"><span class="label">דוא"ל:</span><span class="value">office@matzlema.co.il</span></div>
          <div class="header-line"><span class="label">ע.מ:</span><span class="value">035920024</span></div>
        </div> -->
      </div>



      <!-- Sections Title -->
      <h2>רשימת מקטעים</h2>

      <!-- Sections List -->
      <div class="sections-list">

        <div v-for="(section, i) in sections" :key="i" class="section-card page-break-avoid">
          <div class="section-controls">
            <button @click="moveUp(i)" :disabled="i === 0" title="העבר מעלה">🔼</button>
            <button @click="moveDown(i)" :disabled="i === sections.length - 1" title="העבר מטה">🔽</button>
            <button class="delete-section" @click="removeSection(i)" title="מחק מקטע">✖</button>
          </div>

          <div class="section-grid">

              <div>שיוך לקובץ</div>
              <div>מתא</div>
              <div>לתא</div>
              <div>קוטר (מ"מ)</div>
              <div>סוג</div>
              <div>אורך (מ')</div>
              <div>כיוון</div>

              <div class="grid-cell"><input v-model="section.filename" /></div>
              <div class="grid-cell"><input v-model="section.from" /></div>
              <div class="grid-cell"><input v-model="section.to" /></div>
              <div class="grid-cell"><input v-model="section.diameter" /></div>
              <div class="grid-cell">
                <select v-model="section.pipeType">
                  <option value="PVC">PVC</option>
                  <option value="פוליאתילן">פוליאתילן</option>
                  <option value="פיברגלס">פיברגלס</option>
                  <option value="פלדה">פלדה</option>
                  <option value="אסבסט">אסבסט</option>
                  <option value="פלדקס">פלדקס</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>
              <div class="grid-cell"><input v-model="section.length" /></div>
              <div class="grid-cell"><input v-model="section.direction" /></div>




          </div>

          <div class="field full-width">
            <label>תיאור</label>
            <textarea v-model="section.description" rows="3" class="description"></textarea>
            <div class="description-print">{{ section.description }}</div>
          </div>



        </div>
      </div>
      <div class="summary page-break-avoid">
        <h2>סיכום דו"ח</h2>
        <p>סך הכל מקטעים: {{ sections.length }}</p>
        <p>סה"כ אורך: {{ sections.reduce((sum, section) => sum + (section.length || 0), 0) }} מ'</p>
        <textarea class="full-width" rows="10" >
1. צולמו קיטעי {{ pipePurpose }}, ב{{ location }}
2. הקטעים שצולמו
        </textarea>
        <div class="signature">
          <img src="../assets/sig.jpg" alt="חתימה"  />
        </div>
      </div>
    </div>
    <ExportButton :message="'דוח: ' + reportNumber + ' לקוח: ' + customerName + ' אתר: ' + location "/>
  </div>
</template>


<script setup>
import { inject, ref } from 'vue';
import ExportButton from './ExportButton.vue';
const sections = inject('sections');
const customerName = ref('');
const reportDate = ref(new Date().toISOString().substr(0, 10));
const reportNumber = ref(0);
const location = ref('');
const pipePurpose = ref('ביוב');
function removeSection(index) {
  sections.value.splice(index, 1);
}
function moveUp(index) {
  if (index > 0) {
    const temp = sections.value[index];
    sections.value[index] = sections.value[index - 1];
    sections.value[index - 1] = temp;
  }
}

function moveDown(index) {
  if (index < sections.value.length - 1) {
    const temp = sections.value[index];
    sections.value[index] = sections.value[index + 1];
    sections.value[index + 1] = temp;
  }
}
</script>

<style scoped>
.description-print {
  display: none;
}

.section-controls {
  
  display: flex;
  flex-direction: row;
  gap: 18px;
}

.section-controls button {
  background: #eee;
  border: none;
  padding: 4px 6px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.section-controls button:hover {
  background: #ccc;
}

.header-title {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem 1.5rem;
  font-family: 'Segoe UI', Tahoma, sans-serif;
  direction: rtl;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin: 0 0 1rem 0;
}

.header-line {
  display: flex;
  gap: 0.25rem;
  font-size: 1rem;
  color: #333;
}

.header-line .label {
  font-weight: bold;
}

.header-line .value {
  font-weight: normal;
  direction: ltr; /* Keeps phone numbers, emails etc. readable */
}
.report {
  /* max-width: 800px; */

  margin: auto;
  font-size: 1rem;
  padding: 20px;
  overflow-y: auto;
  max-height: 75vh;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-container {
  width: 100%;
  margin-bottom: 10px;
}

.logo {
  
  height: auto; 
  width: 120px;
  
}
.signature{
  display: flex;
  flex-direction: column;
  direction: ltr;

}
.signature img {
  width: 120px;
  height: auto;
  margin: 25px;
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
  font-size: 13px;
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

.full-width {
  width: 100%;
}

.company-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  line-height: 1.6;
}

table{
  width: 100%;
  /* border-collapse: collapse; */
  /* border: 1px solid #ddd; */
  margin-bottom: 20px;
  text-align: center;
}
table th, table td {
  padding: 1px;
  border: 1px solid #ddd;
  text-align: center;
  
}
table thead {
  font-weight: bold;
  
}
table input {
  border: none;
  text-align: center;
}

table select {
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  border: none;

}

.section-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  /* gap: 8px; */
  /* margin-bottom: 12px; */
}

.section-grid input,
.section-grid select {

  border: none;

}

.section-grid div {
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin: 1px 0;
}
/* .grid-header{
  
  font-weight: bold;
  
  padding: 8px;
  
}

.grid-row {
  
  gap: 8px;
  padding: 8px;
  border-bottom: 1px solid #ddd;
} */

</style>