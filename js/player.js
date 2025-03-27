// background music player
let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let playStatus = false; // false mean stop the music
let muteStatus = false;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    videoId: "HxkCT-vtm_I",
    playerVars: {
      playsinline: 1,
      loop: 1,
      playlist: "HxkCT-vtm_I",
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function updateVideoTitle() {
  if (player && player.getVideoData) {
    document.querySelector(
      ".player-info"
    ).innerHTML = `<a href='${player.getVideoUrl()}'>${
      player.getVideoData().title
    }</a>`;
  }
}

function onPlayerReady(event) {
  event.target.pauseVideo();
  player.setVolume(50);
  document.querySelector(
    ".player-info"
  ).innerHTML = `<a href='${player.getVideoUrl()}'>${
    player.getVideoData().title
  }</a>`;
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
  }
  if (event.data == YT.PlayerState.PLAYING) {
    updateVideoTitle();
  }
}

document.querySelector(".player-icon").addEventListener("click", () => {
  if (playStatus) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
  playStatus = !playStatus;
});

document.querySelector("#volume-up").addEventListener("click", () => {
  if (player) {
    var currentVolume = player.getVolume();
    if (currentVolume < 100) {
      player.setVolume(currentVolume + 10);
    }
  }
});

document.querySelector("#volume-down").addEventListener("click", () => {
  if (player) {
    var currentVolume = player.getVolume();
    if (currentVolume > 0) {
      player.setVolume(currentVolume - 10);
    }
  }
});

document.querySelector("#volume-switch").addEventListener("click", () => {
  if (player) {
    if (muteStatus) {
      player.unMute();
      document.querySelector(
        "#volume-switch"
      ).innerHTML = `<i class="bi bi-volume-off-fill">`;
    } else {
      player.mute();
      document.querySelector(
        "#volume-switch"
      ).innerHTML = `<i class="bi bi-volume-mute"></i>`;
    }
    muteStatus = !muteStatus;
  }
});
