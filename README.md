# QuizBuzz

Inspired in part by [Protobowl](https://github.com/neotenic/protobowl), QuizBuzz is a small website I made to play and practice quiz bowl/trivia.

All of the questions are taken from [QuizDB](http://www.quizdb.org/), a large database of quiz bowl questions taken from various quiz bowl tournaments.

Questions are stored in a local PostgreSQL database, to which the Python (Flask) backend retrieves questions using the SQLAlchemy ORM.

## What is quiz bowl?

From [NAQT](https://www.naqt.com/about/quiz-bowl.html), a major quiz bowl question writer and tournament organizing company:

> Quiz bowl is a game in which two teams compete head-to-head to answer questions from all areas of knowledge, including history, literature, science, fine arts, current events, popular culture, sports, and more. There are also tournaments for individual players rather than teams.
>
>The defining feature of quiz bowl is the use of a “buzzer system” that lets players interrupt the reading of a question when they know the answer. That element adds a dimension of confidence, anticipation, and rapid recall to a game about knowing facts. Those “tossup” questions are answered individually, but doing so earns one’s team a chance at a three-part “bonus” question. Bonus questions are worth more points and allow collaboration, but are generally more difficult.