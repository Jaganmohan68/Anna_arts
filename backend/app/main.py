import secrets
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Artwork, Order, OrderItem
from .schemas import ArtworkOut, OrderCreate, OrderOut
from .seed import seed_artworks


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_artworks(db)
    yield


app = FastAPI(title="Anna Arts API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in __import__("os").getenv("CORS_ORIGINS", "http://localhost:5173").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    db.execute(select(1))
    return {"status": "ok", "service": "anna-arts-api"}


@app.get("/api/artworks", response_model=list[ArtworkOut])
def list_artworks(
    category: str | None = None,
    featured: bool | None = None,
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    query = select(Artwork)
    if category and category.lower() != "all":
        query = query.where(Artwork.category == category)
    if featured is not None:
        query = query.where(Artwork.is_featured == featured)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(Artwork.title.ilike(term) | Artwork.category.ilike(term) | Artwork.medium.ilike(term))
    return db.scalars(query.order_by(Artwork.is_featured.desc(), Artwork.id)).all()


@app.get("/api/artworks/{slug}", response_model=ArtworkOut)
def get_artwork(slug: str, db: Session = Depends(get_db)):
    artwork = db.scalar(select(Artwork).where(Artwork.slug == slug))
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork


@app.get("/api/categories", response_model=list[str])
def categories(db: Session = Depends(get_db)):
    return db.scalars(select(Artwork.category).distinct().order_by(Artwork.category)).all()


@app.post("/api/orders", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    quantities: dict[int, int] = {}
    for line in payload.items:
        quantities[line.artwork_id] = quantities.get(line.artwork_id, 0) + line.quantity
    if any(quantity > 20 for quantity in quantities.values()):
        raise HTTPException(status_code=422, detail="Maximum quantity per artwork is 20")
    artworks = db.scalars(select(Artwork).where(Artwork.id.in_(quantities))).all()
    if len(artworks) != len(quantities):
        raise HTTPException(status_code=400, detail="One or more artworks are unavailable")
    by_id = {art.id: art for art in artworks}
    total = sum(float(by_id[item_id].price) * quantity for item_id, quantity in quantities.items())
    order = Order(
        order_number=f"AA-{secrets.token_hex(4).upper()}", customer_name=payload.customer_name.strip(),
        email=str(payload.email).lower(), phone=payload.phone.strip(), address=payload.address.strip(),
        city=payload.city.strip(), postal_code=payload.postal_code.strip(), note=payload.note,
        status="pending", total=total,
    )
    order.items = [OrderItem(artwork_id=item_id, artwork_title=by_id[item_id].title,
                             quantity=quantity, unit_price=by_id[item_id].price)
                   for item_id, quantity in quantities.items()]
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
