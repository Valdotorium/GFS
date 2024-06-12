//append a link to the div with the id "keynote" if a cretain password is entered into the input elemen with id "password"
button = document.getElementById("keynote_button")
button.onclick = function(){
if (document.getElementById("password").value == "MaisonDio20"){
    window.open("https://valdotorium.github.io/GFS/presentation/HTML_Keynote/index.html#0")
    console.log("keynote access")
}
}