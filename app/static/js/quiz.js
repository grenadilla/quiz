"use strict";

const questionBox = document.getElementById("question-box");
const questionDetails = document.getElementById("question-details");
const answerContainer = document.getElementById("answer-container");
const submitButton = document.getElementById("submit-button");
const answerInput = document.getElementById("answer-input");
const buzzButton = document.getElementById("buzz-button");
const skipButton = document.getElementById("skip-button");
const answerGroup = document.getElementById("answer-group");
const correctButton = document.getElementById("correct-button");
const incorrectButton = document.getElementById("incorrect-button");
const gradingButtons = document.getElementById("grading-buttons");
const correctNum = document.getElementById("correct-num");
const incorrectNum = document.getElementById("incorrect-num");
const missedNum = document.getElementById("missed-num");

answerGroup.style.display = "none";
gradingButtons.style.display = "none";

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
    "questions": new Questions(),
    "loadingTossups": false,
    "userCorrect": null,
    "correctNum": 0,
    "incorrectNum": 0,
    "missedNum": 0,
}

// Displays the metadata and reads the question word by word
function readQuestion(question) {
    let detailsText = "Tossup " + question.id + "/" + question.category.name;
    if("subcategory" in question) {
        detailsText += '/' + question.subcategory.name;
    }
    if("tournament" in question.meta) {
        detailsText += '/' + question.meta.tournament.name;
    }
    questionDetails.innerHTML = detailsText;
    let questionArray = question.text.formatted.split(' ');
    let index = 0;
    state.readingPaused = false;
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

// If possible, will implement automatic answer checking
// Otherwise just display grading buttons
function parseAnswer(userAnswer, actualAnswer) {
    clearInterval(state.readingID);
    questionBox.innerHTML = state.currentQuestion.text.formatted;
    answerContainer.innerHTML = actualAnswer;
    skipButton.disabled = true;
    gradingButtons.style.display = "";
}

// Pause question reading and allow answering
function buzz() {
    state.readingPaused = true;
    answerGroup.style.display = '';
    answerInput.focus();
    buzzButton.disabled = true;
}

function answer() {
    answerInput.disabled = true;
    submitButton.disabled = true;
    parseAnswer(answerInput.value, state.currentQuestion.answer.formatted);
    skipButton.innerHTML = "Next";
}

// Updates grade display and resets button values
function nextQuestion() {
    if (state.userCorrect == null) {
        state.missedNum++;
        missedNum.innerHTML = state.missedNum;
    }
    else if (state.userCorrect == true) {
        state.correctNum++;
        correctNum.innerHTML = state.correctNum;
    }
    else if (state.userCorrect == false) {
        state.incorrectNum++;
        incorrectNum.innerHTML = state.incorrectNum;
    }
    clearInterval(state.readingID);
    questionBox.innerHTML = '';
    answerInput.value = '';
    answerContainer.innerHTML = '';
    skipButton.innerHTML = "Skip";
    buzzButton.disabled = false;
    answerInput.disabled = false;
    submitButton.disabled = false;
    answerGroup.style.display = "none";

    //Reset grading display and value
    gradingButtons.style.display = "none";
    correctButton.classList.remove("btn-success");
    correctButton.classList.add("btn-outline-success");
    incorrectButton.classList.remove("btn-danger");
    incorrectButton.classList.add("btn-outline-danger");
    state.userCorrect = null;

    if(state.questions.tossups.length <= 10 && !state.loadingTossups) {
        state.loadingTossups = true;
        state.questions.getTossups().then(function(result) {
            state.loadingTossups = false;
        });
    }
    state.currentQuestion = state.questions.tossups.shift();
    readQuestion(state.currentQuestion);
}

// User indicates they answered correctly
function chooseCorrect() {
    if (state.userCorrect === null || state.userCorrect === false) {
        correctButton.classList.remove("btn-outline-success");
        correctButton.classList.add("btn-success");
    }
    if (state.userCorrect === false) {
        incorrectButton.classList.remove("btn-danger");
        incorrectButton.classList.add("btn-outline-danger");
    }
    skipButton.disabled = false;
    state.userCorrect = true;
}

// User indicates they answered incorrectly
function chooseIncorrect() {
    if (state.userCorrect === null || state.userCorrect === true) {
        incorrectButton.classList.remove("btn-outline-danger");
        incorrectButton.classList.add("btn-danger");
    }
    if (state.userCorrect === true) {
        correctButton.classList.remove("btn-success");
        correctButton.classList.add("btn-outline-success");
    }
    skipButton.disabled = false;
    state.userCorrect = false;
}

buzzButton.addEventListener("click", buzz, false);

submitButton.addEventListener("click", function() {
    if(answerInput.value != '') {
        answer();
    }
}, false);

correctButton.addEventListener("click", chooseCorrect);

incorrectButton.addEventListener("click", chooseIncorrect);

document.addEventListener("keyup", function(e) {
    if(e.key === 'b' || e.key === ' ') {
        buzz();
    }
    else if(e.key === 'n' || e.key === 's') {
        // Allow skipping only if user has not answered or if they have graded themselves (next question)
        if ((answerGroup.style.display !== '' && gradingButtons.style.display !== '') 
            || state.userCorrect !== null) {
            nextQuestion();
        }
    }

    //Only allow c and i keyboard shortcuts when buttons are onscreen
    else if (e.key === 'c' && gradingButtons.style.display === "") {
        chooseCorrect();
    }
    else if (e.key === 'i' && gradingButtons.style.display === "") {
        chooseIncorrect();
    }
}, false);

answerGroup.addEventListener("keyup", function(e) {
    if(e.key === "Enter" && answerInput.value != '') {
        answer();
    }
}, false);

skipButton.addEventListener("click", function() {
    this.blur();
    nextQuestion();
}, false);

//const questions = new Questions();

state.questions.getTossups(20).then(function(result) {
    //state.currentQuestion = state.questions.tossups.shift();
    //readQuestion(state.currentQuestion);

    //Calling nextQuestion increments missedNum
    state.missedNum = -1;
    nextQuestion();
})