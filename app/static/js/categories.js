import getData from './getdata.js';

const HEADERPREFIX = "category-header";
const COLLAPSEPREFIX = "collapse-prefix";
const ACCORDIANID = "select-categories";

const categories = {
    generateCheckboxes(url, divID) {
        let categoriesRequest = getData(url);
        categoriesRequest.then(function(result) {
            let container = document.getElementById(divID);

            for (const category of result) {
                let card = document.createElement("div");
                card.classList.add("card");

                let header = document.createElement("div");
                header.classList.add("card-header");
                header.setAttribute("id", HEADERPREFIX + category.id);
                header.setAttribute("data-toggle", "collapse");
                header.setAttribute("data-target", "#" + COLLAPSEPREFIX + category.id);

                let form = document.createElement("div");
                form.classList.add("form-check");

                let input = document.createElement("input");
                input.classList.add("form-check-input");
                input.setAttribute("type", "checkbox");
                input.setAttribute("checked", true);

                let label = document.createElement("label");
                label.classList.add("form-check-label");
                label.innerHTML = category.name;

                form.appendChild(input);
                form.appendChild(label);
                header.appendChild(form);
                card.appendChild(header);
                
                let collapse = document.createElement("div");
                collapse.classList.add("collapse");
                collapse.setAttribute("id", COLLAPSEPREFIX + category.id);
                collapse.setAttribute("data-parent", "#" + ACCORDIANID);

                let cardBody = document.createElement("div");
                // set cardBody innerhtml to subcategories

                collapse.appendChild(cardBody);
                card.appendChild(collapse);
                container.appendChild(card);
            }
        }).catch(function(error) {
            console.error(error);
        });
    }
}

export default categories