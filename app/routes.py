from app import app, db
from app.models import Tossup, Bonus, BonusPart, Category, Subcategory, Tournament
from flask import jsonify, request, render_template
import random

def random_id_query(query, model, num=1):
    min = model.query.first().id
    max = model.query.order_by(model.id.desc()).first().id

    if num > max - min:
        num = max - min
    ids = random.sample(range(min, max + 1), num)
    results = query.filter(model.id.in_(ids))

    while results.count() < num:
        results = results.union(random_id_query(query, model, num - results.count()))
    return results

@app.route('/')
@app.route('/index')
def index():
    return jsonify(Bonus.query.first().serialize)

@app.route('/api/tossup/<id>')
def get_tossup_by_id(id):
    tossup = Tossup.query.filter_by(id=id).first()
    return jsonify(tossup.serialize)

@app.route('/api/tossup')
def search_tossups():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', type=int)
    subcategory = request.args.get('subcategory', type=int)
    randomize = request.args.get('randomize', default=False, type=bool)

    tossups = Tossup.query

    if category is not None:
        tossups = tossups.join(Tossup.category, aliased=True).filter_by(id=category)
    if subcategory is not None:
        tossups = tossups.join(Tossup.subcategory, aliased=True).filter_by(id=subcategory)

    # randomize requires number of objects. If not randomizing but given a total amount,
    # limit the query to that amount
    if randomize:
        tossups = random_id_query(tossups, Tossup, per_page)
    
    tossups = tossups.paginate(page=page, per_page=per_page, error_out=False)

    result = {
        "page": tossups.page,
        "per_page": per_page,
        "total_pages": tossups.pages,
        "total_results": tossups.total,
        "results": [tossup.serialize for tossup in tossups.items],
    }

    return jsonify(result)

@app.route('/api/bonus/<id>')
def get_bonus_by_id(id):
    bonus = Bonus.query.filter_by(id=id).first()
    return jsonify(bonus.serialize)

@app.route('/api/bonus')
def search_bonuses():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category = request.args.get('category', type=int)
    subcategory = request.args.get('subcategory', type=int)

    bonuses = Bonus.query

    if category is not None:
        bonuses = bonuses.join(Bonus.category, aliased=True).filter_by(id=category)
    if subcategory is not None:
        bonuses = bonuses.join(Bonus.subcategory, aliased=True).filter_by(id=subcategory)

    bonuses = bonuses.paginate(page=page, per_page=per_page, error_out=False)

    result = {
        "page": bonuses.page,
        "per_page": per_page,
        "total_pages": bonuses.pages,
        "total_results": bonuses.total,
        "results": [bonus.serialize for bonus in bonuses.items],
    }

    return jsonify(result)

@app.route('/api/categories')
def get_categories():
    categories = Category.query.all()
    return jsonify([category.serialize for category in categories])

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')