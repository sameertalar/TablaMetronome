$(document).ready(function () {
  var audioContext; 
  var _isPlaying, _Seed;
  var _notes, _cycle, _cycleTime;
  var _activeMatra, _activeBole, _funRiyaz, _notesEntity;

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

      _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    let _notes1 = $("#notesText").val();
    _notesEntity = new Array();

    document.getElementById("playground").innerHTML = "";

    if (_notes1) {
      let lines = _notes1.split("\n");
      let matraIndex = 0;

      // ----------- ROWS ------------");
      for (let l = 0; l < lines.length; l++) {
        var rowElement = getDivRow("row_" + l + 1);

        let matras = lines[l].split("|");

        // ----------- MATRAS ------------");
        for (let m = 0; m < matras.length; m++) {
          matraIndex++;

          let matraEntity = { id: matraIndex, boles: [] };
          var matraElementI = getDivMatra(m + 1, false); // id for alternate matra colors
          var matraElementO = getDivMatra("matra_" + matraIndex, true);

          let bols = matras[m].split(".");

          // ----------- BOLES ------------");
          for (let b = 0; b < bols.length; b++) {
            let boleEntity = {
              id: b + 1,
              bole: bols[b],
            };

            var boleElement = getDivBole(
              "bol_" + matraIndex + "_" + boleEntity.id,
              12 / bols.length,
              boleEntity.bole
            );

            matraElementI.appendChild(boleElement);

            matraEntity.boles.push(boleEntity);

            //  console.log("Bole:",bol);
          }

          matraElementO.appendChild(matraElementI);
          rowElement.appendChild(matraElementO);
          _notesEntity.push(matraEntity);
        }

        document.getElementById("playground").appendChild(rowElement);
      }
    }

    console.log("_notesEntity ----------", _notesEntity);
  }

  function getDivRow(id) {
    let div = document.createElement("div");
    if (id) div.id = id;
    div.className = "row p-1 mb-1 ms-lg-2 ";

    return div;
  }

  function getDivMatra(id, outer) {
    let div = document.createElement("div");

    if (outer) {
      if (id) div.id = id;
      div.className = "col-sm-1 py-1 border rounded  tablaMatra ";
    } else {
      let cssClass = "bg-warning border-warning ";

      if (id % 2 != 0) cssClass = "bg-info border-info";

      div.className =
        "row border rounded rounded-circle text-center py-1 " + cssClass;
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

    drawNotes();

    console.log("Cycle: started at ", new Date().toLocaleString());
    _cycleTime = new Date().getTime();
    $("#videoDummy")[0].play();

    _funRiyaz = setInterval(playMatra, _Seed);
  }

  function pause() {
    _activeMatra = 0;
    _isPlaying = false;
    togglePlay();

    clearInterval(_funRiyaz);
  }

  function playMatra() {
    _activeMatra++;
    _activeBole = 0;

    if (_activeMatra > _notesEntity.length) {
      _activeMatra = 1;
      _cycle++;
      console.log(
        "Cycle:",
        _cycle,
        " took ",
        (((new Date().getTime() - _cycleTime) / 1000) % 60).toFixed(2),
        " seconds"
      );
      _cycleTime = new Date().getTime();
    }

    $(".tablaMatra").removeClass("bg-success");
    $("#matra_" + _activeMatra).addClass("bg-success");
    $(".tablaBole").removeClass("bg-danger text-white");
    $(".tablaBole").addClass("bg-white text-black");

    let nowMatra = _notesEntity.find((n) => n.id === _activeMatra);

    let bolTime = _Seed / nowMatra.boles.length;

    setTimeout(playBol, 0);
    for (let p = 0; p < nowMatra.boles.length - 1; p++) {
      setTimeout(playBol, bolTime * (p + 1));
      // console.log(p+1, "-",seed* (p+1));
    }

    document.getElementById('matra_' + _activeMatra).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

  }

  function playBol() {
    _activeBole++;

    //$("#consoleMaxX").text(_activeBole);
    $("#bol_" + _activeMatra + "_" + _activeBole).removeClass(
      "bg-white text-black"
    );
    $("#bol_" + _activeMatra + "_" + _activeBole).addClass(
      "bg-danger text-white"
    );

    playNote();


  }

  function playNote() {

    let playAudio = $(".form-check-audio:checked").val();
    if (!playAudio) return;

    let nowMatra = _notesEntity.find((n) => n.id === _activeMatra);
    if (!nowMatra) return;

    let nowbole = nowMatra.boles.find((n) => n.id === _activeBole);

    if (!nowbole || nowbole.bole == "X") return;

    var note = audioContext.createOscillator();
    //note.frequency.value = _activeBole ===1 ? accentPitch:offBeatPitch;
    note.frequency.value = $("#frequency").val();
    note.connect(audioContext.destination);
    let t = audioContext.currentTime;
    note.start(t);
    note.stop(t + 0.03);

  }

  function SpeakBole() {
    let nowMatra = _notesEntity.find((n) => n.id === _activeMatra);
    let nowbole = nowMatra.boles.find((n) => n.id === _activeBole);

    if (nowbole.bole == "X") return;

    if (!window.speechSynthesis) {
      console.log("No speechSynthesis");
    }
    else {
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
    

    if (_isPlaying) play();
  }

  function bindEvents() {
    $("#btnPlay").on("click", play);
    $("#btnPause").on("click", pause);

    $("#notesText").on("focusout", drawNotes);

    $("#rangeTempo").on("change", function (event) {
      changeTempo(this.value);
    });

    $("#btnAddTempo").on("click", function (event) {
      changeTempo(null, 5);
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
    _activeMatra = 0;
    _Seed = (1000 * 60) / $('#rangeTempo').val();
 
    _notes = "";

    clearInterval(_funRiyaz);

    if (window.innerWidth < 500 || window.innerHeight < 500) {
      _mobile = true;
    } else {
      _mobile = false;
    }
 
     

    $("#consoleSize").text(window.innerWidth + " x " + window.innerHeight);
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
