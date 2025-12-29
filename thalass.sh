cd config/spawnbiomeutility

SRC="BiomeMobWeight.csv"   # or your big csv
cp -v "$SRC" "$SRC.bak"

python3 - <<'PY'
import csv, pathlib

src = pathlib.Path("BiomeMobWeight.csv")  # change if needed
dst = src.with_suffix(".csv.tmp")

factor = 10
only_classifications = {"WATER_CREATURE","UNDERGROUND_WATER_CREATURE"}  # set to None to hit all

changed = 0
total = 0

with src.open(newline="") as f_in, dst.open("w", newline="") as f_out:
    r = csv.reader(f_in, skipinitialspace=True)
    w = csv.writer(f_out)
    for row in r:
        if not row:
            w.writerow(row); continue
        # Expect 8 columns. If not, pass through.
        if len(row) < 8:
            w.writerow(row); continue

        total += 1
        line, biome_cat, biome_id, classification, ent, weight, ming, maxg = row[:8]

        is_ocean = (biome_cat.strip() == "ocean") or ("ocean" in biome_id)
        is_thal = ent.strip().startswith("thalassophobia:")

        if only_classifications is None:
            class_ok = True
        else:
            class_ok = classification.strip() in only_classifications

        if is_ocean and is_thal and class_ok:
            try:
                new_w = int(float(weight)) * factor
                row[5] = str(new_w)
                changed += 1
            except ValueError:
                pass

        w.writerow(row)

dst.replace(src)
print(f"Updated {changed} rows out of {total}. Backup at {src}.bak")
PY

