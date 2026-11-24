from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Artwork

SEED_ARTWORKS = [
    {"slug":"monsoon-garden","title":"Monsoon Garden","category":"Abstract","medium":"Acrylic on canvas","description":"A lush, color-soaked garden just after the first rain. Layered brushwork and glowing greens bring a little calm to any room.","image_url":"https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1100&q=85","price":18500,"width_cm":60,"height_cm":80,"is_featured":True},
    {"slug":"quiet-morning","title":"Quiet Morning","category":"Landscape","medium":"Oil on canvas","description":"Soft light settles over a still shoreline in this one-of-a-kind landscape, painted slowly in warm, quiet layers.","image_url":"https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1100&q=85","price":24000,"width_cm":75,"height_cm":60,"is_featured":True},
    {"slug":"terracotta-sun","title":"Terracotta Sun","category":"Abstract","medium":"Mixed media on paper","description":"An expressive study of sunlight, movement, and earthy color. Signed archival print, unframed.","image_url":"https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1100&q=85","price":4200,"width_cm":30,"height_cm":40,"is_featured":False},
    {"slug":"bloom-no-3","title":"Bloom No. 3","category":"Botanical","medium":"Watercolor on paper","description":"A loose botanical portrait inspired by flowers gathered from Anna's own garden. Original watercolor on cotton paper.","image_url":"https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1100&q=85","price":9800,"width_cm":35,"height_cm":45,"is_featured":True},
    {"slug":"blue-hour","title":"Blue Hour","category":"Landscape","medium":"Acrylic on canvas","description":"The last blue light of the day, captured in sweeping marks and a small horizon of warm gold.","image_url":"https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1100&q=85","price":16500,"width_cm":50,"height_cm":70,"is_featured":False},
    {"slug":"wildflower-study","title":"Wildflower Study","category":"Botanical","medium":"Giclée print on archival paper","description":"A fine art print from an original ink and watercolor study. Printed on beautiful textured, acid-free paper.","image_url":"https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1100&q=85","price":2800,"width_cm":30,"height_cm":40,"is_featured":False},
    {"slug":"red-earth","title":"Red Earth","category":"Abstract","medium":"Acrylic on canvas","description":"Warm mineral pigments and confident gestures evoke the red earth after a hot afternoon storm.","image_url":"https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1100&q=85","price":21000,"width_cm":70,"height_cm":70,"is_featured":False},
    {"slug":"little-things","title":"Little Things","category":"Botanical","medium":"Watercolor on paper","description":"A tender reminder to notice the small things: leaves, light, and the beauty of an ordinary day.","image_url":"https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1100&q=85","price":7600,"width_cm":28,"height_cm":36,"is_featured":False},
]


def seed_artworks(db: Session) -> None:
    if db.scalar(select(Artwork.id).limit(1)) is not None:
        return
    db.add_all([Artwork(artist="Anna", **artwork) for artwork in SEED_ARTWORKS])
    db.commit()
