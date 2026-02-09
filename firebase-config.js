// Firebase Configuration and Initialization
let db, auth, storage;

function initFirebase() {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:xxxxxxxxxxxxx"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    
    // Enable offline persistence
    db.enablePersistence()
        .catch((err) => {
            console.log('Persistence error:', err);
        });
    
    console.log('✅ Firebase initialized');
}

// Firestore Helper Functions
const FirebaseDB = {
    // Get document
    async getDoc(collection, docId) {
        try {
            const doc = await db.collection(collection).doc(docId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error getting document:', error);
            return null;
        }
    },

    // Get collection
    async getCollection(collectionName, whereClause = null, limit = null) {
        try {
            let query = db.collection(collectionName);
            
            if (whereClause) {
                query = query.where(whereClause.field, whereClause.operator, whereClause.value);
            }
            
            if (limit) {
                query = query.limit(limit);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting collection:', error);
            return [];
        }
    },

    // Add document
    async addDoc(collection, data) {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding document:', error);
            return null;
        }
    },

    // Update document
    async updateDoc(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating document:', error);
            return false;
        }
    },

    // Delete document
    async deleteDoc(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            return false;
        }
    },

    // Real-time listener
    onSnapshot(collection, callback, whereClause = null) {
        let query = db.collection(collection);
        
        if (whereClause) {
            query = query.where(whereClause.field, whereClause.operator, whereClause.value);
        }
        
        return query.onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(data);
        });
    }
};

// Storage Helper Functions
const FirebaseStorage = {
    // Upload file
    async uploadFile(path, file, onProgress = null) {
        try {
            const storageRef = storage.ref(path);
            const uploadTask = storageRef.put(file);
            
            if (onProgress) {
                uploadTask.on('state_changed', snapshot => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                });
            }
            
            await uploadTask;
            const downloadURL = await storageRef.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    },

    // Delete file
    async deleteFile(path) {
        try {
            await storage.ref(path).delete();
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    },

    // Get download URL
    async getDownloadURL(path) {
        try {
            return await storage.ref(path).getDownloadURL();
        } catch (error) {
            console.error('Error getting download URL:', error);
            return null;
        }
    }
};
