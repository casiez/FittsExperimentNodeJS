/**
 * Author: Gery Casiez
 *
 */
 
function setCookie(dico, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ encodeURIComponent(d.toUTCString());

    for (var key in dico) {
        document.cookie = key + "=" + encodeURIComponent(dico[key]) + ";" + expires + ";path=/";
    }
    // console.log(decodeURIComponent(document.cookie));
}
gvar.setCookie = setCookie;

function getCookie(cname) {
    var decodedCookie = decodeURIComponent(document.cookie);
    // console.log("GetCookie "+cname);
    // console.log(decodedCookie);
    var ca = decodedCookie.split(';');

    for(var k = 0; k < ca.length; k++) {
        var data = ca[k].split('=');
        if (data[0].trim() == cname) {
            // console.log("Found "+data[1]);
            return data[1];
        }
    }

    return null;
}
gvar.getCookie = getCookie;

  // Converts from degrees to radians.
  Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
  };