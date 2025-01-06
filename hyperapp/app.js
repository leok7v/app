import { h, text, app } from "hyperapp://./hyperapp.js"

const AddTodo = (state) => ({
  ...state,
  value: "",
  todos: state.todos.concat(state.value)
})

const NewValue = (state, event) => ({
  ...state,
  value: event.target.value,
})

const RenderMultilineText = (textContent) =>
  textContent.split("\n").map((line) => h("div", {}, text(line)));

app({
  init: { todos: ["Hyperapp Chat"], value: "" },
  view: ({ todos, value }) =>
    h("main", {}, [
      h("h1", {}, text("Chat 💬")),
      h("ul", {},
        todos.map((todo) => h("li", {}, RenderMultilineText(todo)))
      ),
      h("section", {}, [
        h("textarea", {
          oninput: NewValue,
          value,
          placeholder: "Enter your task...",
        }),
        h("button", { onclick: AddTodo }, text("Add new")),
      ])
    ]),
  node: document.getElementById("app"),
})
