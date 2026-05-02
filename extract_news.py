import xml.etree.ElementTree as ET
import json
import re
from datetime import datetime

XML_FILE = r"C:\Users\hashm\Desktop\Projects\Plan Mode\AH\Wordpress\XML\amirhashmi.wordpress.com.2026-05-02.000.xml"
JSON_FILE = r"C:\Users\hashm\Desktop\Projects\Workplace AH\data\news.json"

ns = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

def clean_html(text):
    if not text: return ""
    text = re.sub(r'\[caption[^\]]*\](.*?)\[/caption\]', r'\1', text)
    return text

def get_image_url(content):
    if not content: return None
    match = re.search(r'src=["\']([^"\']+)["\']', content)
    if match:
        url = match.group(1)
        if 'wordpress.com' in url or 'files.wordpress.com' in url:
            return url
    return None

def determine_categories(title, content, tags):
    text = (title + ' ' + content + ' ' + ' '.join(tags)).lower()
    cats = []
    if any(kw in text for kw in ['award', 'prize', 'winner', 'recognition', 'honour', 'सम्मान', 'पुरस्कार']):
        cats.append('Awards')
    if any(kw in text for kw in ['tv', 'video', 'television', 'broadcast', 'youtube', 'interview']):
        cats.append('TV/Video')
    if any(kw in text for kw in ['newspaper', 'print', 'press', 'magazine', 'article', 'अखबार', 'पत्रिका', 'दैनिक']):
        cats.append('Print Media')
    if any(kw in text for kw in ['event', 'workshop', 'conference', 'seminar', 'launch', 'कार्यक्रम', 'समारोह']):
        cats.append('Events')
    
    if not cats:
        cats.append('Online News')
        
    return cats

try:
    tree = ET.parse(XML_FILE)
    root = tree.getroot()
    channel = root.find('channel')
    
    news_items = []
    
    for item in channel.findall('item'):
        post_type = item.find('wp:post_type', ns)
        if post_type is None or post_type.text != 'post':
            continue
            
        status = item.find('wp:status', ns)
        if status is None or status.text != 'publish':
            continue
            
        tags = [cat.text for cat in item.findall('category') if cat.get('domain') == 'post_tag' and cat.text]
        title = item.find('title').text or ""
        
        content_elem = item.find('content:encoded', ns)
        content = content_elem.text if content_elem is not None else ""
        content = clean_html(content)
        
        categories = determine_categories(title, content, tags)
        
        pub_date_str = item.find('pubDate').text or ""
        formatted_date = ""
        iso_date = ""
        year = ""
        if pub_date_str:
            try:
                dt = datetime.strptime(pub_date_str[:-6], "%a, %d %b %Y %H:%M:%S")
                formatted_date = dt.strftime("%d %b %Y")
                iso_date = dt.isoformat() + "Z"
                year = dt.strftime("%Y")
            except:
                formatted_date = pub_date_str
                iso_date = pub_date_str
        
        text_only = re.sub(r'<[^>]+>', ' ', content)
        excerpt = ' '.join(text_only.split()[:30]) + '...' if text_only else ""
        
        img_url = get_image_url(content)
        if img_url:
            filename = img_url.split('/')[-1]
            img_url = f"assets/images/blog/{year}/{filename}" if year else f"assets/images/blog/{filename}"
            
        news_items.append({
            "id": item.find('wp:post_id', ns).text if item.find('wp:post_id', ns) is not None else "",
            "title": title,
            "date": iso_date,
            "formattedDate": formatted_date,
            "categories": categories,
            "excerpt": excerpt,
            "content": content,
            "featuredImage": img_url
        })
        
    news_items.sort(key=lambda x: x["date"], reverse=True)
    
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump({"news": news_items}, f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(news_items)} news items to {JSON_FILE}")
except Exception as e:
    print(f"Error: {e}")
