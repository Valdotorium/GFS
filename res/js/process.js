//--------------------------------------------FUNCTIONS----------------------------------------
let findSeparatingSymbol = function(csvString){
    //c is used as counter
    //console.log("loaded csv string:", csvString)
    let c = 0
    let found = false
    let separatingSymbol = ""
    while (found == false){
        if (csvString[c] == ","){
            found = true
            separatingSymbol = ","
        } else if (csvString[c] == ";"){
            found = true
            separatingSymbol = ";"
        } else if (csvString[c] == "-"){
            found = true
            separatingSymbol = "-"
        } else if (csvString[c] == "|"){
            found = true
            separatingSymbol = "|"
        } else if (csvString[c] == ":"){
            found = true
            separatingSymbol = ":"
        } else if (c > csvString.length - 2){
            found = true
            separatingSymbol = " "
            console.log("ERROR did not find separating symbol")
        }
        else {
            c++
        }
    }
    return separatingSymbol

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
    //console.log(csvMatrix)
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
    return csvMatrix
    }

let CreateArrays = function (csvMatrix, FramesPerValue){
    let c = 1
    //colors of bars / lines in the chart
    let Colors= ["#BB4444", "#44BB44", "#4444BB", "#BBBB44", "#44BBBB", "#BB44BB"]
    let DataObjects = []
    //creating the data for all frames that will be animated
    while (c < csvMatrix[1].length){
        //every column has one data object
        let DataObject = {}
        DataObject.name = csvMatrix[0][c] //because of the separating symbol
        DataObject.color = Colors[c%6]
        DataObject.values = []
        DataObject.rowNames = []
        cc = 0
        while (cc < csvMatrix.length - 1){
            //calculating the values for every frame
            //example:
            //if 1 column of the table occupies one second in a animation with 60 FPS,
            //60 values need to be calculated for a smooth animation
            //these arrays store values for every frame of the animation.
            let NextValue = csvMatrix[cc + 1][c]
            let CurrentValue = csvMatrix[cc][c]
            if(typeof CurrentValue != "number"){
                CurrentValue = 0
            }
            if(typeof NextValue != "number"){
                NextValue = 0
            }
            let ValueDifference = (NextValue - CurrentValue) / FramesPerValue
            ccc = 0
            while (ccc < FramesPerValue){
                DataObject.values.push(CurrentValue + ValueDifference * ccc)
                DataObject.rowNames.push(csvMatrix[cc+1][0])
                ccc += 1
            }
            cc += 1
            //the last frame
            if(cc == csvMatrix.length -1){
                CurrentValue = csvMatrix[cc][c]
                DataObject.values.push(CurrentValue)
                DataObject.rowNames.push(csvMatrix[cc][0])
            }
        }
        DataObjects.push(DataObject)
        c += 1 
    }
    console.log(DataObjects)
    return DataObjects
}

let Layout = function(Layout, DataObjects, animationCanvasSize){
    //size of the browser window
    Layout.windowWidth = window.innerWidth * animationCanvasSize[0]
    Layout.windowHeight = window.innerHeight * animationCanvasSize[1]
    console.log("browser window width:",Layout.windowWidth)
    console.log("browser window height:",Layout.windowHeight)
    //spacing and distribution of bars on the x axis
    Layout.barGap = 40 /DataObjects.length - 1+2
    Layout.barCount = DataObjects.length - 1
    Layout.barWidth = (Layout.windowHeight - Layout.barGap * (Layout.barCount + 1)) / parseInt(Layout.barCount * 1.2)
    if (Layout.barWidth > 80){
        Layout.barWidth = 80
    }
    //how far the bars are apart
    Layout.barDisplayDistance = Layout.barWidth + Layout.barGap
    
    console.log("got ", Layout.barCount, " bars distributed on ", Layout.windowHeight, " y pixels.", "bar width:", Layout.barWidth, " bar spacing:", Layout.barGap)
    
    return Layout
}

let scaleValue = function(value){
    //adjusting the number of decimal points of a number
    if (value == 0){
        value = value.toFixed(1)
    }
    else if(value < 1){
        value = value.toFixed(3)
    }
    else if(value < 10){
        value = value.toFixed(2)
    }
    else if(value < 100){
        value = value.toFixed(1)
    }
    else{
        value = value.toFixed(0)
    }
    return value
}

let getMaximumFrameValue = function(values){
    let max = 0
    for (let i = 0; i < values.length; i++) {
        if (values[i] > max){
            max = values[i]
        }
    }
    return max
}

