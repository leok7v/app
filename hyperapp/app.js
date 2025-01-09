import { h, text, app } from "hyperapp://./hyperapp.js"

let initial = "Questions and Answers will appear here"

const response = (value) => {
    return "What? I don't understand. Where's the tea?";
};

const add = (state) => {
    const r = response(state.value);
    const v = `${state.value}\n${r}`; // Concatenate value and response
    return {
        ...state,
        list: state.list.length === 1 && state.list[0] === initial
        ? [v]
        : state.list.concat(v),
        value: ""
    }
}

// Yes, an electronic brain a simple one would suffice.
// You'd just have  to program  it  to  say...

// "What?" "I don't understand" "Where's the tea?"

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

const update = (element) => {
  if (element.innerText !== value) { element.innerText = value }
}

const multiline = (textContent) =>
  textContent.split("\n").map((line) => h("div", {}, text(line)))

const updateEditable = (dispatch, { value }) => {
  const editable = document.querySelector(".editable")
  if (editable && editable.innerText !== value) {
    editable.innerText = value
  }
  return () => {}
}

app({
  init: { list: [initial], value: "" },
  subscriptions: (state) => [
    [updateEditable, { value: state.value }], // Sync contenteditable div with state
  ],
  view: ({ list, value }) =>
    h("main", {}, [
      h("h1", {}, text("Chat 💬")),
      h("ul", {},
        list.map((todo) => h("li", {}, multiline(todo)))
      ),
      h("section", {}, [
          h("div", { class: "editor" }, [
            h("div", {
              class: "editable",
                contenteditable: "true",
                placeholder: "Enter your question here...",
                oninput: input,
            }),
            h("div", { class: "editor_tools" }, [
                h("button", {
                    disabled: value.trim() !== "",
                    onclick:  lucky
                }, text("😊")),
                h("button", {
                    disabled: value.trim() === "",
                    onclick: add
                }, text("⬆️")),
            ])
        ]),
      ])
    ]),
    node: document.getElementById("app"),
})
