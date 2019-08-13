from app import app, db
from app.models import Tossup, Bonus, BonusPart, Category, Subcategory, Tournament
from flask import jsonify

@app.route('/')
@app.route('/index')
def index():
    return jsonify(Tossup.query.first().serialize)
