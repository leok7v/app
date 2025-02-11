import * as marked from "app://./marked.js"

(() => {
  "use strict"
  const get              = id => document.getElementById(id)

  const chat_header      = get("chat_header")
  const chat_list        = get("chat_list")
  const chat_title       = get("chat_title")
  const clear_all_btn    = get("clear_all_btn")
  const collapse_btn     = get("collapse_btn")
  const content          = get("content")
  const expand_btn       = get("expand_btn")
  const layout           = get("layout")
  const message_input    = get("message_input")
  const menu             = get("menu")
  const menu_btn_delete  = get("btn_delete")
  const menu_btn_rename  = get("btn_rename")
  const menu_btn_share   = get("btn_share")
  const messages         = get("messages")
  const nav              = get("nav")
  const nav_header       = get("nav_header")
  const new_chat_btn     = get("new_chat_btn")
  const scroll_btn       = get("scroll_btn")
  const send_btn         = get("send_btn")
  const toggle_theme_btn = get("toggle_theme_btn")

  let current_chat_key = null
  let press_timer = null
  let long_pressed_item_key = null
  const long_press_threshold = 500

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

  const render_markdown = md => marked.parse(md)

  const render_messages = k => {
    const arr = get_chat_data(k)
    messages.innerHTML = ""
    for (let i = 0; i < arr.length; i++) {
      const d = document.createElement("div")
      d.className = arr[i].sender === "user" ? "message_user" : "message_bot"
      d.innerHTML = render_markdown(arr[i].text)
      messages.appendChild(d)
    }
    messages.scrollTop = messages.scrollHeight
    chat_title.textContent = k
  }

    const rebuild_chat_list = () => {
    chat_list.innerHTML = ""
    const count = localStorage.length
    for (let i = count; i >= 0; i--) {
      const key = localStorage.key(i)
      if (!key) continue
      const div = document.createElement("div")
      div.className = "chat_list_item"
      const span = document.createElement("span")
      span.textContent = key
      const dot_btn = document.createElement("button")
      dot_btn.className = "button_small"
      dot_btn.textContent = "⋮"
      dot_btn.onclick = e => {
        e.stopPropagation()
        long_pressed_item_key = key
        show_menu(e.pageX, e.pageY)
      }
      div.appendChild(span)
      div.appendChild(dot_btn)
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
      chat_list.appendChild(div)
    }
  }

  const get_time_label = () => {
    const d = new Date()
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const w = days[d.getDay()]
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    const ss = String(d.getSeconds()).padStart(2, "0")
    return `${w} ${hh}:${mm}:${ss}`
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
      text: "What do you want to talk about today?<br>" +
            "Use long sentences please (I am not very smart yet)"
    }]
    save_chat_data(k, arr)
    current_chat_key = k
    rebuild_chat_list()
    render_messages(k)
  }

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

  const send_message = t => {
    if (!current_chat_key || !t) return
    const arr = get_chat_data(current_chat_key)
    arr.push({ sender: "user", text: t })
    arr.push({ sender: "bot", text: md })
    save_chat_data(current_chat_key, arr)
    render_messages(current_chat_key)
  }

  const show_menu = (x, y) => {
    menu.style.left = `${x}px`
    menu.style.top = `${y}px`
    menu.style.display = "block"
  }

  const hide_menu = () => {
    menu.style.display = "none"
    long_pressed_item_key = null
  }

  menu_btn_delete.onclick = () => {
    if (!long_pressed_item_key) return
    localStorage.removeItem(long_pressed_item_key)
    if (current_chat_key === long_pressed_item_key)
      current_chat_key = null
    rebuild_chat_list()
    if (!localStorage.length) {
      create_new_chat()
    } else if (!current_chat_key) {
      const k = localStorage.key(0)
      current_chat_key = k
      render_messages(k)
    }
    hide_menu()
  }

  menu_btn_rename.onclick = () => {
    if (!long_pressed_item_key) return
    const new_name = prompt("Enter new name", long_pressed_item_key)
    if (new_name && new_name !== long_pressed_item_key) {
      const data = get_chat_data(long_pressed_item_key)
      localStorage.removeItem(long_pressed_item_key)
      localStorage.setItem(new_name, JSON.stringify(data))
      if (current_chat_key === long_pressed_item_key)
        current_chat_key = new_name
      rebuild_chat_list()
      render_messages(current_chat_key)
    }
    hide_menu()
  }

  menu_btn_share.onclick = () => {
    if (!long_pressed_item_key) return
    const data = get_chat_data(long_pressed_item_key)
    prompt("Copy chat data:", JSON.stringify(data))
    hide_menu()
  }

  document.body.onclick = e => {
    if (e.target.id !== "menu" && !menu.contains(e.target) && long_pressed_item_key)
      hide_menu()
  }

  new_chat_btn.onclick = () => create_new_chat()

  clear_all_btn.onclick = () => {
    localStorage.clear()
    current_chat_key = null
    create_new_chat()
  }

  collapse_btn.onclick = () => {
    nav.classList.add("nav_pane_collapsed")
    layout.classList.add("nav_collapsed")
  }

  expand_btn.onclick = () => {
    nav.classList.remove("nav_pane_collapsed")
    layout.classList.remove("nav_collapsed")
  }

  scroll_btn.onclick = () => {
    messages.scrollTop = messages.scrollHeight
  }

  message_input.onkeydown = e => {
    if (message_input.innerText !== "" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send_message(message_input.innerText.trim())
      message_input.innerText = ""
    }
  }

  send_btn.onclick = e => {
    e.preventDefault()
    if (message_input.innerText !== "") {
      send_message(message_input.innerText.trim())
      message_input.innerText = ""
    }
    requestAnimationFrame(() => message_input.focus())
  }

  message_input.oninput = () => {
    const lines = message_input.innerText.split("\n").length
    message_input.style.maxHeight = lines > 1 ? window.innerHeight * 0.5 + "px" : ""
  }

  content.onclick = e => {
    if (e.target === message_input) {
      nav.classList.add("nav_pane_collapsed")
      layout.classList.add("nav_collapsed")
    }
  }

  messages.onscroll = () => {
    scroll_btn.style.display =
      messages.scrollHeight - messages.scrollTop > messages.clientHeight + 10
        ? "block"
        : "none"
  }

  toggle_theme_btn.onclick = () => {
    const html = document.documentElement
    const current = html.getAttribute("data-theme")
    html.setAttribute("data-theme", current === "dark" ? "light" : "dark")
  }

  rebuild_chat_list()
  if (!localStorage.length) {
    create_new_chat()
  } else {
    current_chat_key = localStorage.key(0)
    render_messages(current_chat_key)
  }
})()
