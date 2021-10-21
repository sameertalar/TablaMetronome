$(document).ready(function () {
  var canvas, ctx, context;
  var _isPlaying, _animationFrameId, _tempo, _beats;
  var _notes, _seed, noteCount, accentPitch, offBeatPitch;
  var boleSeparator, boleGroupSeparator, restBole, matraDotColors, matraColors;
  var canvasMarginX, canvasMarginY, matraHeight, matraWidth;
  var canvasYPosition, lineWidth, barHeight;
  var _TrackingPoints, _move;

  // Load
  init();

  function play() {
    noteCount = 0;
    _TrackingPoints = new Array();
    _isPlaying = true;
    _seed = (_tempo * 10) / matraWidth;

    _beats = $("#beatsText").val();
    _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    toggalPlay();
    drawTrack(true);
    animate();

    ctx.canvas.height = _TrackingPoints[_TrackingPoints.length - 1].y + 100;

    console.log(_TrackingPoints);
 
  }

  function pause() {
    _isPlaying = false;
    toggalPlay();
    window.cancelAnimationFrame(_animationFrameId);
  }

  function restart() {
    window.cancelAnimationFrame(_animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _move = {
      x: canvasMarginX,
      y: canvasMarginY,
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

    _move.x = _move.x + seed;

    if (_move.x > canvasMarginX + _beats * matraWidth) {
      _move.x = canvasMarginX;
      _move.y = _move.y + matraHeight;

      if (
        _move.y >=
        canvasMarginY +
          (_notes.split(boleGroupSeparator).length / _beats) * matraHeight
      ) {
        _move.y = canvasMarginY;
        $("#canvasDiv").scrollTop(-100);
      }
    }

    if (_move.y > 600) {
      $("#canvasDiv").scrollTop(_move.y - canvasMarginY - matraHeight * 3);
    }
  }

  function drawTrack(init) {
    // redraw path
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.lineWidth = lineWidth;

    var matraYPosition = canvasYPosition;
    let notes = _notes.split(boleGroupSeparator);

    let pathX = canvasMarginX;
    let pathY = canvasMarginY;

    for (var i = 0; i < notes.length; i++) {
      //console.log(notes[i]);

      if (i % _beats === 0) {
        pathX = canvasMarginX;

        if (i !== 0) {
          pathY = pathY + matraHeight;
        }
      }

      ctx.beginPath();
      ctx.moveTo(pathX, pathY);
      pathX = pathX + matraWidth;
      ctx.lineTo(pathX, pathY);
      ctx.strokeStyle = matraColors[i % _beats];
      ctx.stroke();
      ctx.beginPath();

      ctx.arc(pathX - matraWidth, pathY, lineWidth * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = matraDotColors[i % _beats];
      ctx.fill();

      // Ending Bar
      if (i % _beats === _beats - 1) {
        ctx.fillStyle = "gray";
        ctx.fillRect(
          pathX,
          pathY - lineWidth / 2,
          1,
          barHeight + lineWidth / 2
        );

        //ctx.fillStyle = "white";
        ctx.fillText(
          (i + 1) / _beats,
          pathX + lineWidth,
          pathY + lineWidth * 2
        );
      }

      // Boles
      var boles = notes[i].split(boleSeparator);

      for (var j = 0; j < boles.length; j++) {
        let bolX = pathX - matraWidth + j * (matraWidth / boles.length);

        ctx.fillStyle = matraDotColors[i % _beats];
        // vertical bars
        ctx.fillRect(bolX, pathY + lineWidth / 2, 1, barHeight - lineWidth / 2);

        ctx.fillText(
          boles[j],
          bolX - lineWidth / 2,
          pathY + barHeight + lineWidth * 2
        );

        if (init) {
          _TrackingPoints.push({
            bole: boles[j],
            x: bolX,
            y: pathY,
            skip: false,
            first: j === 0,
          });
        }

        if (j !== 0) {
          ctx.beginPath();
          ctx.arc(bolX, pathY, lineWidth, 0, Math.PI * 2);
          ctx.fillStyle = "gray";
          ctx.fill();
        }

        if (boles[j] === restBole) {
          ctx.fillStyle = "white";
          ctx.fillText("X", bolX - lineWidth + 3, pathY + lineWidth / 2);
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

    let found = _TrackingPoints.find(
      (t) =>
        t.y === _move.y &&
        t.x - _seed <= _move.x &&
        t.x + _seed >= _move.x &&
        t.bole != restBole
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
    ctx.rect(_move.x - 13, _move.y - 20, 25, 50);
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

  function toggalPlay() {
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
    _TrackingPoints = new Array();

    _tempo = 60;
    _beats = 4;
    _isPlaying = false;
    _notes = "";

    canvasMarginX = 20;
    canvasMarginY = 40;
    matraHeight = 125;
    matraWidth = 200;
    canvasYPosition = 40;
    lineWidth = 10;
    barHeight = 40;
    (accentPitch = 380), (offBeatPitch = 200);

    boleSeparator = ".";
    boleGroupSeparator = "|";
    restBole = "_";

    _move = {
      x: canvasMarginX,
      y: canvasMarginY,
    };

    matraDotColors = [
      "#dd2c00",
      "green",
      "#007bff",
      "#ffc107",
      "#dd2c00",
      "green",
      "#007bff",
      "#ffc107",
    ];
    matraColors = [
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
