var socket = io.connect(),
    joystick = null,
    f = true,
    lamp = false;

const dev = false;

socket.on("connect", function() {
    if (f) {
        document.onkeydown = key;
        document.onkeyup = (id) => { drive(-1); };

        joystick = nipplejs.create({
            zone: document.getElementById('joystick'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'red',
            restOpacity: 100
        });

        joystick.on('move', function(evt, data) {
            var x = data.instance.position.x;
            var y = data.instance.position.y;
            if (dev) {
                var dx = (x - data.position.x).map(-50, 50, -255, 255);
                var dy = (y - data.position.y).map(-50, 50, -255, 255);
                var motor1 = Math.round(dy - dx);
                var motor2 = Math.round(dy + dx);

                if (motor1 > 255) motor1 = 255;
                if (motor2 > 255) motor2 = 255;
                if (motor1 < -255) motor1 = -255;
                if (motor2 < -255) motor2 = -255;
            } else {
                var motor1 = Math.round((x - data.position.x).map(-50, 50, -255, 255));
                var motor2 = Math.round((y - data.position.y).map(-50, 50, -255, 255));
                if (motor1 > 255) motor1 = 255;
                if (motor2 > 255) motor2 = 255;
                if (motor1 < -255) motor1 = -255;
                if (motor2 < -255) motor2 = -255;

                if (motor1 > -15 && motor1 < 15) motor1 = 0;
                if (motor2 > -15 && motor2 < 15) motor2 = 0;
            }
            socket.emit("drive", motor1, motor2);
        }).on('end', function(evt, data) {
            socket.emit("drive", 0, 0);
        });

        f = false;
    }
});

var key = function(i) {
    switch (i.key) {
        case "w":
        case "ArrowUp":
            drive(0);
            break;
        case "s":
        case "ArrowDown":
            drive(1);
            break;
        case "ArrowLeft":
        case "a":
            drive(2);
            break;
        case "ArrowRight":
        case "d":
            drive(3);
            break;
        case "z":
            drive(4);
            break;
        case "c":
            drive(5);
            break;
        case "l":
            lamp = !lamp;
            socket.emit("light", (lamp ? "1" : "0"));
            $("#img_").attr("src", (lamp ? "/media/btns/flashlight_on.png" : "/media/btns/flashlight_off.png"));
            break;
        case -1:
        default:
            drive(-1);
            break;
    }
}

var drive = function(id) {
    switch (id) { //str, spd
        case 0:
            socket.emit("drive", 0, 255);
            break;
        case 1:
            socket.emit("drive", 0, -255);
            break;
        case 2:
            socket.emit("drive", 255, 255);
            break;
        case 3:
            socket.emit("drive", -255, 255);
            break;
        case 4:
            socket.emit("drive", 255, -255);
            break;
        case 5:
            socket.emit("drive", -255, -255);
            break;
        case -1:
            socket.emit("drive", 0, 0);
            break;
    }
}

var robot_func = function(id) {

}


Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}