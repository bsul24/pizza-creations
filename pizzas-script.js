"use strict";

const createBtn = document.querySelector(".create-btn");
const seePizzasBtn = document.querySelector(".see-pizzas");
const pizzaTiles = document.querySelector(".pizza-tiles");
const pizzas = [];
let newPizza;

class NewPizza {
  allToppings = localStorage.getItem("toppings").split(",");
  toppingsAvailable = this.allToppings;
  addIngBtn;
  toppingsAdded = 1;
  pizzaName;
  pizzaToppings;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
    <ul class="new-pizza">
      <li class="new-pizza-name">
        <span>Name: </span><input class="new-pizza-name-input" type="text" />
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
    </ul>`;
    createBtn.insertAdjacentHTML("afterend", ul);
    this.addDropDownChangeListeners();
    this.addDeleteToppingListeners();
    this.addIngBtn = document.querySelector(".add-ing-btn");
    this.addIngBtn.addEventListener("click", this.addIngredient.bind(this));
    const saveBtn = document.querySelector(".save-pizza-btn");
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
    this.addDropDownChangeListeners();
    this.addDeleteToppingListeners();
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

  addDropDownChangeListeners() {
    const dropDowns = [...document.querySelectorAll(".new-pizza-toppings")];
    dropDowns.forEach((drop) =>
      drop.addEventListener("change", this.updateToppings.bind(this))
    );
  }

  addDeleteToppingListeners() {
    const deleteBtns = [...document.querySelectorAll(".delete-topping-btn")];
    deleteBtns.forEach((btn) =>
      btn.addEventListener("click", this.deleteTopping.bind(this))
    );
  }

  savePizza() {
    const name = document.querySelector(".new-pizza-name-input").value;
    if (name === "") {
      alert("Please name the pizza!");
      return;
    }
    this.pizzaName = name;
    const toppings = [...document.querySelectorAll(".new-pizza-toppings")];
    const toppingNames = toppings.reduce((acc, topping) => {
      if (topping.value !== "none") acc.push(topping.value);
      return acc;
    }, []);
    this.pizzaToppings = toppingNames;
    // pizzas.push(this);
    newPizza = "";
    generateNewPizza(this);
    this.removeUI();
  }

  removeUI() {
    const newPizzaUI = document.querySelector(".new-pizza");
    newPizzaUI.innerHTML = "";
  }
}

class Pizza {
  constructor(pizza) {
    this.name = pizza.pizzaName;
    this.toppings = pizza.pizzaToppings;
    this.generateMarkup();
  }

  generateMarkup() {
    const html = `
      <div class="pizza-tile">
        <h2 class="pizza-name">${this.name}</h2>
        <h3 class="pizza-toppings">Toppings</h3>
        <ul class="toppings-list">
          ${this.generateToppings()}
        </ul>
      </div>
    `;
    pizzaTiles.insertAdjacentHTML("beforeend", html);
  }

  generateToppings() {
    return this.toppings.reduce(
      (acc, top) => acc + `<li class="toppings-list-topping">${top}</li>`,
      ``
    );
  }
}

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
};

const generateNewPizza = function (pizza) {
  const newPizza = new Pizza(pizza);
  pizzas.push(newPizza);
};

createBtn.addEventListener("click", startNewPizza);
