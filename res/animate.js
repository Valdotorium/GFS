


 document.getElementById("duration_slider").oninput = function(){
    let sliderVal = document.getElementById("duration_slider").value
    document.getElementById("duration_value").innerText = "Duration:"+sliderVal + "s"
 }