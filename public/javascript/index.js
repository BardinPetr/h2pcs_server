var socket = io.connect(),
    f = true;

const dev = false;
window.pinState = [];
window.fstate = false;

socket.on("connect", () => {
    if (f) {
        f = false;
    }
});

socket.on("mqtt", (topic, msg) => {
    if (topic == "sgh/data") {
        var a = msg.split(";");
        $("#v_sh").html(a[0] + "%");
        $("#v_at").html(a[1] + "°C");
        $("#v_ah").html(a[2] + "%");
        $("#v_lig").html(a[3] + " лк");
        $("#v_pres").html(a[4] + " мм");
    } else if (topic == "sgh/status") {
        var a = msg.split(";");
        if (a[5] == "0" || !window.fstate) {
            window.fstate = true;
            for (var i = 0; i < 6; i++)
                window.pinState[i] = parseInt(a[i]);
        }
        updateBtns();
    }
});

var setState = function(id, state) {
    socket.emit("ctrl", 0, id, state);
}

var setData = function(f, id, state) {
    socket.emit("ctrl", f, id, state);
}

var toggleState = function(id) {
    window.pinState[id] = (window.pinState[id] == 1 ? 0 : 1);
    window.pinState[5] = 1;
    setState(id, window.pinState[id]);
    updateBtns();
}

var updateBtns = function() {
    var arr = ["water", "bulb", "fan", "heat", "", "auto"];
    for (var index = 0; index < 5; index++) {
        if (index == 4) index = 5;
        var i = "#btn" + index.toString();
        var state = (window.pinState[index] == 1 ? "/media/btns/" + arr[index] + "_1.png" : "/media/btns/" + arr[index] + "_0.png");
        $(i).attr("src", state);
    }
}

var toggleCtrl = function() {
    window.pinState[5] = (window.pinState[5] == 1 ? 0 : 1);
    socket.emit("ctrl", 1, window.pinState[5], 0);
    updateBtns();
}

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}