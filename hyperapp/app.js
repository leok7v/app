import { app }               from "hyperapp://./hyperapp.js"
import { focus, blur }       from "hyperapp://./hyperapp.dom.js"
import { every, delay, now } from "hyperapp://./hyperapp.time.js"
import { onMouseMove }       from "hyperapp://./hyperapp.events.js"
import { ellipse }           from "hyperapp://./hyperapp.svg.js"

import {
    main,
    section,
    div,
    h1,
    button,
    ul,
    li,
    text,
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

const add = (state) => {
    const a = answer(state.value)
    const q = state.value
    const e = [
        { type: "question", text: q },
        { type: "answer", text: a }
    ]
    requestAnimationFrame(() => {
        const answers = document.querySelectorAll("li.answer")
        if (answers.length > 0) {
            answers[answers.length - 1].scrollIntoView(
                { block: "end", behavior: "smooth" }
            )
        }
    })
    return {
        ...state,
        list: state.list.concat(e),
        value: ""
    }
}

app({
    init: { list: [], value: "" },
    subscriptions: (state) => [
        [update, { value: state.value }],
    ],
    view: ({ list, value }) =>
        main([
            h1({ class: "header" }, text("Chat 💬")),
            ul(
              list.map((e) => li({ class: e.type }, multiline(e.text)))
            ),
        section( {}, [
            div( { class: "editor" }, [
                div({
                    class: "editable",
                    contenteditable: "true",
                    placeholder: "Enter your question here...",
                    oninput: input,
                }),
                div({ class: "editor_tools" }, [
                    button( {
                        disabled: value.trim() !== "",
                        onclick:  lucky
                    }, text("😊")), // ⚪
                    button( {
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
