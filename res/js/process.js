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
        } else if (csvString[c] == "|"){
            found = true
            separatingSymbol = "|"
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
    //regular expression from:
    //https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
    let csvArray = csvString.split(/\r?\n|\r|\n/g)
    //seperating the lines
    console.log("Array split in lines: ",csvArray)
    for (let i = 0; i < csvArray.length; i++) {
        //separating the columns
        csvArray[i] = csvArray[i].split(separatingSymbol)
        csvMatrix.push(csvArray[i])
        }
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
    let Colors= ["#DD9999","#99DD99", 
                "#9999DD", "#DDDD99", 
                "#99DDDD", "#DD99DD", 
                "#DDAA99", "#AADD99", 
                "#DD99AA", "#AA99DD"]
    let DataObjects = []
    //creating the data for all frames that will be animated
    while (c < csvMatrix[1].length){
        //DATA OBJECTS:
        //every column has one data object. 
        //the name of the column is the name of the data object
        //the color of the data object is the color of the bar / line in the chart
        //the values of the data object are the values of the bar / line in the chart
        //(the values are calculated for every frame)
        //the rowNames of the data object are the names of the rows in the table
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
            //all values always start at zero
            //optimization: make option to start animating at the first line 
            //instead of the "imaginary zero"
            let NextValue = csvMatrix[cc + 1][c]
            let CurrentValue = csvMatrix[cc][c]
            if(typeof CurrentValue != "number"){
                CurrentValue = 0
            }
            if(typeof NextValue != "number"){
                NextValue = 0
            }
            let ValueDifference = (NextValue - CurrentValue) / FramesPerValue
            CurrentFrame = 0
            CurrentFrameValue = CurrentValue
            while (CurrentFrame < FramesPerValue){
                DataObject.values.push(CurrentFrameValue)
                DataObject.rowNames.push(csvMatrix[cc+1][0])
                CurrentFrameValue += ValueDifference
                CurrentFrame += 1
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
    Layout.barGap = 100 /DataObjects.length - 1+2
    Layout.barCount = DataObjects.length - 1
    Layout.barWidth = (Layout.windowHeight - Layout.barGap * (Layout.barCount + 1)) / parseInt(Layout.barCount * 1.2)
    if (Layout.barWidth > 250){
        Layout.barWidth = 250
    }
    //how far the bars are apart
    Layout.barDisplayDistance = Layout.barWidth + Layout.barGap
    console.log("got ", Layout.barCount, 
                " bars distributed on ", Layout.windowHeight, " y pixels.",
                 "bar width:", Layout.barWidth, 
                 " bar spacing:", Layout.barGap)
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
    //finds the maximum value in the list "values". 
    //This is used to scale the entire graph to the correct size.
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
    ctx.font = "5vh Arial"
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
    let graphType = document.getElementById("graph_list").value
    let framesInTotal = DataObjects[0].values.length
    //milliseconds between each frame
    let waitMilliseconds = 1000 / FPS
    let canvas = null
    if (graphType == "bars"){
        let drawNamesOnYAxis = document.getElementById("values_position_checkbox").checked
        //declaring all variables that need to be zero (counters and positions)
        let c = 0, barStartY = 0, barEndY= 0, cc = 0, CurrentRow = "", CurrentFrameValues = []
        var id = null
        let min = 0
        let range = 0
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
            min = Math.min.apply(null, CurrentFrameValues)
            let ZeroX = 0
            if (min > 0){
                min = 0
            }
            range = -min + max
            while (cc<CurrentFrameValues.length){
                //animate on the cancas here
                //y pos of the bar
                barStartY = barGap + cc * barHeight+ cc * barGap
                if(drawNamesOnYAxis){
                    // Define a new path
                    ctx.beginPath()
                    ctx.fillStyle = "#111111"
                    ctx.moveTo(Layout.windowWidth * 0.2, barGap)
                    ctx.lineTo(Layout.windowWidth * 0.2, Layout.windowHeight - barGap)
                    ctx.stroke()
                    //line at zero
                    ctx.beginPath()
                    ctx.strokeStyle = "#777"
                    ctx.lineWidth = 8
                    // Set a start-point
                    ZeroX = ((0 +- min) / range)* Layout.windowWidth * 0.7 +Layout.windowWidth * 0.2
                    ctx.moveTo(ZeroX, barGap)
                    // Set an end-point
                    ctx.lineTo(ZeroX, Layout.windowHeight - barGap)
                    // Stroke it (Do the Drawing)
                    ctx.stroke()
                    //draw a line at x = cx * 0.2 and the bars from cx * 0.2 to cx * 0.8
                    barStartX = (0 +- min) / range
                    barEndX = (CurrentFrameValues[cc] +- min) / range
                    barEndX = barEndX * Layout.windowWidth * 0.7 +Layout.windowWidth * 0.2
                    barStartX = barStartX * Layout.windowWidth * 0.7 +Layout.windowWidth * 0.2
                    //fill a rect on the canvas
                    drawBar(ctx, barStartX,  barStartY,barEndX, barHeight, DataObjects[cc].color)
                    //displaying name and value of the data object
                    ctx.fillText(scaleValue(CurrentFrameValues[cc]), Layout.windowWidth * 0.205,barStartY + barHeight / 2)
                    ctx.fillText(DataObjects[cc].name, Layout.windowWidth * 0.012, barStartY + barHeight / 2)
                    cc += 1  
                }else{
                    
                    //draw bars over the canvas from x = 0
                    barStartX = 0
                    barEndX = (CurrentFrameValues[cc] +- min) / range
                    barEndX = barEndX * Layout.windowWidth * 0.8+Layout.windowWidth * 0.05
                    ZeroX = ((0 +- min) / range)* Layout.windowWidth * 0.8+Layout.windowWidth * 0.05
                    //line at zero
                    ctx.beginPath()
                    ctx.lineWidth = 8
                    ctx.fillStyle = "#111111"
                    ctx.strokeStyle = "#777"
                    // Set a start-point
                    ctx.moveTo(ZeroX, barGap)
                    // Set an end-point
                    ctx.lineTo(ZeroX, Layout.windowHeight - barGap)
                    // Stroke it (Do the Drawing)
                    ctx.stroke()
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
        //a line graph for the latest 10-15 seconds of the animation (FPS * 5) frames
        //creating dataobjects.length lists that store 5 * FPS values
        //optimization: draw lines between lines of the diagram once instead of every frame once they are finished drawing.

        //declaring all variables that need to be zero (counters and positions)
        let c = 0, StartItem = 0, EndItem = 0, max = 0, min = 0, CFVmax = 0, CFVmin = 0, XPos = 0, cc = 0, CurrentRow = "", CurrentFrameValues = []
        let barGap = Layout.barGap
        let id = null
        let range = 0
        //y positions of the start and end point of each line
        let CurrentValueY = 0
        let NextValueY = 0
        //spacing between the start and end points of the lines on the x-axis
        let Xnodes = 1
        let spacingXnodes = 0
        //variable that multiplies values from 0 to 1 * maximum value of frame to usable y-positions
        let ScaleY = Layout.windowHeight*0.9
        clearInterval(id);
        id = setInterval(frame, waitMilliseconds);
        function frame() {
          if (EndItem>= framesInTotal -1) {
            clearInterval(id);
          } else {
            let TextYs = []
            let CanDrawText = true
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
            ctx.lineWidth = 8
            c = 0
            CurrentFrameValues = []
            while (c < DataObjects.length){
                CurrentFrameValues.push(DataObjects[c].values[EndItem])
                c++
            }
            CFVmax = getMaximumFrameValue(CurrentFrameValues)
            CFVmin = Math.min.apply(null, CurrentFrameValues)
            if(CFVmax > max){
                max = CFVmax
            }
            if(CFVmin < min){
                min = CFVmin
            }
            //drawing all the nodes (start and end points of lines)
            c = 0
            range = -min + max
            console.log(CFVmin)
            let ZeroY = Layout.windowHeight -((0 +- min) / range) * Layout.windowHeight *0.9 - Layout.windowHeight *0.05
            while(c<DataObjects.length){
                XPos= 0
                cc = 0
                while(cc<Xnodes){
                    ctx.beginPath()
                    ctx.strokeStyle =DataObjects[c].color
                    // Set a start-point
                    
                    CurrentValueY = Layout.windowHeight -((DataObjects[c].values[StartItem + cc] +- min) / range) * ScaleY - Layout.windowHeight *0.05
                    NextValueY = Layout.windowHeight - ((DataObjects[c].values[StartItem + 1 +cc] +- min) / range) * ScaleY - Layout.windowHeight *0.05
                    ctx.moveTo(XPos, CurrentValueY)
                    // Set an end-point
                    ctx.lineTo(XPos + spacingXnodes * 0.85, NextValueY)
                    ctx.stroke()
                    XPos += spacingXnodes * 0.85
                    cc++
                }
                //drawing name and value of the data object
                ctx.fillStyle = "black"
                ctx.font = "4vh Arial"
                let minimumTextDistance = Layout.windowHeight / 40
                CanDrawText = true
                for (i = 0; i < TextYs.length; i++){
                    //loops through a list with the y positions of the text. if text overlaps, it will not draw the text
                    if(-minimumTextDistance < NextValueY - TextYs[i] && NextValueY - TextYs[i] <  minimumTextDistance){
                        CanDrawText = false
                    }
                }
                minimumTextDistance = Layout.windowHeight / 25
                if(CanDrawText && -minimumTextDistance < NextValueY - TextYs[i] && NextValueY - TextYs[i] <  minimumTextDistance) {
                    ctx.fillText(DataObjects[c].name, XPos+barGap, NextValueY + Layout.windowHeight / 100) 
                    TextYs.push(NextValueY)
                }else if(CanDrawText){
                    ctx.fillText(scaleValue(DataObjects[c].values[EndItem]), XPos + barGap, NextValueY )
                    ctx.fillText(DataObjects[c].name, XPos+barGap, NextValueY + Layout.windowHeight / 55) 
                    TextYs.push(NextValueY)
                }
                c++
            }
            ctx.beginPath()
            ctx.moveTo(0,ZeroY)
            ctx.strokeStyle = "#AAA"
             // Set an end-point
            ctx.lineTo(Layout.windowWidth, ZeroY)
            // Stroke it (Do the Drawing)
            ctx.stroke()
            }
        }
    }
    if(graphType == "area"){
        //a line graph for the latest 10-15 seconds of the animation (FPS * 5) frames
        //creating dataobjects.length lists that store 5 * FPS values
        //needs to be optimized in the future to first draw the overall smalles area, 
        //and the largest last.

        //declaring all variables that need to be zero (counters and positions)
        let c = 0, StartItem = 0, EndItem = 0, max = 0, min = 0, CFVmax = 0, CFVmin = 0, XPos = 0, cc = 0, CurrentRow = ""
        let barGap = Layout.barGap
        let CurrentFrameValues = []
        let id = null
        let range = 0
        //y positions of the start and end point of each line
        let CurrentValueY = 0
        let NextValueY = 0
        //spacing between the start and end points of the lines on the x-axis
        let Xnodes = 1
        let spacingXnodes = 0
        //variable that multiplies values from 0 to 1 * maximum value of frame to usable y-positions
        let ScaleY = Layout.windowHeight*0.9
        clearInterval(id);
        id = setInterval(frame, waitMilliseconds);
        function frame() {
        if (EndItem>= framesInTotal -1) {
            clearInterval(id);
        } else {
            //function to limit the number of lines per data object below FPS*13
            EndItem++
            Xnodes = EndItem - StartItem - 1
            if(EndItem - StartItem >= 10*FPS-1){
                StartItem++
            }
            //the spacing between every line start and end point on the x axis
            spacingXnodes = Layout.windowWidth / Xnodes
            CurrentRow = DataObjects[0].rowNames[EndItem]
            document.getElementById("chart_text").innerText = title + " - "+ CurrentRow
            //clearing the canvas
            ctx.fillStyle = "white"
            ctx.fillRect(0,0, Layout.windowWidth, Layout.windowHeight)
            ctx.lineWidth = 8
            c = 0
            CurrentFrameValues = []
            while (c < DataObjects.length){
                CurrentFrameValues.push(DataObjects[c].values[EndItem])
                c++
            }
            CFVmax = getMaximumFrameValue(CurrentFrameValues)
            CFVmin = Math.min.apply(null, CurrentFrameValues)
            if(CFVmax > max){
                max = CFVmax
            }
            if(CFVmin < min){
                min = CFVmin
            }
            //drawing all the nodes (start and end points of lines)
            c = 0
            range = -min + max
            console.log(CFVmin)
            let ZeroY = Layout.windowHeight -((0 +- min) / range) * Layout.windowHeight *0.9 - Layout.windowHeight *0.05
            while(c<DataObjects.length){
                XPos= 0
                cc = 0
                ctx.beginPath()
                ctx.strokeStyle =DataObjects[c].color
                ctx.fillStyle =DataObjects[c].color
                ctx.moveTo(0,Layout.windowHeight *0.95 )
                while(cc<Xnodes){
                    // Set a start-point
                    CurrentValueY = Layout.windowHeight -((DataObjects[c].values[StartItem + cc] +- min) / range) * ScaleY - Layout.windowHeight *0.05
                    NextValueY = Layout.windowHeight - ((DataObjects[c].values[StartItem + 1 +cc] +- min) / range) * ScaleY - Layout.windowHeight *0.05
                    ctx.lineTo(XPos, CurrentValueY)
                    // Set an end-point
                    ctx.lineTo(XPos + spacingXnodes * 0.85, NextValueY)
                    XPos += spacingXnodes * 0.85
                    cc++
                }
                ctx.lineTo(Layout.windowWidth * 0.85,Layout.windowHeight *0.95 )
                ctx.closePath()
                ctx.fill()
                //drawing name and value of the data object
                ctx.fillStyle = "black"
                ctx.font = "4vh Arial"
                ctx.fillText(scaleValue(DataObjects[c].values[EndItem]), XPos + barGap, NextValueY )
                ctx.fillText(DataObjects[c].name, XPos+barGap, NextValueY + Layout.windowHeight / 55) 
                c++
            }
            ctx.beginPath()
            ctx.moveTo(0,ZeroY)
            ctx.strokeStyle = "#AAA"
            // Set an end-point
            ctx.lineTo(Layout.windowWidth, ZeroY)
            // Stroke it (Do the Drawing)
            ctx.stroke()
            }
        }
    }
    if(graphType == "stack"){
        //a single bar made of all values in the current frame added up.
        //optimization: display names above or below the bar when there is not enough space.

        //declaring all variables that need to be zero (counters and positions)
        let c = 0, barStartY = 0, barEndY= 0, cc = 0, CurrentRow = ""
        let up = true
        let CurrentFrameValues = []
        let id = null
        //x position on which the bar starts drawing
        let XPos = Layout.windowWidth*0.1
        clearInterval(id);
        id = setInterval(frame, waitMilliseconds);
        function frame() {
        if (cc >= framesInTotal -1) {
            clearInterval(id);
        } else {
            up = true
                XPos = Layout.windowWidth*0.1
                CurrentRow = DataObjects[0].rowNames[cc]
                document.getElementById("chart_text").innerText = title + " - "+ CurrentRow
                //clearing the canvas
                ctx.fillStyle = "white"
                ctx.fillRect(0,0, Layout.windowWidth, Layout.windowHeight)
                ctx.lineWidth = 8
                c = 0
                CurrentFrameValues = []
                let total = 0
                while (c < DataObjects.length){
                    CurrentFrameValues.push(DataObjects[c].values[cc])
                    total += DataObjects[c].values[cc]
                    c++
                }
                cc++
                barStartY = Layout.windowHeight * 0.4
                barEndY = Layout.windowHeight * 0.6
                c = 0
                //this variable stores how much pixels a 1 is compared to the sum of all values.
                //For example if there are 800 pixels on x to draw on,
                //and the sum of all values is 3200, this Value stores 0.25
                let XPerUnit = (Layout.windowWidth * 0.8) / total
                while(c<DataObjects.length){
                    up = !up
                    drawBar(ctx, XPos, barStartY,XPos + CurrentFrameValues[c] * XPerUnit, barEndY - barStartY, DataObjects[c].color)
                    console.log(XPos)
                    XPos = XPos +CurrentFrameValues[c] * XPerUnit
                    ctx.fillStyle = "black"
                    ctx.font = "5vh Arial"
                    //writing dataobjects name and value
                    if(DataObjects[c].values[cc] !== 0){
                        ctx.fillText(scaleValue(DataObjects[c].values[cc]), XPos - CurrentFrameValues[c] * XPerUnit * 0.85, barStartY + Layout.windowHeight * 0.07 )
                        ctx.fillText(DataObjects[c].name, XPos - CurrentFrameValues[c] * XPerUnit * 0.85, barStartY + Layout.windowHeight * 0.13 ) 
                    }
                    c++
                }
            }
        }
    }
}
//--------------------------------------------PROGRAM (MAINLY FUNCTION CALLS)----------------------------------------
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
let canvasSize = [2,2] //[1,1] wound be 100vw 100vh

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