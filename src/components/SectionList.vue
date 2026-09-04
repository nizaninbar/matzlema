<template>
  <div class="container">
    <div id="pdf-content" class="report">
      <!-- Header -->
      <div class="report-header page-break-avoid">
        <div class="logo-container">
          <img :src="COMPANY.logo" alt="לוגו" class="logo" />
        </div>
        <h2>דו"ח צילום צנרת מס'<br />{{ reportNumber }}</h2>

        <div class="vertical-form">
          <div class="form-row">
            <div class="cell">
              <label>מספר דו"ח</label>
            </div>
            <div class="cell">
              <input v-model="reportNumber" />
            </div>
          </div>
          <div class="form-row">
            <div class="cell">
              <label>מיקום</label>
            </div>
            <div class="cell">
              <textarea
                v-model="location"
                ref="locationRef"
                @input="autoGrow($event)"
                class="auto-textarea"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="cell">
              <label>ייעוד הצינור</label>
            </div>
            <div class="cell">
              <select v-model="pipePurpose">
                <option v-for="purpose in PIPE_PURPOSES" :key="purpose" :value="purpose">
                  {{ purpose }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="cell">
              <label>שם לקוח</label>
            </div>
            <div class="cell">
              <textarea
                v-model="customerName"
                class="auto-textarea"
                @input="autoGrow($event)"
              ></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="cell">
              <label>תאריך</label>
            </div>
            <div class="cell">
              <input type="date" v-model="reportDate" />
            </div>
          </div>
          <div class="form-row">
            <div class="cell">
              <label>פרטים נוספים</label>
            </div>
            <div class="cell">
              <textarea
                v-model="additionalInfo"
                class="auto-textarea"
                @input="autoGrow($event)"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="vertical-form">
          <div v-for="row in COMPANY_DETAIL_ROWS" :key="row.label" class="form-row">
            <div class="cell">
              <label>{{ row.label }}</label>
            </div>
            <div class="cell">{{ row.value }}</div>
          </div>
        </div>
      </div>

      <h2>רשימת מקטעים</h2>

      <!-- Sections List -->
      <div class="sections-list">
        <div v-for="(section, i) in sections" :key="i" class="section-card page-break-avoid">
          <div class="section-controls">
            <button @click="moveUp(i)" :disabled="i === 0" title="העבר מעלה">🔼</button>
            <button @click="moveDown(i)" :disabled="i === sections.length - 1" title="העבר מטה">
              🔽
            </button>
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
            <div class="grid-cell">
              <input v-model="section.diameter" list="diameter-options" />
            </div>
            <div class="grid-cell">
              <select v-model="section.pipeType">
                <option v-for="type in PIPE_TYPES" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="grid-cell"><input type="number" v-model="section.length" step="any" /></div>
            <div class="grid-cell">
              <select v-model="section.direction">
                <option v-for="dir in DIRECTIONS" :key="dir" :value="dir">{{ dir }}</option>
              </select>
            </div>
          </div>

          <div class="field full-width description-field">
            <label>ממצאים</label>
            <textarea v-model="section.description" rows="3" class="description"></textarea>
            <div class="description-print">{{ section.description }}</div>
          </div>
        </div>
      </div>
      <div>
        <div>
          <!-- Hidden native file input -->
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            style="display: none"
          />

          <!-- Custom styled button or label -->
          <label for="fileInput" class="custom-file-upload"> צרף תמונה </label>
          <div v-if="images.length" class="onepage page-break-avoid">
            <h3>תמונות שנשלפו</h3>
            <div class="image-preview">
              <div v-for="(image, index) in images" :key="index" class="image-container">
                <button @click="removeImage(index)" class="remove-image">✖</button>
                <img :src="image" alt="Uploaded Image" class="uploaded-image" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="summary page-break-avoid onepage">
        <h2>סיכום דו"ח</h2>
        <p>סך הכל מקטעים: {{ sections.length }}</p>
        <p>סה"כ אורך: {{ sections.reduce((sum, section) => sum + (section.length || 0), 0) }} מ'</p>
        <p class="no-bold">1. צולמו קיטעי {{ pipePurpose }}, ב{{ location }}</p>
        <textarea class="full-width no-bold" rows="10" v-model="summaryText"></textarea>
        <div class="signature">
          <p>בברכה: {{ COMPANY.photographer }}</p>
          <img :src="COMPANY.signature" alt="חתימה" />
        </div>
      </div>
    </div>
    <div class="actions">
      <ExportButton
        :message="'דוח: ' + reportNumber + ' לקוח: ' + customerName + ' אתר: ' + location"
      />
      <button @click="downloadJSON" class="action-button">שמור דוח</button>
      <input
        id="handleUpload"
        type="file"
        accept="application/json"
        @change="handleUpload"
        class="action-button"
        style="display: none"
      />

      <!-- Custom styled button or label -->
      <label for="handleUpload" class="action-button"> טען דוח </label>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'
import ExportButton from './ExportButton.vue'
import { COMPANY, COMPANY_DETAIL_ROWS } from '../config/company'
import { PIPE_TYPES, DIRECTIONS, PIPE_PURPOSES, DEFAULT_PIPE_PURPOSE } from '../constants/pipe'
import { DEFAULT_SUMMARY_TEXT, DEFAULT_REPORT_NUMBER } from '../constants/report'

const sections = inject('sections')
const customerName = ref('')
const reportDate = ref(new Date().toISOString().substr(0, 10))
const reportNumber = ref(DEFAULT_REPORT_NUMBER)
const location = ref('')
const pipePurpose = ref(DEFAULT_PIPE_PURPOSE)
const additionalInfo = ref('')
const summaryText = ref(DEFAULT_SUMMARY_TEXT)

function autoGrow(event) {
  const el = event.target
  el.style.height = 'auto' // reset height
  el.style.height = el.scrollHeight + 'px' // set to new content height
}

function downloadJSON(filename = 'report.json') {
  const data = {
    reportNumber: reportNumber.value,
    customerName: customerName.value,
    reportDate: reportDate.value,
    location: location.value,
    pipePurpose: pipePurpose.value,
    additionalInfo: additionalInfo.value,
    sections: sections.value,
    images: images.value,
    summaryText: summaryText.value,
  }
  const dataStr = JSON.stringify(data, null, 2) // עם רווחים לקריאות
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  filename = reportNumber.value + '-' + customerName.value + '.json' // יצירת שם קובץ ייחודי
  // filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // ניקוי שם הקובץ
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
function handleUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result)

      sections.value = json.sections || []
      reportNumber.value = json.reportNumber || DEFAULT_REPORT_NUMBER
      customerName.value = json.customerName || ''
      reportDate.value = json.reportDate || new Date().toISOString().substr(0, 10)
      location.value = json.location || ''
      pipePurpose.value = json.pipePurpose || DEFAULT_PIPE_PURPOSE
      additionalInfo.value = json.additionalInfo || ''
      images.value = json.images || []
      summaryText.value = json.summaryText || DEFAULT_SUMMARY_TEXT
    } catch {
      alert('קובץ JSON שגוי')
    }
  }
  reader.readAsText(file)
}

