import { MIME_TYPES } from './constants.js';

export const dom = {
    dirPicker: document.getElementById('dir-picker'),
    audio: document.getElementById('audio'),
    trackList: document.getElementById('track-list'),
    trackCount: document.getElementById('track-count'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    nowPlayingMeta: document.getElementById('now-playing-meta'),
    nowPlayingArtist: document.getElementById('now-playing-artist'),
    nowPlayingAlbum: document.getElementById('now-playing-album'),
    nowPlayingYear: document.getElementById('now-playing-year'),
    nowPlayingDetails: document.getElementById('now-playing-details'),
    nowPlayingArt: document.getElementById('now-playing-art'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    artworkWrapper: document.querySelector('.artwork-wrapper'),
};

function resolveMimeType(file) {
    if (!file) return 'Unknown';
    if (file.type) return file.type;
    const fileName = file.name || '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    return MIME_TYPES[ext] || 'Unknown';
}

export function renderPlaylist(tracks, onSelectTrack) {
    dom.trackList.innerHTML = '';
    dom.trackCount.textContent = tracks.length;

    tracks.forEach((track, index) => {
        const li = document.createElement('li');

        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.index = index;

        const img = document.createElement('img');
        img.width = 24;
        img.height = 24;
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '10px';
        img.alt = 'cover art';
        img.hidden = !track.coverURL;
        if (track.coverURL) {
            img.src = track.coverURL;
        }

        const label = document.createElement('span');
        label.innerHTML = `<strong>${track.title}</strong> - <small>${track.artist}</small>`;

        button.appendChild(img);
        button.appendChild(label);
        button.addEventListener('click', () => onSelectTrack(index));

        li.appendChild(button);
        dom.trackList.appendChild(li);
    });

    
}

export function updateTrackItem(index, track) {
    const li = dom.trackList.children[index];
    if (!li) return;

    const button = li.querySelector('button');
    if (!button) return;

    let img = button.querySelector('img');
    if (!img) {
        img = document.createElement('img');
        img.width = 24;
        img.height = 24;
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '10px';
        img.alt = 'cover art';
        button.prepend(img);
    }
    
    if (track.coverURL) {
        img.src = track.coverURL;
        img.hidden = false;
    }

    let span = button.querySelector('span');
    if (!span) {
        span = document.createElement('span');
        button.appendChild(span);
    }
    span.innerHTML = `<strong>${track.title}</strong> - <small>${track.artist}</small>`;
}

export function updateNowPlaying(track, index, totalTracks) {
    const file = track.file || track;
    const mimeType = resolveMimeType(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

    if (track.coverURL) {
        dom.nowPlayingArt.src = track.coverURL;
        dom.nowPlayingArt.hidden = false;
    } else {
        dom.nowPlayingArt.hidden = true;
    }

    dom.nowPlayingTitle.textContent = `${track.title}`;
    dom.nowPlayingArtist.textContent = `${track.artist}`;
    dom.nowPlayingAlbum.textContent = `${track.album}${track.year ? ` (${track.year})` : ''}`;
  
    const detailParts = [];
    if (track.genre) detailParts.push(`genre: ${track.genre}`);
    if (track.bitrate) detailParts.push(`bitrate: ${track.bitrate}`);
    dom.nowPlayingDetails.textContent = detailParts.join(' | ');

    dom.nowPlayingMeta.textContent = `format: ${mimeType} | size: ${sizeMb} MB`;


    dom.btnNext.disabled = index === totalTracks - 1;
    dom.btnPrev.disabled = index === 0;

    if (track.coverURL) {
        dom.nowPlayingArt.src = track.coverURL;
        dom.nowPlayingArt.hidden = false;
        dom.artworkWrapper.style.setProperty('--art-glow', `url("${track.coverURL}")`);
    } else {
        dom.nowPlayingArt.hidden = true;
        dom.artworkWrapper.style.removeProperty('--art-glow');
    }

    const buttons = dom.trackList.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.style.fontWeight = idx === index ? 'bold' : 'normal';
    });
}
