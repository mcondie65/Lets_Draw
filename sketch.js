let colour = []; //range for colour selectors
let size = []; //range for size selectors

let colour_qty = 7; //pick an odd number - number of colour options
let weight_qty = 5; //currently can't change from 5

let penColour; //master colour of drawing tool
let penSize = 19; //master size of pen

let numFill = 500; //number of circles between mouse and pmouse
let shapeVar = ""; //shape picker variable
let shapeRef = 0; //shape button state

var drawingCanvas; //main drawing drawingCanvas
var welcome; //welcome screen drawingCanvas

let welcomeState = true; //welcome screen state
let brushState = false; //brush trigger state
let emojiState = false; //emoji trigger state
let colourBoxHoverState = false;
let weightBoxHoverState = false;
let buttonHoverState = false;
let penState = true;

let fontRegular, fontBold, fontItalic; //font import

let previousState;

let stateIndex = 0;
let state = [];


//----- OPERATING FUNCTIONS -----//
function preload() {
  fontRegular = loadFont("Gotham-Light.otf");
  fontItalic = loadFont("Gotham-LightItalic.otf");
  fontBold = loadFont("Gotham-Bold.otf");
  emoji = loadImage("laughing.png");
}

function setup() {
  //create different canvases
  createCanvas(windowWidth, windowHeight);
  drawingCanvas = createGraphics(windowWidth, windowHeight);
  pickerCanvas = createGraphics(windowWidth, windowHeight)
  welcome = createGraphics(windowWidth, windowHeight);

  //Create individual colour picker circles
  for (i = 0; i < colour_qty; i++) {
    colour[i] = new colourPicker();
    colour[i].position(i - floor(colour_qty / 2));
  }
  colour[0].paintColour(0, 0, 0);
  colour[1].paintColour(54, 39, 6);
  colour[2].paintColour(70, 78, 46);
  colour[3].paintColour(172, 185, 146);
  colour[4].paintColour(57, 138, 185);
  colour[5].paintColour(28, 101, 140);
  colour[6].paintColour(233, 229, 214);


  //Create individual weight picker
  for (i = 1; i <= weight_qty; i++) {
    size[i] = new weightPicker();
    size[i].position(i - floor(weight_qty / 2) - 1);
    size[i].weight(i * 3 + 10);
  }

  //Create single classes
  clearDrawing = new clearDrawingClass();
  eraser = new eraserClass();
  drawShape = new drawShapeClass();
  emojiObject = new emojiClass();
  emojiCursor = new emojiClass();
  penButton = new penButtonClass();

  //set default image mode to center
  imageMode(CENTER);
  drawingCanvas.imageMode(CENTER);

  //Assigns first colour to pen
  penColour = colour[floor(colour_qty / 2)].colour;

  //Draws background
  background(240);

}

function draw() {
  //Draws background to update cursor image
  background(240);

  //Dispaly drawing canvas & hide cursor
  image(drawingCanvas, windowWidth / 2, windowHeight / 2);
  noCursor();

  //Display welcome screen at start and displaty normal cursor
  if (welcomeState == true) {
    welcomeScreen();
    image(welcome, 0, 0);
    cursor();
  }

  //Clear Drawing Button
  clearDrawing.hover();
  clearDrawing.display();

  //Eraser Button
  eraser.hover();
  eraser.display();

  //Draw other screen elements
  drawShapeBuild();
  colourPickerBuild();
  penSizeBuild();

  //Draw emoji
  emojiObject.hover();
  emojiObject.display(180, windowHeight - 50);
  
  penButton.hover();
  penButton.display();
  
  buttonHoverCheck();

  image(pickerCanvas, windowWidth/2, windowHeight/2);
  
  drawCursor();
}


//----- EVENTS -----//
function keyPressed() {
  //cycles through brush options
  if (welcomeState == false) {
    shapeRef = shapeRef + 1;
  }
  //resets brush options
  if (shapeRef == 4) {
    shapeRef = 0;
  }
  //hides welcome state
  if (welcomeState == true) {
    welcomeState = false;
    penState = true;
    saveState();
  }
  
//   if (keyCode === LEFT_ARROW) {
//     undoToPreviousState();
//   }
}

