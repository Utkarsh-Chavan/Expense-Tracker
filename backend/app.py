import os
import mysql.connector
from flask import Flask, render_template, request, redirect, url_for, jsonify
from decimal import Decimal
from collections import defaultdict
import calendar

base_dir = os.path.abspath(os.path.dirname(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(base_dir, "templates"),
    static_folder=os.path.join(base_dir, "static")
)

def get_db_connection():
    host = os.environ.get("MYSQL_HOST") or os.environ.get("DB_HOST") or "localhost"
    user = os.environ.get("MYSQL_USER") or os.environ.get("DB_USER") or "root"
    password = os.environ.get("MYSQL_PASSWORD") or os.environ.get("DB_PASSWORD") or "root"
    database = os.environ.get("MYSQL_DATABASE") or os.environ.get("DB_NAME") or "expenses_db"
    port = int(os.environ.get("MYSQL_PORT") or os.environ.get("DB_PORT") or 3306)

    config = {
        "host": host,
        "user": user,
        "password": password,
        "database": database,
        "port": port
    }

    ssl_ca = os.environ.get("MYSQL_SSL_CA") or os.environ.get("DB_SSL_CA")
    if ssl_ca:
        config["ssl_ca"] = ssl_ca

    return mysql.connector.connect(**config)

@app.route("/", methods=["GET"])
def index():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    search = request.args.get("search")

    # ---------------- Expenses Query ----------------
    base_query = "SELECT * FROM expenses WHERE 1=1"
    params = []

    if from_date and to_date:
        base_query += " AND `date` BETWEEN %s AND %s"
        params.extend([from_date, to_date])
    elif from_date:
        base_query += " AND `date` >= %s"
        params.append(from_date)
    elif to_date:
        base_query += " AND `date` <= %s"
        params.append(to_date)

    if search:
        like = f"%{search}%"
        base_query += " AND (`description` LIKE %s OR `category` LIKE %s OR CAST(`amount` AS CHAR) LIKE %s OR `date` LIKE %s)"
        params.extend([like, like, like, like])

    base_query += " ORDER BY `date` DESC"
    cursor.execute(base_query, tuple(params))
    expenses = cursor.fetchall()

    # ---------------- Total ----------------
    total_query = "SELECT SUM(amount) AS total FROM expenses WHERE 1=1"
    total_params = []

    if from_date and to_date:
        total_query += " AND `date` BETWEEN %s AND %s"
        total_params.extend([from_date, to_date])
    elif from_date:
        total_query += " AND `date` >= %s"
        total_params.append(from_date)
    elif to_date:
        total_query += " AND `date` <= %s"
        total_params.append(to_date)

    if search:
        like = f"%{search}%"
        total_query += " AND (`description` LIKE %s OR `category` LIKE %s OR CAST(`amount` AS CHAR) LIKE %s OR `date` LIKE %s)"
        total_params.extend([like, like, like, like])

    cursor.execute(total_query, tuple(total_params))
    row = cursor.fetchone()
    total = float(row["total"] or 0)  # convert Decimal to float

    # ---------------- Totals by Category ----------------
    cat_query = "SELECT `category`, SUM(amount) AS total FROM expenses WHERE 1=1"
    cat_params = []

    if from_date and to_date:
        cat_query += " AND `date` BETWEEN %s AND %s"
        cat_params.extend([from_date, to_date])
    elif from_date:
        cat_query += " AND `date` >= %s"
        cat_params.append(from_date)
    elif to_date:
        cat_query += " AND `date` <= %s"
        cat_params.append(to_date)

    if search:
        like = f"%{search}%"
        cat_query += " AND (`description` LIKE %s OR `category` LIKE %s OR CAST(`amount` AS CHAR) LIKE %s OR `date` LIKE %s)"
        cat_params.extend([like, like, like, like])

    cat_query += " GROUP BY `category`"
    cursor.execute(cat_query, tuple(cat_params))
    totals_by_category = cursor.fetchall()

    # ---------------- Monthly Totals ----------------
    monthly_totals = defaultdict(float)
    yearly_totals = defaultdict(float)
    for exp in expenses:
        date_obj = exp['date']
        month_key = date_obj.strftime("%Y-%m")
        year_key = date_obj.strftime("%Y")
        monthly_totals[month_key] += float(exp['amount'])
        yearly_totals[year_key] += float(exp['amount'])

    # Sort months
    sorted_months = sorted(monthly_totals.keys())
    sorted_monthly_totals = [monthly_totals[m] for m in sorted_months]

    sorted_years = sorted(yearly_totals.keys())
    sorted_yearly_totals = [yearly_totals[y] for y in sorted_years]

    cursor.close()
    conn.close()

    return render_template(
        "index.html",
        expenses=expenses,
        total=total,
        totals_by_category=totals_by_category,
        from_date=from_date,
        to_date=to_date,
        search=search,
        months=sorted_months,
        monthly_totals=sorted_monthly_totals,
        years=sorted_years,
        yearly_totals=sorted_yearly_totals
    )

@app.route("/add", methods=["POST"])
def add_expense():
    description = request.form["description"]
    amount = request.form["amount"]
    date = request.form["date"]
    category = request.form["category"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (description, amount, date, category) VALUES (%s, %s, %s, %s)",
        (description, amount, date, category)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for("index"))

@app.route("/delete/<int:id>", methods=["POST"])
def delete_expense(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for("index"))

@app.route("/get_categories")
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT category FROM expenses")
    categories = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(categories)

@app.route("/search_suggestions")
def search_suggestions():
    query = request.args.get("query", "")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT DISTINCT description FROM expenses WHERE description LIKE %s LIMIT 5",
        (f"%{query}%",)
    )
    results = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return jsonify(results)

@app.route("/reset")
def reset():
    return redirect(url_for("index"))

# Add this function to your Flask app

def get_category_icon(category):
    """Return emoji icon for category"""
    icons = {
        'Food': '🍔',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Bills': '📄',
        'Health': '⚕️',
        'Education': '📚',
        'Housing': '🏠',
        'Utilities': '💡',
        'Travel': '✈️',
        'Clothing': '👕',
        'Groceries': '🛒',
        'Insurance': '🛡️',
        'Fitness': '💪',
        'Personal': '👤',
        'Other': '📦'
    }
    return icons.get(category, '📦')

# Add this to your Jinja2 environment
app.jinja_env.globals.update(get_category_icon=get_category_icon)

if __name__ == "__main__":
    app.run(debug=True)
