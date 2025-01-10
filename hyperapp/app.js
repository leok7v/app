import { app }               from "hyperapp://./hyperapp.js"
import { focus, blur }       from "hyperapp://./hyperapp.dom.js"
import { every, delay, now } from "hyperapp://./hyperapp.time.js"
import { onMouseMove }       from "hyperapp://./hyperapp.events.js"
import { ellipse }           from "hyperapp://./hyperapp.svg.js"

import {
    main, h1, ul, li, section, div, button, text,
} from "hyperapp://./hyperapp.html.js"

const lucky = (state) => {
    const value =
        "Yes, an electronic brain a simple one would suffice.\r\n" +
        "You'd just have  to program  it  to  say..."
    return {
        ...state,
        value
    }
}

const input = (state, event) => ({
    ...state,
    value: event.target.innerText,
})

const multiline = (txt) =>
    txt.split("\n").map((line) => div(text(line)))

const update = (dispatch, { value }) => {
    // Sync contenteditable div with state
    const editable = document.querySelector(".editable")
    if (editable && editable.innerText !== value) {
        editable.innerText = value
    }
    return () => {}
}

const answer = (value) => {
    return "What?\nI don't understand.\nWhere's the tea?";
};

const scroll = (state) => {
    const ul = document.querySelector("ul");
    if (ul) { ul.scrollTo({ top: ul.scrollHeight, behavior: "smooth" }) }
    return state
}

const settings = (state) => { return state }
const login    = (state) => { return state }

const add = (state) => {
    const a = answer(state.value)
    const q = state.value
    const e = [
        { type: "question", text: q },
        { type: "answer", text: a }
    ]
    return [{
        ...state,
        list: state.list.concat(e),
        value: ""
    }, delay(33, scroll)]
}

app({
    init: { list: [], value: "" },
    subscriptions: (state) => [
        [update, { value: state.value }],
    ],
    view: ({ list, value }) =>
        main([
            div({ class: "header" }, [
                button({
                    class: "settings",
                    onclick: settings
                }, text("⚙️")),
                button({
                    class: "login",
                    onclick: login
                }, text("🔑")),
            ]),
            ul(list.map(e => li({class: e.type}, multiline(e.text)))),
            section( {}, [
                div( { class: "editor" }, [
                    div({
                        class: "editable",
                        contenteditable: "true",
                        placeholder: "Ask anything...",
                        oninput: input,
                    }),
                    div({ class: "editor_tools" }, [
                        button({
                            class: "lucky",
                            disabled: value.trim() !== "",
                            onclick: lucky
                        }, text("💬")),
                        button({
                            class: "up-arrow-icon",
                            disabled: value.trim() === "",
                            onclick: add
                        }, text("")), // ⬆️
                    ])
                ]),
            ])
        ]),
    node: document.getElementById("app"),
})
