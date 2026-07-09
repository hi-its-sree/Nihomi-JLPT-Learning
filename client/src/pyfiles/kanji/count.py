import json

total = 0

for f in ["n5.json","n4.json","n3.json","n2.json","n1.json"]:
    with open(f, encoding="utf-8") as fp:
        data = json.load(fp)
        print(f, len(data))
        total += len(data)

print("TOTAL =", total)