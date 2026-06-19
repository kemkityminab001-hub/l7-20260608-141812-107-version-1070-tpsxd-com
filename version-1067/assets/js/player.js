(function () {
    function attachPlayer(shell) {
        const video = shell.querySelector("video");
        const source = video ? video.querySelector("source") : null;
        const overlay = shell.querySelector(".player-overlay");
        const message = shell.querySelector(".player-message");

        if (!video || !source) {
            return;
        }

        const src = source.getAttribute("src");

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        if (src && window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showMessage("视频暂时无法播放，请稍后再试");
                }
            });
        } else if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        }

        function startPlayback() {
            hideOverlay();
            const playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    showMessage("点击视频控件即可继续播放");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", hideOverlay);
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    Array.from(document.querySelectorAll(".js-player")).forEach(attachPlayer);
})();
