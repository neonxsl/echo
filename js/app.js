import { dom, renderPlaylist, updateTrackItem, updateNowPlaying } from './ui.js';
import { AudioEngine } from './engine.js';
import { scanFolder } from './indexer.js';
import { parseTrackMetadata } from './metadata.js';

const state = {
    tracks: [],
    currentIndex: -1,
};

const engine = new AudioEngine(dom.audio);

engine.onStateChange = (status) => {
    dom.nowPlayingMeta.textContent = status;

}
function playTrack(index) {
    if (index < 0 || index >= state.tracks.length) return;

    state.currentIndex = index;
    const track = state.tracks[index];

    engine.load(track);

    engine.play().catch(err => console.error('bruh error:', err));


    updateNowPlaying(track, index, state.tracks.length);
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

async function parseAllTracksMetadata() {
    for (let i = 0; i < state.tracks.length; i++) {
        const track = state.tracks[i];
        const meta = await parseTrackMetadata(track.file);

        Object.assign(track, meta);
        updateTrackItem(i, track);

        if (state.currentIndex === i) {
            updateNowPlaying(track, i, state.tracks.length);
        }
    }
}




dom.dirPicker.addEventListener('change', (e) => {
    const tracks = scanFolder(e.target.files);

    if (tracks.length === 0) {
        alert('no supported audio files detected');
        return;
    }

    state.tracks = tracks.map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'unknown artist',
        album: 'unknown album',
        year: '1970',
        genre: '',
        bitrate: '',
        coverURL: null,
    }));
    renderPlaylist(state.tracks, (selectedIndex) => {
        playTrack(selectedIndex);
    });
    playTrack(0);

    parseAllTracksMetadata();

});

dom.btnNext.addEventListener('click', playNext);
dom.btnPrev.addEventListener('click', playPrev);