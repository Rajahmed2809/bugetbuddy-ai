#!/usr/bin/env python3
"""Generate a simple receipt image for testing the OCR flow."""
from PIL import Image, ImageDraw, ImageFont

# Create a receipt-like image
W, H = 400, 600
img = Image.new('RGB', (W, H), '#fefefe')
draw = ImageDraw.Draw(img)

# Try to load a font
try:
    font_large = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 22)
    font_med = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 16)
    font_small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 13)
except Exception:
    font_large = font_med = font_small = ImageFont.load_default()

y = 30
# Merchant
draw.text((W//2, y), 'WHOLE FOODS MARKET', fill='#1a1a1a', font=font_large, anchor='mt')
y += 35
draw.text((W//2, y), '123 Main Street, Anytown', fill='#555', font=font_small, anchor='mt')
y += 20
draw.text((W//2, y), 'Tel: (555) 123-4567', fill='#555', font=font_small, anchor='mt')
y += 35

# Divider
draw.line([(30, y), (W-30, y)], fill='#999', width=1)
y += 20

# Date and receipt number
draw.text((30, y), 'Date: 2026-10-10', fill='#333', font=font_med)
y += 22
draw.text((30, y), 'Receipt #: 00482', fill='#333', font=font_med)
y += 25

# Divider
draw.line([(30, y), (W-30, y)], fill='#999', width=1)
y += 20

# Items
items = [
    ('Organic Bananas', '3.49'),
    ('Almond Milk', '4.29'),
    ('Sourdough Bread', '5.99'),
    ('Avocado x3', '5.97'),
    ('Cheddar Cheese', '7.49'),
]
for name, price in items:
    draw.text((30, y), name, fill='#1a1a1a', font=font_med)
    draw.text((W-30, y), price, fill='#1a1a1a', font=font_med, anchor='rt')
    y += 24

y += 10
# Divider
draw.line([(30, y), (W-30, y)], fill='#999', width=1)
y += 20

# Subtotal
draw.text((30, y), 'Subtotal', fill='#333', font=font_med)
draw.text((W-30, y), '27.23', fill='#333', font=font_med, anchor='rt')
y += 24

# Tax
draw.text((30, y), 'Tax (8.5%)', fill='#333', font=font_med)
draw.text((W-30, y), '2.31', fill='#333', font=font_med, anchor='rt')
y += 24

# Total
draw.text((30, y), 'TOTAL', fill='#1a1a1a', font=font_large)
draw.text((W-30, y), '$29.54', fill='#1a1a1a', font=font_large, anchor='rt')
y += 35

# Divider
draw.line([(30, y), (W-30, y)], fill='#999', width=1)
y += 20

draw.text((W//2, y), 'Thank you for shopping!', fill='#555', font=font_small, anchor='mt')

out_path = '/home/z/my-project/download/test-receipt.png'
img.save(out_path)
print(f'Saved test receipt to {out_path}')
