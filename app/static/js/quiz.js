"use strict";

class Questions {
    constructor() {
        this.tossupURL = "http://127.0.0.1:5000/api/tossup"
        this.tossups = [];
    }
    getData(url) {
        return new Promise(function(resolve, reject) {
            let request = new XMLHttpRequest();
            request.open('GET', url);
            request.responseType = 'json';
            request.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(request.response);
                } 
                else {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            };
            request.onerror = function() {
              reject({
                status: this.status,
                statusText: request.statusText
              });
            };
            request.send();
        });
    }
    getTossups(num=10, category, subcategory) {
        let url = this.tossupURL + "?" + "per_page=" + num;
        if(category !== undefined) {
            url += "&category" + category;
        }
        if(subcategory !== undefined) {
            url += "&subcategory" + subcategory;
        }
        let self = this;
        return new Promise(function(resolve, reject) {
            let tossupRequest = self.getData(url);
            tossupRequest.then(function(result) {
                self.tossups = self.tossups.concat(result.results);
                resolve();
            }).catch(function() {

            });
        });
    }
}

const questions = new Questions();
const questionBox = document.getElementById("question-box");

questions.getTossups().then(function(result) {
    questionBox.innerHTML = questions.tossups[0].text.formatted;
})
