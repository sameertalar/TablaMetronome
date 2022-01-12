$(document).ready(function () {
  var audioContext;
  var _isPlaying, _Seed;
  var _cycle, _cycleTime, _repeatations, _activeMatraIndex, _activeBoleIndex;
  var _notesList, _notesText, _funRiyaz, _activeMatra, _activeBole, _baseTempo;

  // Load
  init();

  function init() {
    // Load

    bindEvents();
    setConstants();

    drawNotes();
  }

  function drawNotes() {
    reset();

    let _notesText = $("#notesText").val();
    _notesList = new Array();

    document.getElementById("playground").innerHTML = "";

    if (_notesText) {
      let lines = _notesText.split("*");
      let matraIndex = 0;

      // ----------- ROWS ------------");
      for (let l = 0; l < lines.length; l++) {
        var rowElement = getDivRow("row_" + l + 1);

        let matras = lines[l].split("|");

        let rowInnerHtml = "";

        // ----------- MATRAS ------------");
        for (let m = 0; m < matras.length; m++) {
          matraIndex++;

          let matraEntity = {
            id: matraIndex,
            boles: [],
            lid: l + 1,
            mid: m + 1,
          };
          var matraElementI = getDivMatra(m + 1, false); // id for alternate matra colors
          var matraElementO = getDivMatra("matra_" + matraIndex, true);

          let bols = matras[m].split(".");

          // ----------- BOLES ------------");
          for (let b = 0; b < bols.length; b++) {
            let boleEntity = {
              id: "bol_" + matraIndex + "_" + (b + 1),
              index: b + 1,
              bole: bols[b],
            };

            var boleElement = getDivBole(
              boleEntity.id,
              12 / bols.length,
              boleEntity.bole
            );

            matraElementI.appendChild(boleElement);

            matraEntity.boles.push(boleEntity);

            //  console.log("Bole:",bol);
          }

          if (m % 2 === 0)
            rowInnerHtml += "<div class='col-sm-3 '><div class='row  '>";
          // if (m % 2 === 0)  rowElement.appendChild("<div class='col-4'><div class='row'>");

          // rowInnerHtml += matraElementI.outerHTML;
          matraElementO.appendChild(matraElementI);
          rowInnerHtml += matraElementO.outerHTML;
          // matraElementO.appendChild(matraElementI);
          //rowElement.appendChild(matraElementO);

          if (m % 2 !== 0) rowInnerHtml += "</div></div>";
          rowElement.innerHTML = rowInnerHtml;

          _notesList.push(matraEntity);
        }

        document.getElementById("playground").appendChild(rowElement);
      }
    }

    console.log("Notes List:", _notesList);
  }

  function getDivRow(id) {
    let div = document.createElement("div");
    if (id) div.id = id;
    div.className = "row p-1  ms-lg-2   ";

    return div;
  }

  function getDivMatra(id, outer) {
    let div = document.createElement("div");

    if (outer) {
      if (id) div.id = id;
      div.className = "col-6 py-1 border rounded  tablaMatra ";
    } else {
      let cssClass = "row bg-warning border-warning ";

      if (id % 2 != 0) cssClass = "bg-info border-info";

      div.className =
        "row border rounded rounded-circle text-center py-3 " + cssClass;
    }

    return div;
  }

  function getDivBole(id, col, txt) {
    let div = document.createElement("div");
    if (id) div.id = id;

    div.className =
      "tablaBole  text-center  bg-white text-black border-dark border p-1 rounded col-sm-" +
      col;

    div.innerText = txt;
    return div;
  }

  function play() {
    audioContext = new AudioContext(); // initialize on event
    _isPlaying = true;

    togglePlay();

    if (_notesText != $("#notesText").val()) drawNotes();

    _cycleTime = new Date().getTime();
    _cycle++;
    _activeMatraIndex++;

    console.log("Cycle: started at ", new Date().toLocaleString());

    _funRiyaz = setInterval(playMatra, _Seed);
  }

  function stop() {
    _activeMatraIndex = 0;
    _isPlaying = false;
    togglePlay();

    clearInterval(_funRiyaz);
  }

  function playMatra() {
    $("#consoleCycle").text(_cycle);
    $("#consoleLog").text(_repeatations);

    $(".tablaMatra").removeClass("bg-success");
    $("#matra_" + _activeMatraIndex).addClass("bg-success");
    $(".tablaBole").removeClass("bg-danger text-white");
    $(".tablaBole").addClass("bg-white text-black");

    _activeMatra = _notesList.find((n) => n.id === _activeMatraIndex);

    //console.log("------------------_activeMatraIndex", _activeMatraIndex);
    // console.log("_activeMatra", _activeMatra);

    if (!_activeMatra) return;

    // Play Bole

    _activeBoleIndex = 0;
    let bolTime = _Seed / _activeMatra.boles.length;

    playBol(true); // First Bole

    for (let p = 0; p < _activeMatra.boles.length - 1; p++) {
      setTimeout(playBol, bolTime * (p + 1));
    }

    document.getElementById("matra_" + _activeMatraIndex).scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    if (_activeMatraIndex === _notesList.length) {
      if (_cycle + 1 > _repeatations) {
        if (
          $(".form-check-autoAddTempo:checked").val() &&
          $("#rangeTempo").val() < 250
        ) {
          autoTempPlay();
        } else {
          stop();
          console.log("Auto Stop Called");
        }

        return;
      } else {
        _cycle++;
        _activeMatraIndex = 1;
        console.log(
          "Cycle:",
          _cycle,
          " took ",
          (((new Date().getTime() - _cycleTime) / 1000) % 60).toFixed(2),
          " seconds"
        );
        _cycleTime = new Date().getTime();
      }
    } else {
      _activeMatraIndex++;
    }
  }

  function playBol(matraBole) {
    _activeBoleIndex++;

    _activeBole = _activeMatra.boles.find((n) => n.index === _activeBoleIndex);

    //console.log("   _activeBoleIndex", _activeBoleIndex);
    // console.log("   _activeBole", _activeBole);
    //console.log("   _activeBole ID", "#" + _activeBole.id);

    $("#" + _activeBole.id).removeClass("bg-white text-black");

    if (_activeBole.bole === "↦") {
      $("#" + _activeBole.id).addClass("bg-secondary text-white");
    } else if (_activeBole.bole === "X") {
      $("#" + _activeBole.id).addClass("bg-warning text-white");
    } else {
      $("#" + _activeBole.id).addClass("bg-danger text-white");
    }

    //if (first) playNote();
    let firstBole = false;

    if (_activeMatraIndex === 1 && matraBole) {
      firstBole = true;
    }

    playNote(matraBole, _activeMatra.mid === 1 && matraBole);

    // Cycle Start Duplicate alert
    if (firstBole)
      setTimeout(() => {
        playNote(matraBole, firstBole);
      }, 3);
  }

  function playNote(matraBole, firstBole) {
    if (!_activeBole || _activeBole.bole == "X" || _activeBole.bole == "↦")
      return;
    if (!$(".form-check-metronome:checked").val()) return;

    var note = audioContext.createOscillator();
    //note.frequency.value = _activeBole ===1 ? accentPitch:offBeatPitch;

    if (firstBole) note.frequency.value = $("#frequencyS").val();
    else if (matraBole) note.frequency.value = $("#frequencyM").val();
    else {
      if (!$(".form-check-offbeat:checked").val()) return;
      note.frequency.value = $("#frequencyO").val();
    }

    note.connect(audioContext.destination);
    let t = audioContext.currentTime;
    note.start(t);
    note.stop(t + 0.03);
  }

  function SpeakBole() {
    let nowMatra = _notesList.find((n) => n.id === _activeMatraIndex);
    let nowbole = nowMatra.boles.find((n) => n.id === _activeBoleIndex);

    if (nowbole.bole == "X") return;

    if (!window.speechSynthesis) {
      console.log("No speechSynthesis");
    } else {
      let u = new SpeechSynthesisUtterance();
      u.text = nowbole.bole;
      u.lang = "hi-IN";

      u.volume = 1; // 0 to 1
      u.rate = 8; // 0.1 to 10
      u.pitch = 2; //0 to 2
      speechSynthesis.speak(u);
      console.log("speechSynthesis called for" + nowbole.bole);
    }
  }

  function changeTempo(value, changeValue) {
    if (changeValue) {
      $("#rangeTempo").val(Number($("#rangeTempo").val()) + changeValue);
    } else {
      $("#rangeTempo").val(value);
    }

    $("#rangeTempLabel").text($("#rangeTempo").val());
    _baseTempo = $("#rangeTempo").val();

    if (_isPlaying) play();
  }

  function bindEvents() {
    $("#btnPlay").on("click", play);
    $("#btnPause").on("click", stop);

    $("#notesText").on("focusout", function (event) {
      drawNotes();
      _isPlaying = false;
      togglePlay();
    });

    $("#rangeTempo").on("change", function (event) {
      changeTempo(this.value);
    });

    $("#btnAddTempo").on("click", function (event) {
      changeTempo(null, 5);
    });

    $("#btnScreenOn").on("click", function (event) {
      $("#videoDummy")[0].play();
    });

    $("#btnMinusTempo").on("click", function (event) {
      changeTempo(null, -5);
    });

    $("#btnMinusTempo").on("click", function (event) {
      changeTempo(null, -5);
    });

    $("#btnSetTempoS").on("click", function (event) {
      changeTempo(60);
    });

    $("#btnSetTempoM").on("click", function (event) {
      changeTempo(90);
    });
    $("#btnSetTempoF").on("click", function (event) {
      changeTempo(120);
    });
  }

  function togglePlay() {
    if (_isPlaying) {
      $("#btnPlay").hide();
      $("#btnPause").show();
    } else {
      $("#btnPlay").show();
      $("#btnPause").hide();
    }
  }

  function reset() {
    _cycle = 0;
    _activeMatraIndex = 0;
    _Seed = (1000 * 60) / $("#rangeTempo").val();
    _baseTempo = $("#rangeTempo").val();

    _repeatations = Number($("#repeatations").val());

    clearInterval(_funRiyaz);

    if (window.innerWidth < 500 || window.innerHeight < 500) {
      _mobile = true;
    } else {
      _mobile = false;
    }

    $("#consoleSize").text(window.innerWidth + " x " + window.innerHeight);
  }

  function autoTempPlay() {
    _cycle = 0;
    _activeMatraIndex = 1;
    $("#rangeTempo").val(Number($("#rangeTempo").val()) + 5);
    $("#rangeTempLabel").text($("#rangeTempo").val());
    _Seed = (1000 * 60) / $("#rangeTempo").val();
    clearInterval(_funRiyaz);
    _funRiyaz = setInterval(playMatra, _Seed);
  }

  function setConstants() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    (accentPitch = 380), (offBeatPitch = 200);

    noteSeparator = ".";
    measureSeparator = "|";
    restNoteText = "X";

    disabledColor = "Gray";
  }
});
