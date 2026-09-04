<template>
  <form @submit.prevent="submitSection" class="form">
    <div class="form-group">
      <label>שיוך לקובץ</label>
      <input v-model="section.filename" placeholder="שם הקובץ" />
    </div>
    <div class="form-group" style="visibility: hidden"></div>

    <div class="form-group">
      <label>מתא</label>
      <input v-model="section.from" />
    </div>
    <div class="form-group">
      <label>לתא</label>
      <input v-model="section.to" />
    </div>
    <div class="form-group">
      <label>קוטר (מ"מ)</label>
      <input v-model="section.diameter" list="diameter-options" />
    </div>

    <div class="form-group">
      <label>סוג צינור</label>
      <select v-model="section.pipeType">
        <option v-for="type in PIPE_TYPES" :key="type" :value="type">{{ type }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>אורך (מ')</label>
      <input v-model="section.length" type="number" step="any" />
    </div>
    <div class="form-group">
      <label>כיוון צילום</label>
      <select v-model="section.direction">
        <option v-for="dir in DIRECTIONS" :key="dir" :value="dir">{{ dir }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>ממצאים</label>
      <textarea v-model="section.description"></textarea>
    </div>

    <button type="submit" class="submit-button">הוסף מקטע</button>
  </form>
</template>
<script setup>
import { reactive } from 'vue'
import { PIPE_TYPES, DIRECTIONS, SECTION_DEFAULTS } from '../constants/pipe'

const emit = defineEmits(['add-section'])
const section = reactive({
  from: '',
  to: '',
  diameter: '',
  length: '',
  sequence: 0,
  filename: '00',
  ...SECTION_DEFAULTS,
})

function submitSection() {
  emit('add-section', { ...section })
  section.description = SECTION_DEFAULTS.description
  section.length = ''
  section.sequence += 1
  section.filename = section.sequence.toString().padStart(2, '0')
}
</script>

<style scoped>
.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 460px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

input,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.submit-button {
  grid-column: 1 / -1;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>
