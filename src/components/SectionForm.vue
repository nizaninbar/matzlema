
<!--
  This is the section form where users can input details about the pipe section.

<template>
  <form @submit.prevent="submitSection" class="form">
    <div class="form-group">
      <label>מתא</label>
      <input v-model="section.from" required />
    </div>
    <div class="form-group">
      <label>לתא</label>
      <input v-model="section.to" required />
    </div>
    <div class="form-group">
      <label>קוטר (מ"מ)</label>
      <input v-model="section.diameter" type="number" required />
    </div>
    <div class="form-group">
      <label>סוג צינור</label>
      <input v-model="section.pipeType" required />
    </div>
    <div class="form-group">
      <label>אורך (מ')</label>
      <input v-model="section.length" type="number" required />
    </div>
    <div class="form-group">
      <label>כיוון צילום</label>
      <input v-model="section.direction" />
    </div>
    <div class="form-group">
      <label>מצב</label>
      <select v-model="section.status">
        <option value="תקין">תקין</option>
        <option value="לבדיקה">לבדיקה</option>
      </select>
    </div>
    <button type="submit" class="submit-button">הוסף מקטע</button>
  </form>
</template>
-->
<template>
  <form @submit.prevent="submitSection" class="form">
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
      <input v-model="section.diameter" type="number"  />
    </div>
    <div class="form-group">
      <label>סוג צינור</label>
      <select v-model="section.pipeType">
        <option value="PVC">PVC</option>
        <option value="PE">PE</option>
        <option value="פיברגלס">פיברגלס</option>
        <option value="ברזל">ברזל</option>
        <option value="אחר">אחר</option>
      </select>
    </div>
    <div class="form-group">
      <label>אורך (מ')</label>
      <input v-model="section.length" type="number"  />
    </div>
    <div class="form-group">
      <label>כיוון צילום</label>
      <input v-model="section.direction" />
    </div>
    <div class="form-group">
      <label>תיאור</label>
      <textarea v-model="section.status">

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
  pipeType: '',
  length: '',
  direction: '',
  status: 'תקין'
});

function submitSection() {
  emit('add-section', { ...section });
  Object.keys(section).forEach(k => section[k] = '');
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
