


 document.getElementById("duration_slider").oninput = function(){
   //displaying the duration above the slider
    let sliderVal = document.getElementById("duration_slider").value
    document.getElementById("duration_value").innerText = "Duration:"+sliderVal + "s"
 }