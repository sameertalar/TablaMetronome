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
  var _cursor, _trackPoints, _notes, _mobile, _cycle, _cycleTime;

  // Load
  init();
  viewNotes();

  function viewNotes() {
    readInputs();
    setTrackingPints();
    //draw(0);
    drawCanvas();
  }

  function readInputs() {
    _trackPoints = new Array();
    _beats = $("#beatsText").val();
    _tempo = $("#rangeTempo").val();
    _notes.length = 0;
    _notes = $("#notesText")
      .val()
      .replace(/\t/g, "|")
      .replace(/(\r\n|\n|\r)/gm, "|")
      .replace(" ", "|");

    setSizes();
  }

  function play() {
    //if (!_isPlaying) {
    _trackPoints = new Array();
    audioContext = new AudioContext();
    _isPlaying = true;
    readInputs();
    togglePlay();
    setTrackingPints();
    console.log("Cycle: started at ", new Date().toLocaleString());
    _cycleTime = new Date().getTime();
    $("#videoDummy")[0].play();
    console.log(_trackPoints);
    /*
    } else {
      _seed = (measureWidth / 60) * (_tempo / 60);
      console.log("tEMPO:", _tempo, "sEED", _seed);
    }
    */

    //draw(0);
    drawCanvas();
    _animationFrameId = window.requestAnimationFrame(animate);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _cursor = {
      x: margin,
      y: margin,
    };
    $("#canvasDiv").scrollTop(-100);
    play();
  }

  function animate() {
    draw(_seed);

    _animationFrameId = window.requestAnimationFrame(function () {
      if (_isPlaying) animate();
    });
  }

  function cancelAnimate() {
    _isPlaying = false;
    cancelAnimationFrame(_animationFrameId);
    return;
  }

  // draw the current frame based on sliderValue
  function draw(seed) {
    //  if (seed === 0) drawCanvas();

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
        // $("#canvasDiv").scrollTop(-100);
        $(window).scrollTop();

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

    if (_cursor.y > 400) {
      // $("#canvasDiv").scrollTop(_cursor.y - margin - measureHeight * 4);
      // $(window).scrollTop(800);
      $("#canvasDiv")[0].scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      $("#canvasDiv")[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $("#consoleCursor").text(
      Math.floor(_cursor.x) + " :" + Math.floor(_cursor.y)
    );
  }

  function setTrackingPints() {
    _trackPoints = new Array();
    _trackPoints.length = 0;
    let notes = _notes.split(measureSeparator);

    let pathX = margin;
    let pathY = margin;

    for (var i = 0; i < notes.length; i++) {
      if (i % _beats === 0) {
        pathX = margin;

        if (i !== 0) {
          pathY = pathY + measureHeight;
          $("#consoleMaxY").text(pathY + barHeight + trailSize);
        }
      }

      pathX = pathX + measureWidth;
      // vertical bars

      var boles = notes[i].split(noteSeparator);

      for (var j = 0; j < boles.length; j++) {
        let bolX = pathX - measureWidth + j * (measureWidth / boles.length);

        _trackPoints.push({
          bole: boles[j],
          x: bolX,
          y: pathY,
          color: j === 0 ? "white" : dotColors[i % _beats],
          bgColor: j === 0 ? dotColors[i % _beats] : "white",
          skip: false,
          first: j === 0,
        });
      }

      // Ending Bar
      if (i % _beats === _beats - 1) {
        _trackPoints.push({
          bole: (i + 1) / _beats,
          x: pathX,
          y: pathY,
          color: "Black",
          bgColor: "white",
          skip: false,
          first: null,
          end: true,
        });

        $("#consoleMaxX").text(pathX + trailSize);
      }
    }

    ctx.canvas.height = _trackPoints[_trackPoints.length - 1].y + 100;
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = 20 + "px Arial";

    let tp = _trackPoints;

    for (var i = 0; i < tp.length; i++) {
      let nonactive = disabledCheck(tp[i].x, tp[i].y);

      if (tp[i].first) {
        ctx.beginPath();
        ctx.moveTo(tp[i].x, tp[i].y);
        drawMeasure(tp[i].x, tp[i].y);

        // vertical bars
        drawBar(
          tp[i].x,
          tp[i].y + trailSize / 2,
          barHeight - trailSize / 2,
          1,
          tp[i].bgColor,
          nonactive
        );

        /* ??
        drawDot(
          tp[i].x - measureWidth,
          tp[i].y,
          trailSize * 1.5,
          dotColors[i % _beats],
          dotColors[i % _beats]
        );
        */
      }

      if (tp[i].end) {
      }

      drawDot(
        tp[i].x,
        tp[i].y,
        trailSize * 1.5,
        nonactive ? disabledColor : tp[i].bgColor,
        nonactive && !tp[i].first ? disabledColor : tp[i].color
      );
      drawText(
        tp[i].x - trailSize,
        tp[i].y + trailSize,
        tp[i].bole,
        nonactive && !tp[i].first ? "Black" : tp[i].color
      );
    }
  }

  // Obsolute
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
            disabledCheck(bolX, pathY) ? disabledColor : dotColors[i % _beats],
            false
          );
        }

        if (disabledCheck(bolX, pathY)) {
          bolColor = j === 0 ? "White" : "Black";
        }

        drawText(bolX - trailSize, pathY + trailSize, boles[j], bolColor);
      }
    }

    if (init) ctx.canvas.height = _trackPoints[_trackPoints.length - 1].y + 100;
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

  function drawMovingCursor() {
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

    drawBar(
      _cursor.x - 3,
      _cursor.y - 5 + trailSize * 2,
      trailSize * 1.5,
      6,
      "black"
    );
    // drawBar(_cursor.x+(barHeight/3),_cursor.y- trailSize,trailSize*2.5,2, "black");

    /*
    ctx.beginPath();
    ctx.moveTo(_cursor.x ,_cursor.y+trailSize);
    ctx.lineTo(_cursor.x + trailSize*2, _cursor.y+ trailSize*2);
    ctx.lineTo(_cursor.x + trailSize, _cursor.y +trailSize);     
    ctx.fill();
*/
  }

  // draw tracking dot at xy

  function disabledCheck(xPos, yPos) {
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
    ctx.fillStyle = disabled ? disabledColor : color;
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

    ctx.strokeStyle = lineColor;
    ctx.fillStyle = fillColor;

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

  function init() {
    // Load

    setConstants();

    $("#btnPlay").on("click", play);
    $("#btnPause").on("click", pause);

    $("#notesText").on("focusout", viewNotes);

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
    } else {
      $("#btnPlay").show();
      $("#btnPause").hide();
    }
  }

  function setSizes() {
    let mobileRatio = 1;

    if (window.innerWidth < 500 || window.innerHeight < 500) {
      _mobile = true;
      $("#beatsText").val(4);
    } else {
      _mobile = false;
    }

    if (_notes.split("|").length > 16 || _mobile) mobileRatio = 0.7;

    let desktop = window.innerWidth > 900;

    margin = 22;

    measureWidth = Math.floor(window.innerWidth / (Number(_beats) + 1));

    trailSize = 10;

    barHeight = Math.floor(trailSize * 4);
    measureHeight = (margin + barHeight + margin + trailSize) * mobileRatio;

    _cursor = {
      x: margin,
      y: margin,
    };
    _seed = (measureWidth / 60) * (_tempo / 60);

    console.log(
      "setSizes() - _tempo",
      _tempo,
      "_seed",
      _seed,
      "  measureWidth",
      measureWidth,
      "measureHeight",
      measureHeight,
      "barHeight",
      barHeight,
      "trailSize",
      trailSize,
      "_mobile",
      _mobile,
      "_notes ",
      _notes.split("|").length
    );
  }

  function setConstants() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    _trackPoints = new Array();
    _cycle = 0;

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
