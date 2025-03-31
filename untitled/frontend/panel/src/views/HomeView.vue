<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/config'
import { useCountryStore } from '../stores/country'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const countryStore = useCountryStore()
const toast = useToast()
const confirm = useConfirm()

const isLoading = ref(false)
const newConfigName = ref('')
const newConfigValue = ref('')
const newConfigDescription = ref('')
const showEditDialog = ref(false)
const selectedConfig = ref(null)
const editedId = ref('')        // New reactive variable for the edited config key
const editConfigValue = ref('')
const editConfigDescription = ref('')
const editDefaultValue = ref('')
const availableCountries = computed(() => countryStore.countries)
const showDeleteDialog = ref(false)
const configToDelete = ref(null)

const sortDirection = ref({
  parameterKey: false,
  value: false,
  description: false,
  date: false
})

onMounted(async () => {
  isLoading.value = true
  try {
    await configStore.fetchConfigs()
  } catch (error) {
    // Handle error if needed
  } finally {
    isLoading.value = false
  }
})

const toggleSort = (column) => {
  sortDirection.value[column] = !sortDirection.value[column]
  const sortedConfigs = [...configStore.configs]
  
  switch (column) {
    case 'parameterKey':
      sortedConfigs.sort((a, b) => {
        const aValue = a.id ? a.id.toLowerCase() : ''
        const bValue = b.id ? b.id.toLowerCase() : ''
        return sortDirection.value[column] 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      })
      break
      
    case 'value':
      sortedConfigs.sort((a, b) => {
        const aValue = typeof a.content === 'object' ? JSON.stringify(a.content) : (a.content || '')
        const bValue = typeof b.content === 'object' ? JSON.stringify(b.content) : (b.content || '')
        return sortDirection.value[column] 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      })
      break
      
    case 'description':
      sortedConfigs.sort((a, b) => {
        const aValue = a.description ? a.description.toLowerCase() : ''
        const bValue = b.description ? b.description.toLowerCase() : ''
        return sortDirection.value[column] 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      })
      break
      
    case 'date':
      sortedConfigs.sort((a, b) => {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        
        let dateA, dateB;
        
        if (a.createdAt && typeof a.createdAt.toDate === 'function') {
          dateA = a.createdAt.toDate().getTime()
        } else if (a.createdAt && typeof a.createdAt === 'object' && ('_seconds' in a.createdAt || 'seconds' in a.createdAt)) {
          const seconds = a.createdAt._seconds || a.createdAt.seconds || 0
          dateA = seconds * 1000
        } else {
          dateA = new Date(a.createdAt).getTime()
        }
        
        if (b.createdAt && typeof b.createdAt.toDate === 'function') {
          dateB = b.createdAt.toDate().getTime()
        } else if (b.createdAt && typeof b.createdAt === 'object' && ('_seconds' in b.createdAt || 'seconds' in b.createdAt)) {
          const seconds = b.createdAt._seconds || b.createdAt.seconds || 0
          dateB = seconds * 1000
        } else {
          dateB = new Date(b.createdAt).getTime()
        }
        
        return sortDirection.value[column] 
          ? dateA - dateB 
          : dateB - dateA
      })
      break
  }
  
  configStore.configs = sortedConfigs
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  let date;
  
  if (dateString && typeof dateString.toDate === 'function') {
    date = dateString.toDate();
  } else if (dateString && typeof dateString === 'object' && ('_seconds' in dateString || 'seconds' in dateString)) {
    const seconds = dateString._seconds || dateString.seconds || 0;
    date = new Date(seconds * 1000);
  } else {
    try {
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
    } catch (error) {
      return '-';
    }
  }
  
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Update the editConfig function to initialize editedId with the original config ID
const editConfig = (config) => {
  selectedConfig.value = config
  editedId.value = config.id  // Save the original ID into the new reactive variable
  editDefaultValue.value = typeof config.content === 'object' 
    ? JSON.stringify(config.content, null, 2) 
    : String(config.content || '')
  
  const userCountry = countryStore.currentCountry.code
  const hasCountryOverride = config.countryOverrides && config.countryOverrides[userCountry]
  
  if (hasCountryOverride) {
    editConfigValue.value = typeof config.countryOverrides[userCountry] === 'object'
      ? JSON.stringify(config.countryOverrides[userCountry], null, 2)
      : String(config.countryOverrides[userCountry] || '')
  } else {
    editConfigValue.value = ''
  }
  
  editConfigDescription.value = config.description || ''
  showEditDialog.value = true
}

const saveEditedConfig = async () => {
  if (!selectedConfig.value) return
  
  try {
    const originalId = selectedConfig.value.id;
    const newId = editedId.value.trim();
    
    const configData = {
      description: editConfigDescription.value,
      content: editDefaultValue.value,
    }
    
    if (selectedConfig.value.countryOverrides) {
      configData.countryOverrides = { ...selectedConfig.value.countryOverrides }
    }
    
    if (editConfigValue.value.trim() !== '') {
      configData.countryOverrides = {
        ...(configData.countryOverrides || {}),
        [countryStore.currentCountry.code]: editConfigValue.value
      }
    } else {
      if (configData.countryOverrides?.[countryStore.currentCountry.code]) {
        configData.countryOverrides[countryStore.currentCountry.code] = null
      }
    }
    
    if (configData.countryOverrides && Object.keys(configData.countryOverrides).length === 0) {
      configData.countryOverrides = null
    }

    // If the ID was changed, delete the configuration with the original ID
    if (originalId !== newId) {
      await configStore.deleteConfig(originalId)
    }
    
    await configStore.saveConfig(newId, configData)

    showEditDialog.value = false
    await configStore.fetchConfigs()
  } catch (error) {
    // Handle errors if needed
  }
}

const confirmDelete = (name) => {
  showDeleteDialog.value = true
  configToDelete.value = name
}

const handleDelete = async () => {
  try {
    await configStore.deleteConfig(configToDelete.value)
    showDeleteDialog.value = false
    configToDelete.value = null
  } catch (error) {
    // Handle errors if needed
  }
}

const createNewConfig = async () => {
  if (!newConfigName.value.trim()) {
    return
  }

  try {
    let parsedValue = newConfigValue.value
    if (newConfigValue.value && (newConfigValue.value.trim().startsWith('{') || newConfigValue.value.trim().startsWith('['))) {
      try {
        parsedValue = JSON.parse(newConfigValue.value)
      } catch (e) {
        // If JSON parsing fails, use original string
      }
    }

    const configData = {
      description: newConfigDescription.value,
      content: parsedValue,
    }

    await configStore.saveConfig(newConfigName.value, configData)
    
    newConfigName.value = ''
    newConfigValue.value = ''
    newConfigDescription.value = ''
  } catch (error) {
    // Handle errors if needed
  }
}

const getConfigValueForDisplay = (config) => {
  const userCountry = countryStore.currentCountry.code
  const countryOverride = config.countryOverrides?.[userCountry]
  
  if (countryOverride) {
    const value = typeof countryOverride === 'object' 
      ? JSON.stringify(countryOverride) 
      : countryOverride

    if (value && value.length > 20) {
      return value.substring(0, 20) + '...'
    }
    return value
  }
  
  const value = typeof config.content === 'object' 
    ? JSON.stringify(config.content) 
    : config.content

  if (value && value.length > 20) {
    return value.substring(0, 20) + '...'
  }
  return value
}

const renderConfigValue = (config) => {
  const userCountry = countryStore.currentCountry.code
  
  const hasCountryOverride = config.countryOverrides?.[userCountry] !== undefined
  
  const value = getConfigValueForDisplay(config)
  
  if (hasCountryOverride && userCountry !== 'TR') {
    return `<span class="country-value">${value}</span>`
  }
  
  return value
}
</script>

<template>
  <div class="config-list-container">
    <div v-if="isLoading" class="config-loading">
      <ProgressSpinner />
    </div>
    
    <div v-else-if="configStore.configs.length === 0" class="config-empty">
      <p>No configurations available yet.</p>
      <div class="empty-state-form">
        <div class="form-row">
          <div class="form-group">
            <label for="newParam">Parameter Key</label>
            <input type="text" id="newParam" class="p-inputtext" placeholder="Enter parameter name" v-model="newConfigName" />
          </div>
          <div class="form-group">
            <label for="newValue">Value</label>
            <input type="text" id="newValue" class="p-inputtext" placeholder="Enter value" v-model="newConfigValue" />
          </div>
          <div class="form-group">
            <label for="newDesc">Description</label>
            <input type="text" id="newDesc" class="p-inputtext" placeholder="Enter description" v-model="newConfigDescription" />
          </div>
          <div class="form-group form-button-group">
            <Button 
              label="Add Configuration" 
              icon="pi pi-plus"
              class="p-button-success" 
              @click="createNewConfig"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="config-table-container">
      <table class="config-table desktop-view">
        <thead>
          <tr>
            <th @click="toggleSort('parameterKey')" class="sortable-header">
              Parameter Key 
              <i class="pi" :class="[
                sortDirection.parameterKey ? 'pi-sort-up' : 'pi-sort-down',
                {'sort-active': sortDirection.parameterKey !== null}
              ]"></i>
            </th>
            <th @click="toggleSort('value')" class="sortable-header">
              Value 
              <i class="pi" :class="[
                sortDirection.value ? 'pi-sort-up' : 'pi-sort-down',
                {'sort-active': sortDirection.value !== null}
              ]"></i>
            </th>
            <th @click="toggleSort('description')" class="sortable-header">
              Description 
              <i class="pi" :class="[
                sortDirection.description ? 'pi-sort-up' : 'pi-sort-down',
                {'sort-active': sortDirection.description !== null}
              ]"></i>
            </th>
            <th @click="toggleSort('date')" class="sortable-header">
              Create Date 
              <i class="pi" :class="[
                sortDirection.date ? 'pi-sort-up' : 'pi-sort-down',
                {'sort-active': sortDirection.date !== null}
              ]"></i>
            </th>
            <th style="width: 180px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="config in configStore.configs" :key="config.id">
            <td>{{ config.id }}</td>
            <td v-html="renderConfigValue(config)"></td>
            <td>{{ config.description || '-' }}</td>
            <td>{{ formatDate(config.createdAt) }}</td>
            <td class="action-buttons">
              <Button 
                label="Edit" 
                class="p-button-primary p-button-sm web-btn" 
                style="background-color: #3B82F6 !important; border-color: #3B82F6 !important; font-weight: 800 !important;"
                @click="editConfig(config)"
              />
              <Button 
                label="Delete" 
                class="p-button-danger p-button-sm web-btn" 
                style="background-color: #EF4444 !important; border-color: #EF4444 !important; font-weight: 800 !important;"
                @click="confirmDelete(config.id)"
              />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td><input type="text" class="p-inputtext" placeholder="New Parameter" v-model="newConfigName" /></td>
            <td><input type="text" class="p-inputtext" placeholder="Value" v-model="newConfigValue" /></td>
            <td><input type="text" class="p-inputtext" placeholder="Description" v-model="newConfigDescription" /></td>
            <td></td>
            <td>
              <Button 
                label="ADD" 
                class="p-button-success p-button-sm web-btn" 
                style="width: 100%; background-color: #10B981 !important; border-color: #10B981 !important; font-weight: 800 !important;"
                @click="createNewConfig"
              />
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="mobile-view">
        <div class="config-card" v-for="config in configStore.configs" :key="config.id">
          <div class="config-card-body">
            <div class="config-card-item">
              <strong>Parameter Key:</strong> {{ config.id }}
            </div>
            <div class="config-card-item">
              <strong>Value:</strong> <span v-html="renderConfigValue(config)"></span>
            </div>
            <div class="config-card-item">
              <strong>Description:</strong> {{ config.description || '-' }}
            </div>
            <div class="config-card-item">
              <strong>Create Date:</strong> {{ formatDate(config.createdAt) }}
            </div>
          </div>
          <div class="config-card-footer">
            <Button 
              label="Edit" 
              class="p-button-primary p-button-sm mobile-btn edit-btn" 
              @click="editConfig(config)"
            />
            <Button 
              label="Del" 
              class="p-button-danger p-button-sm mobile-btn delete-btn" 
              @click="confirmDelete(config.id)"
            />
          </div>
        </div>

        <div class="config-card new-card">
          <div class="config-card-body">
            <div class="config-card-item">
              <strong>Parameter Key:</strong>
              <input type="text" class="p-inputtext" placeholder="Enter key" v-model="newConfigName" />
            </div>
            <div class="config-card-item">
              <strong>Value:</strong>
              <input type="text" class="p-inputtext" placeholder="Enter value" v-model="newConfigValue" />
            </div>
            <div class="config-card-item">
              <strong>Description:</strong>
              <input type="text" class="p-inputtext" placeholder="Enter description" v-model="newConfigDescription" />
            </div>
          </div>
          <div class="config-card-footer">
            <Button 
              label="ADD" 
              class="p-button-success p-button-sm mobile-btn add-btn"
              @click="createNewConfig"
            />
          </div>
        </div>
      </div>
    </div>
    
    <teleport to="body">
      <div v-if="showEditDialog" class="modal-overlay" @click="showEditDialog = false">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>Edit Configuration</h3>
            <button @click="showEditDialog = false" class="modal-close">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div v-if="selectedConfig" class="modal-content">
            <div class="form-field">
              <label class="field-label">Parameter Key</label>
              <!-- Changed binding from read-only to v-model on editedId -->
              <InputText
                v-model="editedId"
                class="modern-input"
                placeholder="Enter parameter key"
              />
            </div>
            
            <div class="form-field">
              <label class="field-label">
                Default Value
                <span class="default-value-tag">
                  Global
                </span>
              </label>
              <textarea 
                v-model="editDefaultValue" 
                rows="4" 
                class="modern-textarea" 
                placeholder="Enter default value"
              ></textarea>
            </div>

            <div class="form-field">
              <label class="field-label">
                Country-specific Value
                <span class="country-override-tag">
                  {{ countryStore.currentCountry.flag }} {{ countryStore.currentCountry.name }}
                </span>
              </label>
              <textarea 
                v-model="editConfigValue" 
                rows="4" 
                class="modern-textarea" 
                :placeholder="'Enter value specific to ' + countryStore.currentCountry.name"
              ></textarea>
              <small class="helper-tip">Leave empty to use the default value</small>
            </div>
            
            <div class="form-field">
              <label class="field-label">Description</label>
              <textarea 
                v-model="editConfigDescription" 
                rows="2" 
                class="modern-textarea" 
                placeholder="Enter configuration description"
              ></textarea>
            </div>
            
            <div class="modal-footer">
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                @click="showEditDialog = false" 
                class="p-button-text cancel-btn"
              />
              <Button 
                label="Save" 
                icon="pi pi-check" 
                @click="saveEditedConfig" 
                class="p-button-primary save-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <teleport to="body">
      <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
        <div class="modal-container delete-modal" @click.stop>
          <div class="modal-header">
            <h3>Delete Configuration</h3>
            <button @click="showDeleteDialog = false" class="modal-close">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <p class="delete-message">
              Are you sure you want to delete the "<strong>{{ configToDelete }}</strong>" configuration?
            </p>
            <div class="modal-footer">
              <Button 
                label="Cancel" 
                icon="pi pi-times" 
                @click="showDeleteDialog = false" 
                class="p-button-text cancel-btn"
              />
              <Button 
                label="Delete" 
                icon="pi pi-trash" 
                @click="handleDelete" 
                class="p-button-danger delete-confirmation-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.config-list-container {
  padding: 1.5rem;
  background-color: var(--background-color);
}

