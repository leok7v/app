import SwiftUI
import SwiftData
import Network
import Combine // Import Combine

@main
struct HyperApp: App {

    @State private var cancellables: Set<AnyCancellable> = []

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Item.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        
        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
            .onAppear {
                let future = Future<Bool, Error> { promise in
                    do {
                        let webServer = try WebServer(port: NWEndpoint.Port(rawValue: 8080)!)
                        let success = webServer.start()
                        promise(.success(success))
                    } catch {
                        promise(.failure(error))
                    }
                }
                future.sink { completion in
                    switch completion {
                    case .finished:
                        print("WebServer started")
                    case .failure(let error):
                        print("Error starting WebServer: \(error)")
                    }
                } receiveValue: { success in
                        if success {
                            print("WebServer started successfully")
                        } else {
                            print("Failed to start WebServer")
                        }
                    }
                    .store(in: &cancellables)
                }

        }
        .modelContainer(sharedModelContainer)
    }
    
}
