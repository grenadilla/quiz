import getData from './getdata.js';

class CategorySelector {

    static HEADERPREFIX = "category-header";
    static COLLAPSEPREFIX = "collapse-prefix";
    static ACCORDIANID = "select-categories";

    constructor(url, containerID) {
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
        return this.selectedCategories;
    }

    generateCheckboxes() {
        for (const category of this.categories.values()) {
            let card = document.createElement("div");
            card.classList.add("card");

            let header = document.createElement("div");
            header.classList.add("card-header");
            header.setAttribute("id", this.HEADERPREFIX + category.id);
            header.setAttribute("data-toggle", "collapse");
            header.setAttribute("data-target", "#" + this.COLLAPSEPREFIX + category.id);

            let form = document.createElement("div");
            form.classList.add("form-check");

            let input = document.createElement("input");
            input.classList.add("form-check-input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("checked", true);
            input.addEventListener("click", () => {
                let key = category.id;
                this.selectedCategories.set(key, !this.selectedCategories.get(key));
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
            collapse.setAttribute("id", this.COLLAPSEPREFIX + category.id);
            collapse.setAttribute("data-parent", "#" + this.ACCORDIANID);

            let cardBody = document.createElement("div");
            // set cardBody innerhtml to subcategories

            collapse.appendChild(cardBody);
            card.appendChild(collapse);
            this.container.appendChild(card);
        }
    }
}

export default CategorySelector;