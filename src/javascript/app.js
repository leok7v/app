import { app } from "gyptix://./hyperapp.js"
import * as dom from "gyptix://./hyperapp.dom.js"
import * as events from "gyptix://./hyperapp.events.js"
import * as html from "gyptix://./hyperapp.html.js"
import * as svg from "gyptix://./hyperapp.svg.js"
import * as time from "gyptix://./hyperapp.time.js"
import * as marked from "gyptix://./marked.js"
import * as highlight from "gyptix://./highlight.min.js"

const init = (state) => ({...state,
    trigger: 0,
    count: 0,
    n: 99,
    s: "str",
    page: 0,
})

const save = state => {
  localStorage.setItem("data", JSON.stringify(state.data))
  return state
}

const load = state => {
  try {
    const stored = localStorage.getItem("data")
    return stored ? { ...state, data: JSON.parse(stored) } : state
  } catch (e) {
    return state
  }
}

const clear = state => {
  localStorage.clear()
  return { ...state, data: init(state) }
}

const trigger_inc = (state) => ({ ...state, trigger: state.trigger + 1 })
const trigger_dec = (state) => ({ ...state, trigger: state.trigger > 0 ? state.trigger - 1 : 0 })

const notify = state => {
    console.log("notify")
    return { ...state, ...trigger_inc }
}

const notified = state => {
    console.log("notified")
    return { ...state, ...trigger_dec(state) }
}

const get_by_id = id => document.getElementById(id)
const get_by_sel = sel => document.querySelector(sel)

const page1_md =
    "# About\n" +
    "\n" +
    "## About the App\n" +
    "\n" +
    "### version 25.02.5\n" +
    "\n" +
    "* About Item 1\n" +
    "* About Item 2\n" +
    "\n" +
    "*Marked.js*\n" +
    "\n" +
    "Copyright (c) 2018+, MarkedJS\n" +
    "[github.com/markedjs/](https://github.com/markedjs/)\n" +
    "\n" +
    "Copyright (c) 2011-2018, Christopher Jeffrey\n" +
    "[github.com/chjj/](https://github.com/chjj/)\n" +
    "\n" +
    "*Highlight.js*\n" +
    "\n" +
    "(c) 2006-2024 Josh Goebel <hello@joshgoebel.com> and other contributors\n" +
    "License: BSD-3-Clause\n"

const page2_md =
    "# Story\n" +
    "\n" +
    "* Story Item 1\n" +
    "* Story Item 2\n\n" +
    "\n" +
    "**Earth**\n" +
    "\n" +
    "~~Harmless~~\n" +
    "\n" +
    "*Mostly* harmless...\n" +
    "\n" +
    "The overriding design goal for Markdown's formatting " +
    "syntax is to make it as readable as possible. The idea is " +
    "that a Markdown-formatted document should be publishable " +
    "as-is, as plain text, without looking like it's been marked " +
    "up with tags or formatting instructions."

const page3_md =
    "# Fancy button\n" +
    "\n" +
    "* Button has CSS inline SVG as a picture\n" +
    "* Button has rounded rectangle around 1x1em box\n" +
    "* On hover rectangle is highlighted\n" +
    "* On load (after 1-2 seconds delay) a glyph " +
    "(👆 or 👉 or 👈) appears and blinks a few times next " +
    "to the button\n* Button should also support a red " +
    "blinking dot when requested (blink 3 times and fade out)"

const page4_md =
    "# Code:\n" +
    "\n" +
    "# Hello World\n" +
    "\n" +
    "C programming language" +
    "\n" +
    "```C\n" +
    "int main(int argc, const char* argv[]) {\n" +
    "    printf(\"Hello World!\\n\");\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "compile & run:\n" +
    "\n" +
    "```bash\n" +
    "gcc hello.c\n" +
    "./a.out\n" +
    "```\n" +
    "\n" +
    "## JavaScript Hello World\n" +
    "\n" +
    "```javascript\n" +
    "console.log(\"Hello, world!\");\n" +
    "```\n" +
    "\n" +
    "## Python Hello World\n" +
    "\n" +
    "```python\n" +
    "print(\"Hello, world!\")\n" +
    "```\n";

const set_focus = (state, id) => [state, dom.focus(id)]
const inc_and_set_focus = (state, id) => [
  { ...state, data: { ...state.data, n: state.data.n + 1 } },
  dom.focus(id)
]
const noop = state => state
const focused = state => [state, dom.focus("id1")]
const inc = state => [
  { ...state, data: { ...state.data, n: state.data.n + 1 } },
  dom.focus("id2")
]

const toggle = state => ({ ...state, expanded: !state.expanded })
const reset = state => clear(state)
const share = state => { console.log("share"); return state }
const settings = state => { console.log("settings"); return state }
const profile = state => { console.log("profile"); return state }
const back = state => [ { ...state, data: { ...state.data, page: 0 } } ]

const callbacks = {
  reset, share, settings, profile, toggle, focused, inc, back,
  save, load, clear
}

