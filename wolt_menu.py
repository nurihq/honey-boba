import urllib.request
import json

url = "https://restaurant-api.wolt.com/v4/venues/slug/honey-boba-bubble-tea/menu"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        items = data.get('items', [])
        
        # we need 3 items
        top_items = [i for i in items if 'image' in i][:3]
        if not top_items:
            top_items = items[:3]
            
        for idx, item in enumerate(top_items):
            print(f"Item: {item.get('name')}")
            print(f"Desc: {item.get('description')}")
            img_url = item.get('image', '')
            if img_url:
                print(f"Image: {img_url}")
                try:
                    urllib.request.urlretrieve(img_url, f"assets/dish{idx+1}.png")
                    print(f"Saved to assets/dish{idx+1}.png")
                except Exception as e:
                    print(f"Error downloading image: {e}")
            print("---")
except Exception as e:
    print(f"Error: {e}")
