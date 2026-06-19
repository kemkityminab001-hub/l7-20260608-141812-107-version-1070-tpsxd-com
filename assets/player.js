function initVideoPlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('player-start');
    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = streamUrl;
    }

    function hideButton() {
        if (button) {
            button.classList.add('is-hidden');
        }
    }

    function startPlayback() {
        hideButton();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    attachStream();

    if (button) {
        button.addEventListener('click', startPlayback);
    }
    video.addEventListener('play', hideButton);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
}
