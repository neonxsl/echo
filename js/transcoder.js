let scriptLoaded = false;

async function loadScript() {
    if (window.FFmpeg || scriptLoaded) return;
    scriptLoaded = true;

    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export async function transcodeToWave(file) {
    await loadScript();

    const { createFFmpeg } = window.FFmpeg;

    const ffmpeg = createFFmpeg({ 
        log: false,
        mainName: 'main',
        corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    });

    // you for some reason HAVE to use core-st... spend so long trynna fix it D:

    await ffmpeg.load();

    const inputName = `in_${Date.now()}.m4a`;
    const outputName = `out_${Date.now()}.wav`;

    const buf = await file.arrayBuffer();
    ffmpeg.FS('writeFile', inputName, new Uint8Array(buf));
    await ffmpeg.run('-i', inputName, '-c:a', 'pcm_s16le', outputName);

    const data = ffmpeg.FS('readFile', outputName);

    try {
    ffmpeg.FS('unlink', inputName);
    ffmpeg.FS('unlink', outputName);
    } catch (err) {
        console.warn('error cleaning up ffmpeg files', err);
    }

    return new Blob([data.buffer], { type: 'audio/wav' });
}   