function mousePressed() {
  //gets new colour from colour picker
  for (i = 0; i < colour_qty; i++) {
    if (colour[i].trigger == true) {
      penColour = pickerCanvas.get(mouseX, mouseY);
    }
  }

  //gets pen size from size picker
  for (i = 1; i <= weight_qty; i++) {
    if (size[i].trigger == true) {
      penSize = size[i].penSize;
    }
  }

  //re-draws background when clear button clicked
  if (clearDrawing.trigger == true) {
    drawingCanvas.background(240);
  }

  //enables eraser mode
  if (eraser.trigger == true) {
    penColour = 240;
    penState = true
    brushState = false
    emojiState = false
  }

  //toggles shape brush mode
  if (drawShape.trigger == true) {
    if (brushState == false) {
      brushState = true;
      emojiState = false;
      penState = false;
      if (penColour == 240) {
        penColour = colour[floor(colour_qty / 2)].colour;
      }
      
    } else {
      brushState = false;
      penState = true;
    }
  }


  //toggles emoji sticker mode
  if (emojiObject.hoverTrigger == true) {
    if (emojiState == false) {
      emojiState = true;
      brushState = false;
      penState = false;
            if (penColour == 240) {
        penColour = colour[floor(colour_qty / 2)].colour;
      }
    } else {
      emojiState = false;
      penState = true;
    }
  }
  
  if (penButton.trigger == true) {
    if (penState == false) {
      emojiState = false;
      brushState = false;
      penState = true;
    }
  }
  
  //allows shapes to be clicked to paint
  if (brushState == true && buttonHoverState == false) {
    if (shapeRef == 0) {
      drawTriangledrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 1) {
      drawSquaredrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 2) {
      drawCircledrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 3) {
      drawXdrawingCanvas(mouseX, mouseY);
    }
  }

  if (emojiState == true && buttonHoverState == false) {
    emojiObject.displayCanvas(mouseX, mouseY);
  }
  
  if (penState == true && buttonHoverState == false) {
    drawingCanvas.noStroke();
    drawingCanvas.fill(penColour);
    drawingCanvas.circle(mouseX, mouseY, penSize);
  }
}

function mouseDragged() {
  //Code sourced from https://editor.p5js.org/pierrep/sketches/mYSCwSBbi
  if (penState == true) {
    drawingCanvas.strokeWeight(penSize-5);
    drawingCanvas.stroke(penColour);
    var destX = mouseX - pmouseX;
    var destY = mouseY - pmouseY;

    for (var i = 0; i < numFill; i++) {
      drawingCanvas.circle(
        pmouseX + (destX / numFill) * i,
        pmouseY + (destY / numFill) * i,
        5
      );
    }
  } else if (brushState == true) {
    if (shapeRef == 0) {
      drawTriangledrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 1) {
      drawSquaredrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 2) {
      drawCircledrawingCanvas(mouseX, mouseY);
    } else if (shapeRef == 3) {
      drawXdrawingCanvas(mouseX, mouseY);
    }
  }
}


//----- MAIN FUNCTIONS -----//
function welcomeScreen() {
  fill(0);
  noStroke();
  rectMode(CENTER);
  rect(
    windowWidth / 2,
    windowHeight / 2 - 38,
    windowWidth / 2 + 50,
    windowHeight / 4 + 80,
    20
  );
  textSize(50);
  fill(255);
  textAlign(CENTER, CENTER);
  textFont(fontBold);
  text("LET'S DRAW!", windowWidth / 2, windowHeight / 2 - 120);
  textSize(20);
  textFont(fontRegular);
  text("Choose your drawing tool", windowWidth / 2, windowHeight / 2 - 60);
  text(
    "Press any key to change brush shape",
    windowWidth / 2,
    windowHeight / 2 - 30
  );
  text(
    "Click and drag to draw.",
    windowWidth / 2,
    windowHeight / 2
  );
  textFont(fontItalic);
  text("Press any key to begin.", windowWidth / 2, windowHeight / 2 + 60);
  
  if (welcomeState == true) {
    brushState = false;
    penState = false;
    emojiState = false;
  }
}

