import { dom, renderPlaylist, updateTrackItem, updateNowPlaying } from './ui.js';
import { AudioEngine } from './engine.js';
import { scanFolder } from './indexer.js';
import { parseTrackMetadata } from './metadata.js';
import { initKeyboardNavigation } from './keyboard.js';
import { saveFolderHandle, getSavedFolderHandle, getFilesFromDirectory, getCachedMeta, setCachedMeta } from './storage.js';

const state = {
    tracks: [],
    filteredTracks: [],
    currentIndex: -1,
};

const engine = new AudioEngine(dom.audio);
const lyricsView = document.getElementById('lyrics-view');
const btnPlayPause = document.getElementById('btn-play-pause');

function getActiveList() {
    return state.filteredTracks.length > 0 ? state.filteredTracks : state.tracks;
}

function loadTrackList(rawFiles) {
    if (!rawFiles || rawFiles.length === 0) {
        alert('no supported audio files detected');
        return;
    }

    const files = scanFolder(rawFiles);

    state.tracks = files.map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'unknown artist',
        album: 'unknown album',
        year: '1970',
        genre: '',
        bitrate: '',
        coverURL: null,
    }));

    state.filteredTracks = [];
    renderPlaylist(state.tracks, (selectedIndex) => {
        playTrack(selectedIndex);
    });
    playTrack(0);

    parseAllTracksMetadata();
}

export async function openFolder() {
    if ('showDirectoryPicker' in window) {
        try {
            const dirHandle = await window.showDirectoryPicker();
            await saveFolderHandle(dirHandle);
            const files = await getFilesFromDirectory(dirHandle);
            loadTrackList(files);
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Picker error:', err);
        }
    } else {
        dom.dirPicker.click();
    }
}

const pickerLabel = document.querySelector('.file-picker-label');
if (pickerLabel) {
    pickerLabel.addEventListener('click', (e) => {
        e.preventDefault();
        openFolder();
    });
}

async function restoreSavedFolder() {
    const handle = await getSavedFolderHandle();
    if (!handle) return;

    try {
        let permission = await handle.queryPermission({ mode: 'read' });

        if (permission === 'granted') {
            console.log('Permission already granted. Loading songs...');
            const files = await getFilesFromDirectory(handle);
            loadTrackList(files);
            return;
        }

        console.log('Permission is prompt. Waiting for keypress to restore...');
        
        const toast = document.createElement('div');
        toast.className = 'tab-toast visible';
        toast.innerHTML = `Found folder <b>"${handle.name}"</b>. Press <kbd>Enter</kbd> to load.`;
        document.body.appendChild(toast);

        const onGesture = async (e) => {
            if (e.type === 'click' || e.key === 'Enter' || e.key === ' ' || e.key?.toLowerCase() === 'o') {
                window.removeEventListener('keydown', onGesture);
                window.removeEventListener('click', onGesture);
                toast.remove();

                try {
                    permission = await handle.requestPermission({ mode: 'read' });
                    if (permission === 'granted') {
                        const files = await getFilesFromDirectory(handle);
                        loadTrackList(files);
                    }
                } catch (err) {
                    console.error('Error requesting permission on gesture:', err);
                }
            }
        };

        window.addEventListener('keydown', onGesture);
        window.addEventListener('click', onGesture);

    } catch (err) {
        console.error('Error restoring saved folder:', err);
    }
}

restoreSavedFolder();

if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
        if (engine.audio.paused) engine.play(); else engine.pause();
    });
}

engine.audio.addEventListener('play', () => {
    if (btnPlayPause) {
        btnPlayPause.disabled = false;
        btnPlayPause.innerHTML = '<kbd>Space</kbd> pause';
    }
});

engine.audio.addEventListener('pause', () => {
    if (btnPlayPause) {
        btnPlayPause.disabled = false;
        btnPlayPause.innerHTML = '<kbd>Space</kbd> play';
    }
});

dom.audio.addEventListener('timeupdate', () => {
    if (lyricsView) {
        lyricsView.currentTime = dom.audio.currentTime * 1000;
    }
});

function updateLyrics(track) {
    if (!lyricsView || !track) return;
    lyricsView.songTitle = track.title || '';
    lyricsView.songArtist = (track.artist && track.artist !== 'unknown artist') ? track.artist : '';
    lyricsView.songAlbum = (track.album && track.album !== 'unknown album') ? track.album : '';
    lyricsView.query = `${track.title} ${lyricsView.songArtist}`.trim();
}

let stateChangeTimer = null;

engine.onStateChange = (status) => {
    clearTimeout(stateChangeTimer);
    dom.nowPlayingMeta.textContent = status;

    if (status === 'ready') {
        stateChangeTimer = setTimeout(() => {
            const list = getActiveList();
            const track = list[state.currentIndex];
            updateNowPlaying(track, state.currentIndex, list.length);
        }, 1000);
    }
};

function playTrack(index) {
    const list = getActiveList();
    if (index < 0 || index >= list.length) return;

    state.currentIndex = index;
    const track = list[index];

    engine.load(track);
    engine.play().catch(err => console.error('play error:', err));

    updateNowPlaying(track, index, list.length);
    updateLyrics(track);
    keyboardController?.setSelected(index);
}

function playNext() {
    const list = getActiveList();
    if (state.currentIndex < list.length - 1) {
        playTrack(state.currentIndex + 1);
    }
}

function playPrev() {
    if (state.currentIndex > 0) {
        playTrack(state.currentIndex - 1);
    }
}

function onFilterTracks(query) {
    if (!query) {
        state.filteredTracks = [];
        renderPlaylist(state.tracks, (idx) => playTrack(idx));
        return;
    }

    state.filteredTracks = state.tracks.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query)
    );

    renderPlaylist(state.filteredTracks, (idx) => playTrack(idx));
}

const keyboardController = initKeyboardNavigation({
    state,
    engine,
    playTrack,
    playNext,
    playPrev,
    onFilterTracks,
    dirPickerAction: openFolder,
});

engine.setMediaSessionHandlers({
    onPrev: playPrev,
    onNext: playNext,
});

engine.onTrackEnded = playNext;

async function parseAllTracksMetadata() {
    for (let i = 0; i < state.tracks.length; i++) {
        const track = state.tracks[i];
        const cacheKey = track.file.name + '_' + track.file.size;
        const cached = await getCachedMeta(cacheKey);

        if (cached) {
            if (cached.coverBlob) {
                cached.coverURL = URL.createObjectURL(cached.coverBlob);
            }
            Object.assign(track, cached);
            updateTrackItem(i, track);
            if (state.currentIndex === i) {
                updateNowPlaying(track, i, state.tracks.length);
                updateLyrics(track);
            }
            continue;
        }

        const meta = await parseTrackMetadata(track.file);
        Object.assign(track, meta);
        updateTrackItem(i, track);

        if (state.currentIndex === i) {
            updateNowPlaying(track, i, state.tracks.length);
            updateLyrics(track);
        }

        setCachedMeta(cacheKey, meta);
        await new Promise(r => setTimeout(r, 0));
    }
}

dom.btnNext.addEventListener('click', playNext);
dom.btnPrev.addEventListener('click', playPrev);