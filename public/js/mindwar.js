/* global Secretary, TextInterface */
$(function() {
    "use strict";

    var secretary = new Secretary("/socket/", function(messageType, message) {
        textInterface.addParagraph("echo", message);
    });

    // Create the text interface for the game.
    var textInterface = new TextInterface(".mindwarframe", function(line) {
        if (!secretary.connected) {
            return false;
        }

        secretary.send(Secretary.ECHO, line);
        return true;
    });

    secretary.connect();
});