function drawCursor() {
  if (welcomeState == 0 && penState == true) {
    noFill();
    strokeWeight(5);
    stroke(255);
    circle(mouseX, mouseY, penSize);
    if (penColour == 240) {
      stroke(0);
    } else {
      stroke(penColour);
    }
    strokeWeight(2);
    circle(mouseX, mouseY, penSize);
  } else if (brushState == true) {
    push();
    translate(mouseX, mouseY);

    if (welcomeState == 0 && shapeRef == 0) {
      drawTriangle(penSize+5, 'white');
      drawTriangle(penSize, penColour);
    } else if (shapeRef == 1) {
      drawSquare(penSize+5, 'white');
      drawSquare(penSize, penColour);
    } else if (shapeRef == 2) {
      drawCircle(penSize+5, 'white')
      drawCircle(penSize, penColour);
    } else if (shapeRef == 3) {
      drawX(penSize+5, 'white');
      drawX(penSize, penColour);
    }
    pop();
  } else if (emojiState == true) {
    emojiCursor.display(mouseX, mouseY);
  }
}

function colourPickerBuild() {
  //Draw white box behind colour picker
  pickerCanvas.fill(255);
  pickerCanvas.noStroke();
  pickerCanvas.rectMode(CENTER);
  pickerCanvas.rect(width / 2, colour[0].posY, colour_qty * 75, 75, 20);
  if (mouseX < width/2+((colour_qty*75)/2) && mouseX > width/2-((colour_qty*75)/2) && mouseY > colour[0].posY-(75/2) && mouseY < colour[0].posY+(75/2)) {
      colourBoxHoverState = true
      } else {
    colourBoxHoverState = false;
  }
  

  //Draw colour picker colours
  for (i = 0; i < colour_qty; i++) {
    colour[i].hover();
    colour[i].display();
  }
}

function penSizeBuild() {
  //Draw White Box for Pen Size Selection
  fill("white");
  noStroke();
  rectMode(CENTER);
  rect(width / 2, size[1].posY - 4, weight_qty * 45, 45, 20);
  if (mouseX < width/2+((weight_qty*45)/2) && mouseX > width/2-((weight_qty*45)/2) && mouseY < ((size[1].posY - 4)+(45/2)) && mouseY > ((size[1].posY - 4)-(45/2))) {
      weightBoxHoverState = true;
  } else {
    weightBoxHoverState = false;
  }

  //Draw weight picker dots
  for (i = 1; i <= 5; i++) {
    size[i].penColour(penColour);
    size[i].hover();
    size[i].display();

    //Overlay white on hover for pen picker
    if (size[i].trigger == true) {
      fill(255, 255, 255, 90);
      noStroke();
      circle(
        windowWidth / 2 +
          20 * (i - floor(weight_qty / 2) - 1) +
          20 * (i - floor(weight_qty / 2) - 1),
        windowHeight - 120,
        30
      );
    }
  }
}

function drawShapeBuild() {
  drawShape.hover();

  if (shapeRef == 0) {
    shapeVar = "triangle";
  }
  if (shapeRef == 1) {
    shapeVar = "square";
  }
  if (shapeRef == 2) {
    shapeVar = "circle";
  }
  if (shapeRef == 3) {
    shapeVar = "x";
  }

  drawShape.shapeSelect(shapeVar);
  drawShape.hover();
  drawShape.display();
}

function buttonHoverCheck() {
    if (colourBoxHoverState == true ||
        weightBoxHoverState == true ||
       clearDrawing.trigger == true ||
       drawShape.trigger == true ||
       eraser.trigger == true ||
       emojiObject.hoverTrigger == true) {
      buttonHoverState = true;
    } else {
      buttonHoverState = false;
      }
    }


//----- CLASSES -----//
class colourPicker {
  constructor() {
    this.colour = color(0, 0, 0);
    this.size = 50;
    this.posX = windowWidth / 2;
    this.posY = windowHeight - this.size;
    this.trigger = false;
  }

  display() {
    pickerCanvas.fill(this.colour);
    pickerCanvas.noStroke();
    pickerCanvas.circle(this.posX, this.posY, this.size);
  }

  paintColour(r, g, b) {
    this.colour = color(r, g, b);
  }

