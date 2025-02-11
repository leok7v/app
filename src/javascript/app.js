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
let press_timer = null
let long_pressed_item_key = null
const long_press_threshold = 500

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
            long_pressed_item_key = key
            show_menu(e.pageX, e.pageY)
        }
        div.appendChild(span)
        div.appendChild(dots)
        div.onmousedown = e => {
            press_timer = setTimeout(() => {
                long_pressed_item_key = key
                show_menu(e.pageX, e.pageY)
            }, long_press_threshold)
        }
        div.onmouseup = () => clearTimeout(press_timer)
        div.onmouseleave = () => clearTimeout(press_timer)
        div.onclick = () => {
            if (long_pressed_item_key) return
            current_chat_key = key
            render_messages(key)
        }
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

const create_new_chat = () => {
    let k = get_time_label()
    while (localStorage.getItem(k)) {
        k = get_time_label()
    }
    localStorage.setItem(k, "[]")
    current_chat_key = k
    const arr = [{
        sender: "bot",
        text: "What would you like to discuss today?<br>" +
              "<sup>(use long full sentences)<sup>"
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
    long_pressed_item_key = null
}

const init = () => {
    marked.use({
      pedantic: false,
      gfm: true,
      breaks: false
    })
    rebuild_list()
    if (!localStorage.length) {
        create_new_chat()
    } else {
        current_chat_key = localStorage.key(0)
        render_messages(current_chat_key)
    }

    get("toggle_theme").onclick = () => {
        const html = document.documentElement
        const current = html.getAttribute("data-theme")
        html.setAttribute("data-theme", current === "dark" ? "light" : "dark")
    }

    get("send").onclick = e => {
        e.preventDefault()
        if (get("message_input").innerText !== "") {
            send_message(get("message_input").innerText.trim())
            get("message_input").innerText = ""
        }
        requestAnimationFrame(() => get("message_input").focus())
    }

    get("new").onclick = () => create_new_chat()
    
    get("clear").onclick = () => {
        localStorage.clear()
        current_chat_key = null
        create_new_chat()
    }

    const collapse = (collapsed) => {
        if (collapsed) {
            get("navigation").classList.add("collapsed")
            get("layout").classList.add("is_collapsed")
        } else {
            get("navigation").classList.remove("collapsed")
            get("layout").classList.remove("is_collapsed")
        }
    }
    
    get("collapse").onclick = () => collapse(true)

    get("expand").onclick = () => collapse(false)

    get("scroll").onclick = () => {
        get("messages").scrollTop = get("messages").scrollHeight
    }

    get("message_input").onkeydown = e => {
        if (get("message_input").innerText !== "" &&
            e.key === "Enter" &&
            !e.shiftKey) {
            e.preventDefault()
            send_message(get("message_input").innerText.trim())
            get("message_input").innerText = ""
        }
    }

    get("message_input").oninput = () => {
        const lines = get("message_input").innerText.split("\n").length
        get("message_input").style.maxHeight =
            lines > 1 ? window.innerHeight * 0.5 + "px" : ""
    }

    get("content").onclick = e => {
        if (e.target === get("message_input")) collapse(true)
        if (!e.target.closest("#menu")) hide_menu()
    }

    get("messages").onscroll = () => {
        get("scroll").style.display =
            get("messages").scrollHeight - get("messages").scrollTop >
            get("messages").clientHeight + 10
                ? "block"
                : "none"
    }

    get("delete").onclick = () => {
        if (!long_pressed_item_key) return
        localStorage.removeItem(long_pressed_item_key)
        if (current_chat_key === long_pressed_item_key)
            current_chat_key = null
        rebuild_list()
        if (!localStorage.length) {
            create_new_chat()
        } else if (!current_chat_key) {
            const k = localStorage.key(0)
            current_chat_key = k
            render_messages(k)
        }
        hide_menu()
    }

    get("rename").onclick = () => {
        if (!long_pressed_item_key) return
        const new_name = prompt("Enter new name", long_pressed_item_key)
        if (new_name && new_name !== long_pressed_item_key) {
            const data = get_chat_data(long_pressed_item_key)
            localStorage.removeItem(long_pressed_item_key)
            localStorage.setItem(new_name, JSON.stringify(data))
            if (current_chat_key === long_pressed_item_key)
                current_chat_key = new_name
            rebuild_list()
            render_messages(current_chat_key)
        }
        hide_menu()
    }

    get("share").onclick = () => {
        if (!long_pressed_item_key) return
        const data = get_chat_data(long_pressed_item_key)
        prompt("Copy chat data:", JSON.stringify(data))
        hide_menu()
    }

}

export { init }
