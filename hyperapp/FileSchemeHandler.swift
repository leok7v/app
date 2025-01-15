import Foundation
import WebKit

class FileSchemeHandler: NSObject, WKURLSchemeHandler {

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let allowedOrigin = "hyperapp://"
        guard let url = urlSchemeTask.request.url,
              let path = url.path.removingPercentEncoding else {
            urlSchemeTask.didFailWithError(NSError(domain: NSURLErrorDomain, code: NSURLErrorBadURL, userInfo: nil))
            return
        }
        let resourcePath = path.hasPrefix("/") ? String(path.dropFirst()) : path
//      print(resourcePath)
        if (resourcePath == "answer") {
            let body = urlSchemeTask.request.httpBody
            var bodyString: String? = nil
            if let body = body {
                bodyString = String(data: body, encoding: .utf8)
//              print(">urlSchemeTask.request.httpBody")
                if let bodyString = bodyString {
                    print(bodyString)
                } else {
                    print("Failed to decode body as UTF-8 string.")
                    return
                }
                print("<urlSchemeTask.request.httpBody")
            }
            if let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields:
                    ["Access-Control-Allow-Origin": allowedOrigin,
                     "charset": "utf-8",
                     "Content-Type": "text/plain"]) {
                urlSchemeTask.didReceive(response)
                // Placeholder:
                let text = "🤔 What?\r\n" +
                           "😕 I don't understand.\r\n" +
                            "🫖 Where's the tea? ☕\r\n"
                if let data = text.data(using: .utf8) {
                    urlSchemeTask.didReceive(data)
                    urlSchemeTask.didFinish()
//                  print(String(data: data, encoding: .utf8))
                    return;
                } else {
                    print("Failed to encode response body as UTF-8.")
                }
            }
        } else if let fileURL = Bundle.main.url(forResource: resourcePath, withExtension: nil),
            let fileContent = try? String(contentsOf: fileURL, encoding: .utf8),
            let data = fileContent.data(using: .utf8) {
 //         print("fileContent:\n");
 //         print(fileContent)
 //         print("data:\n");
 //         print(data)
// Content-Security-Policy: default-src 'self' hyperapp://; script-src 'self' hyperapp://; img-src 'self' data: hyperapp://;

            let mt = mimeType(for: path);
            if let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: "HTTP/1.1",
                headerFields:
                    ["Access-Control-Allow-Origin": allowedOrigin,
                     "Content-Type": mt,
                     "charset": "utf-8",
                     "Permissions-Policy": "microphone=(self 'hyperapp://');",
                     "Content-Security-Policy":
                     "default-src 'self' hyperapp://;" +
                     "img-src 'self' hyperapp:// data:; " +
                     "style-src 'self' hyperapp:// 'unsafe-inline'; " +
                     "script-src 'self' hyperapp:// 'unsafe-inline';"]) {
                urlSchemeTask.didReceive(response)
                urlSchemeTask.didReceive(data)
                urlSchemeTask.didFinish()
                return;
            }
        }
        urlSchemeTask.didFailWithError(NSError(domain: NSURLErrorDomain, code: NSURLErrorResourceUnavailable, userInfo: nil))
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Not needed for this example
    }

    // Helper function to determine the MIME type based on file extension
    private func mimeType(for path: String) -> String {
        let pathExtension = URL(fileURLWithPath: path).pathExtension.lowercased()
        switch pathExtension {
            case "html", "htm": return "text/html"
            case "js": return "text/javascript"
            case "css": return "text/css"
            case "png": return "image/png"
            case "jpg", "jpeg": return "image/jpeg"
            default: return "application/octet-stream"
        }
    }
}
