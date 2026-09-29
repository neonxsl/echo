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

    load(track) {
        this.currentFile = track.file;
        this.setSource(track.file);
        this.updateMediaSession(track);
    }

    async transcodeALAC(file) {
        if (this.isTranscoding) return;
        this.isTranscoding = true;
        try {
            if (this.onStateChange) this.onStateChange('transcoding');
            const waveBlob = await transcodeToWave(file);
            this.setSource(waveBlob);
            try {
                await this.play();
            } catch (playErr) {}
            if (this.onStateChange) this.onStateChange('ready');
        } catch (err) {
            console.error('error transcoding to alac', err);
        } finally {
            this.isTranscoding = false;
        }
    }

    initAnalyser(onBassupdate) {
        if (this.analyser) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
        const source = this.audioCtx.createMediaElementSource(this.audio);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        const binSize = this.audioCtx.sampleRate / this.analyser.fftSize;
        const startBin = Math.floor(20 / binSize);
        const endBin = Math.floor(256 / binSize);
        const buffer = new Uint8Array(this.analyser.frequencyBinCount);

        const render = () => {
            if (!this.audio.paused) {
                this.analyser.getByteFrequencyData(buffer);
                let sum = 0;
                let count = 0;
                for (let i = startBin; i <= endBin; i++) {
                    sum += buffer[i];
                    count++;
                }
                const bass = count ? sum / count / 255 : 50;
                onBassupdate(bass);

            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

    }

    play() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    updateMediaSession(track) {
        if (!('mediaSession' in navigator)) return;

        const artwork = track.coverUrl ? [{ src: track.coverURL, sizes: '512x512', type: 'image/jpeg' }] : [];

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            album: track.album,
            artwork: artwork
        });
    }

    setMediaSessionHandlers({ onPrev, onNext }) {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('previoustrack', onPrev);
        navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

}