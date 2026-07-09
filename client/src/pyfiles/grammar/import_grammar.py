import csv
import json
import uuid
import psycopg

conn = psycopg.connect(
    "postgresql://tw10569:jlpt2024@localhost:5432/jlpt_learning"
)

cur = conn.cursor()

with open(
    "hanabira_all_jlpt_grammar.csv",
    "r",
    encoding="utf-8"
) as f:

    reader = csv.DictReader(f)

    count = 0

    for row in reader:

        examples = [
            {
                "japanese": row["Example (Japanese)"],
                "romaji": row["Example (Romaji)"],
                "english": row["Example (English)"]
            }
        ]

        level = row["JLPT Level"].replace("JLPT ", "")

        cur.execute("""
            INSERT INTO "GrammarPattern"
            (
                id,
                pattern,
                meaning,
                structure,
                level,
                examples
            )
            VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (
            str(uuid.uuid4()),
            row["Grammar Point"],
            row["Meaning"],
            row["Formation"],
            level,
            json.dumps(examples, ensure_ascii=False)
        ))

        count += 1

conn.commit()

print(f"Imported {count} grammar patterns")

cur.close()
conn.close()