from PIL import Image, ImageDraw

image_path = "data/splits/train/images/synth_ghost_net_00433.png"
label_path = "data/splits/train/labels/synth_ghost_net_00433.txt"

classes = [
    "crab_pot",
    "submarine_pipeline",
    "shipwreck",
    "ghost_net",
    "mine_cylinder"
]

# Open image
image = Image.open(image_path).convert("RGB")

width, height = image.size

draw = ImageDraw.Draw(image)

# Read YOLO label
with open(label_path, "r") as file:
    for line in file:
        values = line.strip().split()

        if not values:
            continue

        class_id = int(values[0])

        x_center = float(values[1])
        y_center = float(values[2])
        box_width = float(values[3])
        box_height = float(values[4])

        # Convert normalized coordinates to pixels
        x_center *= width
        y_center *= height
        box_width *= width
        box_height *= height

        # Calculate box corners
        x1 = x_center - box_width / 2
        y1 = y_center - box_height / 2

        x2 = x_center + box_width / 2
        y2 = y_center + box_height / 2

        # Draw bounding box
        draw.rectangle(
            [x1, y1, x2, y2],
            outline="red",
            width=3
        )

        # Add class name
        label = classes[class_id]

        draw.text(
            (x1, y1 - 20),
            label,
            fill="red"
        )

# Save result
output_path = "annotated_ghost_net.png"

image.save(output_path)

print(f"Image size: {width} x {height}")
print(f"Annotated image saved to: {output_path}")