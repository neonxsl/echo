# echo

echo is a lightweight, local music player built for kb navigation. #tabbed!

you cannot use tab asw!

> [!NOTE]
> this project only works on chromium based browsers as the File System Access API only exists on there!

live at: https://echo.neonxsl.dev

<img width="1626" height="977" alt="Screenshot 2026-09-29 at 9 18 32 pm" src="https://github.com/user-attachments/assets/bf1bbc1a-62f9-4be2-a8f5-71e550257a2e" />


---

## features
- play mp3, aac, alac and flac directly in the browser!
- local folder persistence: uses the modern File System Access API and IndexedDB to store directory handles, so u dont gotta pick the folder everytime
- bass reactive dynamic fx: cool glow effect around the album art that reacts based on song bass, uses a exponential curve fo tha smooooooth
- alac decoding! - chromium cant natively play alac files (apple lossless in m4a) so this transcodes it to wav whilst still keepin lossless quality
- metadata handling: extracts metadata from da songs and caches the id3 tags, bitrates and even album art in indexedDB to avoid re-parsin every single time
- lyric view!!! - thanks a ton to am-lyrics by binimum (ily) https://github.com/binimum/am-lyrics
- search feature and shuffle and playback controls: qol stuff

<img width="1291" height="975" alt="Screenshot 2026-09-30 at 12 36 00 pm" src="https://github.com/user-attachments/assets/81d3907e-41e1-4897-aeb6-d2de2c892db3" />

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

<img width="415" height="473" alt="Screenshot 2026-09-29 at 9 12 00 pm" src="https://github.com/user-attachments/assets/01e0e3ad-a39a-45cd-b1fa-4bc428e2cac1" />
<img width="451" height="501" alt="Screenshot 2026-09-29 at 9 15 46 pm" src="https://github.com/user-attachments/assets/ea6c5ee0-45d9-4387-957b-6055d54e6a5d" /> 

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
