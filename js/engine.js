import { SUPPORTED_EXTENSIONS } from './constants.js';
import { transcodeToWave } from './transcoder.js';

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

        this.currentFile = null;
        this.onStateChange = null;
        this.isTranscoding = false;

        this.audio.addEventListener('error', async () => {
            const error = this.audio.error;
            if (error && error.code === 4 && this.currentFile?.name.toLowerCase().endsWith('.m4a')) {
                await this.transcodeALAC(this.currentFile);
            }
        });

        this.audio.addEventListener('ended', () => {
            if (typeof this.onTrackEnded === 'function') {
                this.onTrackEnded();
            }
        });
    }

    setSource(blobOrFile) {
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
        }
        this.currentBlobUrl = URL.createObjectURL(blobOrFile);
        this.audio.src = this.currentBlobUrl;
    }

    load(file) {
        this.currentFile = file;
        this.setSource(file);
        this.updateMediaSession(file);
    }

    async transcodeALAC(file) {
        try {
            if (this.onStateChange) this.onStateChange('transcoding');
            const waveBlob = await transcodeToWave(file);
            this.setSource(waveBlob);
            await this.play();
            if (this.onStateChange) this.onStateChange('ready');
        } catch (err) {
            console.error('error transcoding to alac', err);
        }
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