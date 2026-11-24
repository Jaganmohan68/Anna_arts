import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function App() {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('anna-cart') || '[]'));
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { localStorage.setItem('anna-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); document.querySelector('#art-search')?.focus();
      }
      if (event.key === 'Escape') { setSelected(null); setDrawer(false); setCheckout(false); setSuccess(null); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  useEffect(() => {
    Promise.all([fetch(`${API}/artworks`).then(r => { if (!r.ok) throw Error(); return r.json(); }), fetch(`${API}/categories`).then(r => r.json())])
      .then(([items, cats]) => { setArtworks(items); setCategories(['All', ...cats]); setError(''); })
      .catch(() => setError('We could not reach the art collection. Check that the API is running and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => artworks.filter(a => (category === 'All' || a.category === category) && `${a.title} ${a.category} ${a.medium}`.toLowerCase().includes(search.toLowerCase())), [artworks, category, search]);
  const featured = artworks.find(a => a.is_featured) || artworks[0];
  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);
  const cartTotal = cart.reduce((n, item) => n + item.price * item.quantity, 0);

  function addToCart(artwork) {
    setCart(prev => prev.some(i => i.id === artwork.id) ? prev.map(i => i.id === artwork.id ? { ...i, quantity: Math.min(i.quantity + 1, 20) } : i) : [...prev, { ...artwork, quantity: 1 }]);
    setSelected(null); setDrawer(true);
  }
  function changeQuantity(id, amount) { setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + amount } : i).filter(i => i.quantity > 0)); }

  async function placeOrder(event) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(['customer_name', 'email', 'phone', 'address', 'city', 'postal_code', 'note'].map(key => [key, form.get(key) || null]));
    payload.items = cart.map(i => ({ artwork_id: i.id, quantity: i.quantity }));
    try {
      const response = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw Error(data.detail || 'Please check your details and try again.');
      setSuccess(data); setCart([]); setCheckout(false);
    } catch (err) { setError(err.message || 'Could not place your request. Please try again.'); }
  }

  const closeOverlays = () => { setSelected(null); setDrawer(false); setCheckout(false); setSuccess(null); };
  return <>
    <div className="announcement">A little art, a lot of heart <span>✳</span> Free shipping on orders over ₹10,000</div>
    <header className="header">
      <a className="wordmark" href="#top" aria-label="Anna Arts home">anna<span>arts</span><i>®</i></a>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`}><a href="#collection" onClick={() => setMenuOpen(false)}>Shop all</a><a href="#collection" onClick={() => setMenuOpen(false)}>Prints & originals</a><a href="#story" onClick={() => setMenuOpen(false)}>Our story</a></nav>
      <div className="header-actions"><button className="icon-button search-toggle" aria-label="Search artworks" onClick={() => document.querySelector('#art-search')?.focus()}><Search size={19}/></button><button className="cart-button" onClick={() => setDrawer(true)}><span>Bag</span><span className="cart-count">{cartCount}</span></button><button className="icon-button mobile-menu" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button></div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span className="spark">✳</span> ART MADE TO MAKE YOU FEEL</p><h1>Make room<br/>for <em>feeling.</em></h1><p className="hero-intro">Original art and little reminders to see the beauty in every day. Made by hand, with heart, by Anna.</p><a className="button button-dark" href="#collection">Explore the collection <ArrowDown size={16}/></a><div className="hero-note"><span className="note-line"></span> Thoughtfully made, just for you</div></div>
        <div className="hero-art"><div className="hero-image-wrap"><img src={featured?.image_url || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1100&q=85'} alt={featured?.title || 'Colorful original artwork'} /><div className="image-stamp">ART<br/>WITH<br/>HEART <span>✳</span></div></div><div className="art-caption"><div><b>{featured?.title || 'A little joy'}</b><span>Original artwork by Anna</span></div><span className="caption-arrow">↗</span></div><span className="hero-doodle">✳</span></div>
        <div className="hero-side-label">INDEPENDENT ARTIST · MADE WITH LOVE</div>
      </section>

      <section className="ticker" aria-label="Studio values"><div>ONE-OF-A-KIND FINDS <span>✳</span> MADE WITH HEART <span>✳</span> ART FOR YOUR EVERYDAY <span>✳</span> ONE-OF-A-KIND FINDS <span>✳</span> MADE WITH HEART <span>✳</span> ART FOR YOUR EVERYDAY <span>✳</span></div></section>

      <section className="collection section-wrap" id="collection">
        <div className="section-heading"><div><p className="eyebrow">THE GOOD STUFF</p><h2>Find your <em>piece.</em></h2></div><p className="section-subtitle">Little windows into Anna’s world.<br/>Big feelings for your walls.</p></div>
        <div className="collection-tools"><div className="filters">{categories.map(c => <button key={c} className={`filter-pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="search-box"><Search size={16}/><input id="art-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find your favorite..."/><kbd>⌘ K</kbd></label></div>
        {error && !artworks.length ? <div className="error-state"><span>✳</span><h3>The studio door is closed for a moment.</h3><p>{error}</p><button className="button button-outline" onClick={() => location.reload()}>Try again <ArrowRight size={15}/></button></div> : loading ? <div className="loading-grid">{[1,2,3,4].map(x => <div className="skeleton" key={x}/>)}</div> : <div className="art-grid">{filtered.map((art, index) => <article className={`art-card card-${index % 4}`} key={art.id}><button className="art-image" onClick={() => setSelected(art)} aria-label={`View ${art.title}`}><img src={art.image_url} alt={art.title} loading="lazy"/><span className="quick-view">Take a closer look <ArrowUpRight size={15}/></span><span className="art-tag">{art.category}</span></button><div className="art-info"><div><button className="art-title" onClick={() => setSelected(art)}>{art.title}</button><p>{art.medium}</p></div><strong>{money(art.price)}</strong></div><button className="quick-add" onClick={() => addToCart(art)}><Plus size={14}/> Add to bag</button></article>)}</div>}
        {!loading && !error && filtered.length === 0 && <div className="empty-state">Nothing on this canvas yet. Try another search.</div>}
        <div className="collection-footer"><span>Showing {filtered.length} lovely {filtered.length === 1 ? 'piece' : 'pieces'}</span><a href="#story">A note from Anna <ArrowRight size={15}/></a></div>
      </section>

      <section className="quote-band" id="story"><div className="quote-mark">“</div><blockquote>Art is how I leave little<br/>love notes for the world.</blockquote><div className="quote-bottom"><span>— ANNA, ARTIST & PROFESSIONAL DAYDREAMER</span><span className="quote-star">✳</span><span className="quote-end">Made slowly. Loved forever.</span></div></section>
      <section className="studio section-wrap"><div className="studio-image"><img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85" alt="Artist's colorful studio" loading="lazy"/><span>THE STUDIO, ON A TUESDAY</span></div><div className="studio-copy"><p className="eyebrow">A LITTLE ABOUT ME</p><h2>Hi, I’m Anna.<br/><em>I make things.</em></h2><p>I believe a home should feel like you. A little unexpected, a little imperfect, and full of things that make you smile for no particular reason.</p><p>Every piece starts at my kitchen table, usually with a very full cup of chai. I’m so glad you’re here.</p><a href="#collection" className="text-link">Come see what I’ve made <ArrowRight size={16}/></a><div className="signature">Anna<span>♡</span></div></div></section>
      <section className="newsletter"><div><p className="eyebrow">POSTCARDS FROM THE STUDIO</p><h2>Good things, in your inbox.</h2><p>New art, little stories, and the occasional cat cameo. Never noise.</p></div><form onSubmit={e => {e.preventDefault(); e.currentTarget.reset(); setSuccess({order_number:'Thanks for joining!',status:'subscribed',total:0})}}><input type="email" placeholder="Your email address" required/><button aria-label="Subscribe"><ArrowRight size={18}/></button></form></section>
    </main>
    <footer><a className="wordmark" href="#top">anna<span>arts</span><i>®</i></a><span>Made with heart & a little bit of paint. © 2025 Anna Arts</span><div><a href="#collection">Shop</a><a href="#story">About</a><a href="mailto:hello@annaarts.example">Say hello</a></div></footer>

    {(drawer || selected || checkout || success) && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) closeOverlays(); }}>
      {selected && <div className="modal product-modal"><button className="close-button" onClick={() => setSelected(null)} aria-label="Close"><X/></button><img className="modal-image" src={selected.image_url} alt={selected.title}/><div className="modal-content"><span className="eyebrow">{selected.category} · BY ANNA</span><h2>{selected.title}</h2><p className="modal-medium">{selected.medium} · {selected.width_cm} × {selected.height_cm} cm</p><p>{selected.description}</p><strong className="modal-price">{money(selected.price)}</strong><button className="button button-dark full-button" onClick={() => addToCart(selected)}>Add to bag <Plus size={16}/></button><span className="shipping-note">Carefully packed and sent with love.</span></div></div>}
      {drawer && <aside className="drawer"><div className="drawer-head"><div><span className="eyebrow">YOUR LITTLE COLLECTION</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="close-button" onClick={() => setDrawer(false)} aria-label="Close bag"><X/></button></div>{cart.length ? <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image_url} alt={item.title}/><div className="cart-item-details"><b>{item.title}</b><span>{money(item.price)}</span><div className="quantity"><button onClick={() => changeQuantity(item.id,-1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id,1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => changeQuantity(item.id,-item.quantity)} aria-label="Remove item"><X size={15}/></button></div>)}</div><div className="drawer-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(cartTotal)}</strong></div><p>Shipping is sorted personally after your request.</p><button className="button button-dark full-button" onClick={() => {setDrawer(false);setCheckout(true)}}>Continue to details <ArrowRight size={16}/></button><button className="continue-shopping" onClick={() => setDrawer(false)}><ArrowLeft size={14}/> Keep looking</button></div></> : <div className="empty-cart"><div className="bag-doodle">♡</div><h3>Your bag feels a little light.</h3><p>There’s a piece of art out there with your name on it.</p><button className="button button-dark" onClick={() => setDrawer(false)}>Find your piece <ArrowRight size={16}/></button></div>}</aside>}
      {checkout && <div className="modal checkout-modal"><button className="close-button" onClick={() => setCheckout(false)} aria-label="Close"><X/></button><div className="checkout-header"><button className="back-link" onClick={() => {setCheckout(false);setDrawer(true)}}><ArrowLeft size={15}/> Back to bag</button><span className="eyebrow">ALMOST YOURS</span><h2>Where should we send<br/>your <em>little joy?</em></h2><p>Send your request and Anna will be in touch to confirm the details.</p></div><form className="checkout-form" onSubmit={placeOrder}><div className="form-grid"><label>Your name<input name="customer_name" autoComplete="name" required minLength="2" placeholder="Full name"/></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label><label>Phone number<input name="phone" type="tel" autoComplete="tel" required minLength="7" placeholder="+91 98765 43210"/></label><label className="span-two">Delivery address<input name="address" autoComplete="street-address" required minLength="8" placeholder="House, street, area"/></label><label>City<input name="city" autoComplete="address-level2" required placeholder="Your city"/></label><label>PIN / postal code<input name="postal_code" autoComplete="postal-code" required minLength="3" placeholder="000 000"/></label><label className="span-two">A note for Anna <span className="optional">(optional)</span><textarea name="note" rows="2" placeholder="Anything we should know?"/></label></div>{error && <p className="form-error">{error}</p>}<div className="checkout-summary"><span>{cartCount} {cartCount === 1 ? 'piece' : 'pieces'} · order request</span><strong>{money(cartTotal)}</strong></div><button className="button button-dark full-button" type="submit">Send order request <ArrowRight size={16}/></button><p className="no-payment">No payment is collected here. Anna will follow up to confirm your order.</p></form></div>}
      {success && <div className="modal success-modal"><button className="close-button" onClick={() => {setSuccess(null);setDrawer(false)}} aria-label="Close"><X/></button><div className="success-icon"><Check size={25}/></div><span className="eyebrow">A LITTLE JOY IS ON ITS WAY</span><h2>{success.status === 'subscribed' ? 'You’re on the list!' : 'Thank you, lovely.'}</h2><p>{success.status === 'subscribed' ? 'Watch your inbox for a note from the studio.' : 'Anna has received your order request and will be in touch soon to confirm everything.'}</p>{success.order_number !== 'Thanks for joining!' && <div className="order-reference"><span>YOUR REQUEST NUMBER</span><strong>{success.order_number}</strong><span>Request total · {money(success.total)}</span></div>}<button className="button button-dark full-button" onClick={() => setSuccess(null)}>Back to the art <ArrowRight size={16}/></button></div>}
    </div>}
  </>;
}

export default App;
