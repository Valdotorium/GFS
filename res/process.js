
let findSeparatingSymbol = function(csvString){
    //c is used as counter
    console.log("loaded csv string:", csvString)
    let c = 0
    let foundSeparatingSymbol = false
    console.log(Array.from(csvString)[0])
    return Array.from(csvString)[0]

}
//fuction for waiting
let sleep = (delay) => {
    new Promise((resolve) => setTimeout(resolve, delay))
}
let readCSVstring = function (csvString){
    //splitting the csv string into an array of strings
    let csvMatrix = []
    //reading the csv string
    let csvArray = csvString.split(/\r?\n|\r|\n/g)
    //seperating the lines
    console.log("Array split in lines: ",csvArray)
    for (let i = 0; i < csvArray.length; i++) {
        //separating the columns
        csvArray[i] = csvArray[i].split(separatingSymbol)

        csvMatrix.push(csvArray[i])
        }
    console.log(csvMatrix)
    return csvMatrix
    }
    
let convertCSVMatrix = function (csvMatrix) { 
    //make all the items integers, except for the first line and column
    //the diagrams title is in the top left corner of the table
    //the first line is the column names
    let diagramTitle = csvMatrix[0][0]
    for (let i = 1; i < csvMatrix.length; i++) {
        for (let j = 1; j < csvMatrix[i].length; j++) {
            if (csvMatrix[i][j] !== ""){
                csvMatrix[i][j] = parseInt(csvMatrix[i][j])
            }
            else {
                csvMatrix[i][j] = 0
            }
        }
    }
    console.log("Coverted Matrix: ",csvMatrix)
    console.log("Diagram Title:" , diagramTitle)
    return csvMatrix
    }


console.log(document.getElementById("output").innerText)
//storing the csv file as string
let csvString = document.getElementById("output").innerText
//finding the separating symbol
let separatingSymbol = findSeparatingSymbol(csvString)
console.log("Found separating symbol in csv string: "+ separatingSymbol)
//reading the csv string
let csvMatrix = readCSVstring(csvString)
csvMatrix = convertCSVMatrix(csvMatrix)

//creating the data for all frames that will be animated

let FramesPerValue = 80 //number of frames per value in the matrix
let FPS = 40

let CreateArrays = function (csvMatrix, FramesPerValue){
    let c = 1
    //colors of bars / lines in the chart
    let Colors= ["#BB4444", "#44BB44", "#4444BB", "#BBBB44", "#44BBBB", "#BB44BB"]
    let DataObjects = []
    //creating the data for all frames that will be animated
    while (c < csvMatrix[c].length){
        //every column has one data object
        let DataObject = {}
        DataObject.name = csvMatrix[0][c+1] //because
        DataObject.color = Colors[c%6]
        DataObject.values = []
        cc = 0
        while (cc < csvMatrix.length - 1){
            //calculating the values for every frame
            //example:
            //if 1 column of the table occupies one second in a animation with 60 FPS,
            //60 values need to be calculated for a smooth animation
            //these arrays store values for every frame of the animation.
            let NextValue = csvMatrix[cc + 1][c]
            let CurrentValue = csvMatrix[cc][c]
            let ValueDifference = (NextValue - CurrentValue) / FramesPerValue
            ccc = 0
            while (ccc < FramesPerValue){
                DataObject.values.push(CurrentValue + ValueDifference * ccc)
                ccc += 1
            }
            cc += 1
        }
        DataObjects.push(DataObject)
        c += 1 
    }
    console.log(DataObjects)
    return DataObjects
}

let LayoutData = {}
let canvasSize = [0.6,0.6]
let Layout = function(Layout, DataObjects, animationCanvasSize){
    //size of the browser window
    Layout.windowWidth = window.innerWidth * animationCanvasSize[0]
    Layout.windowHeight = window.innerHeight * animationCanvasSize[1]
    console.log("browser window width:",Layout.windowWidth)
    console.log("browser window height:",Layout.windowHeight)
    //spacing and distribution of bars on the x axis
    Layout.barGap = 10
    Layout.barCount = DataObjects.length - 1
    Layout.barWidth = (Layout.windowHeight - Layout.barGap * (Layout.barCount + 1)) / parseInt(Layout.barCount * 1.5)
    if (Layout.barWidth > 80){
        Layout.barWidth = 80
    }
    Layout.barDisplayDistance = Layout.barWidth + Layout.barGap
    
    console.log("got ", Layout.barCount, " bars distributed on ", Layout.windowHeight, " y pixels.", "bar width:", Layout.barWidth, " bar spacing:", Layout.barGap)
    
    return Layout
}
let createCanvas = function(Layout){
    let canvas = document.createElement("canvas")
    canvas.width = Layout.windowWidth
    canvas.height = Layout.windowHeight
    canvas.id = "canvas"
    document.getElementById("animation_placeholder").appendChild(canvas)
}

let AnimateData = async function (DataObjects, FPS, Layout, Canvas, ctx) {
    let framesInTotal = DataObjects[0].values.length - 1
    //milliseconds between each frame
    let waitMilliseconds = 1000 / FPS
    let canvas = null
    let c = 0
    let cc = 0
    let CurrentFrameValues = []
    var id = null
    const barHeight = Layout.barWidth
    const barGap = Layout.barGap
    clearInterval(id);
    id = setInterval(frame, waitMilliseconds);
    function frame() {
      if (c>= framesInTotal) {
        clearInterval(id);
      } else {
        c++
        cc = 0
        CurrentFrameValues = []
        while (cc < DataObjects.length) {
            CurrentFrameValues.push(DataObjects[cc].values[c])

            
            cc += 1
        }
        console.log("values for frame: ", c, ":",CurrentFrameValues)
        cc = 0
        //clearing the canvas
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, Layout.windowWidth, Layout.windowHeight)
        max = Math.max.apply(null, CurrentFrameValues)
        while (cc<CurrentFrameValues.length){
            //animate on the cancas here
            //y pos of the bar
            barStartY = barGap + cc * barHeight+ cc * barGap
            barStartX = 0 
            
            barEndX = CurrentFrameValues[cc] / max
            barEndX = barEndX * Layout.windowWidth * 0.8
            //fill a rect on the canvas
            ctx.fillStyle = DataObjects[cc].color
            ctx.fillRect(barStartX, barStartY, barEndX-barStartX , barHeight)
            ctx.fillStyle = "black"
            ctx.font = "2vh Arial"
            
            ctx.fillText(CurrentFrameValues[cc].toFixed(1), barEndX, barStartY + barHeight / 3)
            ctx.fillText(DataObjects[cc].name, barEndX, barStartY + barHeight / 1.5)
            cc += 1

        }
         
      }
    }

}
//reading the bcsv matrix in a different way
let AnimationDataObjects = CreateArrays(csvMatrix, FramesPerValue)
//creating a layout
LayoutData = Layout(LayoutData, AnimationDataObjects, canvasSize)
//adding a canvas to the page
createCanvas(LayoutData)
//animating the values for every frame
AnimateData(AnimationDataObjects, FPS, LayoutData, document.getElementById("canvas"), document.getElementById("canvas").getContext("2d"))
console.log("create animation data objects:", AnimationDataObjects)

