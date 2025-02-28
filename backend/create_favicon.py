from PIL import Image, ImageDraw, ImageFont
import os

# Create a directory for static files if it doesn't exist
os.makedirs('static', exist_ok=True)

# Set the size of the favicon
size = 256

# Create a new image with a transparent background
image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Define colors
background_color = (52, 152, 219)  # Blue
bubble_color = (41, 128, 185)      # Darker blue
highlight_color = (236, 240, 241)  # Light gray

# Draw a rounded rectangle for the background
draw.rounded_rectangle([(0, 0), (size, size)], radius=size//5, fill=background_color)

# Draw a chat bubble
bubble_margin = size // 6
bubble_width = size - (bubble_margin * 2)
bubble_height = size // 2
bubble_x = bubble_margin
bubble_y = bubble_margin

# Draw the main chat bubble
draw.rounded_rectangle(
    [(bubble_x, bubble_y), (bubble_x + bubble_width, bubble_y + bubble_height)],
    radius=bubble_height // 4,
    fill=bubble_color
)

# Draw three dots to represent AI chat
dot_radius = size // 20
dot_spacing = size // 10
dot_y = bubble_y + (bubble_height // 2)
dot_start_x = bubble_x + (bubble_width // 2) - dot_spacing

# Draw three dots in different colors to represent different AI providers
provider_colors = [(231, 76, 60), (46, 204, 113), (241, 196, 15)]  # Red, Green, Yellow
for i, color in enumerate(provider_colors):
    dot_x = dot_start_x + (i * dot_spacing)
    draw.ellipse(
        [(dot_x - dot_radius, dot_y - dot_radius), 
         (dot_x + dot_radius, dot_y + dot_radius)],
        fill=color
    )

# Add a small triangle at the bottom of the bubble to make it look like a chat bubble
triangle_size = size // 12
triangle_points = [
    (bubble_x + bubble_width // 4, bubble_y + bubble_height),
    (bubble_x + bubble_width // 4 - triangle_size, bubble_y + bubble_height + triangle_size),
    (bubble_x + bubble_width // 4 + triangle_size, bubble_y + bubble_height + triangle_size)
]
draw.polygon(triangle_points, fill=bubble_color)

# Resize the image to standard favicon sizes
favicon_sizes = [16, 32, 48, 64, 128, 256]
favicon_images = []

for favicon_size in favicon_sizes:
    favicon_images.append(image.resize((favicon_size, favicon_size), Image.Resampling.LANCZOS))

# Save as .ico file with multiple sizes
favicon_images[0].save(
    'static/favicon.ico',
    format='ICO',
    sizes=[(size, size) for size in favicon_sizes],
    append_images=favicon_images[1:]
)

# Also save as PNG for modern browsers
image.save('static/favicon.png', format='PNG')

print("Favicon created successfully in the static directory!") 