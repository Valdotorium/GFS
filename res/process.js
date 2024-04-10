
let findSeparatingSymbol = function(csvString){
    //c is used as counter
    let c = 0
    let foundSeparatingSymbol = false
    console.log(Array.from(csvString)[0])
    return Array.from(csvString)[0]

}
//fuction for waiting
const sleep = (delay) => {
    new Promise((resolve) => setTimeout(resolve, delay))
}
let readCSVstring = function (csvString){
    //splitting the csv string into an array of strings
    let csvMatrix = []
    //reading the csv string
    let csvArray = csvString.split("\n")
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

let FramesPerValue = 50 //number of frames per value in the matrix
let FPS = 2

let CreateArrays = function (csvMatrix, FramesPerValue){
    let c = 1
    //colors of bars / lines in the chart
    let Colors= [[200, 20, 20], [20,200,20], [20,20,200], [20,200,200], [200,200,20], [200,20,200]]
    let DataObjects = []
    //creating the data for all frames that will be animated
    while (c < csvMatrix[c].length){
        //every column has one data object
        let DataObject = {}
        DataObject.name = csvMatrix[0][c]
        DataObject.color = Colors[c%6]
        DataObject.values = []
        cc = 1
        while (cc < csvMatrix.length - 1){
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


}
let AnimateData = async function (csvMatrix, FPS) {
    let framesInTotal = csvMatrix.length
    let waitMilliseconds = 1000 / FPS
    let c = 0
    while (c < framesInTotal){
        await sleep(waitMilliseconds)
        console.log(csvMatrix[c])
        c++
    }

}
let AnimationDataObjects = CreateArrays(csvMatrix, FramesPerValue)
AnimateData(csvMatrix, FPS)
// from here, create a animate bar chart and animate line graph function
