var chartData = [];
var plots     = [];
var rooms     = [];

$(function() {
    var devices = {};

    $(".zebra tr:not(.header, .footer):odd").addClass("alt");

    // Find and bind widgets
    $("div.an_channel_toggle").each(function(index) {
        var $input = {};
        var $_this = $(this);
        var serial = $_this.attr("data-serial");
        var alias = $_this.attr("data-alias");
        var model = $_this.attr("data-model");
        var channel = $_this.attr("data-channel");
        var label = $_this.attr("data-label");
        var mode = $_this.attr("data-mode");
        var uniqueChannels = [];
        var id = "";

        socket.emit("digital", serial, alias, model, channel, function(error, state) {
            if (error) {
                createErrorWidget($_this, "toggle", index, error, "See http://ansync.com/docs/design/widgets/channel#toggle for details.");
            } else {
                if (mode && mode.toUpperCase() === "MOMENTARY") {
                    id = "ansync_momentary_toggle_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + channel[i] + "_" + index;
                    $input = ("<button class=\"an_channel_toggle\" id=\"" + id + "\" data-channel=\"" + channel + "\">" + (label? label : channel) + "</button>");
                    $_this.append($input);
                    $("button#" + id).button();
                    $("button#" + id).mousedown(function() {
                        socket.emit("button", serial, alias, model, channel, true);
                    });
                    $("button#" + id).mouseup(function() {
                        socket.emit("button", serial, alias, model, channel, false);
                    });
                } else if (mode && mode.toUpperCase() === "RADIO" && channel.split(" ").length > 1) {
                    channel = channel.split(" ");
                    if (label) {
                        label = label.split(" ");
                    }
                    // Filter duplicates to prevent re-binding the same radio button
                    uniqueChannels = channel.filter(function(el, pos) {
                        return channel.indexOf(el) == pos;
                    });

                    for (var i = 0; i < uniqueChannels.length; i++) {
                        id = "ansync_radio_toggle_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + uniqueChannels[i] + "_" + index;
                        $_this.append("<label for=\"" + id + "\">" + (label && label[i]? label[i] : uniqueChannels[i]) + "</label>");
                        $_this.append("<input class=\"an_channel_toggle\" id=\"" + id + "\" name=\"ansync_radios_" + index + "\" type=\"radio\" data-channel=\"" + uniqueChannels[i] + "\"/>");
                        $("input#" + id).click(function() {
                            for (var j = 0; j < uniqueChannels.length; j++) {
                                if (uniqueChannels[j] == $(this).attr("data-channel")) {
                                    socket.emit("button", serial, alias, model, uniqueChannels[j], true);
                                } else {
                                    socket.emit("button", serial, alias, model, uniqueChannels[j], false);
                                }
                            }
                        });
                    }
                    $_this.buttonset();
                } else {
                    id = "ansync_toggle_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + channel + "_" + index;
                    $_this.append("<label for=\"" + id + "\">" + (label? label : channel) + "</label>");
                    $input = ("<input class=\"an_channel_toggle\" id=\"" + id + "\" type=\"checkbox\" data-channel=\"" + channel + "\"/>");
                    $_this.append($input);
                    $("input#" + id).prop("checked", state.value);
                    $("input#" + id).button();
                    $("input#" + id).click(function() {
                        var $_this = $(this);
                        var timeout;

                        socket.emit("button", serial, alias, model, channel, $(this).is(":checked"));

                        timeout = setTimeout(function() {
                            $_this.button({ disabled: false, icons: { }, text: true });
                            $_this.prop("checked", !$_this.is(":checked")).change();
                        }, 3000);

                        $(this).data("timeout", timeout);
                        $(this).button({ disabled: true, icons: { primary: ($(this).is(":checked")? "loading-ani-active" : "loading-ani") }, text: false });
                    });
                }

                joinRoom(serial, alias, model, channel);
            }
        });
    });
    $("div.an_channel_digital_out").each(function(index) {
        var $input = {};
        var $_this = $(this);
        var serial = $_this.attr("data-serial");
        var alias = $_this.attr("data-alias");
        var model = $_this.attr("data-model");
        var channel = $_this.attr("data-channel");
        var time = $_this.attr("data-time");
        var mode = $_this.attr("data-mode");
        var id = "";

        if (!time) {
            time = 100;
        }

        socket.emit("digital_out", serial, alias, model, channel, time, function(error, state) {
            if (error) {
                createErrorWidget($_this, "digital_out", index, error, "See http://ansync.com/docs/design/widgets/channel#digitalout for details.");
            } else {
                id = "ansync_digital_out_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + channel + "_" + index;
                $_this.append("<label class=\"an_channel_digital_out\" for=\"" + id + "\"> </label>");
                $input = ("<input id=\"" + id + "\" type=\"checkbox\" data-channel=\"" + channel + "\"/>");
                $_this.append($input);
                $("input#" + id).prop("checked", state.value);
                $("input#" + id).button();
                $("input#" + id).click(function(event) {
                    var checked = ($(this).is(":checked")? true : false);

                    if (mode && mode.toUpperCase() === "INVERT" || mode.toUpperCase() == "ACTIVE_LOW") {
                        checked = !checked;
                    }

                    if ($(this).is(":checked")) {
                        $("label[for=\"" + id + "\"]").removeClass("ui-state-active");
                    } else {
                        $("label[for=\"" + id + "\"]").addClass("ui-state-active");
                    }
                    return false;
                });

                joinRoom(serial, alias, model, channel);
            }
        });
    });
    $("div.an_channel_analog_out").each(function(index) {
        var $_this = $(this);
        var serial = $_this.attr("data-serial");
        var alias = $_this.attr("data-alias");
        var model = $_this.attr("data-model");
        var channel = $_this.attr("data-channel");
        var gain = $_this.attr("data-gain");
        var time = $_this.attr("data-time");
        var id = $_this.attr("id");

        if (!gain) {
            gain = 1;
        }
        if (!time) {
            time = 1000;
        }
        socket.emit("analog_out", serial, alias, model, channel, gain, time, function(error, state) {
            if (error) {
                createErrorWidget($_this, "analog_out", index, error, "See http://ansync.com/docs/design/widgets/channel#analogout for details.");
            } else {
                if (!id) {
                    id = "ansync_analog_out_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + channel + "_" + index;
                }
                chartData[id] = [];
                if ($_this.attr("width")) {
                    $_this.width($_this.attr("width"));
                } else {
                    $_this.width(400);
                }
                if ($_this.attr("height")) {
                    $_this.height($_this.attr("height"));
                } else {
                    $_this.height(200);
                }
                joinRoom(serial, alias, model, channel);
            }
        });
    });
    $("div.an_channel_slider").each(function(index) {
        var $_this = $(this);
        var serial = $_this.attr("data-serial");
        var alias = $_this.attr("data-alias");
        var model = $_this.attr("data-model");
        var channel = $_this.attr("data-channel");
        var min = $_this.attr("data-min");
        var max = $_this.attr("data-max");
        var id = $_this.attr("id");

        socket.emit("range", serial, alias, model, channel, min, max, function(error, min, max, value) {
            if (error) {
                createErrorWidget($_this, "slider", index, error, "See http://ansync.com/docs/design/widgets/channel#slider for details.");
            } else {
                if (!id) {
                    id = "ansync_slider_" + (serial? serial + "_" : "") + (alias? alias + "_" : "") + (model? model + "_" : "") + channel + "_" + index;
                }
                $_this.slider({
                    animate: true,
                    min: min * 100,
                    max: max * 100,
                    step: 5,
                    value: value * 100,
                    stop: function(event, ui) {
                        socket.emit("slider", serial, alias, model, channel, ui.value/100);
                    }
                });
            }
        });
    });
    socket.on("ansync-data", function(serial, alias, model, channel, data) {
        handleEvent(serial, alias, model, channel, data);
    });
    socket.on("ready", function() {
    });
});

