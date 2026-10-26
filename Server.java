import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.net.InetSocketAddress;

public class Server {
    private static final int PORT = 8000;
    private static final String ROOT_DIR = ".";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);

        System.out.println("=================================================");
        System.out.println("🚀 Hostel Hub Java Web Server is Running!");
        System.out.println("👉 Access Portal in Browser: http://localhost:" + PORT);
        System.out.println("=================================================");
        
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }

            File file = new File(ROOT_DIR, path).getCanonicalFile();

            if (!file.exists() || file.isDirectory()) {
                file = new File(ROOT_DIR, "/index.html").getCanonicalFile();
            }

            String mimeType = getMimeType(file.getName());
            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.sendResponseHeaders(200, file.length());

            OutputStream os = exchange.getResponseBody();
            FileInputStream fis = new FileInputStream(file);

            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }

            fis.close();
            os.close();
        }

        private String getMimeType(String fileName) {
            if (fileName.endsWith(".html")) return "text/html";
            if (fileName.endsWith(".css")) return "text/css";
            if (fileName.endsWith(".js")) return "text/javascript";
            if (fileName.endsWith(".json")) return "application/json";
            if (fileName.endsWith(".png")) return "image/png";
            if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
            if (fileName.endsWith(".svg")) return "image/svg+xml";
            return "text/plain";
        }
    }
}
