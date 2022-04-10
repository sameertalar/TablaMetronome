window.onload = function () {
  var notesInput =
    "धा.↦.↦.↦|धिं.↦.न.↦|ग.↦.↦.↦|तिं₂.↦.न₂.↦|ता.↦.↦.↦|धिं.↦.न.↦|ग.↦.↦.↦|धिं₂.↦.न₂.↦";
  var dd = 10;
  var beats = notesInput.split("|");
  var notes = [];

  for (var i = 0; i < beats.length; i++) {
    let items = beats[i].split(".");
    for (var j = 0; j < items.length; j++) {
      notes.push(items[j]);
    }
  }

  console.log(notes);

  // DEFINE CANVAS AND ITS CONTEXT.
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var radius = (canvas.height / 2) * 0.9;

  var fps = 10000;

  // requestAnimationFrame(animate);

  function animate() {
    setTimeout(function () {
      requestAnimationFrame(animate);

      showClock();
    }, 1000 / fps);
  }
  animate();

  setInterval(showClock, 10);

  function showClock() {
    var date = new Date();
    var angle;

    // CLEAR EVERYTHING ON THE CANVAS. RE-DRAW NEW ELEMENTS EVERY SECOND.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //drawFace(ctx, radius);
    OUTER_DIAL1();
    OUTER_DIAL2();
    CENTER_DIAL();

    MARK_THE_SECONDS();
    MARK_THE_HOURS();
    MARK_Bols();

    SHOW_SECONDS();

    // draw
    // draw(newX, newY);

    //  SHOW_MINUTES();
    //  SHOW_HOURS();

    function drawFace(ctx, radius) {
      var grad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * 0.95,
        0,
        0,
        radius * 1.05
      );
      grad.addColorStop(0, "#333");
      grad.addColorStop(0.5, "white");
      grad.addColorStop(1, "#333");
      ctx.strokeStyle = grad;
      ctx.lineWidth = radius * 0.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
      ctx.fillStyle = "#333";
      ctx.fill();
    }

    function OUTER_DIAL1() {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(canvas.width / 2, canvas.height / 2, radius + 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(canvas.width / 2, canvas.height / 2, radius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "#92949C";
      ctx.stroke();
    }
    function OUTER_DIAL2() {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "#929BAC";
      ctx.stroke();
    }
    function CENTER_DIAL() {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.fillStyle = "#353535";
      ctx.strokeStyle = "#0C3D4A";
      ctx.stroke();
    }

    function MARK_THE_HOURS() {
      for (var i = 0; i < beats.length; i++) {
        //for (var i = 0; i < 12; i++) {
        angle = ((i - 2) * (Math.PI * 2)) / beats.length; // THE ANGLE TO MARK.

        ctx.lineWidth = i === 0 ? 20 : 10; // HAND WIDTH.

        ctx.beginPath();

        var x1 = canvas.width / 2 + Math.cos(angle) * radius;
        var y1 = canvas.height / 2 + Math.sin(angle) * radius;
        var x2 = canvas.width / 2 + Math.cos(angle) * (radius - radius / 10);
        var y2 = canvas.height / 2 + Math.sin(angle) * (radius - radius / 10);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        //ctx.strokeStyle = "#466B76";
        ctx.strokeStyle = i === 0 ? "Red" : "#466B76"; // HAND WIDTH.

        ctx.stroke();
      }
    }

    function MARK_THE_SECONDS() {
      for (var i = 0; i < notes.length; i++) {
        // for (var i = 0; i < 60; i++) {
        angle = ((i - 3) * (Math.PI * 2)) / notes.length; // THE ANGLE TO MARK.
        ctx.lineWidth = 5; // HAND WIDTH.
        ctx.beginPath();

        var x1 = canvas.width / 2 + Math.cos(angle) * radius;
        var y1 = canvas.height / 2 + Math.sin(angle) * radius;
        var x2 = canvas.width / 2 + Math.cos(angle) * (radius - radius / 10);
        var y2 = canvas.height / 2 + Math.sin(angle) * (radius - radius / 10);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = "#C4D1D5";
        ctx.stroke();
      }
    }

    function MARK_Bols() {
      ctx.font = radius * 0.1 + "px arial";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      let radius2 = radius - 35;

      for (var i = 0; i < notes.length; i++) {
        // for (var i = 0; i < 60; i++) {

        if (notes[i] != "↦") {
          angle = ((i - 8) * (Math.PI * 2)) / notes.length; // THE ANGLE TO MARK.
          ctx.lineWidth = 5; // HAND WIDTH.
          ctx.beginPath();

          var x1 = canvas.width / 2 + Math.cos(angle) * radius2;
          var y1 = canvas.height / 2 + Math.sin(angle) * radius2;

          ctx.fillText(notes[i], x1, y1);
          //ctx.fillText(i, x1, y1);

          ctx.strokeStyle = "#C4D1D5";
          ctx.stroke();
        }
      }
    }

    function draw(x, y) {
      ctx.save();

      ctx.beginPath();
      ctx.rect(x - 50 / 2, y - 50 / 2, 50, 50);
      //ctx.arc(canvas.width / 2, canvas.height / 2, radius + 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    function SHOW_SECONDS() {
      var sec = date.getSeconds();
      angle = Math.PI * 2 * (sec / 10) - (Math.PI * 2) / 4;
      ctx.lineWidth = 4; // HAND WIDTH.

      ctx.beginPath();
      // START FROM CENTER OF THE CLOCK.
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      // DRAW THE LENGTH.
      ctx.lineTo(
        canvas.width / 2 + Math.cos(angle) * radius,
        canvas.height / 2 + Math.sin(angle) * radius
      );

      // DRAW THE TAIL OF THE SECONDS HAND.
      ctx.moveTo(canvas.width / 2, canvas.height / 2); // START FROM CENTER.
      // DRAW THE LENGTH.
      ctx.lineTo(
        canvas.width / 2 - Math.cos(angle) * 20,
        canvas.height / 2 - Math.sin(angle) * 20
      );

      ctx.strokeStyle = "blue"; // COLOR OF THE HAND.
      ctx.stroke();
    }

    function SHOW_MINUTES() {
      var min = date.getMinutes();
      angle = Math.PI * 2 * (min / 60) - (Math.PI * 2) / 4;
      ctx.lineWidth = 1.5; // HAND WIDTH.

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2); // START FROM CENTER.
      // DRAW THE LENGTH.
      ctx.lineTo(
        canvas.width / 2 + (Math.cos(angle) * radius) / 1.1,
        canvas.height / 2 + (Math.sin(angle) * radius) / 1.1
      );

      ctx.strokeStyle = "#999"; // COLOR OF THE HAND.
      ctx.stroke();
    }

    function SHOW_HOURS() {
      var hour = date.getHours();
      var min = date.getMinutes();
      angle =
        Math.PI * 2 * ((hour * 5 + (min / 60) * 5) / 60) - (Math.PI * 2) / 4;
      ctx.lineWidth = 1.5; // HAND WIDTH.

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2); // START FROM CENTER.
      // DRAW THE LENGTH.
      ctx.lineTo(
        canvas.width / 2 + (Math.cos(angle) * radius) / 1.5,
        canvas.height / 2 + (Math.sin(angle) * radius) / 1.5
      );

      ctx.strokeStyle = "#000"; // COLOR OF THE HAND.
      ctx.stroke();
    }
  }
};
