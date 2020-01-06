"use strict";

import QuestionHolder from './question-holder.js';
import CategorySelector from './category-selector.js';

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

let state = {
    readingID: 0,
    readingPaused: false,
    currentQuestion: undefined,
    questionHolder: new QuestionHolder("http://127.0.0.1:5000/api/tossup"),
    loadingTossups: false,
    userCorrect: null,
    correctNum: 0,
    incorrectNum: 0,
    missedNum: 0,
    currentTime: 0,
    totalTime: 0,
    totalAnswerTime: 5000,
    answeringID: 0,
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

function gradePlayer() {
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
}

function resetDisplay() {
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
}

// Updates grade display and resets button values
function nextQuestion() {
    console.log(state.questionHolder);

    gradePlayer();
    resetDisplay();

    // Only pass in selectedCategories if they have changed, otherwise we can use previous values
    let categoriesChanged = state.categorySelector.categoriesHaveChanged();
    let selectedCategories = state.categorySelector.getSelectedCategories();
    // Only pass in selected categories if they have changed
    state.questionHolder.getTossup(categoriesChanged ? selectedCategories : undefined)
        .then(function(result) {
        // Load extra tossups from api if running short. Called here so that
        // valid and invalid tossups are already sorted
        if(!state.loadingTossups && state.questionHolder.shouldLoadTossups()) {
            console.log("loading tossups");
            state.loadingTossups = true;

            let chain = Promise.resolve();
            let numSelectedCategories = state.categorySelector.numSelectedCategories();
            for (const entry of selectedCategories) {
                if (entry[1]) {
                    console.log("should load category " + entry[0]);
                    chain.then(() => state.questionHolder.loadCategoryTossups(entry[0], numSelectedCategories));
                }
            }
            chain.then(() => {
                state.loadingTossups = false;
                console.log("finished loading");
            });
        }

        state.currentQuestion = result;
        readQuestion(state.currentQuestion);
    });
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

// event.detail is ID of added category
document.addEventListener(CategorySelector.ADDCATEGORYEVENTNAME, 
    (event) => state.questionHolder.addCategoryTossups(event.detail, state.categorySelector.numSelectedCategories())
);

document.addEventListener("DOMContentLoaded", function(event) { 
    state.categorySelector = new CategorySelector("http://127.0.0.1:5000/api/categories", "select-categories");
    state.questionHolder.selectedCategories = state.categorySelector.getSelectedCategories();

    state.questionHolder.loadTossups(20).then(function(result) {
        //Calling nextQuestion increments missedNum
        state.missedNum = -1;
        nextQuestion();
    });
});