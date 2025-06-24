document.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.detail.target.id === 'song-list') {
        document.querySelectorAll('.play-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const songId = btn.getAttribute('data-id');
                const songTitle = btn.getAttribute('data-title');
                const audio = document.getElementById('audio-player');
                audio.src = `/api/v1/songs/${songId}/stream`;
                audio.play();
                document.getElementById('player').classList.remove('hidden');
                document.getElementById('now-playing').textContent = `Now Playing: ${songTitle}`;
            });
        });
    }
});
