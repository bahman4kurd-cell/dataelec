from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-election-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///election_db.sqlite'
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# ----------------- داتابەیس مۆدێلەکان -----------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='viewer') # superadmin, admin, viewer

class ElectionTerm(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False) # ناوی خول
    election_type = db.Column(db.String(100), nullable=False) # جۆری هەڵبژاردن (پەرلەمان، ئەنجومەن،...)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# دروستکردنی سوپەر ئەدمین و خولی نموونەیی
with app.app_context():
    db.create_all()
    if not User.query.filter_by(username='superadmin').first():
        hashed_pw = generate_password_hash('admin123', method='pbkdf2:sha256')
        new_user = User(username='superadmin', password=hashed_pw, role='superadmin')
        db.session.add(new_user)
    
    # خولە دەرکەوتووەکانی ناو وێنەکە بۆ شاشەی سەرەتایی
    if not ElectionTerm.query.first():
        t1 = ElectionTerm(title="پەرلەمانی کوردستان - خولی شەشەم (٢٠٢٤)", election_type="پەرلەمانی کوردستان")
        t2 = ElectionTerm(title="ئەنجومەنی نوێنەرانی عێراق - خولی پێنجەم (٢٠٢١)", election_type="ئەنجومەنی نوێنەرانی عێراق")
        db.session.add_all([t1, t2])
    
    db.session.commit()

# پڕۆسێسەر بۆ ئەوەی خولەکان بۆ هەموو پەڕەکان بنێردرێت
@app.context_processor
def inject_terms():
    terms = ElectionTerm.query.all()
    return dict(election_terms=terms)

# ----------------- ڕاوتەکان (Routes) -----------------
@app.route('/')
@login_required
def dashboard():
    active_term_id = request.args.get('term_id', type=int)
    return render_template('dashboard.html', active_term_id=active_term_id)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user and check_password_hash(user.password, request.form.get('password')):
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# زیادکردنی خولی نوێ
@app.route('/add_term', methods=['POST'])
@login_required
def add_term():
    if current_user.role == 'viewer':
        return "مافت نییە", 403
    title = request.form.get('title')
    election_type = request.form.get('election_type')
    if title and election_type:
        new_term = ElectionTerm(title=title, election_type=election_type)
        db.session.add(new_term)
        db.session.commit()
    return redirect(url_for('dashboard'))

# دەستکاریکردنی خول
@app.route('/edit_term/<int:term_id>', methods=['POST'])
@login_required
def edit_term(term_id):
    if current_user.role == 'viewer':
        return "مافت نییە", 403
    term = ElectionTerm.query.get_or_404(term_id)
    term.title = request.form.get('title')
    term.election_type = request.form.get('election_type')
    db.session.commit()
    return redirect(url_for('dashboard'))

# سڕینەوەی خول
@app.route('/delete_term/<int:term_id>', methods=['POST'])
@login_required
def delete_term(term_id):
    if current_user.role == 'viewer':
        return "مافت نییە", 403
    term = ElectionTerm.query.get_or_404(term_id)
    db.session.delete(term)
    db.session.commit()
    return redirect(url_for('dashboard'))

@app.route('/control_panel')
@login_required
def control_panel():
    if current_user.role == 'viewer':
        return "تۆ مافی چوونە ژوورەوەت نییە بۆ ئەم بەشە", 403
    users = User.query.all()
    return render_template('control_panel.html', users=users)

if __name__ == '__main__':
    app.run(debug=True)