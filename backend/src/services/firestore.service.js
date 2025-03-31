const admin = require('../config/firebase');
const db = admin.firestore();

class FirestoreService {

  async getConfigByName(name) {
    const configRef = db.collection('configurations').doc(name);
    const doc = await configRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }

  async getAllConfigs() {
    const configsRef = db.collection('configurations');
    const snapshot = await configsRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async setConfig(name, data, userId) {
    const configRef = db.collection('configurations').doc(name);
    const doc = await configRef.get();
    
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    
    const configData = {
      ...data,
      updatedBy: userId,
      updatedAt: timestamp,
    };
    
    if (!doc.exists) {
      configData.createdBy = userId;
      configData.createdAt = timestamp;
      configData.version = 1;
    } else {
      configData.version = (doc.data().version || 0) + 1;
    }
    
    if (doc.exists) {
      const historyRef = db.collection('configurations')
        .doc(name)
        .collection('history')
        .doc(`v${doc.data().version || 1}`);
        
      await historyRef.set({
        ...doc.data(),
        archivedAt: timestamp,
      });
    }
    
    await configRef.set(configData, { merge: true });
    
    const updatedDoc = await configRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
  
  async deleteConfig(name) {
    const configRef = db.collection('configurations').doc(name);
    const doc = await configRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await configRef.delete();
    return true;
  }

  async getConfigForCountry(name, countryCode) {
    const configRef = db.collection('configurations').doc(name);
    const doc = await configRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    
    if (data.countryOverrides && data.countryOverrides[countryCode]) {
      return {
        id: doc.id,
        ...data,
        ...data.countryOverrides[countryCode],
        countryOverrides: undefined
      };
    }
    
    return { id: doc.id, ...data };
  }
}

module.exports = new FirestoreService(); 