  position(num) {
    if (num == 0) {
      this.posX = windowWidth / 2;
    } else {
      this.posX = windowWidth / 2 + this.size * num + 20 * num;
    }
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.size = 55;
      this.trigger = true;
    } else {
      this.size = 50;
      this.trigger = false;
    }
  }
}

class weightPicker {
  constructor() {
    this.penSize = 10;
    this.colour = (0, 0, 0);
    this.posX = windowWidth / 2;
    this.posY = windowHeight - 120;
    this.trigger = true;
  }

  display() {
    fill(this.colour);
    circle(this.posX, this.posY, this.penSize);

    if (penSize == this.penSize) {
      noStroke();
      fill(180);
      circle(this.posX, this.posY - 18, 5);
    }
  }

  position(num) {
    if (num == 0) {
      this.posX = windowWidth / 2;
    } else {
      this.posX = windowWidth / 2 + 20 * num + 20 * num;
    }
  }

  weight(num) {
    this.penSize = num;
  }

  penColour(num) {
    this.colour = num;
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.penSize / 2) {
      this.trigger = true;
    } else {
      this.trigger = false;
    }
  }
}

class clearDrawingClass {
  constructor() {
    this.posX = windowWidth - 50;
    this.posY = windowHeight - 50;
    this.size = 50;
    this.trigger = true;
    this.xSize = 10;
    this.xWeight = 8;
    this.circleColour = 0;
  }

  display() {
    noStroke();
    fill(this.circleColour);
    circle(this.posX, this.posY, this.size);

    push();
    translate(windowWidth - 50, windowHeight - 50);
    strokeWeight(this.xWeight);
    stroke(100);
    line(-this.xSize, this.xSize, this.xSize, -this.xSize);
    line(this.xSize, this.xSize, -this.xSize, -this.xSize);
    pop();
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.trigger = true;
      this.circleColour = 200;
    } else {
      this.trigger = false;
      this.circleColour = 220;
    }
  }

  hoverGrow() {
    if (this.trigger == true) {
    } else {
    }
  }
}

class drawShapeClass {
  constructor() {
    this.posX = 115;
    this.posY = windowHeight - 50;
    this.size = 50;
    this.trigger = true;
    this.squareSize = 20;
    this.xWeight = 8;
    this.circleColour = 0;
    this.shape = "square";
    this.clickedState = false;
  }

  display() {
    if (this.trigger == true || brushState == true) {
      this.circleColour = 200;
    } else {
      this.circleColour = 220;
    }
    
    noStroke();
    fill(this.circleColour);
    circle(this.posX, this.posY, this.size);

    this.drawShape();
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.trigger = true;
    } else {
      this.trigger = false;
    }
  }

  shapeSelect(shape) {
    this.shape = shape;
  }

  drawShape() {
    if (this.shape == "square") {
      push();
      translate(this.posX, this.posY);
      drawSquare(penSize, penColour);
      pop();
    } else if (this.shape == "x") {
      push();
      translate(this.posX, this.posY);
      drawX(penSize, penColour);
      pop();
    } else if (this.shape == "circle") {
      push();
      translate(this.posX, this.posY);
      drawCircle(penSize, penColour);
      pop();
    } else if (this.shape == "triangle") {
      push();
      translate(this.posX, this.posY);
      drawTriangle(penSize, penColour);
      pop();
    }
  }
}

class eraserClass {
  constructor() {
    this.posX = windowWidth - 115;
    this.posY = windowHeight - 50;
    this.size = 50;
    this.trigger = false;
    this.xSize = 10;
    this.xWeight = 8;
    this.circleColour = 0;
  }

  display() {
    noStroke();
    this.circleColour = 220;
    if (penColour == 240 || this.trigger == true) {
      this.circleColour = 200;
    }
    fill(this.circleColour);
    circle(this.posX, this.posY, this.size);

    push();
    translate(this.posX, this.posY);
    rotate(-35);
    strokeWeight(this.xWeight);
    stroke(100);
    rectMode(CENTER);
    rect(0, 0, 25, 16, 2);
    pop();

    push();
    translate(this.posX, this.posY);
    stroke(100);
    strokeWeight(5);
    line(-12, 16, 12, 16);
    pop();
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.trigger = true;
      //this.circleColour = 200;
    } else {
      this.trigger = false;
      //this.circleColour = 220;
    }
  }
}

