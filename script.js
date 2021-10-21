$(document).ready(function () {
  var canvas, ctx, context,_animationFrameId;
  var accentPitch, offBeatPitch;
  var noteSeparator, measureSeparator, restNoteText, dotColors, trailColors;
  var trailSize, barHeight, measureHeight, measureWidth, marginX, marginY;
  var _isPlaying, _tempo, _beats,_seed;
  var _cursor, _trackPoints, _notes;

  // Load
  init();

  function play() {
    _trackPoints = new Array();
    _isPlaying = true;
    _seed = (_tempo * 10) / measureWidth;

    _beats = $("#beatsText").val();
    _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    togglePlay();
    drawTrack(true);
    animate();

    ctx.canvas.height = _trackPoints[_trackPoints.length - 1].y + 100;

    console.log(_trackPoints);
  }

  function pause() {
    _isPlaying = false;
    togglePlay();
    window.cancelAnimationFrame(_animationFrameId);
  }

  function restart() {
    window.cancelAnimationFrame(_animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _cursor = {
      x: marginX,
      y: marginY,
    };
    play();
  }

  // draw the current frame based on sliderValue
  function draw(seed) {
    drawTrack();

    // Draw the tracking rectangle -------------------

    drawMovingRect();

    // Play Audio
    playNote();

    _cursor.x = _cursor.x + seed;

    if (_cursor.x > marginX + _beats * measureWidth) {
      _cursor.x = marginX;
      _cursor.y = _cursor.y + measureHeight;

      if (
        _cursor.y >=
        marginY +
          (_notes.split(measureSeparator).length / _beats) * measureHeight
      ) {
        _cursor.y = marginY;
        $("#canvasDiv").scrollTop(-100);
      }
    }

    if (_cursor.y > 600) {
      $("#canvasDiv").scrollTop(_cursor.y - marginY - measureHeight * 3);
    }
  }

  function drawTrack(init) {
    // redraw path
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.lineWidth = trailSize;

    let notes = _notes.split(measureSeparator);

    let pathX = marginX;
    let pathY = marginY;

    for (var i = 0; i < notes.length; i++) {
      //console.log(notes[i]);

      if (i % _beats === 0) {
        pathX = marginX;

        if (i !== 0) {
          pathY = pathY + measureHeight;
        }
      }

      ctx.beginPath();
      ctx.moveTo(pathX, pathY);
      pathX = pathX + measureWidth;
      ctx.lineTo(pathX, pathY);
      ctx.strokeStyle = trailColors[i % _beats];
      ctx.stroke();
      ctx.beginPath();

      ctx.arc(pathX - measureWidth, pathY, trailSize * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = dotColors[i % _beats];
      ctx.fill();

      // Ending Bar
      if (i % _beats === _beats - 1) {
        ctx.fillStyle = "gray";
        ctx.fillRect(
          pathX,
          pathY - trailSize / 2,
          1,
          barHeight + trailSize / 2
        );

        //ctx.fillStyle = "white";
        ctx.fillText(
          (i + 1) / _beats,
          pathX + trailSize,
          pathY + trailSize * 2
        );
      }

      // Boles
      var boles = notes[i].split(noteSeparator);

      for (var j = 0; j < boles.length; j++) {
        let bolX = pathX - measureWidth + j * (measureWidth / boles.length);

        ctx.fillStyle = dotColors[i % _beats];
        // vertical bars
        ctx.fillRect(bolX, pathY + trailSize / 2, 1, barHeight - trailSize / 2);

        ctx.fillText(
          boles[j],
          bolX - trailSize / 2,
          pathY + barHeight + trailSize * 2
        );

        if (init) {
          _trackPoints.push({
            bole: boles[j],
            x: bolX,
            y: pathY,
            skip: false,
            first: j === 0,
          });
        }

        if (j !== 0) {
          ctx.beginPath();
          ctx.arc(bolX, pathY, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = "gray";
          ctx.fill();
        }

        if (boles[j] === restNoteText) {
          ctx.fillStyle = "white";
          ctx.fillText("X", bolX - trailSize + 3, pathY + trailSize / 2);
        }
      }
    }
  }

  function animate() {
    draw(_seed);

    _animationFrameId = window.requestAnimationFrame(function () {
      animate();
    });
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

    if (found) {
      // console.log("Found Object", found);
      // console.log("Note Played");

      var note = context.createOscillator();
      note.frequency.value = offBeatPitch;
      note.connect(context.destination);

      const d = new Date();
      let t = context.currentTime;

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

  // draw tracking rect at xy
  function drawMovingRect() {
    ctx.fillStyle = "fuchsia";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(_cursor.x - 13, _cursor.y - 20, 25, 50);
    ctx.fill();
    ctx.stroke();
  }

  // draw tracking dot at xy
  function drawDot(point, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // line: percent is 0-1
  function getLineXYatPercent(startPt, endPt, percent) {
    var dx = endPt.x - startPt.x;
    var dy = endPt.y - startPt.y;
    var X = startPt.x + dx * percent;
    var Y = startPt.y + dy * percent;
    return {
      x: X,
      y: Y,
    };
  }

  $("#rangeTempo").on("change", function (event) {
    _tempo = this.value;
    $("#rangeTempLabel").text(this.value);
  });

  function init() {
    // Load
    setConstants();

    $("#btnPlay").on("click", play);
    $("#btnPause").on("click", pause);
    $("#btnRestart").on("click", restart);
    ctx.canvas.width = window.innerWidth - 50;
    ctx.canvas.height = 300;
    //$("#canvasDiv").height(window.innerHeight - 500);
    //$("#canvasDiv").width(window.innerWidth - 30);
  }

  function togglePlay() {
    if (_isPlaying) {
      $("#btnPlay").hide();
      $("#btnPause").show();
      $("#btnRestart").show();
    } else {
      $("#btnPlay").show();
      $("#btnPause").hide();
    }
  }

  function setConstants() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    _trackPoints = new Array();

    _tempo = 60;
    _beats = 4;
    _isPlaying = false;
    _notes = "";

    marginX = 20;
    marginY = 40;
    measureHeight = 125;
    measureWidth = 200;

    trailSize = 10;
    barHeight = 40;
    (accentPitch = 380), (offBeatPitch = 200);

    noteSeparator = ".";
    measureSeparator = "|";
    restNoteText = "_";

    _cursor = {
      x: marginX,
      y: marginY,
    };

    dotColors = [
      "#dd2c00",
      "green",
      "#007bff",
      "#ffc107",
      "#dd2c00",
      "green",
      "#007bff",
      "#ffc107",
    ];
    trailColors = [
      "#F6B5A7",
      "#A7F6D2",
      "#A7BEF6",
      "#F6F4A7",
      "#F6B5A7",
      "#A7F6D2",
      "#A7BEF6",
      "#F6F4A7",
    ];
  }
});
