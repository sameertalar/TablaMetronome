const playButton = document.querySelector("#playButton");
const playButtonIcon = document.querySelector("#playButtonIcon");
const waveform = document.querySelector("#waveform");
const volumeIcon = document.querySelector("#volumeIcon");
const volumeSlider = document.querySelector("#volumeSlider");
const currentTime = document.querySelector("#currentTime");
const totalDuration = document.querySelector("#totalDuration");
// --------------------------------------------------------- //
/**
 * Initialize Wavesurfer
 * @returns a new Wavesurfer instance
 */
const initializeWavesurfer = () => {
  return WaveSurfer.create({
    container: "#waveform",
    responsive: true,
    height: 80,
    waveColor: "#ff5501",
    progressColor: "#d44700",
    plugins: [
      WaveSurfer.timeline.create({
        container: "#wave-timeline",
        formatTimeCallback: formatTimeCallback,
        timeInterval: timeInterval,
        primaryLabelInterval: primaryLabelInterval,
        secondaryLabelInterval: secondaryLabelInterval,
        primaryColor: "blue",
        secondaryColor: "red",
        primaryFontColor: "blue",
        secondaryFontColor: "red",
      }),
    ],
  });
};
// --------------------------------------------------------- //
// Functions
/**
 * Toggle play button
 */
const togglePlay = () => {
  wavesurfer.playPause();
  const isPlaying = wavesurfer.isPlaying();
  if (isPlaying) {
    playButtonIcon.src = "assets/icons/pause.svg";
  } else {
    playButtonIcon.src = "assets/icons/play.svg";
  }
};
/**
 * Handles changing the volume slider input
 * @param {event} e
 */
const handleVolumeChange = (e) => {
  // Set volume as input value divided by 100
  // NB: Wavesurfer only excepts volume value between 0 - 1
  const volume = e.target.value / 100;
  wavesurfer.setVolume(volume);
  // Save the value to local storage so it persists between page reloads
  localStorage.setItem("audio-player-volume", volume);
};
/**
 * Retrieves the volume value from local storage and sets the volume slider
 */
const setVolumeFromLocalStorage = () => {
  // Retrieves the volume from local storage, or falls back to default value of 50
  const volume = localStorage.getItem("audio-player-volume") * 100 || 50;
  volumeSlider.value = volume;
};
/**
 * Formats time as HH:MM:SS
 * @param {number} seconds
 * @returns time as HH:MM:SS
 */
const formatTimecode = (seconds) => {
  //return new Date(seconds * 1000).toISOString().substr(11, 8);

  return new Date(seconds * 1000).toISOString().substr(17, 6);
};
/**
 * Toggles mute/unmute of the Wavesurfer volume
 * Also changes the volume icon and disables the volume slider
 */
const toggleMute = () => {
  wavesurfer.toggleMute();
  const isMuted = wavesurfer.getMute();
  if (isMuted) {
    volumeIcon.src = "assets/icons/mute.svg";
    volumeSlider.disabled = true;
  } else {
    volumeSlider.disabled = false;
    volumeIcon.src = "assets/icons/volume.svg";
  }
};
// --------------------------------------------------------- //
// Create a new instance and load the wavesurfer
const wavesurfer = initializeWavesurfer();
wavesurfer.load("Dha DhiNa G tin (Slow).mp3");
// --------------------------------------------------------- //
// Javascript Event listeners
window.addEventListener("load", setVolumeFromLocalStorage);
playButton.addEventListener("click", togglePlay);
volumeIcon.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", handleVolumeChange);
// --------------------------------------------------------- //
// Wavesurfer event listeners
wavesurfer.on("ready", () => {
  // Set wavesurfer volume
  wavesurfer.setVolume(volumeSlider.value / 100);
  // Set audio track total duration
  const duration = wavesurfer.getDuration();
  totalDuration.innerHTML = formatTimecode(duration);
});
// Sets the timecode current timestamp as audio plays
wavesurfer.on("audioprocess", () => {
  const time = wavesurfer.getCurrentTime();
  currentTime.innerHTML = formatTimecode(time);
});
// Resets the play button icon after audio ends
wavesurfer.on("finish", () => {
  playButtonIcon.src = "assets/icons/play.svg";
});

/* ----------------------Timeline Start-------------------------------------------------*/

function formatTimeCallback(seconds, pxPerSec) {
  seconds = Number(seconds);
  var minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;

  // fill up seconds with zeroes
  var secondsStr = Math.round(seconds).toString();
  if (pxPerSec >= 25 * 10) {
    secondsStr = seconds.toFixed(2);
  } else if (pxPerSec >= 25 * 1) {
    secondsStr = seconds.toFixed(1);
  }

  if (minutes > 0) {
    if (seconds < 10) {
      secondsStr = "0" + secondsStr;
    }
    return `${minutes}:${secondsStr}`;
  }
  return secondsStr;
}

/**
 * Use timeInterval to set the period between notches, in seconds,
 * adding notches as the number of pixels per second increases.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param: pxPerSec
 */
function timeInterval(pxPerSec) {
  var retval = 1;
  if (pxPerSec >= 25 * 100) {
    retval = 0.01;
  } else if (pxPerSec >= 25 * 40) {
    retval = 0.025;
  } else if (pxPerSec >= 25 * 10) {
    retval = 0.1;
  } else if (pxPerSec >= 25 * 4) {
    retval = 0.25;
  } else if (pxPerSec >= 25) {
    retval = 1;
  } else if (pxPerSec * 5 >= 25) {
    retval = 5;
  } else if (pxPerSec * 15 >= 25) {
    retval = 15;
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60;
  }
  return retval;
}

/**
 * Return the cadence of notches that get labels in the primary color.
 * EG, return 2 if every 2nd notch should be labeled,
 * return 10 if every 10th notch should be labeled, etc.
 *
 * Note that if you override the default function, you'll almost
 * certainly want to override formatTimeCallback, primaryLabelInterval
 * and/or secondaryLabelInterval so they all work together.
 *
 * @param pxPerSec
 */
function primaryLabelInterval(pxPerSec) {
  var retval = 1;
  if (pxPerSec >= 25 * 100) {
    retval = 10;
  } else if (pxPerSec >= 25 * 40) {
    retval = 4;
  } else if (pxPerSec >= 25 * 10) {
    retval = 10;
  } else if (pxPerSec >= 25 * 4) {
    retval = 4;
  } else if (pxPerSec >= 25) {
    retval = 1;
  } else if (pxPerSec * 5 >= 25) {
    retval = 5;
  } else if (pxPerSec * 15 >= 25) {
    retval = 15;
  } else {
    retval = Math.ceil(0.5 / pxPerSec) * 60;
  }
  return retval;
}

function secondaryLabelInterval(pxPerSec) {
  // draw one every 10s as an example
  return Math.floor(10 / timeInterval(pxPerSec));
}

/* ----------------------Timeline End-------------------------------------------------*/