let drawBar= function(ctx, barStartX, barStartY,barEndX,barHeight, color){
    //drawing a rect (the bars) for the bar chart
    ctx.fillStyle = color
    ctx.fillRect(barStartX, barStartY, barEndX-barStartX , barHeight)
    ctx.fillStyle = "black"
    ctx.font = "2vh Arial"
}

let createCanvas = function(Layout){
    //animation "header"
    let text = document.createElement("p")
    text.id = "chart_text"
    text.width = Layout.windowWidth
    document.getElementById("animation_placeholder").appendChild(text)
    //animation canvas
    let canvas = document.createElement("canvas")
    canvas.width = Layout.windowWidth
    canvas.height = Layout.windowHeight
    canvas.id = "canvas"
    document.getElementById("animation_placeholder").appendChild(canvas)
}

let AnimateData = async function (DataObjects, FPS, Layout, Canvas, ctx, title) {
    //checking the status of the make line graph checkbox
    let graphType = "bars"
    if (document.getElementById("line_graph_checkbox").checked){
        graphType = "lines"
    } else{
        graphType = "bars"
    }
    let framesInTotal = DataObjects[0].values.length
    //milliseconds between each frame
    let waitMilliseconds = 1000 / FPS
    let canvas = null
    if (graphType == "bars"){
        let drawNamesOnYAxis = document.getElementById("values_position_checkbox").checked
        let c = 0
        let cc = 0
        let CurrentFrameValues = []
        let CurrentRow = ""
        var id = null
        const barHeight = Layout.barWidth
        const barGap = Layout.barGap
        clearInterval(id);
        id = setInterval(frame, waitMilliseconds);
        function frame() {
          if (c>= framesInTotal -1) {
            clearInterval(id);
          } else {
            c++
            cc = 0
            //extracting the values for the current frame out of each data object and storing them in a list
            CurrentFrameValues = []
            while (cc < DataObjects.length) {
                CurrentFrameValues.push(DataObjects[cc].values[c])
                CurrentRow = DataObjects[cc].rowNames[c]
                cc += 1
            }
            cc = 0
            //the "header"
            document.getElementById("chart_text").innerText = title + " - "+ CurrentRow
            //clearing the canvas
            ctx.fillStyle = "white"
            ctx.fillRect(0,0, Layout.windowWidth, Layout.windowHeight)
            max = getMaximumFrameValue(CurrentFrameValues)
            while (cc<CurrentFrameValues.length){
                //animate on the cancas here
                //y pos of the bar
                barStartY = barGap + cc * barHeight+ cc * barGap
                if(drawNamesOnYAxis){
                    // Define a new path
                    ctx.beginPath()
                    ctx.fillStyle = "#111111"
                    // Set a start-point
                    ctx.moveTo(Layout.windowWidth * 0.2, barGap)
                    // Set an end-point
                    ctx.lineTo(Layout.windowWidth * 0.2, Layout.windowHeight - barGap)
                    // Stroke it (Do the Drawing)
                    ctx.stroke()
                    //draw a line at x = cx * 0.2 and the bars from cx * 0.2 to cx * 0.8
                    barStartX = Layout.windowWidth * 0.2
                    barEndX = CurrentFrameValues[cc] / max
                    barEndX = barEndX * Layout.windowWidth * 0.7 +Layout.windowWidth * 0.2
                    //fill a rect on the canvas
                    drawBar(ctx, barStartX,  barStartY,barEndX, barHeight, DataObjects[cc].color)
                    //displaying name and value of the data object
                    ctx.fillText(scaleValue(CurrentFrameValues[cc]), Layout.windowWidth * 0.205,barStartY + barHeight / 2)
                    ctx.fillText(DataObjects[cc].name, Layout.windowWidth * 0.012, barStartY + barHeight / 2)
                    cc += 1  
                }else{
                    //draw bars over the canvas from x = 0
                    barStartX = 0 
                    barEndX = CurrentFrameValues[cc] / max
                    barEndX = barEndX * Layout.windowWidth * 0.8
                    //fill a rect on the canvas
                    drawBar(ctx, barStartX, barStartY,barEndX, barHeight,DataObjects[cc].color)
                    //displaying name and value of the data object
                    ctx.fillText(scaleValue(CurrentFrameValues[cc]), barEndX, barStartY+ barHeight /2)
                    ctx.fillText(DataObjects[cc].name, barEndX - ctx.measureText(DataObjects[cc].name).width - 4, barStartY + barHeight /2)
                    cc += 1  
                }
            }   
          }
        }
    }
    if(graphType == "lines"){
        //a line graph for the latest 15 seconds of the animation (FPS * 5) frames
        //creating dataobjects.length lists that store 5 * FPS values
        let c = 0
        let StartItem = 0
        let EndItem = 1
        let barGap = Layout.barGap
        let CurrentFrameValues = []
        let id = null
        let max = 0
        let CFVmax = 0
        let XPos = 0
        let cc = 0
        let CurrentValueY = 0
        let NextValueY = 0
        let CurrentRow = ""
        let Xnodes = 1
        let spacingXnodes = 0
        clearInterval(id);
        id = setInterval(frame, waitMilliseconds);
        function frame() {
          if (EndItem>= framesInTotal -1) {
            clearInterval(id);
          } else {
            //function to limit the number of lines per data object below FPS*13
            EndItem++
            Xnodes = EndItem - StartItem - 1
            if(EndItem - StartItem >= 13*FPS-1){
                StartItem++
            }
            //the spacing between every line start and end point on the x axis
            spacingXnodes = Layout.windowWidth / Xnodes
            CurrentRow = DataObjects[0].rowNames[EndItem]
            document.getElementById("chart_text").innerText = title + " - "+ CurrentRow
            //clearing the canvas
            ctx.fillStyle = "white"
            ctx.fillRect(0,0, Layout.windowWidth, Layout.windowHeight)
            ctx.lineWidth = 3
            c = 0
            CurrentFrameValues = []
            while (c < DataObjects.length){
                CurrentFrameValues.push(DataObjects[c].values[EndItem])
                c++
            }
            CFVmax = getMaximumFrameValue(CurrentFrameValues)
            if(CFVmax > max){
                max = CFVmax
            }
            //drawing all the nodes (start and end points of lines)
            c = 0
            console.log(max)
            while(c<DataObjects.length){
                XPos= 0
                cc = 0
                while(cc<Xnodes){
                    ctx.beginPath()
                    ctx.strokeStyle =DataObjects[c].color
                    // Set a start-point
                    CurrentValueY = Layout.windowHeight -(DataObjects[c].values[StartItem + cc] / max) * Layout.windowHeight *0.9
                    NextValueY = Layout.windowHeight - (DataObjects[c].values[StartItem + 1 +cc] / max) * Layout.windowHeight*0.9
                    ctx.moveTo(XPos, CurrentValueY)

                    // Set an end-point
                    ctx.lineTo(XPos + spacingXnodes * 0.85, NextValueY)
                    // Stroke it (Do the Drawing)
                    ctx.stroke()
                    
                    XPos += spacingXnodes * 0.85
                    cc++
                }
                //drawing name and value of the data object
                ctx.fillStyle = "black"
                ctx.font = "1.3vh Arial"
                ctx.fillText(scaleValue(DataObjects[c].values[EndItem]), XPos + barGap, NextValueY )
                ctx.fillText(DataObjects[c].name, XPos+barGap, NextValueY + barGap) 
                c++
            }
          }
        }
      }
  }

