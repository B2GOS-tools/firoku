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
            this.do_roku_post("keydown", button);
        },

        do_roku_up: function (button) {
            this.do_roku_post("keyup", button);
        },

        show_settings: function () {
            $("#remote").hide();
            $("#settings").show();
        },

        show_remote: function () {
            $("#settings").hide();
            $("#remote").show();
        },

        save_ip: function () {
            this.ip = $("#roku_ip")[0].value;
            localStorage.setItem('roku_ip', this.ip);
        },

        setup: function () {
            this.ip = localStorage.getItem('roku_ip');
            this.form = $("#roku_query")[0];

            if (!this.ip) {
                this.show_settings();
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
        "Fwd",
    ];

    for (var b of roku_buttons) {
        (function(btn) {
            $("#b_" + btn).on('mousedown', function () {
                f.do_touch_start(btn);
                f.do_roku_down(btn);
            });
            $("#b_" + btn).on('mouseup', function () {
                f.do_touch_stop(btn);
                f.do_roku_up(btn);
            });
        })(b);
    }

    $("#b_settings").on('mousedown', function () {
        f.do_touch_start("settings");
    });
    $("#b_settings").on('mouseup', function () {
        f.do_touch_stop("settings");
        f.show_settings();
    });

    $("#b_remote").on('mousedown', function () {
        f.do_touch_start("remote");
    });
    $("#b_remote").on('mouseup', function () {
        f.do_touch_stop("remote");
        f.show_remote();
    });

    $("#roku_ip").on('blur', f.save_ip);

    f.setup();
})(jQuery);
