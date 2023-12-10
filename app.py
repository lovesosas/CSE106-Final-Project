from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_wtf.csrf import CSRFProtect


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///walmart_forum_db.sqlite"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
app.secret_key = "Walmart"
csrf = CSRFProtect(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


# User class for Flask-Login
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    likes = db.Column(db.Integer, default=0)
    dislikes = db.Column(db.Integer, default=0)
    comments = db.relationship('Comment', backref='post', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'likes': self.likes,
            'dislikes': self.dislikes,
            'author': User.query.get(self.author_id).username if self.author_id else None,
            'comments': [comment.serialize() for comment in self.comments]
        }

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    author = db.relationship('User', foreign_keys=[author_id])

    def serialize(self):
        return {
            'id': self.id,
            'content': self.content,
            'author_id': self.author_id,
            'author': User.query.get(self.author_id).username if self.author_id else None,
            'post_id': self.post_id
        }


# Initialize Flask-Admin
admin = Admin(app, name='WalmartForum', template_mode='bootstrap3')

# ModelView for User with admin access control
class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.username == "admin"

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login', next=request.url))

# Adding views to Flask-Admin
admin.add_view(AdminModelView(User, db.session))
admin.add_view(AdminModelView(Post, db.session))
admin.add_view(AdminModelView(Comment, db.session))

# Flask-Login user loader
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Check password hash
def check_password_hash(hashed_password, password):
    return bcrypt.check_password_hash(hashed_password, password)

# Flask-Login signup route
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('signup.html')

# Flask-Login login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    # data = request.get_json() 
    #implement this for live server
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('home'))

    return render_template('login.html')

# Flask-Login logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# Protected route requiring login
# @app.route('/home')
# @login_required
# def home():
#     return f'Hello, {current_user.username}!'

# Default route to render login HTML when the app is run
@app.route('/')
def index():
    return render_template('login.html')

@app.route('/home')
@login_required
def home():
    # posts fetch from database here
    posts = Post.query.all()
    return render_template('home.html', posts=posts)


# CREATE LIKE COMMENT ON POSTS

@app.route('/create_post', methods=['GET', 'POST'])
@login_required
def create_post():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        new_post = Post(title=title, content=content, author_id=current_user.id)
        db.session.add(new_post)
        db.session.commit()
        return redirect(url_for('home'))
    return render_template('create_post.html')

@app.route('/like_post/<int:post_id>', methods=['POST'])
@login_required
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.likes += 1
    db.session.commit()
    return jsonify({'success': True, 'likes': post.likes, 'post_id': post_id})

@app.route('/dislike_post/<int:post_id>', methods=['POST'])
@login_required
def dislike_post(post_id):
    post = Post.query.get_or_404(post_id)
    post.dislikes += 1
    db.session.commit()
    return jsonify({'success': True, 'dislikes': post.dislikes, 'post_id': post_id})

@app.route('/comment_post/<int:post_id>', methods=['POST'])
@login_required
def comment_post(post_id):
    try:
        data = request.get_json()
        content = data.get('comment')

        new_comment = Comment(content=content, author_id=current_user.id, post_id=post_id)
        db.session.add(new_comment)
        db.session.commit()

        return jsonify(new_comment.serialize())
    except Exception as e:
        return jsonify({'error': str(e)}), 500





# Function to create a default admin user
def create_default_admin_user():
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        new_admin = User(username='admin', password=hashed_password)
        db.session.add(new_admin)
        db.session.commit()
        print("Default admin user created with username 'admin' and password 'admin123'")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_default_admin_user()

    app.run()
