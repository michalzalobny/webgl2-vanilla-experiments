import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def random_color():
    return (np.random.randint(0, 256), np.random.randint(0, 256), np.random.randint(0, 256))

# Function to create a gradient background
def create_gradient(size, start_color, end_color):
    width, height = size
    gradient = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        blend = y / height
        color = [
            int(start_color[i] * (1 - blend) + end_color[i] * blend)
            for i in range(3)
        ]
        gradient[y, :, :] = color
    return Image.fromarray(gradient)

# Function to generate images
def generate_images(width, amount=5):
    size = (width, width)

    folder_name = "generated_images"

    # Remove the folder if it exists and create a new one
    if os.path.exists(folder_name):
        for file in os.listdir(folder_name):
            os.remove(os.path.join(folder_name, file))
        os.rmdir(folder_name)
    os.mkdir(folder_name)

    font_size = width // 2
    font = ImageFont.truetype("./Arial.ttf", font_size)
    
    for i in range(1, amount + 1):
        start_color = random_color()  # Gradient start color
        end_color = random_color()    # Gradient end color
        gradient = create_gradient(size, start_color, end_color)
        draw = ImageDraw.Draw(gradient)

        text = str(i)
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width, text_height = text_bbox[2] - text_bbox[0], text_bbox[3] - text_bbox[1]
        text_position = (
            (size[0] - text_width) // 2 - text_bbox[0],
            (size[1] - text_height) // 2 - text_bbox[1]
        )

        draw.text(text_position, text, fill="white", font=font)
        gradient.save(os.path.join(folder_name, f"{i}.jpg"), "JPEG")

# Generate the images
generate_images(400, 10)
