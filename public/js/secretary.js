/**
 * This object acts a 'secretary' for sending and receiving messages
 * to and from the game server, via a WebSocket.
 */
function Secretary(url, messageCallback) {
    "use strict";

    if (typeof url !== "string") {
        throw new Error("The url must be a string!");
    }

    if (!(messageCallback instanceof Function)) {
        throw new Error("messageCallback must be a function!");
    }

    // Allow using local paths for the websocket URL.
    if (url.charAt(0) === "/") {
        url =
            (location.protocol === "https:" ? "wss" : "ws")
            + "://"
            + location.host
            + url;
    }

    this.__url = url;
    this.__messageCallback = messageCallback;
    this.__retryWait = Secretary.START_WAIT_TIME;
    this.__socket = null;

    Object.defineProperties(this, {
        connected: {
            get: function() {
                return this.__socket != null
                    && this.__socket.readyState === WebSocket.OPEN;
            }
        }
    });
}

(function() {
    "use strict";

    var cls = Secretary;
    var proto = cls.prototype;

    cls.START_WAIT_TIME = 1000;

    cls.ECHO = 1;
    cls.HELP = 2;
    cls.INFO = 3;

    proto.connect = function() {
        var my = this;

        this.__messageCallback(
            cls.INFO,
            "Connecting to " + this.__url + " ..."
        );

        this.__socket = new WebSocket(this.__url);

        this.__socket.onmessage = function(event) {
            my.__messageCallback(cls.ECHO, event.data);
        };

        this.__socket.onopen = function() {
            // Reset the wait time for retries now we have connected.
            my.__retryWait = cls.START_WAIT_TIME;

            my.__messageCallback(cls.INFO, "Connected!");
        };

        this.__socket.onclose = function() {
            my.__messageCallback(cls.INFO,
                "Connection closed, retrying in "
                + my.__retryWait
                + "ms"
            );

            // Try to reopen the socket later.
            setTimeout(
                my.reopenSocket.bind(my),
                my.__retryWait
            );

            // Double the wait time to the next retry.
            my.__retryWait *= 2;
        };
    };

    proto.send = function(messageType) {
        var messageJSON;

        switch (messageType) {
        case cls.ECHO:
            messageJSON = ["echo"].concat(
                Array.prototype.slice.call(arguments, 1)
            );
        break;
        default:
            throw new Error("Invalid message type!");
        }

        if (!this.connected) {
            throw new Error("No connection open!");
        }

        this.__socket.send(JSON.stringify(messageJSON));
    };
}());