function removeSection(index) {
  sections.value.splice(index, 1)
}
function moveUp(index) {
  if (index > 0) {
    const temp = sections.value[index]
    sections.value[index] = sections.value[index - 1]
    sections.value[index - 1] = temp
  }
}

function moveDown(index) {
  if (index < sections.value.length - 1) {
    const temp = sections.value[index]
    sections.value[index] = sections.value[index + 1]
    sections.value[index + 1] = temp
  }
}

const images = ref([])

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    images.value.push(URL.createObjectURL(file))
  }
}

function removeImage(index) {
  images.value.splice(index, 1)
}
</script>

<style scoped>
.actions {
  display: flex;
  gap: 10px;
}
.action-button {
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

.action-button:hover {
  background-color: #218838;
  transform: translateY(-1px);
}

.image-preview {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.image-preview img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  max-width: 100%;
  height: auto;
}

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

.report {
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
.signature {
  display: flex;
  flex-direction: column;
  direction: ltr;
}
.signature img {
  width: 120px;
  height: auto;
  margin: 2 0 0 25px;
}

.signature p {
  margin: 0 0 0 25px;
  font-size: 14px;
  font-weight: bold;
  /* text-align: right; */
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
  font-size: 0.9rem;
  line-height: 1.2;
  height: auto;
  box-sizing: border-box;
  vertical-align: middle;
  line-height: 1.5;
}

textarea {
  font-size: 1.1rem;
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

.section-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-left: -2px;
}

.section-grid input,
.section-grid select {
  border: none;
}

.section-grid div {
  text-align: center;
  font-weight: bold;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin: 1px 0;
}
.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  text-align: center;
}
.custom-file-upload:hover {
  background-color: #0056b3;
}

.vertical-form {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  max-width: 600px;
  margin-bottom: 50px;
}

.form-row {
  display: flex;
  align-items: flex-start;
}
.form-row label {
  padding: 5px;
  text-align: right;
}
.form-row div {
  width: 300px;
  font-weight: bold;
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
}

.form-row div input,
.form-row div select {
  flex: 1;
  padding: 0 10px 0;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 300px;
  text-align: right;
}

.form-row div {
  border: 1px solid #ddd;
  min-height: 33px;
  display: flex;
}

.description-field {
  border: 1px solid #ddd;
}
.summary {
  padding: 25px 0 0 0;
}
.summary p {
  font-weight: bold;
  margin: 0px 0 8px 0;
  padding: 0 10px;
}
.summary textarea {
  font-weight: bold;
  font-size: 1rem;
  font-family: 'Segoe UI', 'Heebo', sans-serif;
  padding: 0 10px;
}
.auto-textarea {
  display: block;
  width: 100%;
  resize: none;
  overflow: hidden;

  line-height: 1.1;
  /* min-height: 10px; */
  font-size: 14px;
  font-family: inherit;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin: 0;
  padding: 2px 10px 0 10px;

  height: 33px; /* גובה התחלתי */
}

.cell {
  flex: 1;
  display: flex;
  flex-direction: column;
}
h3 {
  margin: 15px;
}

.no-bold {
  font-weight: normal !important;
}

.remove-image {
  /* position: absolute;
  top: 5px;
  right: 5px; */
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.remove-image:hover {
  background: rgba(255, 0, 0, 0.8);
  color: white;
}
</style>
