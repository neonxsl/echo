import { parseBlob } from 'https://cdn.jsdelivr.net/npm/music-metadata@11.16.1/+esm';

export async function parseTrackMetadata(file) {
    const fallbackTitle = file.name.replace(/\.[^/.]+$/, '');

    try {
        const { common, format} = await parseBlob(file);

        let coverURL = null;
            let coverBlob = null;
        if (common.picture && common.picture.length > 0) {
            const pic = common.picture[0];
            coverBlob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
            coverURL = URL.createObjectURL(coverBlob);
        }

        return {
            title: common.title || fallbackTitle,
            artist: common.artist || 'unknown artist',
            album: common.album || 'unknown album',
            year: common.year || '1970', // reference lol
            genre: Array.isArray(common.genre) ? common.genre.join(', ') : (common.genre || ''), // traditional chinese music is fire
            bitrate: format.bitrate ? (format.bitrate / 1000).toFixed(0) + ' kbps' : '',
            coverURL,
            coverBlob,
        };
    } catch (error) {
        console.warn('no metadata for you!', error);
        return {
            title: fallbackTitle,
            artist: 'unknown artist',
            album: 'unknown album',
            year: '1970',
            genre: '',
            bitrate: '',
            coverURL: null,
        };
    }
}