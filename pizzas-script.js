"use strict";

const createBtn = document.querySelector(".create-btn");
const newPizzaContainer = document.querySelector(".new-pizza-container");
const pizzaTiles = document.querySelector(".pizza-tiles");
const overlay = document.querySelector(".overlay");
const pizzas = [];
let newPizza;

class NewPizza {
  allToppings = localStorage.getItem("toppings").split(",");
  toppingsAvailable = this.allToppings;
  addIngBtn;
  closeBtn;
  toppingsAdded = 1;
  name;
  toppings;
  input;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
      <section class="modal">
        <ul class="new-pizza">
          <button class="close-new-pizza-btn">X</button>
          <li class="new-pizza-name">
          <span>Name: </span><input class="new-pizza-name-input" type="text" maxlength="20" />
          </li>
          <li>
          <span class="topping-number">Topping 1: </span>
          <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.allToppings)}
          </select>
          <button class="delete-topping-btn">X</button>
          </li>
          <button class="add-ing-btn">Add</button>
          <button class="save-pizza-btn">Save Pizza</button>
        </ul>
      </section>
      `;
    overlay.classList.remove("hidden");
    newPizzaContainer.insertAdjacentHTML("afterbegin", ul);
    this.addDropDownChangeHandlers();
    this.addDeleteToppingHandlers();
    this.closeBtn = document.querySelector(".close-new-pizza-btn");
    this.closeBtn.addEventListener("click", this.removeUI.bind(this));
    this.addIngBtn = document.querySelector(".add-ing-btn");
    this.addIngBtn.addEventListener("click", this.addIngredient.bind(this));
    const saveBtn = document.querySelector(".save-pizza-btn");
    this.input = document.querySelector(".new-pizza-name-input");
    this.input.addEventListener("input", this.checkIfAllowed.bind(this));
    saveBtn.addEventListener("click", this.savePizza.bind(this));
  }

  generateOptions(toppings) {
    let options = ``;
    toppings.forEach(
      (top) => (options += `<option value="${top}">${top}</option>`)
    );
    return options;
  }

  updateToppings() {
    const selectedToppings = [
      ...document.querySelectorAll(".new-pizza-toppings"),
    ];
    const usedToppings = new Set(selectedToppings.map((item) => item.value));
    this.toppingsAvailable = this.allToppings.filter(
      (top) => !usedToppings.has(top)
    );
    selectedToppings.forEach(
      (select) =>
        (select.innerHTML =
          (select.value === "none"
            ? `<option value="none" selected disabled hidden>Choose one</option>`
            : `<option value="${select.value}" selected>${select.value}</option>`) +
          `${this.generateOptions(this.toppingsAvailable)}`)
    );
  }

  addIngredient() {
    if (this.toppingsAdded === this.allToppings.length) return;
    const newIngHTML = `
      <li>
        <span class="topping-number">Topping X: </span>
        <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.toppingsAvailable)}
        </select>
        <button class="delete-topping-btn">X</button>
      </li>
    `;
    this.addIngBtn.insertAdjacentHTML("beforebegin", newIngHTML);
    this.addDropDownChangeHandlers();
    this.addDeleteToppingHandlers();
    this.updateToppingNumbers();
  }

  updateToppingNumbers() {
    const toppingNumbers = [...document.querySelectorAll(".topping-number")];
    for (let i = 0; i < toppingNumbers.length; i++) {
      toppingNumbers[i].textContent = `Topping ${i + 1}: `;
    }
    this.toppingsAdded = toppingNumbers.length;
  }

  deleteTopping(e) {
    e.target.closest("li").remove();
    this.updateToppingNumbers();
    this.updateToppings();
  }

  addDropDownChangeHandlers() {
    const dropDowns = [...document.querySelectorAll(".new-pizza-toppings")];
    dropDowns.forEach((drop) =>
      drop.addEventListener("change", this.updateToppings.bind(this))
    );
  }

  addDeleteToppingHandlers() {
    const deleteBtns = [...document.querySelectorAll(".delete-topping-btn")];
    deleteBtns.forEach((btn) =>
      btn.addEventListener("click", this.deleteTopping.bind(this))
    );
  }

  checkIfAllowed(e) {
    if (!e.data) return;

    if (
      (e.data.toUpperCase() >= "A" && e.data.toUpperCase() <= "Z") ||
      e.data === " " ||
      Number(e.data) ||
      e.data === "'"
    )
      return;

    this.input.value = this.input.value.slice(0, -1);
  }

  savePizza() {
    const name = document.querySelector(".new-pizza-name-input").value;
    if (name === "") {
      alert("Please name the pizza!");
      return;
    }
    this.name = name;
    const toppings = [...document.querySelectorAll(".new-pizza-toppings")];
    const toppingNames = toppings.reduce((acc, topping) => {
      if (topping.value !== "none") acc.push(topping.value);
      return acc;
    }, []);
    this.toppings = toppingNames;

    pizzaTracker.createPizza(this);
    this.removeUI();
  }

  removeUI() {
    const newPizzaUI = document.querySelector(".modal");
    newPizzaUI.remove();
    overlay.classList.add("hidden");
    newPizza = "";
  }
}

class Pizza {
  thisTile;
  thisName;
  thisToppings;
  toppingsList;
  allToppings;
  toppingsLeft;
  selecters;
  selecterDeleteBtns;
  deleteBtn;
  editBtn;
  addBtn;
  saveBtn;
  input;

  constructor(pizza) {
    this.name = pizza.name;
    // Sort toppings to make it easier to check if a pizza already exists with these toppings
    this.toppings = pizza.toppings.sort();
    this.generateMarkup();
  }

  generateMarkup() {
    const html = `
      <div class="pizza-tile">
      <div class="pizza-tile-btns">
        <button class="pizza-tile-delete-btn">X</button>
        <button class="pizza-tile-edit-btn">✏️</button>
      </div>
        <h2 class="pizza-name">${this.name}</h2>
        <h3 class="pizza-toppings">Toppings</h3>
        <ul class="toppings-list">
          ${this.generateToppings()}
        </ul>
      </div>
    `;
    pizzaTiles.insertAdjacentHTML("beforeend", html);
    this.storeDOM();
    this.addBtnHandlers();
  }

  generateToppings() {
    return this.toppings.reduce(
      (acc, top) => acc + `<li class="toppings-list-topping">${top}</li>`,
      ``
    );
  }

  addBtnHandlers() {
    this.editBtn.addEventListener("click", this.startEditMode.bind(this));
    this.deleteBtn.addEventListener("click", this.removePizzaPopup.bind(this));
  }

  storeDOM() {
    this.thisTile = document.querySelector(".pizza-tile:last-child");
    this.thisName = this.thisTile.querySelector(".pizza-name");
    this.thisToppings = [
      ...this.thisTile.querySelectorAll(".toppings-list-topping"),
    ];
    this.toppingsList = this.thisTile.querySelector(".toppings-list");
    this.deleteBtn = this.thisTile.querySelector(".pizza-tile-delete-btn");
    this.editBtn = this.thisTile.querySelector(".pizza-tile-edit-btn");
  }

  startEditMode() {
    if (this.saveBtn) {
      this.endEditMode();
      return;
    }
    this.thisName.innerHTML = `<input class="pizza-name-edit" type="text" value="${this.name}" maxlength="20" />`;
    const addBtn = `<button class="edit-add-topping-btn">Add Topping</button>`;
    const saveBtn = `<button class="edit-save-btn">Save Pizza</button>`;
    this.thisTile.insertAdjacentHTML("beforeend", addBtn);
    this.thisTile.insertAdjacentHTML("beforeend", saveBtn);
    this.input = this.thisTile.querySelector(".pizza-name-edit");
    this.addBtn = this.thisTile.querySelector(".edit-add-topping-btn");
    this.saveBtn = this.thisTile.querySelector(".edit-save-btn");
    this.input.addEventListener("input", this.checkIfAllowed.bind(this));
    this.addBtn.addEventListener("click", this.addNewTopping.bind(this));
    this.saveBtn.addEventListener("click", this.endEditMode.bind(this));
    this.setToppingChoices();
    this.thisToppings.forEach(
      (top) =>
        (top.innerHTML = `
          <div class="dropdown-row">
            <select class="pizza-tile-toppings-dropdown">
              ${this.generateToppingsOptions(top.textContent)}
            </select>
            <button class="delete-select-topping">X</button>
          </div>
        `)
    );
    this.addSelectHandlers();
  }

  setToppingChoices(edit = false) {
    this.allToppings = localStorage.getItem("toppings").split(",");
    this.thisToppings = edit
      ? [...this.thisTile.querySelectorAll(".pizza-tile-toppings-dropdown")]
      : [...this.thisTile.querySelectorAll(".toppings-list-topping")];
    const toppingsUsed = this.thisToppings.map((top) =>
      edit ? top.value : top.textContent
    );
    this.toppingsLeft = this.allToppings.filter(
      (top) => !toppingsUsed.some((topping) => topping === top)
    );
  }

  generateToppingsOptions(topping) {
    let options = topping
      ? `<option value="${topping}" selected>${topping}</option>`
      : ``;
    this.toppingsLeft.forEach(
      (top) => (options += `<option value="${top}">${top}</option>`)
    );
    return options;
  }

  addSelectHandlers() {
    this.selecters = [
      ...this.thisTile.querySelectorAll(".pizza-tile-toppings-dropdown"),
    ];
    this.selecters.forEach((sel) =>
      sel.addEventListener("change", this.updateToppingsOptions.bind(this))
    );
    this.selecterDeleteBtns = [
      ...this.thisTile.querySelectorAll(".delete-select-topping"),
    ];
    this.selecterDeleteBtns.forEach((btn) =>
      btn.addEventListener("click", this.deleteTopping.bind(this))
    );
  }

  updateToppingsOptions() {
    this.setToppingChoices(true);
    this.selecters.forEach(
      (sel) =>
        (sel.innerHTML = `
        <select class="pizza-tile-toppings-dropdown">
          <option value="${sel.value}" selected>${sel.value}</option>
          ${this.generateToppingsOptions()}
        </select>
      `)
    );
  }

  addNewTopping() {
    this.setToppingChoices(true);
    if (this.thisToppings.length >= this.allToppings.length) return;

    const newTopping = `
    <div class="dropdown-row">
      <select class="pizza-tile-toppings-dropdown">
        ${this.generateToppingsOptions()}
      </select>
      <button class="delete-select-topping">X</button>
  </div>
  `;
    this.toppingsList.insertAdjacentHTML("beforeend", newTopping);
    this.addSelectHandlers();
  }

  deleteTopping(e) {
    const toppingRow = e.target.closest(".dropdown-row");
    toppingRow.remove();
    this.addSelectHandlers();
    this.updateToppingsOptions();
  }

  checkIfAllowed(e) {
    if (!e.data) return;

    if (
      (e.data.toUpperCase() >= "A" && e.data.toUpperCase() <= "Z") ||
      e.data === " " ||
      Number(e.data) ||
      e.data === "'"
    )
      return;

    this.input.value = this.input.value.slice(0, -1);
  }

  endEditMode() {
    this.name = this.thisTile.querySelector("input").value;
    this.thisName.textContent = this.name;
    this.saveBtn.remove();
    this.saveBtn = "";
    this.addBtn.remove();
    this.addBtn = "";
    this.toppingsList.innerHTML = this.selecters.reduce(
      (acc, sel) => acc + `<li class="toppings-list-topping">${sel.value}</li>`,
      ``
    );
    this.thisToppings = [
      ...this.thisTile.querySelectorAll(".toppings-list-topping"),
    ];
    this.toppings = this.thisToppings.map((topping) => topping.textContent);
    pizzaTracker.updatePizza(this);
  }

  removePizzaPopup() {
    const popup = `
      <div class="modal remove-pizza-popup">
        <p>Are you sure you want to delete this pizza?</p>
        <div class="popup-btns">
          <button class="yes">Yes</button>
          <button class="cancel">Cancel</button>
        </div>
      </div>
    `;
    newPizzaContainer.insertAdjacentHTML("afterbegin", popup);
    overlay.classList.remove("hidden");
    const yesBtn = document.querySelector(".yes");
    const cancelBtn = document.querySelector(".cancel");
    yesBtn.addEventListener("click", this.removePizza.bind(this));
    cancelBtn.addEventListener("click", this.endPopup.bind(this));
  }

  endPopup() {
    const popup = document.querySelector(".remove-pizza-popup");
    popup.remove();
    overlay.classList.add("hidden");
  }

  removePizza() {
    this.endPopup();
    this.thisTile.remove();
    pizzaTracker.deletePizza(this);
  }
}

class PizzaTracker {
  allPizzas = [];

  constructor() {
    this.setAllPizzas();
  }

  setAllPizzas() {
    if (!localStorage.getItem("pizzas")) return;

    const pizzas = JSON.parse(localStorage.getItem("pizzas"));
    pizzas.forEach((piz) => this.createPizza(piz));
  }

  storePizzas() {
    localStorage.setItem("pizzas", JSON.stringify(this.allPizzas));
  }

  createPizza(pizza) {
    if (!this.checkIfDuplicate(pizza)) return;
    const newPizza = new Pizza(pizza);
    this.allPizzas.push(newPizza);
    this.storePizzas();
  }

  checkIfDuplicate(pizza) {
    if (this.allPizzas.some((piz) => piz.name === pizza.name)) {
      alert("There is already a pizza with this name!");
      return false;
    }
    if (
      this.allPizzas.some(
        (piz) =>
          JSON.stringify(piz.toppings) === JSON.stringify(pizza.toppings.sort())
      )
    ) {
      alert("There is already a pizza with these toppings!");
      return false;
    }
    return true;
  }

  updatePizza(pizza) {
    const pizzaIndex = this.allPizzas.indexOf(pizza);
    this.allPizzas[pizzaIndex] = pizza;
    this.storePizzas();
  }

  deletePizza(pizza) {
    const pizzaIndex = this.allPizzas.indexOf(pizza);
    this.allPizzas.splice(pizzaIndex, 1);
    this.storePizzas();
  }
}
const pizzaTracker = new PizzaTracker();

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
};

createBtn.addEventListener("click", startNewPizza);
