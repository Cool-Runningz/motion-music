const modelParams = {
  flipHorizontal: true, // flip e.g for video
  imageScaleFactor: 0.7, // reduce input image size for gains in speed.
  maxNumBoxes: 1, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.9, // confidence threshold for predictions.
};

const genres = {
  classical: {
    filter: "sepia",
    source: "https://ccrma.stanford.edu/~jos/mp3/oboe-bassoon.mp3",
  },
  jazz: {
    filter: "grayscale",
    source: "https://ccrma.stanford.edu/~jos/mp3/JazzTrio.mp3",
  },
  rock: {
    filter: "rocknroll",
    source: "https://ccrma.stanford.edu/~jos/mp3/gtr-dist-jimi.mp3",
  },
};

const video = document.getElementsByTagName("video")[0];
const audio = document.getElementsByTagName("audio")[0];
const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");
let model;

function loadModel() {
  handTrack.load().then((_model) => {
    // Initial interface after model load.
    // Store model in global model variable
    model = _model;
    model.setModelParameters(modelParams);
    
    runDetection();
    document.getElementById("loading").remove();
  });
}

// Returns a promise
handTrack.startVideo(video).then(function (status) {
  if (status) {
    loadModel()
  } else {
    console.log("Please enable video");
  }
});

function applyFilter(filterType) {
  if (canvas.classList.length > 0) canvas.classList.remove(canvas.classList[0]);
  canvas.classList.add(filterType);
}

function drawText(text, x, y) {
  const color = "black";
  const font = "1.5rem Rammetto One";

  context.font = font;
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function runDetection() {
  model.detect(video).then((predictions) => {
    //Render hand predictions to be displayed on the canvas
    model.renderPredictions(predictions, canvas, context, video);

    //Add genres to canvas
    drawText("Rock 🎸", 25, 50);
    drawText("Classical 🎻", 250, 50);
    drawText("Jazz 🎷", 525, 50, "");

    requestAnimationFrame(runDetection);

    if (predictions.length > 0) {
      let x = predictions[0].bbox[0];
      let y = predictions[0].bbox[1];

      //Apply proper music source and filter based on hand position
      if (y <= 100) {
        if (x <= 150) {
          //ROCK
          audio.src = genres.rock.source;
          applyFilter(genres.rock.filter);
        } else if (x >= 250 && x <= 350) {
          //CLASSICAL
          audio.src = genres.classical.source;
          applyFilter(genres.classical.filter);
        } else if (x >= 450) {
          //JAZZ
          audio.src = genres.jazz.source;
          applyFilter(genres.jazz.filter);
        }
        //Play the sound
        audio.play();
      }
    }
  });
}
