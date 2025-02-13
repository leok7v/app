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

let current  = null // current chat key
let selected = null // selected chat

const render_markdown = md => marked.parse(md)

document.addEventListener("copy", e => {
    e.preventDefault()
    const s = window.getSelection().toString()
    e.clipboardData.setData("text/plain", s)
})

const get_chat = k => {
    const s = localStorage.getItem(k)
    return s ? JSON.parse(s) : []
}

const save_chat = (k, a) =>
    localStorage.setItem(k, JSON.stringify(a))

// TODO: ChatGPT dark backgrounds (match):
// backgrounds:
// navigation #272829
// messages   #38393a
// input      #3c3c3c
// user       #454646

// Android
// Mozilla/5.0 (linux; android 11; kfquwi build/rs8332.3115n; wv) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/128.0.6613.187 safari/537.36
// linux armv8l

// macOS Sequoai 15.3 Apple Silicon
// mozilla/5.0 (macintosh; intel mac os x 10_15_7) applewebkit/605.1.15 (khtml, like gecko)
// macintel
    
const detect = () => {
    const html = document.documentElement
    const ua = navigator.userAgent.toLowerCase()
    const p = navigator.platform ? navigator.platform.toLowerCase() : ""
    const apple =
        /iphone|ipad|ipod/.test(ua) ||
        (p.includes("mac") && navigator.maxTouchPoints > 1) ||
        (ua.includes("macintosh") &&
         ua.includes("applewebkit") &&
        !ua.includes("chrome"))
    const bro = apple ? "safari" : "chrome"
    console.log("User-Agent:", ua)
    console.log("Platform:", p)
    console.log("Browser:", bro)
    html.setAttribute("data-bro", bro)
}

const get_time_label = () => {
    const d = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return `${days[d.getDay()]} ${d.getHours().toString().padStart(2, "0")}:` +
           `${d.getMinutes().toString().padStart(2, "0")}:` +
           `${d.getSeconds().toString().padStart(2, "0")}`
}


detect() // Immediately to apply styles ASAP

const init = () => { // called DOMContentLoaded
    const clear        = get("clear"),
          collapse     = get("collapse"),
          content      = get("content"),
          expand       = get("expand"),
          input        = get("input"),
          layout       = get("layout"),
          list         = get("list"),
          menu         = get("menu"),
          messages     = get("messages"),
          navigation   = get("navigation"),
          remove       = get("remove"),
          rename       = get("rename"),
          restart      = get("restart"),
          scroll       = get("scroll"),
          send         = get("send"),
          share        = get("share"),
          toggle_theme = get("toggle_theme");

    const render_messages = (k) => {
        const arr = get_chat(k)
        messages.innerHTML = ""
        arr.forEach(msg => {
            const d = document.createElement("div")
            d.className = msg.sender === "user"
                ? "user"
                : "bot"
            d.innerHTML = render_markdown(msg.text)
            messages.appendChild(d)
        })
        messages.scrollTop = messages.scrollHeight
        title.textContent = k
    }

    const rebuild_list = () => {
        list.innerHTML = ""
        const count = localStorage.length
        for (let i = count - 1; i >= 0; i--) {
            const key = localStorage.key(i)
            if (!key) continue
            const div = document.createElement("div")
            div.className = "item"
            div.onclick = () => {
                current = key
                render_messages(key)
            }
            const span = document.createElement("span")
            span.textContent = key
            const dots = document.createElement("button")
            dots.className = "button"
            dots.textContent = "⋮"
            dots.onclick = e => {
                e.stopPropagation()
                selected = key
                show_menu(e.pageX, e.pageY)
            }
            div.appendChild(span)
            div.appendChild(dots)
            list.appendChild(div)
        }
    }

    const start = () => {
        let k = get_time_label()
        while (localStorage.getItem(k)) {
            k = get_time_label()
        }
        localStorage.setItem(k, "[]")
        current = k
        const arr = [{
            sender: "bot",
            text: "What would you like to discuss today?<br>" +
                  "<sup>Full sentences help me respond better.<sup>"
        }]
        save_chat(k, arr)
        rebuild_list()
        render_messages(k)
    }

    const send_message = t => {
        if (!current || !t) return
        const arr = get_chat(current)
        arr.push({ sender: "user", text: t })
        arr.push({ sender: "bot", text: md })
        save_chat(current, arr)
        render_messages(current)
    }

    const show_menu = (x, y) => {
        menu.style.left = `${x}px`
        menu.style.top = `${y}px`
        menu.style.display = "block"
    }

    const hide_menu = () => {
        menu.style.display = "none"
        selected = null
    }
    
    detect()
    marked.use({pedantic: false, gfm: true, breaks: false})

    rebuild_list()

    window.addEventListener("resize", () => {
        const px = window.innerHeight * 0.01;
        console.log("--vh: " + px + "px")
        document.documentElement.style.setProperty("--vh", px + "px")
    })

    if (!localStorage.length) {
        start()
    } else {
        current = localStorage.key(0)
        render_messages(current)
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
        current = null
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
        if (!selected) return
        localStorage.removeItem(selected)
        if (current === selected)
            current = null
        rebuild_list()
        if (!localStorage.length) {
            start()
        } else if (!current) {
            const k = localStorage.key(0)
            current = k
            render_messages(k)
        }
        hide_menu()
    }

    rename.onclick = () => {
        if (!selected) return
        const name = prompt("Enter new name", selected)
        if (name && name !== selected) {
            const data = get_chat(selected)
            localStorage.removeItem(selected)
            localStorage.setItem(name, JSON.stringify(data))
            if (current === selected)
                current = name
            rebuild_list()
            render_messages(current)
        }
        hide_menu()
    }

    share.onclick = () => {
        if (!selected) return
        const data = get_chat(selected)
        prompt("Copy chat data:", JSON.stringify(data))
        hide_menu()
    }
}

export { init }
