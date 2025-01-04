import Foundation
import WebKit

class FileSchemeHandler: NSObject, WKURLSchemeHandler {

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              let path = url.path.removingPercentEncoding else {
            urlSchemeTask.didFailWithError(NSError(domain: NSURLErrorDomain, code: NSURLErrorBadURL, userInfo: nil))
            return
        }
        let resourcePath = path.hasPrefix("/") ? String(path.dropFirst()) : path
        if let fileURL = Bundle.main.url(forResource: resourcePath, withExtension: nil),
            let fileContent = try? String(contentsOf: fileURL, encoding: .utf8),
            let data = fileContent.data(using: .utf8) {
 //         print("fileContent:\n");
 //         print(fileContent)
 //         print("data:\n");
 //         print(data)
            if let mainFrameURL = urlSchemeTask.request.url {
                let mainFrameOrigin = mainFrameURL.absoluteString.split(separator: "/").prefix(3).joined(separator: "/")
                var allowedOrigin = mainFrameOrigin
                allowedOrigin = "hyperapp://."
                let mt = mimeType(for: path);
                if let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: ["Access-Control-Allow-Origin": allowedOrigin,
                                   "charset": "utf-8",
                                   "Content-Type": mt]) {
                    urlSchemeTask.didReceive(response)
                    urlSchemeTask.didReceive(data)
                    urlSchemeTask.didFinish()
                    return;
                }
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
