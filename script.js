$(document).ready(function () {
  var canvas, ctx, audioContext, _animationFrameId;
  var accentPitch, offBeatPitch;
  var noteSeparator,
    measureSeparator,
    restNoteText,
    dotColors,
    trailColors,
    disabledColor;
  var trailSize, barHeight, measureHeight, measureWidth, margin;
  var _isPlaying, _tempo, _beats, _seed;
  var _cursor, _trackPoints, _notes;

  // Load
  init();

  function play() {
    _trackPoints = new Array();
    _isPlaying = true;

    audioContext = new AudioContext();

    _beats = $("#beatsText").val();
    _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    togglePlay();
    setSizes();
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
      x: margin,
      y: margin,
    };
    play();
  }

  function animate() {
    draw(_seed);

    _animationFrameId = window.requestAnimationFrame(function () {
      animate();
    });
  }

  // draw the current frame based on sliderValue
  function draw(seed) {
    drawTrack();

    drawMovingRect();

    // Play Audio
    playNote();

    _cursor.x = _cursor.x + seed;

    if (_cursor.x > margin + _beats * measureWidth) {
      _cursor.x = margin;
      _cursor.y = _cursor.y + measureHeight;

      if (
        _cursor.y >=
        margin +
          (_notes.split(measureSeparator).length / _beats) * measureHeight
      ) {
        _cursor.y = margin;
        $("#canvasDiv").scrollTop(-100);
      }
    }

    if (_cursor.y > 600) {
      $("#canvasDiv").scrollTop(_cursor.y - margin - measureHeight * 3);
    }

    $("#consoleCursor").text(
      Math.floor(_cursor.x) + " :" + Math.floor(_cursor.y)
    );
  }

  function drawTrack(init) {
    // redraw path
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = 20 + "px Arial";

    let notes = _notes.split(measureSeparator);

    let pathX = margin;
    let pathY = margin;

    for (var i = 0; i < notes.length; i++) {
      //console.log(notes[i]);

      if (i % _beats === 0) {
        pathX = margin;

        if (i !== 0) {
          pathY = pathY + measureHeight;
          if (init) $("#consoleMaxY").text(pathY + barHeight + trailSize);
        }
      }

      ctx.beginPath();
      ctx.moveTo(pathX, pathY);

      drawMeasure(pathX, pathY);

      pathX = pathX + measureWidth;
      // vertical bars

      drawDot(
        pathX - measureWidth,
        pathY,
        trailSize * 1.5,
        dotColors[i % _beats],
        dotColors[i % _beats]
      );

      // Ending Bar
      if (i % _beats === _beats - 1) {
        drawDot(pathX, pathY, trailSize * 1.5, "white", disabledColor);

        drawText(
          pathX - trailSize / 2,
          pathY + trailSize / 2,
          (i + 1) / _beats,
          "Black"
        );

        $("#consoleMaxX").text(pathX + trailSize);
      }

      var boles = notes[i].split(noteSeparator);

      for (var j = 0; j < boles.length; j++) {
        let bolX = pathX - measureWidth + j * (measureWidth / boles.length);

        if (init) {
          _trackPoints.push({
            bole: boles[j],
            x: bolX,
            y: pathY,
            skip: false,
            first: j === 0,
          });
        }

        // Print Bol
        let bolColor = "white";

        if (j !== 0) {
          bolColor = dotColors[i % _beats];
          drawDot(bolX, pathY, trailSize * 1.5, "white", bolColor);
        } else {
          // vertical bars
          drawBar(
            bolX,
            pathY + trailSize / 2,
            barHeight - trailSize / 2,
            1,
            disabled(bolX, pathY) ? disabledColor : dotColors[i % _beats],
            false
          );
        }

        if (disabled(bolX, pathY)) {
          bolColor = j === 0 ? "White" : "Black";
        }

        drawText(bolX - trailSize, pathY + trailSize, boles[j], bolColor);
      }
    }
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

  function drawMovingRect() {
    // draw tracking rect at xy
    ctx.fillStyle = "fuchsia";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(
      _cursor.x - trailSize,
      _cursor.y - 5 + trailSize * 2,
      barHeight / 2,
      barHeight - trailSize
    );
    ctx.fill();
    ctx.stroke();

    /*
      ctx.beginPath();
      ctx.rect(
          _cursor.x - trailSize,
          _cursor.y - (trailSize*2),
          barHeight / 2,
          trailSize
      );
      ctx.fill();
      ctx.stroke();
      */
    ctx.beginPath();
    ctx.arc(_cursor.x, _cursor.y - trailSize * 1, trailSize, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    /*
    ctx.beginPath();
    ctx.moveTo(_cursor.x ,_cursor.y+trailSize);
    ctx.lineTo(_cursor.x + trailSize*2, _cursor.y+ trailSize*2);
    ctx.lineTo(_cursor.x + trailSize, _cursor.y +trailSize);     
    ctx.fill();
*/
  }

  // draw tracking dot at xy

  function disabled(xPos, yPos) {
    if ((_cursor.x > xPos && _cursor.y >= yPos) || yPos < _cursor.y) {
      return true;
    }

    return false;
  }

  function drawMeasure(xPos, yPos) {
    ctx.fillStyle = "silver";
    ctx.fillRect(xPos, yPos - 1, measureWidth, 1);
    ctx.fillRect(xPos, yPos + 1, measureWidth, 1);
  }

  function drawBar(xPos, yPos, height, lineSize, color, disabled) {
    ctx.fillStyle = color;
    ctx.fillRect(xPos, yPos, lineSize, height);
  }

  function drawText(xPos, yPos, text, color) {
    ctx.fillStyle = color;
    ctx.fillText(text, xPos, yPos);
  }

  function drawDot(xPos, yPos, radius, fillColor, lineColor) {
    ctx.beginPath();
    ctx.arc(xPos, yPos, radius, 0, Math.PI * 2);

    ctx.lineWidth = 2;

    if (disabled(xPos, yPos)) {
      ctx.strokeStyle = disabledColor;
      ctx.fillStyle = disabledColor;
    } else {
      ctx.strokeStyle = lineColor;
      ctx.fillStyle = fillColor;
    }

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

    if (_isPlaying) {
      restart();
    }
  });

  function init() {
    // Load

    if (window.innerWidth < 900) {
      $("#beatsText").val(4);
    }

    setConstants();

    $("#btnPlay").on("click", play);
    $("#btnPause").on("click", pause);
    $("#btnRestart").on("click", restart);
    ctx.canvas.width = window.innerWidth - 50;
    ctx.canvas.height = 300;
    //$("#canvasDiv").height(window.innerHeight - 500);
    //$("#canvasDiv").width(window.innerWidth - 30);

    $("#consoleSize").text(window.innerWidth + " x " + window.innerHeight);
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

  function setSizes() {
    let desktop = window.innerWidth > 900;

    margin = 22;

    measureWidth = Math.floor(window.innerWidth / (Number(_beats) + 1));

    trailSize = 10;

    barHeight = Math.floor(trailSize * 4);
    measureHeight = margin + barHeight + margin + trailSize;

    _cursor = {
      x: margin,
      y: margin,
    };
    _seed = measureWidth / _tempo;

    console.log(
      "measureWidth",
      measureWidth,
      "measureHeight",
      measureHeight,
      "barHeight",
      barHeight,
      "trailSize",
      trailSize,
      "_seed",
      _seed,
      "desktop",
      desktop
    );
  }

  function setConstants() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    _trackPoints = new Array();

    _tempo = 60;
    _beats = 4;
    _isPlaying = false;
    _notes = "";

    (accentPitch = 380), (offBeatPitch = 200);

    noteSeparator = ".";
    measureSeparator = "|";
    restNoteText = "X";

    disabledColor = "Gray";
    dotColors = [
      "#dd2c00",
      "green",
      "#007bff",
      "#fa9207",
      "#dd2c00",
      "green",
      "#007bff",
      "#fa9207",
      "#dd2c00",
      "green",
      "#007bff",
      "#fa9207",
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
      "#F6B5A7",
      "#A7F6D2",
      "#A7BEF6",
      "#F6F4A7",
    ];
  }
});
