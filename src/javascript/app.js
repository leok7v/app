"use strict"

import * as marked from "app://./marked.js"

const md =
  "# Lorem ipsum\n\n" +
  "# Dolor sit amet\n\n" +
  "# Consectetur\n\n" +
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
  "sed do eiusmod tempor incididunt ut labore et dolore " +
  "magna aliqua.\n\n" +
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
  "sed do eiusmod tempor incididunt ut labore et dolore " +
  "magna aliqua.\n\n" +
  "### C\n\n" +
  "```c\n" +
  "int main(void) {\n" +
  "    return 0\n" +
  "}\n" +
  "```\n\n" +
  "### Python\n\n" +
  "```python\n" +
  "print(\"Hello, world!\")\n" +
  "```\n\n" +
  "### JavaScript\n\n" +
  "```javascript\n" +
  "console.log(\"Hello, world!\")\n" +
  "```\n\n" +
  "* Lorem\n" +
  "* Ipsum\n" +
  "* Magna\n\n"

const get = id => document.getElementById(id)

let current_chat_key = null
let selected_chat = null

const render_markdown = md => marked.parse(md)

document.addEventListener("copy", e => {
    e.preventDefault()
    const s = window.getSelection().toString()
    e.clipboardData.setData("text/plain", s)
})

const get_chat_data = k => {
    const s = localStorage.getItem(k)
    return s ? JSON.parse(s) : []
}

const save_chat_data = (k, a) =>
    localStorage.setItem(k, JSON.stringify(a))

const render_messages = k => {
    const messages = get("messages")
    const chat_title = get("title")
    const arr = get_chat_data(k)
    messages.innerHTML = ""
    arr.forEach(msg => {
        const d = document.createElement("div")
        d.className = msg.sender === "user"
            ? "message_user"
            : "message_bot"
        d.innerHTML = render_markdown(msg.text)
        messages.appendChild(d)
    })
    messages.scrollTop = messages.scrollHeight
    chat_title.textContent = k
}

const rebuild_list = () => {
    const list = get("list")
    list.innerHTML = ""
    const count = localStorage.length
    for (let i = count - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (!key) continue
        const div = document.createElement("div")
        div.className = "item"
        const span = document.createElement("span")
        span.textContent = key
        const dots = document.createElement("button")
        dots.className = "button"
        dots.textContent = "⋮"
        dots.onclick = e => {
            e.stopPropagation()
            selected_chat = key
            show_menu(e.pageX, e.pageY)
        }
        div.appendChild(span)
        div.appendChild(dots)
        list.appendChild(div)
    }
}

const get_time_label = () => {
    const d = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return `${days[d.getDay()]} ${d.getHours().toString().padStart(2, "0")}:` +
           `${d.getMinutes().toString().padStart(2, "0")}:` +
           `${d.getSeconds().toString().padStart(2, "0")}`
}

const start = () => {
    let k = get_time_label()
    while (localStorage.getItem(k)) {
        k = get_time_label()
    }
    localStorage.setItem(k, "[]")
    current_chat_key = k
    const arr = [{
        sender: "bot",
        text: "What would you like to discuss today?<br>" +
              "<sup>Full sentences help me respond better.<sup>"
    }]
    save_chat_data(k, arr)
    rebuild_list()
    render_messages(k)
}

const send_message = t => {
    if (!current_chat_key || !t) return
    const arr = get_chat_data(current_chat_key)
    arr.push({ sender: "user", text: t })
    arr.push({ sender: "bot", text: md })
    save_chat_data(current_chat_key, arr)
    render_messages(current_chat_key)
}

const show_menu = (x, y) => {
    const menu = get("menu")
    menu.style.left = `${x}px`
    menu.style.top = `${y}px`
    menu.style.display = "block"
}

const hide_menu = () => {
    const menu = get("menu")
    menu.style.display = "none"
    selected_chat = null
}

const init = () => {
    const toggle_theme = get("toggle_theme"),
          send         = get("send"),
          restart      = get("restart"),
          clear        = get("clear"),
          collapse     = get("collapse"),
          expand       = get("expand"),
          scroll       = get("scroll"),
          input        = get("input"),
          content      = get("content"),
          messages     = get("messages"),
          remove       = get("remove"),
          rename       = get("rename"),
          share        = get("share"),
          navigation   = get("navigation"),
          layout       = get("layout"),
          menu         = get("menu")

    marked.use({pedantic: false, gfm: true, breaks: false})
    rebuild_list()
    if (!localStorage.length) {
        start()
    } else {
        current_chat_key = localStorage.key(0)
        render_messages(current_chat_key)
    }

    toggle_theme.onclick = () => {
        const html = document.documentElement
        const current = html.getAttribute("data-theme")
        html.setAttribute("data-theme", current === "dark"
            ? "light" : "dark")
    }

    send.onclick = e => {
        e.preventDefault()
        if (input.innerText !== "") {
            send_message(input.innerText.trim())
            input.innerText = ""
        }
        requestAnimationFrame(() => input.focus())
    }

    restart.onclick = () => start()
    
    clear.onclick = () => {
        localStorage.clear()
        current_chat_key = null
        start()
    }

    const collapsed = () => {
        navigation.classList.add("collapsed")
        layout.classList.add("is_collapsed")
    }

    const expanded = () => {
        navigation.classList.remove("collapsed")
        layout.classList.remove("is_collapsed")
    }

    collapse.onclick = () => collapsed()
    expand.onclick = () => expanded()

    scroll.onclick = () => {
        messages.scrollTop = messages.scrollHeight
    }

    input.onkeydown = e => {
        if (input.innerText !== "" && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            send_message(input.innerText.trim())
            input.innerText = ""
        }
    }

    input.onfocus = () => collapsed()
    
    input.oninput = () => {
        const lines = input.innerText.split("\n").length
        input.style.maxHeight = lines > 1
            ? window.innerHeight * 0.5 + "px" : ""
    }

    content.onclick = e => {
        if (e.target.closest("#messages") ||
            e.target.closest("#input")) collapsed()
        if (!e.target.closest("#menu")) hide_menu()
    }

    messages.onscroll = () => {
        const d = messages.scrollHeight - messages.scrollTop
        scroll.style.display = d > messages.clientHeight + 10
            ? "block" : "none"
    }

    remove.onclick = () => {
        if (!selected_chat) return
        localStorage.removeItem(selected_chat)
        if (current_chat_key === selected_chat)
            current_chat_key = null
        rebuild_list()
        if (!localStorage.length) {
            start()
        } else if (!current_chat_key) {
            const k = localStorage.key(0)
            current_chat_key = k
            render_messages(k)
        }
        hide_menu()
    }

    rename.onclick = () => {
        if (!selected_chat) return
        const name = prompt("Enter new name", selected_chat)
        if (name && name !== selected_chat) {
            const data = get_chat_data(selected_chat)
            localStorage.removeItem(selected_chat)
            localStorage.setItem(name, JSON.stringify(data))
            if (current_chat_key === selected_chat)
                current_chat_key = name
            rebuild_list()
            render_messages(current_chat_key)
        }
        hide_menu()
    }

    share.onclick = () => {
        if (!selected_chat) return
        const data = get_chat_data(selected_chat)
        prompt("Copy chat data:", JSON.stringify(data))
        hide_menu()
    }
}

export { init }
