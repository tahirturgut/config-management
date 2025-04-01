const { deleteField } = require('firebase/firestore');
const admin = require('../config/firebase');
const db = admin.firestore();

const getAllConfigs = async () => {
  const snapshot = await db.collection('configs').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    content: doc.data().content,
    description: doc.data().description,
    createdAt: doc.data().createdAt,
    countryOverrides: doc.data().countryOverrides,
    version: doc.data().version
  }));
};

const getConfigByName = async (name) => {
  const doc = await db.collection('configs').doc(name).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    content: doc.data().content,
    description: doc.data().description,
    createdAt: doc.data().createdAt,
    countryOverrides: doc.data().countryOverrides,
    version: doc.data().version
  };
};

const setConfig = async (name, configData, userId) => {
  const configRef = db.collection('configs').doc(name);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(configRef);
    
    if (!doc.exists) {
      const newConfig = {
        ...configData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: userId,
        version: 1
      };
      
      transaction.set(configRef, newConfig);
      return {
        id: name,
        ...newConfig
      };
    }
    
    const currentData = doc.data();
    const updatedConfig = {
      ...currentData,
      ...configData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId,
      version: (currentData.version || 0) + 1
    };
    
    transaction.update(configRef, updatedConfig);
    return { id: name, ...updatedConfig };
  });
};

const deleteConfig = async (name) => {
  const doc = await db.collection('configs').doc(name).get();
  if (!doc.exists) return false;
  
  await db.collection('configs').doc(name).delete();
  return true;
};

module.exports = {
  getAllConfigs,
  getConfigByName,
  setConfig,
  deleteConfig
}; 