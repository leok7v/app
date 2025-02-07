import SwiftUI
import WebKit

#if os(macOS)
import Cocoa

class CustomWebView: WKWebView {
    
    override func willOpenMenu(_ menu: NSMenu, with event: NSEvent) {
        #if !DEBUG // remove Reload in Release
        if let reload = menu.item(withTitle: "Reload") { menu.removeItem(reload) }
        #endif
    }
    
}

public typealias ViewRepresentable = NSViewRepresentable

#elseif os(iOS)

public typealias ViewRepresentable = UIViewRepresentable

#endif

struct WebView: ViewRepresentable {
    
    let htmlFileName: String
    let schemeHandler: WKURLSchemeHandler

    init(htmlFileName: String, schemeHandler: WKURLSchemeHandler) {
        self.htmlFileName = htmlFileName
        self.schemeHandler = schemeHandler
    }

    func loadHTML() -> String? {
        guard let fileURL = Bundle.main.url(forResource: htmlFileName, withExtension: "html") else {
            return nil
        }
//      print("fileURL: \(fileURL)")
        return try? String(contentsOf: fileURL, encoding: .utf8)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        #if DEBUG
        let pd = "document.body.setAttribute('oncontextmenu', " +
                 "'event.preventDefault();');"
        webView.evaluateJavaScript(pd, completionHandler: nil)
        #endif
    }
    
#if os(macOS)
    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(schemeHandler, forURLScheme: "app")
        #if DEBUG
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        #endif
        let webView = CustomWebView(frame: .zero, configuration: config)
        webView.configuration.preferences.setValue(true,
                forKey: "allowFileAccessFromFileURLs")
        webView.setValue(false, forKey: "drawsBackground")
        if let url = URL(string: "app://./index.html") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {
        // Handle updates if needed
    }
#elseif os(iOS)
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(schemeHandler, forURLScheme: "app")
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.configuration.preferences.setValue(true,
                forKey: "allowFileAccessFromFileURLs")
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        if let url = URL(string: "app://./index.html") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    // Handle updates if needed:
    
    func updateUIView(_ uiView: WKWebView, context: Context) { }
#endif
}
