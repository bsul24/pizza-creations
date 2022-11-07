"use strict";

/****************
 *** Classes **
 ****************/

class Topping {
  parentEl = document.querySelector(".toppings");
  thisEl;
  deleteBtn;
  editBtn;

  constructor(topping) {
    this.topping = topping;
    this.renderTopping();
  }

  renderTopping() {
    const html = `
      <li class="topping">
        <span class="topping-text">${this.topping}</span>
        <div class="topping-btns">
          <button class="delete-btn">X</button>
          <button class="edit-btn">✏️</button>
        </div>
      </li>
  `;
    this.parentEl.insertAdjacentHTML("beforeend", html);
    this.setDOMElements();
    this.addButtonHandlers();
  }

  setDOMElements() {
    this.thisEl = this.parentEl.querySelector("li:last-child");
    this.deleteBtn = this.thisEl.querySelector(".delete-btn");
    this.editBtn = this.thisEl.querySelector(".edit-btn");
  }

  addButtonHandlers() {
    this.deleteBtn.addEventListener("click", this.removeTopping.bind(this));
    this.editBtn.addEventListener("click", this.editTopping.bind(this));
  }

  removeTopping(clear = false) {
    this.thisEl.remove();

    // When removing all toppings, we don't want the deleteTopping function to be called. Instead of removing each topping one by one in the tracker, it will all be done in one action at the end of the clear.
    if (clear) return;

    toppingTracker.deleteTopping(this);
  }
  editTopping() {
    console.log("edit");
  }
}

class ToppingTracker {
  allToppingClasses = [];
  allToppings = [];

  constructor() {
    this.setAllToppings();
  }

  setAllToppings() {
    if (!localStorage.getItem("toppings")) return;
    const toppings = localStorage.getItem("toppings").split(",");
    toppings.forEach((top) => this.createTopping(top));
  }

  storeAllToppings() {
    localStorage.setItem("toppings", this.allToppings);
  }

  createTopping(topping) {
    if (this.checkIfDuplicate(topping)) {
      alert("This topping already exists!");
      return;
    }
    const toppingClass = new Topping(topping);
    this.allToppingClasses.push(toppingClass);
    this.allToppings.push(topping);
    this.storeAllToppings();
  }

  checkIfDuplicate(topping) {
    return this.allToppingClasses.some(
      (top) => top.topping.toUpperCase() === topping.toUpperCase()
    );
  }

  deleteTopping(topping) {
    const toppingIndex = this.allToppings.indexOf(topping.topping);
    const toppingClassIndex = this.allToppingClasses.indexOf(topping);
    this.allToppings.splice(toppingIndex, 1);
    this.allToppingClasses.splice(toppingClassIndex, 1);
    this.storeAllToppings();
  }

  clearAllToppings() {
    this.allToppingClasses?.forEach((topping) => topping.removeTopping(true));
    this.allToppingClasses = [];
    this.allToppings = [];
    this.storeAllToppings();
  }
}
const toppingTracker = new ToppingTracker();

class ToppingController {
  input = document.querySelector("#add-topping");
  addToppingBtn = document.querySelector(".add-submit-btn");
  form = document.querySelector(".topping-form");
  clearToppingsBtn = document.querySelector(".clear-toppings");

  constructor() {
    this.addControllerHandlers();
  }

  addControllerHandlers() {
    this.input.addEventListener("input", this.checkIfLetter.bind(this));
    this.form.addEventListener("submit", this.addNewTopping.bind(this));
    this.clearToppingsBtn.addEventListener(
      "click",
      this.clearToppings.bind(this)
    );
  }

  checkIfLetter(e) {
    if (!e.data) return;

    if (
      (e.data.toUpperCase() >= "A" && e.data.toUpperCase() <= "Z") ||
      e.data === " "
    )
      return;

    this.input.value = this.input.value.slice(0, -1);
  }

  addNewTopping(e) {
    e.preventDefault();
    toppingTracker.createTopping(this.input.value);
    this.clearForm();
  }

  clearToppings() {
    toppingTracker.clearAllToppings();
  }

  clearForm() {
    this.input.value = "";
    this.input.blur();
  }
}
const toppingController = new ToppingController();

const editTopping = function (e) {
  const item = e.target.closest("li");
  if (item.querySelector("input")) {
    console.log("here");
    saveToppingEdit(item.querySelector("input"));
    return;
  }
  item.firstElementChild.classList.toggle("hidden");
  const topping = item.querySelector("span").textContent;
  const toppingEditor = `<input type="text" value="${topping}" class="topping-text" />`;
  item.insertAdjacentHTML("afterbegin", toppingEditor);
  const toppingInput = item.firstElementChild;
  toppingInput.setSelectionRange(topping.length, topping.length);
  toppingInput.focus();
  toppingInput.addEventListener("change", saveToppingEdit);
  toppingInput.addEventListener("blur", saveToppingEdit);
  // const editBtn = e.target;
  // editBtn.removeEventListener("click", editTopping);
  // editBtn.addEventListener("click", saveToppingEdit);
};

const saveToppingEdit = function (e) {
  // const editBtn = e.target.closest("li").querySelector(".edit-btn");
  // editBtn.removeEventListener("click", saveToppingEdit);
  // editBtn.addEventListener("click", editTopping);
  // // let toppingInput;
  // if (e.target.nodeName === "BUTTON") {
  //   toppingInput = e.target.closest("li").querySelector("input");
  // } else {
  const toppingInput = e.target;
  // }
  const toppingText = document.querySelector(".hidden");
  if (!toppingText) return;
  toppingText.textContent = toppingInput.value;
  toppingText.classList.toggle("hidden");
  toppingInput.remove();
};
