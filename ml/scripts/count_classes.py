from pathlib import Path
from collections import Counter

labels_dir = Path("data/splits/train/labels")

class_names = {
    0: "crab_pot",
    1: "submarine_pipeline",
    2: "shipwreck",
    3: "ghost_net",
    4: "mine_cylinder"
}

counts = Counter()

for label_file in labels_dir.glob("*.txt"):
    with open(label_file, "r") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            class_id = int(line.split()[0])
            counts[class_id] += 1

print("\nTraining annotation distribution:")
print("--------------------------------")

for class_id, name in class_names.items():
    print(f"{class_id} - {name}: {counts[class_id]}")

print("--------------------------------")
print(f"Total objects: {sum(counts.values())}")