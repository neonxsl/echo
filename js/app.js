import { dom, renderPlaylist, updateNowPlaying } from './ui.js';
import { AudioEngine } from './engine.js';
import { scanFolder } from './indexer.js';

const state = {
    tracks: [],
    currentIndex: -1,
};

const engine = new AudioEngine(dom.audio);

function playTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;

    state.currentIndex = index;
    const file = state.tracks[index];

    engine.load(file);
    engine.play().catch(err => console.error('bruh error:', err));
    updateNowPlaying(file, index, state.tracks.length);
}

function playNext() {
    if (state.currentIndex < state.tracks.length - 1) {
        playTrack(state.currentIndex + 1);
    }
}

function playPrev() {
    if (state.currentIndex > 0) {
        playTrack(state.currentIndex - 1);
    }
}

engine.setMediaSessionHandlers({
    onPrev: playPrev,
    onNext: playNext,
});

engine.onTrackEnded = playNext;

dom.dirPicker.addEventListener('change', (e) => {
    const tracks = scanFolder(e.target.files);

    if (tracks.length === 0) {
        alert('no supported audio files detected');
        return;
    }

    state.tracks = tracks;
    renderPlaylist(state.tracks, (selectedIndex) => {
        playTrack(selectedIndex);
    });
    playTrack(0);

});

dom.btnNext.addEventListener('click', playNext);
dom.btnPrev.addEventListener('click', playPrev);