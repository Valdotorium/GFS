

document.getElementById("inputfile").addEventListener("change", function(){
    let reader = new FileReader()

    reader.onload = function(){
        document.getElementById("output").innerText = reader.result
    }
    reader.readAsText(this.files[0])
})