const b_frames = ["b_sh", "b_lig", "b_ah", "b_at"];
const socket = io();
const dev = false;

var ignore_next = false;

window.pinState = [];

const millis = () => new Date().getTime();

var dss0, dss1;

window.autodisable = undefined;

function setConnected(a) {
  if (a) {
    setTimeout(() => {
      $('#loadingmodal').modal("hide");
      clearTimeout(window.autodisable);
      window.autodisable = setTimeout(() => setConnected(false), 15000);
    }, 1500);
  } else {
    $('#loadingmodal').modal({
      backdrop: "static",
      keyboard: false
    });
  }
}

$(document).ready(function () {
  $("#camcard").hide();
  setConnected(false);
  $("#automode").change(function () {
    setAuto(this.checked);
  });
  b_frames.forEach((e, i, a) => {
    $(`#switch-cb${e}`).change(function () {
      setState(i, this.checked);
    });
  });
  setTimeout(() => {
    socket.emit("guid", 111);
  }, 300);
  initCharts();
});

socket.on("data", function (msg) {
  setConnected(true);
  var p = parse(msg.toString());
  var a = p[1];
  if (p[0] == "SENS") {
    $("#v_sh").html(a[0] + "%");
    $("#v_at").html(a[1] + "°C");
    $("#v_ah").html(a[2] + "%");
    $("#v_lig").html(a[3] + " лк");
    addData(a);
  } else if (p[0] == "STAT") {
    for (var i = 0; i < 6; i++) window.pinState[i] = parseInt(a[i]);
    if (!ignore_next) {
      updateBtns();
    }
    ignore_next = false;
  }
});

socket.on("video", function (msg) {
  $("#camcard").fadeIn(1200);
  $("#cam").attr("src", msg);
});

var send = function () {
  var data = create(...Array.prototype.slice.call(arguments, 0));
  console.log("SENDING: ", data)
  socket.emit(
    "send",
    "/sgh/111/ctrl",
    data
  );
  ignore_next = true;
};

var setState = function (id, state) {
  send("SETSTATE", id, state + 0);
};

var setAuto = function (checked) {
  send("SETCTRL", !checked + 0);
  window.pinState[5] = !checked + 0;
  updateBtns();
};

var updateBtns = function () {
  $("#automode").prop("checked", !!+window.pinState[5]);
  b_frames.forEach((val, i, a) => {
    $(`#${val}f`).animate({
        opacity: !window.pinState[5] ? 0.5 : 1
      },
      250
    );
    $(`#switch-cb${val}`).prop("disabled", !window.pinState[5]);
    $(`#switch-cb${val}`).prop("checked", window.pinState[i]);
  });
};

function setType(id) {
  send("SETTARGT", id);
}

function setAge(id) {
  send("SETLID", id);
}

function initCharts() {
  var seriesOptions0 = [{
        strokeStyle: "rgba(0, 0, 255, 1)",
        fillStyle: "rgba(0, 0, 255, 0.1)",
        lineWidth: 3
      },
      {
        strokeStyle: "rgba(0, 255, 0, 1)",
        fillStyle: "rgba(0, 255, 0, 0.1)",
        lineWidth: 3
      }
    ],
    seriesOptions1 = [{
      strokeStyle: "rgba(255, 0, 0, 1)",
      fillStyle: "rgba(255, 0, 0, 0.1)",
      lineWidth: 3
    }],
    seriesOptions2 = [{
      strokeStyle: "rgba(255, 255, 0, 1)",
      fillStyle: "rgba(255, 255, 0, 0.1)",
      lineWidth: 3
    }];

  (dss0 = [new TimeSeries(), new TimeSeries()]),
  (dss1 = [new TimeSeries()]),
  (dss2 = [new TimeSeries()]);

  var tl0 = new SmoothieChart({
    millisPerPixel: 50,
    grid: {
      strokeStyle: "#555555",
      lineWidth: 1,
      millisPerLine: 5000,
      verticalSections: 6
    },
    responsive: true,
    maxValueScale: 1.5,
    minValueScale: 1.5,
    tooltip: true,
    timestampFormatter: SmoothieChart.timeFormatter
  });

  for (var i = 0; i < dss0.length; i++) {
    tl0.addTimeSeries(dss0[i], seriesOptions0[i]);
  }
  tl0.streamTo(document.getElementById("chart0"), 1000);

  var tl1 = new SmoothieChart({
    millisPerPixel: 50,
    grid: {
      strokeStyle: "#555555",
      lineWidth: 1,
      millisPerLine: 5000,
      verticalSections: 4
    },
    responsive: true,
    maxValueScale: 1.5,
    minValueScale: 1.5,
    tooltip: true,
    timestampFormatter: SmoothieChart.timeFormatter
  });
  for (var i = 0; i < dss1.length; i++) {
    tl1.addTimeSeries(dss1[i], seriesOptions1[i]);
  }
  tl1.streamTo(document.getElementById("chart1"), 1000);

  var tl2 = new SmoothieChart({
    millisPerPixel: 50,
    grid: {
      strokeStyle: "#555555",
      lineWidth: 1,
      millisPerLine: 5000,
      verticalSections: 4
    },
    responsive: true,
    maxValueScale: 1.5,
    minValueScale: 1.5,
    tooltip: true,
    timestampFormatter: SmoothieChart.timeFormatter
  });
  for (var i = 0; i < dss2.length; i++) {
    tl2.addTimeSeries(dss2[i], seriesOptions2[i]);
  }
  tl2.streamTo(document.getElementById("chart2"), 1000);
}

function addData(a) {
  dss0[0].append(new Date().getTime(), parseInt(a[0]));
  dss0[1].append(new Date().getTime(), parseInt(a[2]));
  dss1[0].append(new Date().getTime(), parseInt(a[1]));
  dss2[0].append(new Date().getTime(), parseInt(a[3]));
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};