//--------------------------------------------PROGRAM----------------------------------------
//LOADING
//storing the csv file as string
document.getElementById("btn").innerHTML = "Reload page to play again"
let csvString = document.getElementById("output").innerText
//finding the separating symbol
let separatingSymbol = findSeparatingSymbol(csvString)
console.log("Found separating symbol in csv string: "+ separatingSymbol)
//reading the csv string
let csvMatrix = readCSVstring(csvString)
csvMatrix = convertCSVMatrix(csvMatrix)

//VARIABLES
let FramesPerValue = 80 //number of frames per value in the matrix
let FPS = 30
let LayoutData = {}
let canvasSize = [0.6,0.6] //[1,1] wound be 100vw 100vh

//ANIMATION
let duration = document.getElementById("duration_slider").value
FramesPerValue = parseInt((FPS * duration) / csvMatrix.length)
//reading the csv matrix in a different way
//creating the data for all frames that will be animated
let AnimationDataObjects = CreateArrays(csvMatrix, FramesPerValue)
//creating a layout
LayoutData = Layout(LayoutData, AnimationDataObjects, canvasSize)
//adding a canvas to the page
createCanvas(LayoutData)
//animating the values for every frame
AnimateData(AnimationDataObjects, FPS, LayoutData, document.getElementById("canvas"), document.getElementById("canvas").getContext("2d"), csvMatrix[0][0])
console.log("create animation data objects:", AnimationDataObjects)