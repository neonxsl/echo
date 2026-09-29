export function initKeyboardNavigation({
    state,
    engine,
    playTrack,
    playNext,
    playPrev,
    onFilterTracks,
    dirPickerAction,
    onToggleShuffle,
}) {
    let selectedVisualIndex = 0;
    const searchInput = document.getElementById('search-input');
    const helpModal = document.getElementById('help-modal');
    const tabToast = document.getElementById('tab-toast');

    function warnTabBlocked() {
        if (!tabToast) return;
        tabToast.classList.add('visible');
        clearTimeout(tabToast._timer);
        tabToast._timer = setTimeout(() => {
            tabToast.classList.remove('visible');
        }, 1500);
    }

    function highlightSelectedTrack(index, shouldFocus = true) {
        const listItems = document.querySelectorAll('#track-list li');
        listItems.forEach((li, idx) => {
            const btn = li.querySelector('button');

            if (idx === index) {
                li.classList.add('keyboard-selected');
                if (shouldFocus && document.activeElement !== searchInput) {
                btn?.focus();}
                li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                li.classList.remove('keyboard-selected');
            }
        });
        
    }

    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Tab') {
            e.preventDefault();
            warnTabBlocked();
            return;
        }

        const isSearchFocused = document.activeElement === searchInput;

        if (isSearchFocused) {
            if (e.key === 'Escape') {
                e.preventDefault();
                searchInput.blur();
                searchInput.value = '';
                onFilterTracks('');
                highlightSelectedTrack(selectedVisualIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                searchInput.blur();
                playTrack(selectedVisualIndex);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const total = document.querySelectorAll('#track-list li').length;
                if (total > 0) {
                    selectedVisualIndex = (selectedVisualIndex + 1) % total;
                    highlightSelectedTrack(selectedVisualIndex);
                } 
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const total = document.querySelectorAll('#track-list li').length;
                if (total > 0) {
                    selectedVisualIndex = (selectedVisualIndex - 1 + total) % total;
                    highlightSelectedTrack(selectedVisualIndex);
                }
            }
            return; // this ONE LINE TOOK ME SO LONG TO FRICKING FIX
        }

        switch (e.key) {
            case '/':
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
                break;

                case 'o':
                case 'O':
                e.preventDefault();
                    if (typeof dirPickerAction === 'function') {
                        dirPickerAction();
                    } else if (dirPickerAction?.click) {
                        dirPickerAction.click();
                    }
                break;

                case 's':
                case 'S':
                    e.preventDefault();
                    onToggleShuffle?.();
                    break;

                case 'h':
                case 'H':
                    e.preventDefault();
                    if (helpModal) {
                        helpModal.classList.toggle('visible');
                    }
                    break;

                case 'Escape':
                    helpModal?.classList.remove('visible');
                    break;

                case ' ':
                    e.preventDefault();
                    if (engine.audio.paused) {
                        engine.play().catch(err => console.error('play error:', err));
                    } else {
                        engine.pause();
                    }
                    break;

                case 'n':
                case 'N':
                    e.preventDefault();
                    playNext();
                    break;

                case 'p':
                case 'P':
                    e.preventDefault();
                    playPrev();
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    if (engine.audio && !isNaN(engine.audio.duration)) {
                        engine.audio.currentTime = Math.min(engine.audio.duration, engine.audio.currentTime + 5);
                    }
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    if (engine.audio) {
                        engine.audio.currentTime = Math.max(0, engine.audio.currentTime - 5);
                    }
                    break;

                case 'ArrowDown':
                case 'j':
                case 'J': {
                    e.preventDefault();
                    const listItems = document.querySelectorAll('#track-list li');
                    if (listItems.length > 0) {
                        selectedVisualIndex = (selectedVisualIndex + 1) % listItems.length;
                        highlightSelectedTrack(selectedVisualIndex);
                    }
                    break;
                }

                case 'ArrowUp':
                case 'k':
                case 'K': {
                    e.preventDefault();
                    const listItems = document.querySelectorAll('#track-list li');
                    if (listItems.length > 0) {
                        selectedVisualIndex = (selectedVisualIndex - 1 + listItems.length) % listItems.length;
                        highlightSelectedTrack(selectedVisualIndex);
                    }
                    break;
                }

                case 'Enter': {
                    e.preventDefault();
                    const visibleButtons = document.querySelectorAll('#track-list li button');
                    if (visibleButtons[selectedVisualIndex]) {
                        visibleButtons[selectedVisualIndex].click();
                    }
                    break;
                }
            }
    });

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { capture: true, passive: false });

    ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'dragstart', 'drop'].forEach((type) => {
        window.addEventListener(type, (e) => {
            if (e.isTrusted) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, { capture: true });
    });
    
    searchInput?.addEventListener('input', (e) => {
        selectedVisualIndex = 0;
        onFilterTracks(e.target.value.toLowerCase().trim());
        highlightSelectedTrack(0, false);

    });

    return {
        setSelected(index) {
            selectedVisualIndex = index;
            highlightSelectedTrack(index, false);
        }
    }

}