#!/usr/bin/env python3
"""
ابزار استخراج تصاویر و تحلیل فایل آفلاین accesssory as.fig
"""
import os
import sys
import zipfile

FIG_FILE = "accesssory as.fig"
OUTPUT_DIR = "public/images/figma-extracted"

def main():
    if not os.path.exists(FIG_FILE):
        print(f"Error: {FIG_FILE} not found.")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with zipfile.ZipFile(FIG_FILE, "r") as z:
        image_files = [f for f in z.namelist() if f.startswith("images/") and len(f) > 7]
        print(f"Found {len(image_files)} image files inside {FIG_FILE}.")

        extracted_count = 0
        for img_name in image_files:
            dest_filename = os.path.basename(img_name) + ".png"
            dest_path = os.path.join(OUTPUT_DIR, dest_filename)
            if not os.path.exists(dest_path):
                with z.open(img_name) as src, open(dest_path, "wb") as dst:
                    dst.write(src.read())
                extracted_count += 1

        print(f"Extracted {extracted_count} new images to {OUTPUT_DIR}.")

if __name__ == "__main__":
    main()
