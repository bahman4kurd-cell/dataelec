from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'election-system-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///election_db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# ----------------- داتابەیس مۆدێلەکان -----------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='viewer') # superadmin, admin, viewer

class ElectionTerm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    branches = db.relationship('Branch', backref='term', cascade="all, delete", lazy=True)

class Branch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    term_id = db.Column(db.Integer, db.ForeignKey('election_term.id'), nullable=False)
    districts = db.relationship('District', backref='branch', cascade="all, delete", lazy=True)

class District(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    branch_id = db.Column(db.Integer, db.ForeignKey('branch.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# دروستکردنی بنکەی داتابەیس و یوزەری بنچینەیی
with app.app_context():
    db.create_all()
    if not User.query.filter_by(username='superadmin').first():
        hashed_pw = generate_password_hash('admin123', method='pbkdf2:sha256')
        db.session.add(User(username='superadmin', password=hashed_pw, role='superadmin'))
    
    if not ElectionTerm.query.first():
        t1 = ElectionTerm(title="پەرلەمانی کوردستان - خولی شەشەم (٢٠٢٤)")
        db.session.add(t1)
        db.session.commit()
        b1 = Branch(name="لقی هەولێر", term_id=t1.id)
        b2 = Branch(name="لقی سلێمانی", term_id=t1.id)
        db.session.add_all([b1, b2])
        db.session.commit()
        d1 = District(name="ناوچەی یەک", branch_id=b1.id)
        d2 = District(name="ناوچەی دوو", branch_id=b1.id)
        db.session.add_all([d1, d2])
        db.session.commit()

@app.route('/')
@login_required
def index():
    terms = ElectionTerm.query.all()
    users = User.query.all() if current_user.role == 'superadmin' else []
    return render_template('base.html', terms=terms, users=users)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user and check_password_hash(user.password, request.form.get('password')):
            login_user(user)
            return redirect(url_for('index'))
        flash('ناوی بەکارهێنەر یان پاسۆرد هەڵەیە!')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# API - دروستکردنی خولی نوێ
@app.route('/add_term', methods=['POST'])
@login_required
def add_term():
    if current_user.role != 'viewer':
        title = request.form.get('title')
        if title:
            db.session.add(ElectionTerm(title=title))
            db.session.commit()
    return redirect(url_for('index'))

# API - سڕینەوەی خول
@app.route('/delete_term/<int:id>', methods=['POST'])
@login_required
def delete_term(id):
    if current_user.role != 'viewer':
        term = ElectionTerm.query.get_or_404(id)
        db.session.delete(term)
        db.session.commit()
    return redirect(url_for('index'))

# API - دروستکردنی یوزەری نوێ لە کۆنترۆڵ پەناڵ
@app.route('/add_user', methods=['POST'])
@login_required
def add_user():
    if current_user.role == 'superadmin':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')
        if username and password:
            hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')
            db.session.add(User(username=username, password=hashed_pw, role=role))
            db.session.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)