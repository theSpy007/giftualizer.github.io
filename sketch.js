let capture, captureWidth, captureHeight, captureOffsetX, captureOffsetY;
let video = null;
let model = null;
let model_is_loaded = false;

const res_x = 56;
const res_y = 56;

let marker_pos = null;

let inputMat, videoMat;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  stroke(255);
  textSize(20);

  ellipseMode(CENTER);


  await tf.loadLayersModel('tensorflowjs_save/model.json').then(function (data) {
    console.log('model loaded');
    model_is_loaded = true;
    model = data;
  });

  //capture.size(320, 240);
}

function cvSetup() {
  inputMat = new cv.Mat([res_x, res_y], cv.CV_8UC4);
  videoMat = new cv.Mat([1920, 1080], cv.CV_8UC4);

}
var ready = false;
function cvReady() {
  if (!cv || !cv.loaded) return false;
  if (ready) {
    return true;
  }
  ready = true;
  return true;
}

function startVideo() {
  if (capture == null) {
    capture = createCapture(VIDEO);
    capture.hide()


    if (width > height) {
      captureWidth = (height / capture.height) * capture.width;
      captureHeight = height;
    } else {

      captureWidth = width;
      captureHeight = (width / capture.width) * capture.height;
    }

    captureOffsetX = (width - captureWidth) / 2;
    captureOffsetY = (height - captureHeight) / 2;

    video = createVideo('video.mov');
    video.loop();
    // The above function actually makes a separate video
    // element on the page.  The line below hides it since we are
    // drawing the video to the canvas
    video.hide();
    cvSetup();
  }
}

function mousePressed() {
  startVideo();
}

function predict() {
  if (model_is_loaded) {
    video.loadPixels();
    videoMat.data().set(video.pixels);
    input = createImage(res_x, res_y);
    input.copy(capture, 0, 0, capture.width, capture.height, 0, 0, res_x, res_y);
    input.loadPixels();
    inputMat.data().set(input.pixels);
    tensor = tf.tensor(inputMat.data());
    tensor = tensor.reshape([res_x, res_y, 4]);
    tensor = tensor.sum(2);
    tensor = tensor.div(3);
    tensor = tensor.expandDims(2);
    tensor = tensor.expandDims(0);
    
    //tensor = tf.tensor([tensor]);
    
    tmp_marker_pos = model.predict(tensor).arraySync()[0];
    if (marker_pos == null){
      marker_pos = tmp_marker_pos;
    }else{
      for(i = 0; i < tmp_marker_pos.length; i++){
        //console.log(marker_pos[i] + tmp_marker_pos[0][i])
        marker_pos[i] = (marker_pos[i] + tmp_marker_pos[i]) / 2.0
      }
    }
    //console.log(marker_pos)
  }
}

function draw() {
  background(0);
  // Step 5. Display the video image.
  if (cvReady()) {
    if (video != null) {

      predict();

      image(capture, captureOffsetX, captureOffsetY, captureWidth, captureHeight);
      image(video, 10, 10, 1000, 100);

      for(i = 0; i < marker_pos.length/2; i++){
        fill(255,0,0)
        //console.log(marker_pos[i*2+1]*captureWidth + captureOffsetX, marker_pos[i*2+1]*captureHeight)
        ellipse(marker_pos[i*2]*captureWidth + captureOffsetX, marker_pos[i*2+1]*captureHeight + captureOffsetY, 20, 20)
      }
    } else {
      text("Pleas click on the screen.", width / 2, height / 2);
    }
  }
}