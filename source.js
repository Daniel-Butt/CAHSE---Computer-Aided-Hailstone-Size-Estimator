var windowScale = 0.95;
var state = "idle";
var mouseIn = false;

var gui;
var cnv;
var img;

var params = {
    'Hand Size': ['average', 'small', 'large'],
    'Hand Gender': ['male', 'female'],
    'Assumed Hand Length': '191.47mm',
    'Assumed Hand Width': '96.53mm',
    'Measured Hand Length (pixels)': '-',
    'Measured Hand Width (pixels)': '-',
    'Measured Hail Size (pixels)': '-',
    'Estimated Hail Size' : '-'
}

var handLengthPoints = [];
var handWidthPoints = [];
var hailSizePoints = [];


function setup(){
    cnv = createCanvas(windowWidth*windowScale, windowHeight*windowScale);
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    cnv.position(x, y);
    cnv.mouseOver(() => mouseIn = true);
    cnv.mouseOut(() => mouseIn = false);
    // input = createFileInput(handleFile);
    // input.position(0, 0);

    gui = createGui();
    gui.addObject(params);
    //gui.moveTo(0, 50);
}

function draw(){
    windowResized();
    background(70);

    if(img){
        //let imgCopy = copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)
        let imgCopy = createImage(img.width, img.height);
        imgCopy.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        imgCopy.resize(width, height);
        image(imgCopy, width/2 - imgCopy.width/2, height/2 - imgCopy.height/2);
    }
    noFill();
    strokeWeight(3);

    stroke(3, 69, 8);
    for (p of handLengthPoints){
        circle(p[0]*width, p[1]*height, Math.min(width, height)/75);
    }
    stroke(0, 0, 255);
    for (p of handWidthPoints){
        circle(p[0]*width, p[1]*height, Math.min(width, height)/75);
    }
    stroke(255, 0, 0);
    for (p of hailSizePoints){
        circle(p[0]*width, p[1]*height, Math.min(width, height)/75);
    }

    let pts = addMousePoint();

    strokeWeight(2);
    stroke(3, 69, 8);
    for (let i = 0; i<handLengthPoints.length - 1; i++){
        p1 = handLengthPoints[i];
        p2 = handLengthPoints[i+1];

        line(p1[0]*width, p1[1]*height, p2[0]*width, p2[1]*height);
    }
    stroke(0, 0, 255);
    for (let i = 0; i<handWidthPoints.length - 1; i++){
        p1 = handWidthPoints[i];
        p2 = handWidthPoints[i+1];

        line(p1[0]*width, p1[1]*height, p2[0]*width, p2[1]*height);
    }
    stroke(255, 0, 0);
    for (let i = 0; i<hailSizePoints.length - 1; i++){
        p1 = hailSizePoints[i];
        p2 = hailSizePoints[i+1];

        line(p1[0]*width, p1[1]*height, p2[0]*width, p2[1]*height);
    }

    if(pts){
        fill(255, 255, 255);
        stroke(0, 0, 0);
        textSize(24);
        let d = 0

        for (let i = 0; i < pts.length - 1; i++){
            d += Math.sqrt(Math.pow((pts[i][0]*img.width - pts[i+1][0]*img.width), 2) + Math.pow((pts[i][1]*img.height - pts[i+1][1]*img.height), 2));
        }

        if (d != 0){
            text(Math.floor(d).toString(), mouseX, mouseY - 20);
        }
        
        pts.pop();
        updateDistance();
    }

    if(params['Measured Hand Length (pixels)'] != '-' && params['Measured Hand Width (pixels)'] != '-' && params['Measured Hail Size (pixels)'] != '-'){
        estimateHailStoneSize();
    }
    else{
        gui.setValue('Estimated Hail Size', '-');
    }

}

function windowResized() {
    if(img){
        let widthScaleFactor = (windowWidth*windowScale - 300) / img.width;
        let heightScaleFactor = (windowHeight*windowScale) / img.height;

        let scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

        resizeCanvas(img.width * scaleFactor, img.height * scaleFactor);
    }
    else{
        resizeCanvas(windowWidth*windowScale - 300, windowHeight*windowScale);
    }
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    cnv.position(x, y);
}

// function handleFile() {
//     const selectedFile = document.getElementById('upload');
//     const myImageFile = selectedFile.files[0];
//     let urlOfImageFile = URL.createObjectURL(myImageFile);
//     img = loadImage(urlOfImageFile);
// }

function importData() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg';
    input.onchange = _ => {
      // you can use this method to get file and perform respective operations
        console.log('y')
        const myImageFile = input.files[0];
        let urlOfImageFile = URL.createObjectURL(myImageFile);
        noLoop();
        img = loadImage(urlOfImageFile, () => loop());

        //console.log(width, height)
        redraw();
        };
    input.click();
    
}

function estimateHailStoneSize(){

    let handLength = parseFloat(params['Assumed Hand Length'].slice(0, -2));
    let measuredHandLength = parseInt(params['Measured Hand Length (pixels)'])

    let lengthRatio = handLength / measuredHandLength;

    let handWidth = parseFloat(params['Assumed Hand Width'].slice(0, -2));
    let measuredHandWidth = parseInt(params['Measured Hand Width (pixels)'])

    let widthRatio = handWidth / measuredHandWidth;

    let pixelRatio = (lengthRatio + widthRatio)/2.0;

    let measuredHailStoneSize = parseInt(params['Measured Hail Size (pixels)'])

    let estimatedHailStoneSize = measuredHailStoneSize * pixelRatio;

    gui.setValue('Estimated Hail Size', Math.round(estimatedHailStoneSize).toString() + 'mm');

}

function updateDistance(){
    if (state != 'idle'){
        let pts;
        let guiVariableName;

        switch(state){
            case 'Hand Length':
                pts = handLengthPoints;
                guiVariableName = 'Measured Hand Length (pixels)';
                break;
            case 'Hand Width':
                pts = handWidthPoints;
                guiVariableName = 'Measured Hand Width (pixels)';
                break;
            case 'Hail Size':
                pts = hailSizePoints;
                guiVariableName = 'Measured Hail Size (pixels)';
                break;

        }

        let d = 0

        for (let i = 0; i < pts.length - 1; i++){
            d += Math.sqrt(Math.pow((pts[i][0]*img.width - pts[i+1][0]*img.width), 2) + Math.pow((pts[i][1]*img.height - pts[i+1][1]*img.height), 2));
        }

        if (d == 0){
            gui.setValue(guiVariableName, '-')
        }
        else{
            gui.setValue(guiVariableName, Math.floor(d).toString())
        }
        
    }

}

function addMousePoint() {
    if (state != 'idle' && mouseIn){
        let pts;

        switch(state){
            case 'Hand Length':
                pts = handLengthPoints;
                break;
            case 'Hand Width':
                pts = handWidthPoints;
                break;
            case 'Hail Size':
                pts = hailSizePoints;
                break;

        }

        pts.push([mouseX/width, mouseY/height])

        return pts
    }
}

function mouseClicked() {
    addMousePoint();
}

function updateState(newState){
    state = newState;
    console.log(state);
}
