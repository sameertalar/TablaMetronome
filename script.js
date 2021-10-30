$(document).ready(function () {
  var audioContext, _animationFrameId;
  var accentPitch, offBeatPitch;
  var noteSeparator,
    measureSeparator,
    restNoteText,
    dotColors,
    trailColors,
    disabledColor;
  var trailSize, barHeight, measureHeight, measureWidth, margin;
  var _isPlaying, _tempo, _beats, _seed;
  var _cursor, _trackPoints, _notes, _mobile, _cycle, _cycleTime;

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

    _beats = $("#beatsText").val();
    _tempo = $("#rangeTempo").val();

    _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    let _notes1 = $("#notesText").val();
    var _notesEntity = new Array();

    document.getElementById("playground").innerHTML = "";

    if (_notes1) {
      let lines = _notes1.split("\n");

      // ----------- ROWS ------------");
      for (let l = 0; l < lines.length; l++) {
        let rowEntity = { id: l + 1, matras: [] };
        var rowElement = getDivRow("row_" + rowEntity.id);

        let matras = lines[l].split("|");

        // ----------- MATRAS ------------");
        for (let m = 0; m < matras.length; m++) {
          let matraEntity = { id: m + 1, boles: [] };
          var matraElementI = getDivMatra(matraEntity.id, false);
          var matraElementO = getDivMatra(
            "matra_" + rowEntity.id + "_" + matraEntity.id,
            true
          );

          let bols = matras[m].split(".");

          // ----------- BOLES ------------");
          for (let b = 0; b < bols.length; b++) {
            let boleEntity = {
              id: b + 1,
              bole: bols[b],
            };

            var boleElement = getDivBole(
              "bol_" +
                rowEntity.id +
                "_" +
                matraEntity.id +
                "_" +
                boleEntity.id,
              12 / bols.length,
              boleEntity.bole
            );

            matraElementI.appendChild(boleElement);

            matraEntity.boles.push(boleEntity);

            //  console.log("Bole:",bol);
          }

          matraElementO.appendChild(matraElementI);
          rowElement.appendChild(matraElementO);
          rowEntity.matras.push(matraEntity);
        }

        document.getElementById("playground").appendChild(rowElement);
        _notesEntity.push(rowEntity);
      }
    }

    console.log("_notesEntity----------", _notesEntity);
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
      div.className = "col-sm-1 bg-light py-1 border rounded";
    } else {
      let cssClass = "bg-warning border-warning";

      if (id % 2 != 0) cssClass = "bg-info border-info";

      div.className = "row border rounded text-center py-1 " + cssClass;
    }

    return div;
  }

  function getDivBole(id, col, txt) {
    let div = document.createElement("div");
    if (id) div.id = id;

    div.className =
      "text-center bg-white border-success border p-1 rounded col-sm-" + col;

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

    /*
    } else {
      _seed = (measureWidth / 60) * (_tempo / 60);
      console.log("tEMPO:", _tempo, "sEED", _seed);
    }
    */

    // _animationFrameId = window.requestAnimationFrame(animate);
  }

  function pause() {
    _isPlaying = false;
    _cycle = 0;
    togglePlay();
    _trackPoints = new Array();
    window.cancelAnimationFrame(_animationFrameId);
  }

  function restart() {
    window.cancelAnimationFrame(_animationFrameId);

    _cursor = {
      x: margin,
      y: margin,
    };

    play();
  }

  function animate() {
    draw(_seed);

    _animationFrameId = window.requestAnimationFrame(function () {
      if (_isPlaying) animate();
    });
  }

  // draw the current frame based on sliderValue
  function draw(seed) {
    //  drawMovingCursor();
    $("#mover").css("marginLeft", _cursor.x);
    $("#mover").css("marginTop", _cursor.y - 10);

    // Play Audio
    playNote();

    _cursor.x = _cursor.x + seed;

    if (_cursor.x >= _trackPoints[_trackPoints.length - 1].x) {
      _cursor.x = margin;

      if (_cursor.y === _trackPoints[_trackPoints.length - 1].y) {
        _cursor.y = margin;

        _cycle++;
        console.log(
          "Cycle:",
          _cycle,
          " took ",
          (((new Date().getTime() - _cycleTime) / 1000) % 60).toFixed(2),
          " seconds"
        );
        _cycleTime = new Date().getTime();
      } else {
        _cursor.y = _cursor.y + measureHeight;
      }
    }

    /*
    if (_cursor.y > 400) {
      // $("#canvasDiv").scrollTop(_cursor.y - margin - measureHeight * 4);
      // $(window).scrollTop(800);
      $("#canvasDiv")[0].scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      $("#canvasDiv")[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }
    */

    $("#consoleCursor").text(
      Math.floor(_cursor.x) + " :" + Math.floor(_cursor.y)
    );
  }

  function playNote() {
    let playAudio = $(".form-check-audio:checked").val();

    if (!playAudio) return;

    let found = _trackPoints.find(
      (t) =>
        t.y === _cursor.y &&
        t.x - _seed <= _cursor.x &&
        t.x + _seed >= _cursor.x &&
        t.bole != restNoteText
    );

    if (found && audioContext) {
      // console.log("Found Object", found);
      // console.log("Note Played");

      var note = audioContext.createOscillator();
      note.frequency.value = offBeatPitch;
      note.connect(audioContext.destination);

      let t = audioContext.currentTime;

      if (found.first) note.frequency.value = accentPitch;
      else note.frequency.value = offBeatPitch;

      note.start(t);
      note.stop(t + 0.03);
    }

    /* 
        if(_move.x)
  
  
   
  */
    /*
  
      if( $(".counter .dot").eq(noteCount).hasClass("active") )
        note.frequency.value = accentPitch;
      else
        note.frequency.value = offBeatPitch;
    */
    /*
      
      
      */
  }

  function changeTempo(value, changeValue) {
    if (changeValue) {
      $("#rangeTempo").val(Number($("#rangeTempo").val()) + changeValue);
    } else {
      $("#rangeTempo").val(value);
    }

    $("#rangeTempLabel").text($("#rangeTempo").val());
    _tempo = $("#rangeTempo").val();

    if (_isPlaying) {
      cancelAnimationFrame(_animationFrameId);
      play();
    }
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

    _tempo = 60;
    _beats = 4;
    _isPlaying = false;
    _notes = "";

    if (window.innerWidth < 500 || window.innerHeight < 500) {
      _mobile = true;
    } else {
      _mobile = false;
    }

    _cursor = {
      x: margin,
      y: margin,
    };
    _seed = (measureWidth / 60) * (_tempo / 60);

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
