import SwiftUI
import WebKit

#if os(macOS)
public typealias ViewRepresentable = NSViewRepresentable
#elseif os(iOS)
public typealias ViewRepresentable = UIViewRepresentable
#endif

struct WebView: ViewRepresentable {
    let htmlFileName: String

    func loadHTML() -> String? {
        guard let fileURL = Bundle.main.url(forResource: htmlFileName, withExtension: "html") else {
            return nil
        }
        return try? String(contentsOf: fileURL, encoding: .utf8)
    }

#if os(macOS)
    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView()
        // Make background transparent
        webView.setValue(false, forKey: "drawsBackground")
        if let htmlContent = loadHTML() {
            webView.loadHTMLString(htmlContent, baseURL: Bundle.main.bundleURL)
        }
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {
        // Handle updates if needed
    }
#elseif os(iOS)
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        if let htmlContent = loadHTML() {
            webView.loadHTMLString(htmlContent, baseURL: Bundle.main.bundleURL)
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Handle updates if needed
    }
#endif
}
