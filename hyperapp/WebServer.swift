import Network
import Foundation

class WebServer {
    private let listener: NWListener
    private let queue = DispatchQueue(label: "WebServerQueue")
    var startResult = true

    init(port: NWEndpoint.Port) throws {
        listener = try NWListener(using: .tcp, on: port)
    }

    func start() -> Bool {
        listener.stateUpdateHandler = { state in
            switch state {
                case .failed(let error):
                    print("Listener failed with error: \(error)")
                    self.startResult = false
                case .ready:
                    self.startResult = true
                default:
                    break
            }
        }
        acceptNewConnection()
        listener.start(queue: queue)
        return startResult
    }

    private func acceptNewConnection() {
        listener.newConnectionHandler = { connection in
            connection.stateUpdateHandler = { state in
                switch state {
                case .ready:
                    self.handleConnection(connection)
                case .failed(let error):
                    print("Connection failed with error: \(error)")
                default:
                    break
                }
            }
            connection.start(queue: self.queue)
        }
    }

    private func response(_ requestString: String) -> String {
        guard let request = parseHTTPRequest(requestString) else {
            return "HTTP/1.1 400 Bad Request\r\n\r\n"
        }
        let filePath: String
        var contentType = "text/html"
        switch request.path {
            case "/":
                filePath = "index.html"
            case "/hyperapp.js":
                filePath = "hyperapp.js"
                contentType = "application/javascript"
            default:
                return "HTTP/1.1 404 Not Found\r\n\r\n" // Handle unknown paths
        }
        if let fileContent = loadFileContent(filePath) {
            return "HTTP/1.1 200 OK\r\n" +
                   "Content-Type: " + contentType + "\r\n" +
                   "\r\n" +
                   fileContent
        } else {
            return "HTTP/1.1 500 Internal Server Error\r\n\r\n" // Handle file loading errors
        }
    }
    
    private func handleConnection(_ connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) { (data, context, isComplete, error) in
            if let data = data, !data.isEmpty {
                let requestString = String(data: data, encoding: .utf8) ?? ""
                print("Received request: \(requestString)")
                let r = self.response(requestString)
                let responseData = r.data(using: .utf8)!
                connection.send(content: responseData, completion: .contentProcessed { error in
                    if let error = error {
                        print("Error sending response: \(error)")
                    }
                    connection.cancel() // Close the connection
                })
            } else if isComplete {
                connection.cancel()
            } else if let error = error {
                print("Error receiving data: \(error)")
                connection.cancel()
            } else {
                // Continue receiving data
                connection.receive(minimumIncompleteLength: 1, maximumLength: 1024, completion: { (data, context, isComplete, error) in
                    self.handleConnection(connection) // Recursively call to handle more data
                })
            }
        }
    }
    
    private func parseHTTPRequest(_ requestString: String) -> (method: String, path: String)? {
        let lines = requestString.components(separatedBy: "\n")
        if lines.isEmpty { return nil }
        let firstLine = lines[0]
        let components = firstLine.split(separator: " ").map(String.init)
        if components.count < 3 { return nil }
        return (components[0], components[1])
    }
        
    private func loadFileContent(_ fileName: String) -> String? {
        guard let bundleURL = Bundle.main.url(forResource: "index", withExtension: "html") else {
            return nil
        }
        let fileURL = bundleURL.deletingLastPathComponent()
                                .appendingPathComponent(fileName)
        do {
            let content = try String(contentsOf: fileURL, encoding: .utf8)
            return content
        } catch {
            print("Error loading file content: \(error)")
            return nil
        }
    }

    private func loadFileContent0(_ fileName: String) -> String? {
        if let fileURL = Bundle.main.url(forResource: fileName, withExtension: "html"),
           let content = try? String(contentsOf: fileURL, encoding: .utf8) {
            return content
        }
        return nil
    }
    
}

