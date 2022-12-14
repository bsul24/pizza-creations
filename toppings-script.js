"use strict";

const overlay = document.querySelector(".overlay");

/****************
 *** Classes **
 ****************/

class Topping {
  parentEl = document.querySelector(".toppings");
  thisEl;
  input;
  deleteBtn;
  editBtn;
  preEdit;

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

  removeTopping(e, clear = false) {
    this.thisEl.remove();

    // When removing all toppings, we don't want the deleteTopping function to be called. Instead of removing each topping one by one in the tracker, it will all be done in one action at the end of the clear.
    if (clear) return;
    toppingTracker.deleteTopping(this);
  }

  editTopping() {
    if (this.thisEl.querySelector("input")) {
      this.checkIfDuplicate();
      return;
    }
    this.preEdit = this.topping;
    this.thisEl.firstElementChild.remove();
    const inputNode = `<input type="text" value="${this.topping}" class="topping-text" maxlength="20" />`;
    this.thisEl.insertAdjacentHTML("afterbegin", inputNode);
    this.input = this.thisEl.querySelector(".topping-text");
    this.input.setSelectionRange(this.topping.length, this.topping.length);
    this.input.focus();
    this.addEditHandlers();
  }

  addEditHandlers() {
    this.input.addEventListener("input", this.checkIfLetter.bind(this));
    this.input.addEventListener("change", this.checkIfDuplicate.bind(this));
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

  checkIfDuplicate() {
    const allToppings = toppingTracker.getToppings();
    if (
      allToppings.some(
        (top) => top.toUpperCase() === this.input.value.toUpperCase()
      ) &&
      this.input.value.toUpperCase() !== this.topping.toUpperCase()
    ) {
      return;
    }

    this.saveEdit();
  }

  saveEdit() {
    if (this.thisEl.querySelector("span")) return;

    if (this.input.value === "") {
      alert("Please enter topping name");
      return;
    }

    this.topping = this.input.value;
    this.input.remove();
    this.input = "";
    const newToppingText = `<span class="topping-text">${this.topping}</span>`;
    this.thisEl.insertAdjacentHTML("afterbegin", newToppingText);
    toppingTracker.updateTopping(this.preEdit, this);
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

    if (topping === "") {
      alert("Please enter topping name");
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

  updateTopping(toppingPre, toppingNew) {
    const toppingIndex = this.allToppings.indexOf(toppingPre);
    const toppingClassIndex = this.allToppingClasses.findIndex(
      (top) => top.topping === toppingPre
    );
    this.allToppings[toppingIndex] = toppingNew.topping;
    this.allToppingClasses[toppingClassIndex] = toppingNew;
    this.storeAllToppings();
  }

  clearToppingsPopup() {
    const popup = `
      <div class="modal clear-toppings-popup">
        <p>Are you sure you want to clear all toppings?</p>
        <div class="popup-btns">
          <button class="yes">Yes</button>
          <button class="cancel">Cancel</button>
        </div>
      </div>
    `;
    document
      .querySelector(".toppings-header")
      .insertAdjacentHTML("afterbegin", popup);
    overlay.classList.remove("hidden");
    const yesBtn = document.querySelector(".yes");
    const cancelBtn = document.querySelector(".cancel");
    yesBtn.addEventListener("click", this.clearAllToppings.bind(this));
    cancelBtn.addEventListener("click", this.endPopup.bind(this));
  }

  endPopup() {
    const popup = document.querySelector(".clear-toppings-popup");
    popup.remove();
    overlay.classList.add("hidden");
  }

  clearAllToppings() {
    this.endPopup();
    this.allToppingClasses?.forEach((topping) =>
      topping.removeTopping(true, true)
    );
    this.allToppingClasses = [];
    this.allToppings = [];
    this.storeAllToppings();
  }

  getToppings() {
    return this.allToppings;
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
    toppingTracker.clearToppingsPopup();
  }

  clearForm() {
    this.input.value = "";
    this.input.blur();
  }
}
const toppingController = new ToppingController();
