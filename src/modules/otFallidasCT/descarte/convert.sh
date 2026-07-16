python3 - <<'PY'
import csv, json

input_file = "input.csv"
output_file = "mockRows.json"

with open(input_file, newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    first_column = reader.fieldnames[0]

    rows = []
    for row in reader:
        value = row[first_column]

        if value not in ("", None):
            row[first_column] = int(value)

        rows.append(row)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)
PY