const action = (name, label) =>
  html.button(
    {
      class: name === "toggle" ? "btn toggle" : "btn",
      onclick: (s, e) => {
          e.stopPropagation()
          return (callbacks[name] || noop)(s, e)
      }
    },
    html.text(label)
  )

const page = (i, label) =>
  html.button(
    {
      class: "nav-page-btn",
      onclick: s => ({ ...s, data: { ...s.data, page: i } })
    },
    html.text(label)
  )

const highlightAllCodeBlocks = (node) => {
  node.querySelectorAll('pre code').forEach(block => {
    hljs.highlightBlock(block);
  });
}

const renderPage = state => {
    let md = ""
    switch(state.data.page) {
        case 0: return page0(state)
        case 1: md = page1_md; break
        case 2: md = page2_md; break
        case 3: md = page3_md; break
        case 4: md = page4_md; break
        default: md = ""
    }
    const parsed = marked.parse(md)
    return html.div({ class: "page" }, [
        html.button({ class: "btn close-btn", onclick: back }, html.text("❎")),
        html.div({ class: "markdown-content", innerHTML: parsed })
    ])
}

const hide_nav_if_overlap = state => {
  if (state.expanded) {
    const nav = get_by_sel(".nav.expanded")
    if (nav) {
      const overlap = getComputedStyle(nav)
        .getPropertyValue("--nav-overlap")
        .trim()
      if (overlap === "true")
        return { ...state, expanded: false }
    }
  }
  return state
}

const nav_header = state =>
  html.div({ class: "header" }, [
    html.div({ class: "header-left" }, [
      action("toggle", "🔽"),
      html.span({}, html.text("_"))
    ]),
    action("reset", "🆕")
  ])

const main_header = state =>
  html.div({ class: "header" }, [
    html.div({ class: "header-left" }, [
      !state.expanded ? action("toggle", "🔽") : null,
      !state.expanded ? action("reset", "🆕") : null,
      html.span({}, html.text("🙈"))
    ]),
    html.div({ class: "header-right" }, [
      action("share", "📤"),
      action("settings", "🎛"),
      action("profile", "👤"),
      action("save", "💾"),
      action("load", "📥"),
      action("clear", "🗑")
    ])
  ])

const page0 = state => [
  html.div(
    { class: "in", id: "id1", contenteditable: "plaintext-only" },
    html.text("state.data .s: " +
      state.data.s + " .n: " + state.data.n)
  ),
  action("focused", "🎯"),
  html.hr(),
  html.div(
    { class: "in", id: "id2", contenteditable: "plaintext-only" },
    html.text("state.data .s: " +
      state.data.s + " .n: " + state.data.n)
  ),
  action("inc", "🐲")
]

const updated = state => {
    console.log("updated")
    return state
}

const view = state =>
    html.div({ class: "app-container" }, [
    html.div({ class: "container" }, [
      state.expanded
        ? html.div({ class: "nav expanded" }, [
            nav_header(state),
            html.div({ class: "nav-content" }, [
              html.div({}, page(0, "Chat")),
              html.div({}, page(1, "About")),
              html.div({}, page(2, "Story")),
              html.div({}, page(3, "👪")),
              html.div({}, page(4, "Code"))
            ])
        ])
        : null,
      html.div(
        {
          class: "main-content",
          onclick: hide_nav_if_overlap,
          onmousedown: hide_nav_if_overlap,
          onfocus: hide_nav_if_overlap,
          onupdate: updated,
        },
        [
          main_header(state),
          html.main(renderPage(state))
        ]
      )
    ])
  ])

const tick = state => state.data.trigger > 0 ? notify(state) : state

const stateMiddleware = fn => dispatch => (action, payload) => {
    if (Array.isArray(action) && typeof action[0] !== 'function') {
        action = [fn(action[0]), ...action.slice(1)]
    } else if (!Array.isArray(action) && typeof action !== 'function') {
        action = fn(action)
    }
    // pass on to original dispatch
    dispatch(action, payload)
}

const logStateMiddleware = stateMiddleware(state => {
  console.log('STATE:', state)
  return state
})

const logActionsMiddleware = dispatch => (action, payload) => {
  if (typeof action === 'function') {
    console.log('DISPATCH: ', action.name || action)
  }
  // pass on to original dispatch
  dispatch(action, payload)
}

const immutableProxy = o => { // a proxy prohibiting mutation
  if (o===null || typeof o !== 'object') return o
  return new Proxy(o, {
    get(obj, prop) {
      return immutableProxy(obj[prop])
    },
    set(obj, prop) {
      throw new Error(`Can not set prop ${prop} on immutable object`)
    }
  })
}

const immutableMiddleware = stateMiddleware(state => immutableProxy(state))

app({
    init: { expanded: false, data: init({}) },
    subscriptions: state => [ time.every(1000, tick) ],
    view,
    dispatch: dispatch => logStateMiddleware(logActionsMiddleware(immutableMiddleware(dispatch))),
    node: get_by_id("app"),
})
