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
        form: null,

        do_roku_post: function (act, param) {
            // This is kind of an ugly hack, because the Roku takes its
            // commands via HTTP, but doesn't have any sort of CORS header,
            // so we have to hack around it by sending commands via a post
            // in an iframe, and hoping to god they work. Joy.
            var url = "http://" + this.ip + ":8060/" + act + "/" + param;
            this.form.action = url;
            this.form.submit();
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
                var n = noty({layout: "center",
                              type: "error",
                              text: "You need to set your Roku's IP",
                              timeout: 2500});
                return;
            }
            this.do_roku_post("keydown", button);
        },

        do_roku_up: function (button) {
            if (!this.ip) {
                // We've already showed an error on button down, so no need to
                // show another of the same one, but we don't want to try to do
                // the post.
                return;
            }
            this.do_roku_post("keyup", button);
        },

        show_settings: function () {
            $("#remote").hide();
            $("#b_remote").removeClass("active");
            $("#settings").show();
            $("#b_settings").addClass("active");
        },

        show_remote: function () {
            $("#settings").hide();
            $("#b_settings").removeClass("active");
            $("#remote").show();
            $("#b_remote").addClass("active");
        },

        save_ip: function () {
            this.ip = $("#roku_ip")[0].value;
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
    }

    for (var u of upevents) {
        $("#b_settings").on(u, function () {
            f.do_touch_stop("settings");
            f.show_settings();
        });

        $("#b_remote").on(u, function () {
            f.do_touch_stop("remote");
            f.show_remote();
        });
    }

    $("#roku_ip").on('blur', function () { f.save_ip(); });

    f.setup();
})(jQuery);
