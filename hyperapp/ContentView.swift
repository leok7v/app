import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var items: [Item]
    let schemeHandler = FileSchemeHandler()
    
    var body: some View {
        WebView(htmlFileName: "index", schemeHandler: schemeHandler)
    }
    
}

#Preview {
    ContentView()
        .modelContainer(for: Item.self, inMemory: true)
}
