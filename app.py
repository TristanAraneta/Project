# app.py - GSU Monitoring System with Login
from flask import Flask, render_template, request, redirect, url_for, session, flash, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = 'gsu-monitoring-secret-key-change-in-production'

# Configuration
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('templates/Employee', exist_ok=True)
os.makedirs('templates/Semi_Head', exist_ok=True)
os.makedirs('templates/Head', exist_ok=True)

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Authentication Routes
@app.route('/')
def index():
    """Show landing page"""
    return render_template('landingpage.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Show registration page and handle registration"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirmPassword', '')
        terms = request.form.get('terms')

        # Validation
        if not username or not email or not password or not confirm_password:
            flash('All fields are required.', 'error')
            return redirect(url_for('register'))

        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('register'))

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return redirect(url_for('register'))

        if not terms:
            flash('You must agree to the terms and conditions.', 'error')
            return redirect(url_for('register'))

        # Registration disabled - backend removed
        flash('Registration is currently disabled. Backend will be implemented with SQL Workbench.', 'error')
        return redirect(url_for('register'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and authentication"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            return redirect(url_for('login', error='Please enter both username and password'))

        # Login disabled - backend removed
        flash('Login is currently disabled. Backend will be implemented with SQL Workbench.', 'error')
        return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    response = make_response(redirect(url_for('index')))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/inventory')
@login_required
def inventory():
    """Inventory management page"""
    return render_template('Employee/employee_inventory.html', username=session.get('username', 'User'))

@app.route('/borrowing')
@login_required
def borrowing():
    """Borrowing management page"""
    return render_template('Employee/employee_borrowing.html', username=session.get('username', 'User'))

@app.route('/graph')
@login_required
def graph():
    """Graph analytics page"""
    return render_template('Employee/employee_graph.html', username=session.get('username', 'User'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard"""
    # Dashboard disabled - backend removed
    flash('Dashboard is currently disabled. Backend will be implemented with SQL Workbench.', 'error')
    return redirect(url_for('index'))

# API Routes - Disabled due to backend removal

if __name__ == '__main__':
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
