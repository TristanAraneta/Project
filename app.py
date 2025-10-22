# app.py - GSU Monitoring System with Login
from flask import Flask, render_template, request, redirect, url_for, session, flash, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'gsu-monitoring-secret-key-change-in-production'

# Configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('templates/Employee', exist_ok=True)
os.makedirs('templates/Semi_Head', exist_ok=True)
os.makedirs('templates/Head', exist_ok=True)

# Role definitions
ROLES = {
    'employee': 'Employee',
    'semi_head': 'Semi-Head',
    'head': 'Head'
}

# Sample data for dashboard
AREAS = [
    {"id": 1, "name": "Area A - Building 1", "status": "Done", "lastCheck": "2 hours ago", "checkedBy": "Jun"},
    {"id": 2, "name": "Area A - Building 2", "status": "Pending", "lastCheck": "2 hours ago", "checkedBy": "Leanard"},
    {"id": 3, "name": "Area A - Building 3", "status": "Done", "lastCheck": "2 hours ago", "checkedBy": "John Leanard"},
    {"id": 4, "name": "Area A - Building 4", "status": "Done", "lastCheck": "2 hours ago", "checkedBy": "Junadie"},
    {"id": 5, "name": "Area A - Building 5", "status": "Done", "lastCheck": "2 hours ago", "checkedBy": "Leanard De Ocampo"}
]

STATS = {
    "unresolved": 12,
    "overdue": 12,
    "open": 12,
    "onHold": 12
}

def init_database():
    """Initialize database with users and demo data"""
    conn = sqlite3.connect('gsu_monitoring.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'employee',
            email TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Areas table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            last_check TIMESTAMP,
            checked_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Inventory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            stock INTEGER DEFAULT 0,
            min_stock INTEGER DEFAULT 5,
            status TEXT DEFAULT 'ok',
            unit TEXT DEFAULT 'pcs',
            category TEXT DEFAULT 'supplies',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert demo users
    demo_users = [
        ('admin', generate_password_hash('admin123'), 'Administrator', 'head', 'admin@gsu.com'),
        ('semihead', generate_password_hash('semi123'), 'Semi Head User', 'semi_head', 'semi@gsu.com'),
        ('employee', generate_password_hash('emp123'), 'Employee User', 'employee', 'emp@gsu.com')
    ]

    for username, password, full_name, role, email in demo_users:
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, password, full_name, role, email)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, password, full_name, role, email))

    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection with row factory"""
    conn = sqlite3.connect('gsu_monitoring.db')
    conn.row_factory = sqlite3.Row
    return conn

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def role_required(allowed_roles):
    """Decorator to require specific role(s)"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('login'))
            if session.get('role') not in allowed_roles:
                flash('You do not have permission to access this page.', 'error')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Authentication Routes
@app.route('/')
def index():
    """Show landing page"""
    return render_template('landingpage.html')

@app.route('/register')
def register():
    """Show registration page"""
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page and authentication"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        if not username or not password:
            return redirect(url_for('login', error='Please enter both username and password'))

        conn = get_db_connection()
        user = conn.execute('''
            SELECT * FROM users
            WHERE username = ? AND is_active = 1
        ''', (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], password):
            # Login successful
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['full_name'] = user['full_name']
            session['role'] = user['role']

            print(f"✅ Login successful: {user['full_name']} ({user['role']})")

            return redirect(url_for('dashboard'))
        else:
            return redirect(url_for('login', error='Invalid username or password'))

    # GET request - show login page
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout user"""
    username = session.get('full_name', 'User')
    session.clear()
    print(f"👋 Logout: {username}")
    response = make_response(redirect(url_for('login', success='Logged out successfully')))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard - show employee dashboard for all users"""
    return render_template('Employee/employee.html', areas=AREAS, stats=STATS)

@app.route('/sample-dashboard')
@login_required
def sample_dashboard():
    """Sample dashboard with static data"""
    return render_template('dashboard.html', areas=AREAS, stats=STATS)

# API Routes (for dashboard data)
@app.route('/api/current_user')
@login_required
def get_current_user():
    """Get current logged in user info"""
    return {
        'id': session.get('user_id'),
        'username': session.get('username'),
        'full_name': session.get('full_name'),
        'role': session.get('role')
    }

@app.route('/api/areas')
@login_required
def get_areas():
    """Get all areas"""
    conn = get_db_connection()
    areas = conn.execute('''
        SELECT a.*, u.full_name as checked_by_name
        FROM areas a
        LEFT JOIN users u ON a.checked_by = u.id
        ORDER BY a.id
    ''').fetchall()
    conn.close()
    
    return {'areas': [dict(area) for area in areas]}

@app.route('/api/inventory')
@login_required
def get_inventory():
    """Get all inventory items"""
    conn = get_db_connection()
    items = conn.execute('''
        SELECT * FROM inventory 
        ORDER BY status DESC, name
    ''').fetchall()
    conn.close()
    
    return {'inventory': [dict(item) for item in items]}

@app.route('/api/stats')
@login_required
def get_stats():
    """Get dashboard statistics"""
    conn = get_db_connection()
    
    # Area stats
    area_stats = conn.execute('''
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM areas
    ''').fetchone()
    
    # Inventory stats
    inventory_stats = conn.execute('''
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'ok' THEN 1 END) as ok,
            COUNT(CASE WHEN status = 'low' THEN 1 END) as low,
            COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical
        FROM inventory
    ''').fetchone()
    
    conn.close()
    
    return {
        'areas': dict(area_stats),
        'inventory': dict(inventory_stats)
    }

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('login.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return "Internal Server Error", 500

if __name__ == '__main__':
    # Initialize database
    init_database()

    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
