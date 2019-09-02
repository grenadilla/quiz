"use strict";

const questionBox = document.getElementById("question-box");
const questionDetails = document.getElementById("question-details");
const submitButton = document.getElementById("submit-button");
const answerInput = document.getElementById("answer-input");
const buzzButton = document.getElementById("buzz-button");
const skipButton = document.getElementById("skip-button");
const answerGroup = document.getElementById("answer-group");

answerGroup.style.display = "none";

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

let state = {
    "readingID": 0,
    "readingPaused": false,
    "currentQuestion": undefined,
}

function readQuestion(question) {
    let detailsText = "Tossup/" + question.category.name;
    if("subcategory" in question) {
        detailsText += '/' + question.subcategory.name;
    }
    if("tournament" in question.meta) {
        detailsText += '/' + question.meta.tournament.name;
    }
    questionDetails.innerHTML = detailsText;
    let questionArray = question.text.formatted.split(' ');
    let index = 0;
    state.readingID = setInterval(function() {
        if(!state.readingPaused) {
            questionBox.innerHTML += questionArray[index] + ' ';
            index++;
            if(index === questionArray.length) {
                clearInterval(state.readingID);
            }
        }
    }, 100)
}

function parseAnswer(userAnswer, actualAnswer) {
    alert(userAnswer + '\n' + actualAnswer);
}

function buzz() {
    state.readingPaused = true;
    answerGroup.style.display = '';
    answerInput.focus();
    buzzButton.disabled = true;
}

function answer() {
    parseAnswer(answerInput.value, state.currentQuestion.answer.formatted);
    answerInput.value = '';
    buzzButton.disabled = false;
    state.readingPaused = false;
}

buzzButton.addEventListener("click", buzz, false);

submitButton.addEventListener("click", function() {
    if(answerInput.value != '') {
        answer();
    }
}, false);

document.addEventListener("keyup", function(e) {
    if(e.key === 'b' || e.key === ' ') {
        buzz();
    }
}, false);

answerGroup.addEventListener("keyup", function(e) {
    if(e.key === "Enter" && answerInput.value != '') {
        answer();
    }
}, false);

const questions = new Questions();

questions.getTossups().then(function(result) {
    state.currentQuestion = questions.tossups.shift();
    readQuestion(state.currentQuestion);
})