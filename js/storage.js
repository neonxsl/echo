import { SUPPORTED_EXTENSIONS } from './constants.js';

const DB_NAME = 'echo-player-db';
const STORE_NAME = 'handles';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 2);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function getCachedMeta(key) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction('metadata', 'readonly');
        const req = tx.objectStore('metadata').get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
    });
}

export async function setCachedMeta(key, data) {
    const db = await openDB();
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(data, key);
}

export async function saveFolderHandle(handle) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(handle, 'savedFolder');
        tx.oncomplete = () => {
            console.log('Successfully saved folder handle to IndexedDB:', handle.name);
            resolve();
        };
        tx.onerror = () => reject(tx.error);
    });
}

export async function getSavedFolderHandle() {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get('savedFolder');
            req.onsuccess = () => {
                const handle = req.result || null;
                console.log('Retrieved from IndexedDB:', handle ? handle.name : 'No saved folder found');
                resolve(handle);
            };
            req.onerror = () => resolve(null);
        });
    } catch (err) {
        console.error('Error reading IndexedDB:', err);
        return null;
    }
}

function isSupportedAudioFile(fileName) {
    const lowerName = fileName.toLowerCase();
    return SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext.toLowerCase()));
}

export async function getFilesFromDirectory(dirHandle) {
    const files = [];

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && isSupportedAudioFile(entry.name)) {
            const file = await entry.getFile();
            files.push(file);
        } else if (entry.kind === 'directory') {
            const subFiles = await getFilesFromDirectory(entry);
            files.push(...subFiles);
        }
    }
    return files;
}