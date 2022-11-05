"use strict";

const createBtn = document.querySelector(".create-btn");
let newPizza;

class NewPizza {
  allToppings = localStorage.getItem("toppings").split(",");
  toppingsUsed = [];
  toppingsAvailable = this.allToppings;
  toppingsCount = 0;
  addIngBtn;

  constructor() {
    this.generateInitialMarkup();
  }

  generateInitialMarkup() {
    const ul = `
    <ul class="new-pizza">
      <li class="new-pizza-name">
        <span>Name: </span><input type="text" />
      </li>
      <li>
        <span>Topping ${this.toppingsCount + 1}: </span>
        <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.allToppings)}
        </select>
      </li>
      <button class="add-ing-btn">Add</button>
    </ul>`;
    createBtn.insertAdjacentHTML("afterend", ul);
    this.addDropDownChangeListeners();
    this.addIngBtn = document.querySelector(".add-ing-btn");
    this.addIngBtn.addEventListener("click", this.addIngredient.bind(this));
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
    const newIngHTML = `
      <li>
        <span>Topping ${this.toppingsCount + 1}: </span>
        <select class="new-pizza-toppings">
          <option value="none" selected disabled hidden>Choose one</option>
          ${this.generateOptions(this.toppingsAvailable)}
        </select>
      </li>
    `;
    this.addIngBtn.insertAdjacentHTML("beforebegin", newIngHTML);
    this.addDropDownChangeListeners();
  }

  addDropDownChangeListeners() {
    const dropDowns = [...document.querySelectorAll(".new-pizza-toppings")];
    dropDowns.forEach((drop) =>
      drop.addEventListener("change", this.updateToppings.bind(this))
    );
  }
}

const startNewPizza = function () {
  if (newPizza) return;
  newPizza = new NewPizza();
};

createBtn.addEventListener("click", startNewPizza);
