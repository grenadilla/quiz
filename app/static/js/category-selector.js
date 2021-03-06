import getData from './getdata.js';

class CategorySelector {

    static HEADERPREFIX = "category-header";
    static COLLAPSEPREFIX = "collapse-prefix";
    static ACCORDIANID = "select-categories";

    static ADDCATEGORYEVENTNAME = "addCategory";

    constructor(url, containerID) {
        this.categoriesChanged = true;
        this.container = document.getElementById(containerID);

        let categoriesRequest = getData(url);
        let self = this;
        categoriesRequest.then(function(result) {
            // Map from ID to categories
            self.categories = new Map();
            for (const category of result) {
                self.categories.set(category.id, category);
            }

            self.selectedCategories = new Map();
            for (const category of self.categories.values()) {
                self.selectedCategories.set(category.id, true);
            }

            self.generateCheckboxes();
        }).catch(function(error) {
            console.error(error);
        });
    }

    getSelectedCategories() {
        this.categoriesChanged = false;
        return this.selectedCategories;
    }

    categoriesHaveChanged() {
        // Tracks whether selected categories have changed since the last call
        // to getSelectedCategories
        return this.categoriesChanged;
    }

    // Returns number of selected categories
    numSelectedCategories() {
        let total = 0;
        for (const value of this.selectedCategories.values()) {
            if (value) {
                total++;
            }
        }
        return total;
    }

    // Generates the checkboxes on the CategorySelector's container
    generateCheckboxes() {
        for (const category of this.categories.values()) {
            let card = document.createElement("div");
            card.classList.add("card");

            let header = document.createElement("div");
            header.classList.add("card-header");
            header.setAttribute("id", CategorySelector.HEADERPREFIX + category.id);
            header.setAttribute("data-toggle", "collapse");
            header.setAttribute("data-target", "#" + CategorySelector.COLLAPSEPREFIX + category.id);

            let form = document.createElement("div");
            form.classList.add("form-check");

            let input = document.createElement("input");
            input.classList.add("form-check-input");
            input.setAttribute("type", "checkbox");
            input.checked = true;

            // Event listener for changing categories
            input.addEventListener("click", (event) => {
                let isSelected = !this.selectedCategories.get(category.id);
                this.selectedCategories.set(category.id, isSelected);

                // Must have at least one category selected, so prevent unchecking last category
                if (this.numSelectedCategories() === 0 && !isSelected) {
                    this.selectedCategories.set(category.id, true);
                    input.checked = true;
                    event.preventDefault();
                } else {
                    this.categoriesChanged = true;
                }

                if (isSelected) {
                    let event = new CustomEvent(CategorySelector.ADDCATEGORYEVENTNAME, {"detail": category.id})
                    document.dispatchEvent(event);
                }
            });

            let label = document.createElement("label");
            label.classList.add("form-check-label");
            label.innerHTML = category.name;

            form.appendChild(input);
            form.appendChild(label);
            header.appendChild(form);
            card.appendChild(header);
            
            let collapse = document.createElement("div");
            collapse.classList.add("collapse");
            collapse.setAttribute("id", CategorySelector.COLLAPSEPREFIX + category.id);
            collapse.setAttribute("data-parent", "#" + CategorySelector.ACCORDIANID);

            let cardBody = document.createElement("div");
            // set cardBody innerhtml to subcategories

            collapse.appendChild(cardBody);
            card.appendChild(collapse);
            this.container.appendChild(card);
        }
    }
}

export default CategorySelector;