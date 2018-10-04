const dev = false;
window.pinState = [];
window.fstate = false;

var client = mqtt.connect('mqtt://bardin.petr.fvds.ru')

client.on('connect', function () {
    client.subscribe('/sgh/', function (err) {
        if (!err) {
            client.publish('presence', 'Hello mqtt')
        }
    })
})

client.on('message', function (topic, message) {
    var p = parse(message.toString())
    var a = p[1];
    if (p[0] == 'SENS') {
        $("#v_sh").html(a[0] + "%");
        $("#v_at").html(a[1] + "°C");
        $("#v_ah").html(a[2] + "%");
        $("#v_lig").html(a[3] + " лк");
    } else if (p[0] == 'STAT') {
        if (a[5] == "0" || !window.fstate) {
            window.fstate = true;
            for (var i = 0; i < 6; i++)
                window.pinState[i] = parseInt(a[i]);
        }
        updateBtns();
    } else {

    }
    client.end()
})

var send = function () {
    client.publish("/sgh/111/ctrl", create(...Array.prototype.slice.call(arguments, 0)))
}

var setState = function (id, state) {
    send("SETSTATE", id, state)
}

var toggleState = function (id) {
    window.pinState[id] = (window.pinState[id] == 1 ? 0 : 1);
    window.pinState[5] = 1;
    setState(id, window.pinState[id]);
    updateBtns();
}

var updateBtns = function () {
    var arr = ["water", "bulb", "fan", "heat", "", "auto"];
    for (var index = 0; index < 5; index++) {
        if (index == 4) index = 5;
        var i = "#btn" + index.toString();
        var state = (window.pinState[index] == 1 ? "/media/btns/" + arr[index] + "_1.png" : "/media/btns/" + arr[index] + "_0.png");
        $(i).attr("src", state);
    }
}

var toggleCtrl = function () {
    window.pinState[5] = (window.pinState[5] == 1 ? 0 : 1);
    send("SETCTRL", window.pinState[5])
    updateBtns();
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}