/**
 * This object is a text interface for the Mindwar game.
 *
 * Upon being constructed, a text interface will be rendered in
 * a given frame in the browser window.
 */
function TextInterface(target, inputReceiver) {
    "use strict";

    var $frame = $(target);

    $frame.append('<div class="textframe" />');

    $frame.append(
        '<form>'
            + '<input type="text" />'
            + '<button>Submit</button>'
        + '</form>'
    );

    var $input = $frame.find("> form > input");

    $frame.children("form").submit(function(event) {
        event.preventDefault();
        event.stopPropagation();

        if ($input.val() && inputReceiver($input.val())) {
            $input.val("");
        }
    });

    $input[0].focus();

    $("html").click(function(event) {
        if (event.target instanceof HTMLHtmlElement) {
            $input[0].focus();
        }
    });

    this.__$textframe = $frame.children(".textframe");
}

(function() {
    "use strict";

    var cls = TextInterface;
    var proto = cls.prototype;

    proto.addParagraph = function(cssClass, text) {
        var $paragraph = $("<p />");
        $paragraph.addClass(cssClass);

        var scrolledToBottom =
            this.__$textframe[0].scrollTop + this.__$textframe[0].clientHeight
            >= this.__$textframe[0].scrollHeight;

        this.__$textframe.append($paragraph);
        $paragraph.text(text);

        // Keep the scrollbar at the bottom if we haven't moved it up.
        if (scrolledToBottom) {
            this.__$textframe[0].scrollTop = this.__$textframe[0].scrollHeight;
        }
    };
}());
