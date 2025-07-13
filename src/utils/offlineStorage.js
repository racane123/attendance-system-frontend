// Offline storage utilities for PWA functionality

const DB_NAME = 'AttendanceCheckerDB';
const DB_VERSION = 1;

// Database stores
const STORES = {
  ATTENDANCE: 'attendance',
  STUDENTS: 'students',
  SUBJECTS: 'subjects',
  PENDING_ACTIONS: 'pendingActions',
  CACHE: 'cache'
};

class OfflineStorage {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores
        if (!db.objectStoreNames.contains(STORES.ATTENDANCE)) {
          const attendanceStore = db.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id', autoIncrement: true });
          attendanceStore.createIndex('studentId', 'studentId', { unique: false });
          attendanceStore.createIndex('subjectId', 'subjectId', { unique: false });
          attendanceStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
          const studentsStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
          studentsStore.createIndex('studentId', 'studentId', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
          const subjectsStore = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
          subjectsStore.createIndex('code', 'code', { unique: true });
        }

        if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
          const pendingStore = db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id', autoIncrement: true });
          pendingStore.createIndex('type', 'type', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  // Attendance methods
  async saveAttendance(attendance) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.ATTENDANCE], 'readwrite');
      const store = transaction.objectStore(STORES.ATTENDANCE);
      
      const request = store.add({
        ...attendance,
        timestamp: Date.now(),
        synced: false
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAttendance(filters = {}) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.ATTENDANCE], 'readonly');
      const store = transaction.objectStore(STORES.ATTENDANCE);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;
        
        // Apply filters
        if (filters.studentId) {
          results = results.filter(item => item.studentId === filters.studentId);
        }
        if (filters.subjectId) {
          results = results.filter(item => item.subjectId === filters.subjectId);
        }
        if (filters.date) {
          results = results.filter(item => {
            const itemDate = new Date(item.date).toDateString();
            const filterDate = new Date(filters.date).toDateString();
            return itemDate === filterDate;
          });
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Student methods
  async saveStudents(students) {
    await this.init();
    const transaction = this.db.transaction([STORES.STUDENTS], 'readwrite');
    const store = transaction.objectStore(STORES.STUDENTS);

    return Promise.all(students.map(student => {
      return new Promise((resolve, reject) => {
        const request = store.put({
          ...student,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }));
  }

  async getStudents() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.STUDENTS], 'readonly');
      const store = transaction.objectStore(STORES.STUDENTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Subject methods
  async saveSubjects(subjects) {
    await this.init();
    const transaction = this.db.transaction([STORES.SUBJECTS], 'readwrite');
    const store = transaction.objectStore(STORES.SUBJECTS);

    return Promise.all(subjects.map(subject => {
      return new Promise((resolve, reject) => {
        const request = store.put({
          ...subject,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }));
  }

  async getSubjects() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SUBJECTS], 'readonly');
      const store = transaction.objectStore(STORES.SUBJECTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Pending actions methods
  async addPendingAction(action) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_ACTIONS);
      
      const request = store.add({
        ...action,
        timestamp: Date.now(),
        retryCount: 0
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions() {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_ACTIONS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_ACTIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingAction(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PENDING_ACTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_ACTIONS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cache methods
  async setCache(key, data, ttl = 3600000) { // Default 1 hour TTL
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCache(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHE], 'readonly');
      const store = transaction.objectStore(STORES.CACHE);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const now = Date.now();
        if (now - result.timestamp > result.ttl) {
          // Remove expired cache
          this.removeCache(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeCache(key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility methods
  async clearAll() {
    await this.init();
    const transaction = this.db.transaction(Object.values(STORES), 'readwrite');
    
    return Promise.all(
      Object.values(STORES).map(storeName => {
        return new Promise((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  async getStorageInfo() {
    await this.init();
    const info = {};
    
    for (const storeName of Object.values(STORES)) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const count = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      info[storeName] = count;
    }
    
    return info;
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage; 