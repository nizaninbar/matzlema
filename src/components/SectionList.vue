<template>
  <div class="container">
    <div id="pdf-content" class="report">
      <!-- Header -->
      <div class="report-header">
        <div class="logo-container">
          <img src="../assets/mazlema.png" alt="לוגו" class="logo" />
        </div>
        <div class="header-title">
          <div class="header-line"><span class="label">צלם מוסמך:</span><span class="value">דוד כהן</span></div>
          <div class="header-line"><span class="label">מס׳ תעודה:</span><span class="value">23774</span></div>
          <div class="header-line"><span class="label">כתובת:</span><span class="value">הירדן 2, מושב ישרש</span></div>
          <div class="header-line"><span class="label">מיקוד:</span><span class="value">76838</span></div>
          <div class="header-line"><span class="label">טל':</span><span class="value">054-6655305</span></div>
          <div class="header-line"><span class="label">טלפקס:</span><span class="value">08-6168321</span></div>
          <div class="header-line"><span class="label">דוא"ל:</span><span class="value">office@matzlema.co.il</span></div>
          <div class="header-line"><span class="label">ע.מ:</span><span class="value">035920024</span></div>
        </div>
        <div class="header-fields">
          <div class="field">
            <label>דו"ח:</label>
            <input v-model="reportNumber" />
          </div>
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
      <div class="page-break-avoid">
        <h2>סיכום דו"ח</h2>
        <p>סך הכל מקטעים: {{ sections.length }}</p>
        <p>סה"כ אורך: {{ sections.reduce((sum, section) => sum + (section.length || 0), 0) }} מ'</p>
        <textarea class="full-width" rows="10" >
          דו"ח זה נערך על ידי מערכת צילום צנרת אוטומטית. 
          כל המידע נאסף במהלך הצילום ונבדק על ידי צוות מקצועי.
          דו"ח זה מהווה תיעוד מלא של מצב הצנרת במועד הצילום.
          
        </textarea>

      </div>
    </div>
    <ExportButton :message="'דוח: ' + reportNumber + ' לקוח: ' + customerName + ' אתר: ' + location"/>
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
</script>

<style scoped>
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
  font-size: 12px;
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