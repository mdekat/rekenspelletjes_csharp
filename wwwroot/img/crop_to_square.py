from PIL import Image
import os

# Directory containing images
image_dir = r'd:\Sandbox - spelletjes\img'

# Process each image
for filename in os.listdir(image_dir):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        filepath = os.path.join(image_dir, filename)
        with Image.open(filepath) as img:
            width, height = img.size
            if width == height:
                continue  # Already square
            # Determine crop size
            size = min(width, height)
            # Crop to center
            left = (width - size) // 2
            top = (height - size) // 2
            right = left + size
            bottom = top + size
            cropped_img = img.crop((left, top, right, bottom))
            # Save with new name
            name, ext = os.path.splitext(filename)
            new_filename = f"{name}_square{ext}"
            new_filepath = os.path.join(image_dir, new_filename)
            cropped_img.save(new_filepath)
            print(f"Processed {filename} -> {new_filename}")