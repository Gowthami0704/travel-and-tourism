import sqlite3
c = sqlite3.connect('database/database.sqlite')
for t in ('places', 'food_dishes'):
    print(t, c.execute(f"select sum(image_url like '%upload.wikimedia.org%'), count(*) from {t}").fetchone())
