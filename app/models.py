# coding: utf-8
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import INET
from sqlalchemy.orm import relationship

from app import db

class ActiveAdminComment(db.Model):
    __tablename__ = 'active_admin_comments'
    __table_args__ = (
        Index('index_active_admin_comments_on_resource_type_and_resource_id', 'resource_type', 'resource_id'),
        Index('index_active_admin_comments_on_author_type_and_author_id', 'author_type', 'author_id')
    )

    id = Column(Integer, primary_key=True, server_default=text("nextval('active_admin_comments_id_seq'::regclass)"))
    namespace = Column(String, index=True)
    body = Column(Text)
    resource_type = Column(String)
    resource_id = Column(Integer)
    author_type = Column(String)
    author_id = Column(Integer)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = Column(Integer, primary_key=True, server_default=text("nextval('admin_users_id_seq'::regclass)"))
    email = Column(String, nullable=False, unique=True, server_default=text("''::character varying"))
    encrypted_password = Column(String, nullable=False, server_default=text("''::character varying"))
    reset_password_token = Column(String, unique=True)
    reset_password_sent_at = Column(DateTime)
    remember_created_at = Column(DateTime)
    sign_in_count = Column(Integer, nullable=False, server_default=text("0"))
    current_sign_in_at = Column(DateTime)
    last_sign_in_at = Column(DateTime)
    current_sign_in_ip = Column(INET)
    last_sign_in_ip = Column(INET)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    role = Column(Integer, server_default=text("0"))
    confirmation_token = Column(String, unique=True)
    confirmed_at = Column(DateTime)
    confirmation_sent_at = Column(DateTime)
    unconfirmed_email = Column(String)


class ArInternalMetadatum(db.Model):
    __tablename__ = 'ar_internal_metadata'

    key = Column(String, primary_key=True)
    value = Column(String)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class Category(db.Model):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, server_default=text("nextval('categories_id_seq'::regclass)"))
    name = Column(String, nullable=False, unique=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class Error(db.Model):
    __tablename__ = 'errors'
    __table_args__ = (
        Index('index_errors_on_errorable_type_and_errorable_id', 'errorable_type', 'errorable_id'),
    )

    id = Column(Integer, primary_key=True, server_default=text("nextval('errors_id_seq'::regclass)"))
    description = Column(Text, nullable=False)
    error_type = Column(Integer, nullable=False)
    resolved = Column(Boolean, server_default=text("false"))
    errorable_type = Column(String)
    errorable_id = Column(Integer)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class SchemaMigration(db.Model):
    __tablename__ = 'schema_migrations'

    version = Column(String, primary_key=True)


class Tournament(db.Model):
    __tablename__ = 'tournaments'

    id = Column(Integer, primary_key=True, server_default=text("nextval('tournaments_id_seq'::regclass)"))
    year = Column(Integer, nullable=False)
    name = Column(String, nullable=False, unique=True)
    difficulty = Column(Integer, nullable=False)
    quality = Column(Integer)
    address = Column(String)
    type = Column(String)
    link = Column(String)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)


class Subcategory(db.Model):
    __tablename__ = 'subcategories'

    id = Column(Integer, primary_key=True, server_default=text("nextval('subcategories_id_seq'::regclass)"))
    name = Column(String, unique=True)
    category_id = Column(ForeignKey('categories.id'), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    category = relationship('Category')


class Bonus(db.Model):
    __tablename__ = 'bonuses'

    id = Column(Integer, primary_key=True, server_default=text("nextval('bonuses_id_seq'::regclass)"))
    number = Column(Integer)
    round = Column(String)
    category_id = Column(ForeignKey('categories.id'), index=True)
    subcategory_id = Column(ForeignKey('subcategories.id'), index=True)
    quinterest_id = Column(Integer)
    tournament_id = Column(ForeignKey('tournaments.id'), index=True)
    leadin = Column(Text, index=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    errors_count = Column(Integer, server_default=text("0"))
    formatted_leadin = Column(Text)

    category = relationship('Category')
    subcategory = relationship('Subcategory')
    tournament = relationship('Tournament')


class Tossup(db.Model):
    __tablename__ = 'tossups'

    id = Column(Integer, primary_key=True, server_default=text("nextval('tossups_id_seq'::regclass)"))
    answer = Column(Text, nullable=False, index=True)
    number = Column(Integer)
    tournament_id = Column(ForeignKey('tournaments.id'), index=True)
    category_id = Column(ForeignKey('categories.id'), index=True)
    subcategory_id = Column(ForeignKey('subcategories.id'), index=True)
    round = Column(String)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    quinterest_id = Column(Integer, unique=True)
    formatted_text = Column(Text)
    errors_count = Column(Integer, server_default=text("0"))
    text = Column(Text, nullable=False, index=True)
    formatted_answer = Column(Text)
    wikipedia_url = Column(Text)

    category = relationship('Category')
    subcategory = relationship('Subcategory')
    tournament = relationship('Tournament')


class BonusPart(db.Model):
    __tablename__ = 'bonus_parts'

    id = Column(Integer, primary_key=True, server_default=text("nextval('bonus_parts_id_seq'::regclass)"))
    bonus_id = Column(ForeignKey('bonuses.id'), index=True)
    text = Column(Text, index=True)
    answer = Column(Text, index=True)
    formatted_text = Column(Text)
    formatted_answer = Column(Text)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    number = Column(Integer, nullable=False)
    wikipedia_url = Column(Text)

    bonus = relationship('Bonus')