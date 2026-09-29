import { SUPPORTED_EXTENSIONS } from './constants.js';

function stripExtension(filename) {
    const lowerName = filename.toLowerCase();
    for (const ext of SUPPORTED_EXTENSIONS) {
        if (lowerName.endsWith(ext.toLowerCase())) {
            return filename.slice(0, -ext.length);
        }
    }
    return filename;
}

export class AudioEngine {
    constructor(audioElement) {
        this.audio = audioElement;
        this.currentBlobUrl = null;
        this.onTrackEnded = null;

        this.audio.addEventListener('ended', () => {
            if (typeof this.onTrackEnded === 'function') {
                this.onTrackEnded();
            }
        });
    }

    load(file) {
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
        }
        this.currentBlobUrl = URL.createObjectURL(file);
        this.audio.src = this.currentBlobUrl;
        this.updateMediaSession(file);
    }

    play() {
        return this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    updateMediaSession(file) {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: stripExtension(file.name),
            album: '',
            artist: '',
        });
    }

    setMediaSessionHandlers({ onPrev, onNext }) {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('previoustrack', onPrev);
        navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

}