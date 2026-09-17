from flask import Flask, render_template, request, redirect, url_for, flash
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

# داتابەیس مۆدێلەکان
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='viewer') # superadmin, admin, viewer

class Election(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    type = db.Column(db.String(100)) # پەرلەمان، پارێزگاکان، هتد

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# دروستکردنی سوپەر ئەدمین لەکاتی یەکەم جار ڕەنکردن
with app.app_context():
    db.create_all()
    if not User.query.filter_by(username='superadmin').first():
        hashed_pw = generate_password_hash('admin123', method='pbkdf2:sha256')
        new_user = User(username='superadmin', password=hashed_pw, role='superadmin')
        db.session.add(new_user)
        db.session.commit()

@app.route('/')
@login_required
def dashboard():
    return render_template('dashboard.html')

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

@app.route('/control_panel')
@login_required
def control_panel():
    if current_user.role == 'viewer':
        return "تۆ مافی چوونە ژوورەوەت نییە بۆ ئەم بەشە", 403
    users = User.query.all()
    return render_template('control_panel.html', users=users)

if __name__ == '__main__':
    app.run(debug=True)