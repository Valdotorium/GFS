
document.getElementById("inputfile").addEventListener("change", function(){
    //reading the file the user inputted as text
    let reader = new FileReader()
    let csvString = ""
    let separatingSymbol = ""
                
    reader.onload = function(){
        console.log("reader onload")
        document.getElementById("output").innerText = reader.result
        csvString = reader.result
        }
    reader.readAsText(document.getElementById("inputfile").files[0])

})

