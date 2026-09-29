import { MIME_TYPES } from './constants.js';

export const dom = {
    dirPicker: document.getElementById('dir-picker'),
    audio: document.getElementById('audio'),
    trackList: document.getElementById('track-list'),
    trackCount: document.getElementById('track-count'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    nowPlayingMeta: document.getElementById('now-playing-meta'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
};

function resolveMimeType(file) {
    if (file.type) return file.type;
    const ext = file.name.split('.').pop().toLowerCase();
    return MIME_TYPES[ext] || 'unknown/unknown';
}

export function renderPlaylist(tracks, onSelectTrack) {
    dom.trackList.innerHTML = '';
    dom.trackCount.textContent = tracks.length;

    tracks.forEach((file, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = file.name;
        button.addEventListener('click', () => onSelectTrack(index));
        button.dataset.index = index;
        button.dataset.mimeType = resolveMimeType(file);

        li.appendChild(button);
        dom.trackList.appendChild(li);
    } );
}

export function updateNowPlaying(file, index, totalTracks) {
    const mimeType = resolveMimeType(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

    dom.nowPlayingTitle.textContent = `${index + 1}. ${file.name}`;
    dom.nowPlayingMeta.textContent = `format: ${mimeType}, size: ${sizeMb} MB, track ${index + 1} of ${totalTracks}`;

    dom.btnNext.disabled = index === totalTracks - 1;
    dom.btnPrev.disabled = index === 0;

    const buttons = dom.trackList.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.style.fontWeight = idx === index ? 'bold' : 'normal';
    });
}
