let capture;

function setup() {
  createCanvas(640, 360);
  video = createVideo('video.mov');
  video.loop();
  // The above function actually makes a separate video
  // element on the page.  The line below hides it since we are
  // drawing the video to the canvas
  video.hide();
  
  capture = createCapture(VIDEO);
  console.log(capture.height);
  capture.hide()
  //capture.size(320, 240);
}

function draw() {
  background(0);
  // Step 5. Display the video image.
  image(capture, 0, 0, capture.width, capture.height);
  image(video, 10, 10, 100, 100);
}