.custom-dialog .p-dialog {
  margin: auto !important;
}

.footer-button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.config-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
}

.config-loading,
.config-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #c0bfd4;
}

.empty-state-form {
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
  background-color: #000000;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #c0bfd4;
  font-size: 0.9rem;
}

.form-button-group {
  margin-top: 1rem;
}

.config-table-container {
  width: 100%;
  overflow-x: auto;
}

.config-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-background);
  color: #ffffff;
}

.config-table th,
.config-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #2a2a3c;
}

.config-table th {
  background-color: var(--card-background);
  font-weight: 600;
  cursor: pointer;
}

.config-table tbody tr:hover {
  background-color: #111111;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.config-table input,
.empty-state-form input {
  width: 100%;
  padding: 0.5rem;
  background-color: #323248;
  border: 1px solid #3f3f5a;
  color: #ffffff;
  border-radius: 4px;
}

.config-table input::placeholder,
.empty-state-form input::placeholder {
  color: #8d8da8;
}

.country-overrides-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.country-overrides-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #2a2a3c;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #c0bfd4;
}

.helper-text {
  color: var(--text-light);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.d-block {
  display: block;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.w-full {
  width: 100%;
}

@media (min-width: 768px) {
  .form-row {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .form-group {
    flex: 1;
    min-width: 200px;
  }
  
  .form-button-group {
    display: flex;
    align-items: flex-end;
  }
}

@media (max-width: 767px) {
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }
  
  .config-header {
    display: none;
  }
}

@media (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

.config-card {
  background-color: var(--card-background);
  border-radius: 30px;
  margin-bottom: 1.25rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.config-card-body {
  padding: 0.75rem 1rem;
}

.config-card-item {
  margin-bottom: 0.35rem;
  word-break: break-word;
}

.config-card-item strong {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  margin-right: 0.3rem;
}

.config-card-item input.p-inputtext {
  width: calc(100% - 130px);
  height: 36px;
  border-radius: 6px;
  background-color: #272735;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
}

.config-card-footer {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem 1rem;
}

.mobile-btn {
  padding: 0.25rem 1rem;
  font-weight: 1700;
  font-size: 0.9rem;
  border-radius: 8px;
}

.edit-btn {
  background-color: #3B82F6 !important;
  border-color: #3B82F6 !important;
}

.delete-btn {
  background-color: #EF4444 !important;
  border-color: #EF4444 !important;
}

.new-card {
  border: 1px dashed #5e72e4;
  background-color: #1a1a27;
}

.new-card .config-card-footer {
  background-color: transparent;
}

.new-card .config-card-body {
  padding: 1.25rem;
}

.new-card .config-card-item {
  margin-bottom: 0.85rem;
}

.new-card .config-card-item strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.new-card .config-card-item input.p-inputtext {
  width: 100%;
  margin-left: 0;
  display: block;
  height: 42px;
  font-size: 1rem;
  background-color: #272735;
}

.add-btn {
  background-color: #10B981 !important;
  border-color: #10B981 !important;
  color: white;
  font-weight: 700;
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  border-radius: 8px;
  text-transform: uppercase;
}

.config-value-readonly {
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  color: var(--text-light);
  font-family: monospace;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.p-inputtextarea {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  font-family: monospace;
  border-radius: 6px;
}

.p-fluid .p-inputtext {
  width: 100%;
}

.sortable-header {
  cursor: pointer;
  position: relative;
  padding-right: 24px !important;
  user-select: none;
}

.sortable-header i {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.sortable-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sortable-header:hover i {
  opacity: 1;
}

.sortable-header i.sort-active {
  opacity: 1;
  color: #3B82F6;
}

.country-dropdown-container {
  margin-bottom: 1rem;
}

.country-override-info {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.8rem;
  font-weight: normal;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.country-value {
  background-color: rgba(94, 114, 228, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border-left: 3px solid #5e72e4;
}

.default-value-info {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.8rem;
  font-weight: normal;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: rgba(94, 114, 228, 0.15);
  color: #5e72e4;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  background-color: var(--card-background);
  border-radius: 20px;
  width: 450px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
}

.modal-header {
  background-color: var(--card-background);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 1.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 34px;
  height: 34px;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.modal-content {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.form-field {
  margin-bottom: 24px;
}

.form-field:last-of-type {
  margin-bottom: 12px;
}

.field-label {
  display: flex;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
  align-items: center;
}

.modern-textarea {
  width: 100%;
  border-radius: 12px;
  padding: 12px 16px;
  background-color: #323248;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  transition: all 0.2s;
  resize: none;
}

.modern-textarea:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.modern-textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.25);
  background-color: #383850;
}

.modern-input {
  width: 100%;
  border-radius: 12px;
  padding: 12px 16px;
  background-color: #323248;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  transition: all 0.2s;
}

.modern-input:hover {
  border-color: rgba(255, 255, 255, 0.25);
}

.modern-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.25);
  background-color: #383850;
}

.default-value-tag, .country-override-tag {
  margin-left: 10px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
}

.default-value-tag {
  background-color: rgba(94, 114, 228, 0.15);
  color: #5e72e4;
}

.country-override-tag {
  background-color: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.helper-tip {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #a7a7c5;
  font-style: italic;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  min-width: 120px;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.cancel-btn {
  background-color: #3a3a4c;
  border-color: #3a3a4c;
  color: #ffffff;
}

.cancel-btn:hover {
  background-color: #444456;
  border-color: #444456;
}

.save-btn {
  background-color: #5e72e4;
  border-color: #5e72e4;
}

.save-btn:hover {
  background-color: #4a5bd4;
  border-color: #4a5bd4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(94, 114, 228, 0.3);
}

.web-btn {
  font-weight: 800;
}

.delete-modal {
  max-width: 400px;
}

.delete-message {
  color: var(--text-color);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem;
}

.delete-message strong {
  color: #ffffff;
}

.delete-confirmation-btn {
  background-color: #EF4444 !important;
  border-color: #EF4444 !important;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 500;
  min-width: 120px;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.delete-confirmation-btn:hover {
  background-color: #DC2626 !important;
  border-color: #DC2626 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}
</style>