function createErrorWidget(domElement, type, index, error, message) {
    var id     = "invalid_" + type + "_" + index;
    var $input = ("<button id=\"" + id + "\" class=\"ui-state-error\">X</button>");

    domElement.append($input);
    $("button#" + id).button().click(function() {
        alert("An error occured while binding this widget:\n\n" + error + "\n\n" + message);
    });
}

function joinRoom(serial, alias, model, channel) {
    var room = "";

    if (serial) {
        room = serial + "." + channel;
    } else if (alias) {
        room = alias + "." + channel;
    } else {
        room = model + "." + channel;
    }

    if (rooms.indexOf(room) === -1) {
        rooms.push(room);
        socket.emit("join", room);
    }
}

function handleEvent(serial, alias, model, channel, data) {
    var selector = "div";
    var divClass = "";
    var index;

    if (serial) {
        selector += "[data-serial=" + serial + "][data-channel~=" + channel + "]";
    } else if (alias) {
        selector += "[data-alias=" + alias + "][data-channel~=" + channel + "]";
    } else {
        selector += "[data-model=" + model + "][data-channel~=" + channel + "]:not([data-serial]):not([data-alias])";
    }

    if (data instanceof Error) {
        $(selector).each(function(index, el) {
            divClass = $(this).attr("class");
            index = divClass.search(/an_channel_(toggle|slider|digital_out|analog_out)/i);
            if (index >= 0) {
                divClass = divClass.substring(index, divClass.indexOf(" ", index));
            } else {
                divClass = "an_channel_unknown";
            }
            $(selector).empty();
            createErrorWidget($(this), divClass, index, "Device Error", data.toString());
        });
    } else {
        $(selector).each(function(index, el) {
            if ($(this).hasClass("an_channel_toggle") || $(this).hasClass("an_channel_digital_out")) {
                $(this).children("input").each(function() {
                    if ($(this).attr("type") == "checkbox") {
                        clearTimeout($(this).data("timeout"));
                        $(this).button({ disabled: false, icons: { }, text: true });
                    }
                    if ($(this).attr("data-channel") == channel) {
                        $(this).prop("checked", data.value).change();
                    }
                });
            } else if ($(this).hasClass("an_channel_analog_out")) {
                updateAnalogChannel($(this).attr("id"), channel, data);
            } else if ($(this).hasClass("an_slider")) {

            }
        });
    }
}

function updateAnalogChannel(id, channel, data) {
    var options = {
        seriesDefaults: {
            showMarker: false
        },
        axes: {
            xaxis: {
                tickOptions: {
                    showLabel: false
                }
            },
            yaxis: {
                labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                label: data.units,
                labelOptions: {
                    angle: 270
                }
            }
        }
    }

    chartData[id].push(data.value);
    if (chartData[id].length >= 20) {
        chartData[id].shift();
    }
    if (plots[id]) {
        plots[id].destroy();
    }
    plots[id] = $.jqplot(id, [chartData[id]], options);
}
