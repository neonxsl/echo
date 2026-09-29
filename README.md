# echo

echo is a lightweight, local music player built for kb navigation. #tabbed!

you cannot use tab asw!

> [!NOTE]
> this project only works on chromium based browsers as the File System Access API only exists on there!

---

## features
- play mp3, aac, alac and flac directly in the browser!
- local folder persistence: uses the modern File System Access API and IndexedDB to store directory handles, so u dont gotta pick the folder everytime
- bass reactive dynamic fx: cool glow effect around the album art that reacts based on song bass, uses a exponential curve fo tha smooooooth
- alac decoding! - chromium cant natively play alac files (apple lossless in m4a) so this transcodes it to wav whilst still keepin lossless quality
- metadata handling: extracts metadata from da songs and caches the id3 tags, bitrates and even album art in indexedDB to avoid re-parsin every single time
- lyric view!!! - thanks a ton to am-lyrics by binimum (ily) https://github.com/binimum/am-lyrics
- search feature and shuffle and playback controls: qol stuff

---

## kb controls

| key | action |
| --- | --- |
| J / Down Arrow | move selection down in playlist |
| K / Up Arrow | move selection up in playlist |
| Enter | play selected track |
| Space | toggle play / pause |
| N | next track |
| P | previous track |
| S | toggle shuffle mode (on / off) |
| Left Arrow | seek backward 5 seconds |
| Right Arrow | seek forward 5 seconds |
| / | focus search input (Esc to exit) |
| O | open folder dialog |
| H | toggle keyboard controls cheat sheet (help menu) |
| Tab | strictly banned (triggers notification) |

---

## stack
- frontend: vanilla js, html, css
- audio engine: html5 audio, web audio api
- storage: IndexedDB
- tag parsing: music-metadata-browser
- transcoding: ffmpeg
- lyrics: am-lyrics

---

### ai declaration

this project was made using less than 20% artifically generated code

usage of ai:
- code completion (vscode copilot)
- claude code for debugging (only used if was reaaally stuck)