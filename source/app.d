import vibe.core.log;
import vibe.http.server;
import vibe.http.fileserver;
import vibe.http.websockets;
import vibe.appmain;

enum MessageType : ubyte {
    unknown,
    help,
}

struct Message {
    MessageType messageType;
}

void handleConnection(scope WebSocket sock) {
    while (sock.connected) {
        auto message = sock.receiveText();

        logInfo(message);

        sock.send(message);
    }
}

void indexPage(HTTPServerRequest request, HTTPServerResponse response) {
    response.render!("index.dt", request);
}

shared static this() {
    import vibe.http.router;

    auto settings = new HTTPServerSettings;
    settings.port = 9001;

    auto fileSettings = new HTTPFileServerSettings;
    fileSettings.serverPathPrefix = "/static";

    auto router = new URLRouter;

    router
    .get("/", &indexPage)
    .get("/socket/", handleWebSockets(&handleConnection))
    .get("/static/*", serveStaticFiles("./public/", fileSettings))
    ;

    listenHTTP(settings, router);
}
