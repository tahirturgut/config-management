<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/config'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const isLoading = ref(true)
const isSaving = ref(false)
const isExistingConfig = ref(false)

const configName = computed(() => route.params.name)
const currentConfig = computed(() => configStore.currentConfig)

const configForm = ref({
  description: '',
  value: '',
})

const parseContent = (val) => {
  if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
    try {
      return JSON.parse(val)
    } catch (e) {
      return val
    }
  }
  return val
}

onMounted(async () => {
  try {
    if (configName.value) {
      await configStore.fetchConfig(configName.value)
      if (currentConfig.value) {
        isExistingConfig.value = true
        configForm.value = {
          description: currentConfig.value.description || '',
          value: currentConfig.value.content || '',
        }
      }
    }
  } catch (error) {
    console.error('Error fetching configuration:', error)
  } finally {
    isLoading.value = false
  }
})

const validateForm = () => {
  if (!configForm.value.value) return false

  if (typeof configForm.value.value === 'string' &&
      (configForm.value.value.trim().startsWith('{') ||
       configForm.value.value.trim().startsWith('['))) {
    try {
      JSON.parse(configForm.value.value)
    } catch (error) {
      return false
    }
  }
  return true
}

const saveConfig = async () => {
  if (!validateForm()) return

  isSaving.value = true
  try {
    const contentValue = parseContent(configForm.value.value)
    await configStore.saveConfig(configName.value, {
      description: configForm.value.description,
      content: contentValue
    })
    router.push('/')
  } catch (error) {
    console.error('Error saving configuration:', error)
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  router.push('/')
}
</script>

<template>
  <div class="config-edit-container">
    <div class="config-edit-header">
      <h1>{{ isExistingConfig ? `Edit ${configName}` : 'New Configuration' }}</h1>
      <div class="header-actions">
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          outlined
          @click="cancelEdit"
          class="mr-2"
        />
        <Button 
          label="Save" 
          icon="pi pi-save" 
          :loading="isSaving"
          @click="saveConfig"
          class="p-button-primary"
        />
      </div>
    </div>
    
    <div v-if="isLoading" class="config-loading">
      <ProgressSpinner />
    </div>
    
    <div v-else class="config-edit-content">
      <div class="config-edit-card">
        <div class="form-field">
          <label>Parameter Key</label>
          <InputText
            :value="configName"
            disabled
            class="config-name-input"
          />
        </div>
        
        <div class="form-field">
          <label>Value</label>
          <small class="helper-text">
            Enter the configuration value. For complex values, you can use JSON format.
          </small>
          <InputText
            v-model="configForm.value"
            class="config-value-input"
            placeholder="Enter configuration value"
          />
        </div>
        
        <div class="form-field">
          <label>Description</label>
          <small class="helper-text">
            Enter a description for this configuration parameter.
          </small>
          <InputText
            v-model="configForm.description"
            class="config-description-input"
            placeholder="Enter description"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-edit-container {
  padding: 1.5rem;
}

.config-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.config-edit-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
}

.config-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.config-edit-card {
  background-color: #2a2a3c;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #c0bfd4;
}

.helper-text {
  display: block;
  margin-bottom: 0.5rem;
  color: #a7a7c5;
  font-size: 0.85rem;
}

.config-name-input,
.config-value-input,
.config-description-input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  color: #ffffff;
}

.config-name-input {
  max-width: 400px;
  color: #a7a7c5;
}
</style>