class emojiClass {
  constructor() {
    this.size = 55;
    this.posX = 115;
    this.posY = windowHeight - 50;
    this.hoverTrigger = false;
  }

  display(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    image(emoji, this.posX, this.posY, this.size, this.size);
  }

  displayCanvas(posX, posY) {
    this.posX = posX;
    this.posY = posY;
    drawingCanvas.image(emoji, this.posX, this.posY, this.size, this.size);
  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.hoverTrigger = true;
      this.size = 60;
    } else {
      this.hoverTrigger = false;
      this.size = 55;
    }
  }
}

class penButtonClass {
  constructor() {
    this.posX = 50;
    this.posY = windowHeight - 50;
    this.size = 50;
    this.trigger = true;
    this.clickedState = false;
    this.circleColour = 0;
  }

  display() {
    if (this.trigger == true || penState == true) {
      this.circleColour = 200;
    } else {
      this.circleColour = 220;
    }
    
    noStroke();
    fill(this.circleColour);
    circle(this.posX, this.posY, this.size);
    
    strokeWeight(2);
    stroke(penColour);
    if (penState == true) {
      fill(penColour);
    } else {
      noFill();
    }
    circle(this.posX, this.posY, penSize)

  }

  hover() {
    if (dist(mouseX, mouseY, this.posX, this.posY) <= this.size / 2) {
      this.trigger = true;
    } else {
      this.trigger = false;
    }
  }
}


//----- SHAPE FUNCTIONS -----//
function drawTriangle(weight, colour) {
  strokeWeight(weight - 10);
  stroke(colour);
  let lineLength = 12;
  line(-lineLength, lineLength, lineLength, lineLength);
  line(lineLength, lineLength, 0, -lineLength);
  line(0, -lineLength, -lineLength, lineLength);
}
function drawCircle(weight, colour) {
  strokeWeight(weight - 10);
  noFill();
  stroke(colour);
  circle(0, 0, 25);
}
function drawSquare(weight, colour) {
  strokeWeight(weight - 10);
  stroke(colour);
  noFill();
  rectMode(CENTER);
  square(0, 0, 25, 1);
}
function drawX(weight, colour) {
  strokeWeight(weight - 10);
  stroke(colour);
  line(-10, 10, 10, -10);
  line(10, 10, -10, -10);
}

function drawTriangledrawingCanvas(posX, posY) {
  drawingCanvas.strokeWeight(penSize - 10);
  drawingCanvas.stroke(penColour);
  let lineLength = 12;
  drawingCanvas.line(
    posX - lineLength,
    posY + lineLength,
    posX + lineLength,
    posY + lineLength
  );
  drawingCanvas.line(
    posX + lineLength,
    posY + lineLength,
    posX,
    posY - lineLength
  );
  drawingCanvas.line(
    posX,
    posY - lineLength,
    posX - lineLength,
    posY + lineLength
  );
} 
function drawCircledrawingCanvas(posX, posY) {
  drawingCanvas.strokeWeight(penSize - 10);
  drawingCanvas.noFill();
  drawingCanvas.stroke(penColour);
  drawingCanvas.circle(posX, posY, 25);
}
function drawSquaredrawingCanvas(posX, posY) {
  drawingCanvas.strokeWeight(penSize - 10);
  drawingCanvas.stroke(penColour);
  drawingCanvas.noFill();
  drawingCanvas.rectMode(CENTER);
  drawingCanvas.square(posX, posY, 25, 1);
}
function drawXdrawingCanvas(posX, posY) {
  drawingCanvas.strokeWeight(penSize - 10);
  drawingCanvas.stroke(penColour);
  drawingCanvas.line(posX - 10, posY + 10, posX + 10, posY - 10);
  drawingCanvas.line(posX + 10, posY + 10, posX - 10, posY - 10);
}




//UNDO
function undoToPreviousState() {
  if (!state || !state.length || stateIndex === 0) {
    return;
  }

  stateIndex--;
  
  //drawingCanvas.background(200);
  drawingCanvas.image(state[stateIndex], windowWidth/2, windowHeight/2);
}

// function mouseReleased() {
//   saveState();
// }

function saveState() {
  stateIndex++;

  drawingCanvas.loadPixels();
  state.push(get())
}

