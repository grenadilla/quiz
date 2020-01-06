import getData from './getdata.js';

class QuestionHolder {
    static MINTOSSUPS = 10;
    static TARGETTOSSUPS = 30;

    constructor(url) {
        this.tossupURL = url;
        this.tossups = [];
        this.invalidTossups = [];
    }

    shouldLoadTossups() {
        return this.tossups.length < QuestionHolder.MINTOSSUPS;
    }
    
    // Gets tossups from the database through the api
    // Call when tossups are running low or selected categories are changed
    loadTossups(num=10, categoryID, subcategoryID) {
        let url = this.tossupURL + "?randomize=true&per_page=" + num;
        if(categoryID !== undefined) {
            url += "&category=" + categoryID;
        }
        if(subcategoryID !== undefined) {
            url += "&subcategory=" + subcategoryID;
        }
        let self = this;
        return new Promise(function(resolve, reject) {
            let tossupRequest = getData(url);
            tossupRequest.then(function(result) {
                self.tossups = self.tossups.concat(result.results);
                resolve();
            }).catch(function(error) {
                console.error(error);
            });
        });
    }

    addCategoryTossups(categoryID, numSelectedCategories) {
        this.loadTossups(Math.ceil(this.tossups.length / numSelectedCategories), categoryID); 
    }

    loadCategoryTossups(categoryID, numSelectedCategories) {
        this.loadTossups(Math.ceil(QuestionHolder.TARGETTOSSUPS / numSelectedCategories), categoryID);
    }

    // Called in getTossup to remove invalid tossups and add back newly valid tossups
    // based on selected categories
    sortTossups(selectedCategories) {
        // Remove invalid
        let newInvalid = [];
        for (let i = 0; i < this.tossups.length; i++) {
            if (!selectedCategories.get(this.tossups[i].category.id)) {
                // Tossup is not in selected category, move into invalid tossups
                newInvalid.push(this.tossups.splice(i, 1)[0]);
                i--;
            }
        }

        // Add back valid
        for (let i = 0; i < this.invalidTossups.length; i++) {
            if (selectedCategories.get(this.invalidTossups[i].category.id)) {
                // Tossup is in selected category, move into valid tossups
                this.tossups.push(this.invalidTossups.splice(i, 1)[0]);
                i--;
            }
        }
        this.invalidTossups.concat(newInvalid);
    }

    // Returns a promise that resolves a single tossup to be read as a question
    getTossup(selectedCategories) {
        // Load emergency tossups if have no tossups
        let self = this;
        if (self.tossups.length === 0) {
            // selectedCategories is map [categoryID, isSelected]
            let chain = Promise.resolve();
            for (const entry of selectedCategories) {
                if (entry[1]) {
                    chain.then(() => self.loadTossups(1, entry[0]));
                }
            }
            chain.then(() => {
                // Return random element of tossups to randomize possible categories
                let index = Math.random() * self.tossups.length;
                resolve(self.tossups.splice(index, 1)[0]);
            });
            return chain;
        }

        return new Promise(function(resolve, reject) {
            // Return random element of tossups to randomize possible categories
            let index = Math.random() * self.tossups.length;
            resolve(self.tossups.splice(index, 1)[0]);
        });
    }
}

export default QuestionHolder;