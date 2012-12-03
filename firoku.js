/*
 * IMPORTANT URLS
 * /query/apps
 *    Returns an XML list of apps.
 *    <apps>
 *      <app id="some_id_number" version="some.version.number">App Name</app>
 *      ...
 *    </apps>
 *
 * /query/icon/<appid>
 *    Returns the image that is the icon for the app in question.
 *
 * /launch/<appid>
 *    Start the app in question
 */
(function ($) {
    var f = {
        ip: null,
        urlbase: null,
        form: null,
        channels: {},

        do_error: function (msg) {
            noty({layout: "center",
                  type: "error",
                  text: msg,
                  timeout: 2500});
        },

        do_roku_button: function (act, button) {
            var url = this.urlbase + act + "/" + button;
            $.ajax(url).fail(function (jqxhr, status, error) {
                f.do_error("Error communicating with Roku (" + status + ")");
            });
        },

        do_touch_start: function (button) {
            $("#b_" + button).addClass("active");
        },

        do_touch_stop: function (button) {
            $("#b_" + button).removeClass("active");
        },

        do_roku_down: function (button) {
            if (!this.ip) {
                // Oops! We can't send a button push if we don't know about a
                // Roku! Let the user know.
                this.do_error("You need to set your Roku's IP");
                return;
            }
            this.do_roku_button("keydown", button);
        },

        do_roku_up: function (button) {
            if (!this.ip) {
                // We've already showed an error on button down, so no need to
                // show another of the same one, but we don't want to try to do
                // the post.
                return;
            }
            this.do_roku_button("keyup", button);
        },

        show_panel: function(panel) {
            $("#panel").hide();
            $("#menu-item").removeClass("active");
            $(".p_" + panel).show();
            $(".b_" + panel).addClass("active");
        },

        load_channels: function() {
            var a = $.ajax(this.urlbase + "query/apps");
            a.done(display_channels);
            a.fail(function (jqxhr, status, error) {
                f.do_error("Error retrieving channel list (" + status + ")");
            });
        },

        display_channels: function(data, status, jqxhr) {
            var panel = $("#p_channels");
            var xml = jqxhr.responseXML;
            // TODO
        },

        launch_channel: function(chanid) {
            var url = this.urlbase + "launch/" + chanid;
            $.ajax(url).fail(function (jqxhr, status, error) {
                f.do_error("Error launching channel (" + status + ")");
            });
        },

        update_urlbase: function() {
            this.urlbase = "http://" + this.ip + ":8060/";
        },

        save_ip: function () {
            this.ip = $("#roku_ip")[0].value;
            this.update_urlbase();
            localStorage.setItem('roku_ip', this.ip);
        },

        setup: function () {
            // This lets us perform XHR to the Roku, which sucks at CORS.
            $.ajaxSetup({xhrFields: {mozSystem: true}});

            this.ip = localStorage.getItem('roku_ip');
            this.form = $("#roku_query")[0];

            if (!this.ip) {
                this.show_settings();
            } else {
                this.update_urlbase();
                $("#roku_ip")[0].value = this.ip;
            }
        }
    };

    var roku_buttons = [
        "Back",
        "Up",
        "Home",
        "Left",
        "Select",
        "Right",
        "InstantReplay",
        "Down",
        "Info",
        "Rev",
        "Play",
        "Fwd"
    ];

    var downevents = [
        "mousedown",
        "touchstart"
    ];

    var upevents = [
        "mouseup",
        "touchend",
        "touchcancel",
        "touchleave"
    ];

    for (var b of roku_buttons) {
        (function(btn) {
            for (var d of downevents) {
                $("#b_" + btn).on(d, function () {
                    f.do_touch_start(btn);
                    f.do_roku_down(btn);
                });
            }
            for (var u of upevents) {
                $("#b_" + btn).on(u, function () {
                    f.do_touch_stop(btn);
                    f.do_roku_up(btn);
                });
            }
        })(b);
    }

    for (var d of downevents) {
        $("#b_settings").on(d, function () {
            f.do_touch_start("settings");
        });

        $("#b_remote").on(d, function () {
            f.do_touch_start("remote");
        });

        #("#b_channels").on(d, function() {
            f.do_touch_start("channels");
        });
    }

    for (var u of upevents) {
        $("#b_settings").on(u, function () {
            f.do_touch_stop("settings");
            f.show_panel("settings");
        });

        $("#b_remote").on(u, function () {
            f.do_touch_stop("remote");
            f.show_panel("remote");
        });

        $("#b_channels").on(u, function () {
            f.do_touch_stop("channels");
            f.show_panel("channels");
            f.load_channels();
        });
    }

    $("#roku_ip").on('blur', function () { f.save_ip(); });

    f.setup();
})(jQuery);
