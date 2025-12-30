import os
import requests
import time

# 1. Create the directory
SAVE_PATH = '/Users/manishmahajan/AIProjects/FleshToHome/frontend/products'
os.makedirs(SAVE_PATH, exist_ok=True)


# 2. List of items from your seed.py
items = [
    "raw-salmon-fillet", "Tiger-prawns", "Sea-Bass-fresh", "crab-fresh", "Calamari Rings",
    "raw-chicken-breast", "Chicken Drumsticks", "Whole Farm Chicken", "chicken-wings-raw", "Chicken Mince",
    "mutton-curry-cuts", "Boneless Lamb", "lamb-chops-raw", "Mutton Keema",   "Lamb Shank" , 
    "Wagyu Ribeye-raw", "Filet-Mignon-raw", "Newyork-Steak-raw", "T-Bone Steak" , "sirloin-steak-raw"
]
# 2. Keywords for your original 5 items per category (Total 20)
# Use specific keywords to keep the style uniform
search_queries = {
    "salmon": "raw salmon fillet",
    "prawns": "Tiger prawns",
    "sea bass": "Sea Bass fresh",
    "crab": "fresh crab",
    "squid": "Calamari Rings",


    "chicken_breast": "raw-chicken-breast",
    "chicken drumsticks": "chicken-drumsticks-raw",
    "whole chicken": "whole-farm-chicken-raw",
    "chicken wings": "chicken-wings-raw",
    "chicken mince": "ground-chicken-raw",

    "mutton": "mutton curry cuts",
    "boneless lamb": "boneless-lamb-raw",
    "lamb chops": "lamb-chops-raw",
    "mutton minced": "mutton-keema-raw",
    "lamb shank": "lamb-shank-raw",
    "wagyu": "wagyu-ribeye-raw",
    "filet mignon": "filet-mignon-raw",
    "new york steak": "newyork-steak-raw",
    "t-bone steak": "t-bone-steak-raw",
    "sirloin steak": "sirloin-steak-raw"


}

def download_uniform_images():
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    for filename, query in search_queries.items():
        # Using a higher-quality Unsplash source with specific dimensions
        # 'organic' and 'white-background' help keep the style uniform
        url = f"https://images.unsplash.com/photo-1581514373300-4b2a60b975d5?auto=format&fit=crop&w=400&q=80&q={query}"
        # Alternative stable URL (using a direct high-quality placeholder)
        url = f"https://loremflickr.com/400/400/{query},meat/all"

        print(f"Requesting image for: {query}...")
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                with open(f"{SAVE_PATH}/{filename}.jpg", 'wb') as f:
                    f.write(response.content)
                print(f"✅ Saved {filename}.jpg")
            else:
                print(f"❌ Failed {query}: Status {response.status_code}")
        except Exception as e:
            print(f"⚠️ Error downloading {query}: {e}")
        
        time.sleep(1) # Be nice to the server

if __name__ == "__main__":
    download_uniform_images()