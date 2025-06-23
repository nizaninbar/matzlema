<template>
  <form @submit.prevent="submitSection" class="form">
    <div class="form-group">
      <label>שיוך לקובץ</label>
      <input v-model="section.filename" placeholder="שם הקובץ" />
    </div>
    <div class="form-group" style="visibility: hidden;">
    </div>

    <div class="form-group">
      <label>מתא</label>
      <input v-model="section.from"  />
    </div>
    <div class="form-group">
      <label>לתא</label>
      <input v-model="section.to"  />
    </div>
    <div class="form-group">
      <label>קוטר (מ"מ)</label>
      <select v-model="section.diameter" >
        <option value="110">110</option>
        <option value="160">160</option>
        <option value="200">200</option>
        <option value="225">225</option>
        <option value="250">250</option>
        <option value="300">300</option>
        <option value="315">315</option>
        <option value="335">335</option>
        <option value="400">400</option>
        <option value="450">450</option>
        <option value="500">500</option>
        <option value="600">600</option>
        <option value="800">800</option>
        <option value="1000">1000</option>
        <option value="1250">1250</option>
        <option value="*">אחר</option>
      </select>
    </div>

    <div class="form-group">
      <label>סוג צינור</label>
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
    <div class="form-group">
      <label>אורך (מ')</label>
      <input v-model="section.length" type="number" step="any" />
    </div>
    <div class="form-group">
      <label>כיוון צילום</label>
      <select v-model="section.direction">
        <option value="מורד הקו">מורד הקו</option>
        <option value="מעלה הקו">מעלה הקו</option>
      </select>
    </div>
    <div class="form-group">
      <label>תיאור</label>
      <textarea v-model="section.description">
      </textarea>
    </div>

    
    <button type="submit" class="submit-button">הוסף מקטע</button>
  </form>
  
</template>
<script setup>
import { reactive } from 'vue';


const emit = defineEmits(['add-section']);
const section = reactive({
  from: '',
  to: '',
  diameter: '',
  pipeType: 'PVC',
  length: '',
  direction: 'מורד הקו',
  description: 'תקין',
  sequence: 1,
  filename: '01',
  
});

function submitSection() {
  emit('add-section', { ...section });
  section.description = 'תקין'; // Reset status to default
  section.length = ''; // Reset length to empty
  section.sequence += 1; // Increment sequence for new section
  section.filename = section.sequence.toString().padStart(2, '0'); // Reset filename to empty

  // Object.keys(section).forEach(k => section[k] = '');
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
