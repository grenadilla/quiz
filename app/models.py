#coding: utf-8
from sqlalchemy import DateTime, Index, text
from sqlalchemy.dialects.postgresql import INET

from app import db

class ActiveAdminComment(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'active_admin_comments'
    __table_args__ = (
        Index('index_active_admin_comments_on_resource_type_and_resource_id',
              'resource_type', 'resource_id'),
        Index('index_active_admin_comments_on_author_type_and_author_id',
              'author_type', 'author_id')
    )

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('active_admin_comments_id_seq'::regclass)"))
    namespace = db.Column(db.String, index=True)
    body = db.Column(db.Text)
    resource_type = db.Column(db.String)
    resource_id = db.Column(db.Integer)
    author_type = db.Column(db.String)
    author_id = db.Column(db.Integer)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)


class AdminUser(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('admin_users_id_seq'::regclass)"))
    email = db.Column(db.String, nullable=False, unique=True,
                      server_default=text("''::character varying"))
    encrypted_password = db.Column(db.String, nullable=False,
                                   server_default=text("''::character varying"))
    reset_password_token = db.Column(db.String, unique=True)
    reset_password_sent_at = db.Column(DateTime)
    remember_created_at = db.Column(DateTime)
    sign_in_count = db.Column(db.Integer, nullable=False, server_default=text("0"))
    current_sign_in_at = db.Column(DateTime)
    last_sign_in_at = db.Column(DateTime)
    current_sign_in_ip = db.Column(INET)
    last_sign_in_ip = db.Column(INET)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)
    role = db.Column(db.Integer, server_default=text("0"))
    confirmation_token = db.Column(db.String, unique=True)
    confirmed_at = db.Column(DateTime)
    confirmation_sent_at = db.Column(DateTime)
    unconfirmed_email = db.Column(db.String)


class ArInternalMetadatum(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'ar_internal_metadata'

    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)


class Category(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('categories_id_seq'::regclass)"))
    name = db.Column(db.String, nullable=False, unique=True)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)


class Error(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'errors'
    __table_args__ = (
        Index('index_errors_on_errorable_type_and_errorable_id', 'errorable_type', 'errorable_id'),
    )

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('errors_id_seq'::regclass)"))
    description = db.Column(db.Text, nullable=False)
    error_type = db.Column(db.Integer, nullable=False)
    resolved = db.Column(db.Boolean, server_default=text("false"))
    errorable_type = db.Column(db.String)
    errorable_id = db.Column(db.Integer)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)


class SchemaMigration(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'schema_migrations'

    version = db.Column(db.String, primary_key=True)


class Tournament(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'tournaments'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('tournaments_id_seq'::regclass)"))
    year = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False, unique=True)
    difficulty = db.Column(db.Integer, nullable=False)
    quality = db.Column(db.Integer)
    address = db.Column(db.String)
    type = db.Column(db.String)
    link = db.Column(db.String)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)


class Subcategory(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'subcategories'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('subcategories_id_seq'::regclass)"))
    name = db.Column(db.String, unique=True)
    category_id = db.Column(db.ForeignKey('categories.id'), nullable=False, index=True)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)

    category = db.relationship('Category')


class Bonus(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'bonuses'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('bonuses_id_seq'::regclass)"))
    number = db.Column(db.Integer)
    round = db.Column(db.String)
    category_id = db.Column(db.ForeignKey('categories.id'), index=True)
    subcategory_id = db.Column(db.ForeignKey('subcategories.id'), index=True)
    quinterest_id = db.Column(db.Integer)
    tournament_id = db.Column(db.ForeignKey('tournaments.id'), index=True)
    leadin = db.Column(db.Text, index=True)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)
    errors_count = db.Column(db.Integer, server_default=text("0"))
    formatted_leadin = db.Column(db.Text)

    category = db.relationship('Category')
    subcategory = db.relationship('Subcategory')
    tournament = db.relationship('Tournament')


class Tossup(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'tossups'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('tossups_id_seq'::regclass)"))
    answer = db.Column(db.Text, nullable=False, index=True)
    number = db.Column(db.Integer)
    tournament_id = db.Column(db.ForeignKey('tournaments.id'), index=True)
    category_id = db.Column(db.ForeignKey('categories.id'), index=True)
    subcategory_id = db.Column(db.ForeignKey('subcategories.id'), index=True)
    round = db.Column(db.String)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)
    quinterest_id = db.Column(db.Integer, unique=True)
    formatted_text = db.Column(db.Text)
    errors_count = db.Column(db.Integer, server_default=text("0"))
    text = db.Column(db.Text, nullable=False, index=True)
    formatted_answer = db.Column(db.Text)
    wikipedia_url = db.Column(db.Text)

    category = db.relationship('Category')
    subcategory = db.relationship('Subcategory')
    tournament = db.relationship('Tournament')


class BonusPart(db.Model): # pylint: disable=too-few-public-methods
    __tablename__ = 'bonus_parts'

    id = db.Column(db.Integer, primary_key=True,
                   server_default=text("nextval('bonus_parts_id_seq'::regclass)"))
    bonus_id = db.Column(db.ForeignKey('bonuses.id'), index=True)
    text = db.Column(db.Text, index=True)
    answer = db.Column(db.Text, index=True)
    formatted_text = db.Column(db.Text)
    formatted_answer = db.Column(db.Text)
    created_at = db.Column(DateTime, nullable=False)
    updated_at = db.Column(DateTime, nullable=False)
    number = db.Column(db.Integer, nullable=False)
    wikipedia_url = db.Column(db.Text)

    bonus = db.relationship('Bonus')