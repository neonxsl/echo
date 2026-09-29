import { SUPPORTED_EXTENSIONS } from './constants.js';

export function scanFolder(fileList) {
    const files = Array.from(fileList);

    return files
    .filter(file => {
        const lowerName = file.name.toLowerCase();
        return SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext.toLowerCase()));
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}