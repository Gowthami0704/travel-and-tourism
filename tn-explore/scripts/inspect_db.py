import sqlite3

conn = sqlite3.connect(r'database/database.sqlite')
c = conn.cursor()
c.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
for t, sql in c.fetchall():
    if t in ['districts', 'places', 'food_dishes', 'listings', 'vendors']:
        print(f"=== TABLE: {t} ===")
        print(sql)
        print()

c.execute("SELECT id, name FROM districts ORDER BY id")
districts = c.fetchall()
print("Districts mapping in DB:")
for d in districts:
    print(d)
