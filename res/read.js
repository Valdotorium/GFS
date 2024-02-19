
function makeArray(data){
        console.log("schisch")
}
document.getElementById("inputfile").addEventListener("change", function(){
    let reader = new FileReader()
    reader.onload = function(){
        console.log("reader onload")
        document.getElementById("output").innerText = reader.result
    }
    reader.readAsText(this.files[0])
})

