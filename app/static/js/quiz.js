"use strict";

import getData from './getdata.js';
import categories from './categories.js';

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
const countdownBar = document.getElementById("countdown-bar");
const countdownClock = document.getElementById("countdown-clock");

answerGroup.style.display = "none";
gradingButtons.style.display = "none";

class Questions {
    constructor() {
        this.tossupURL = "http://127.0.0.1:5000/api/tossup"
        this.tossups = [];
    }
    
    getTossups(num=10, category, subcategory) {
        let url = this.tossupURL + "?randomize=true&per_page=" + num;
        if(category !== undefined) {
            url += "&category" + category;
        }
        if(subcategory !== undefined) {
            url += "&subcategory" + subcategory;
        }
        let self = this;
        return new Promise(function(resolve, reject) {
            let tossupRequest = getData(url);
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
    "currentTime": 0,
    "totalTime": 0,
    "totalAnswerTime": 5000,
    "answeringID": 0,
}

// Converts milliseconds to human readable
function getTimeString(ms) {
    let deciseconds = Math.floor((ms % 1000) / 100);
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds + "." + deciseconds;
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

    // Time to read the question plus 10 seconds
    state.totalTime = questionArray.length * 100 + 10000;
    state.currentTime = state.totalTime;

    let index = 0;
    state.readingPaused = false;
    state.readingID = setInterval(function() {
        if(!state.readingPaused) {
            countdownClock.innerHTML = getTimeString(state.currentTime);
            countdownBar.style.width = (state.currentTime / state.totalTime * 100) + '%';
            state.currentTime -= 100;

            if (index !== questionArray.length) {
                questionBox.innerHTML += questionArray[index] + ' ';
                index++;
            }
            
            if(state.currentTime === 0) {
                countdownClock.innerHTML = getTimeString(state.currentTime);
                countdownBar.style.width = (state.currentTime / state.totalTime * 100) + '%';
                clearInterval(state.readingID);
                skipButton.innerHTML = "Next";
                buzzButton.disabled = true;
                answerContainer.innerHTML = state.currentQuestion.answer.formatted;
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
    if (state.currentTime !== 0) {
        state.readingPaused = true;
        answerGroup.style.display = '';
        answerInput.focus();
        buzzButton.disabled = true;
        
        state.currentTime = state.totalAnswerTime;
        state.answeringID = setInterval(function() {
            countdownClock.innerHTML = getTimeString(state.currentTime);
            countdownBar.style.width = (state.currentTime / state.totalAnswerTime * 100) + '%';
            state.currentTime -= 100;

            if (state.currentTime === 0) {
                clearInterval(state.answeringID);
                countdownClock.innerHTML = getTimeString(state.currentTime);
                countdownBar.style.width = (state.currentTime / state.totalAnswerTime * 100) + '%';
                answer();
                state.userCorrect = false;
            }
        }, 100);
    }
}

function answer() {
    clearInterval(state.answeringID);
    answerInput.disabled = true;
    submitButton.disabled = true;
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
        parseAnswer(answerInput.value, state.currentQuestion.answer.formatted);
    }
}, false);

correctButton.addEventListener("click", chooseCorrect);

incorrectButton.addEventListener("click", chooseIncorrect);

document.addEventListener("keyup", function(e) {
    if((e.key === 'b' || e.key === ' ') && answerGroup.style.display === "none") {
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
        parseAnswer(answerInput.value, state.currentQuestion.answer.formatted);
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
});

document.addEventListener("DOMContentLoaded", function(event) { 
    categories.generateCheckboxes("http://127.0.0.1:5000/api/categories", "select-categories");
});