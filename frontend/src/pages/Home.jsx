import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FoodCard from "../components/FoodCard";
import SafeImage from "../components/SafeImage";
import { ErrorBox, Loading } from "../components/StateMessages";
import { getCategories, getMenu } from "../services/api";
import { getErrorMessage } from "../utils/helpers";

const IMG = "https://images.unsplash.com/";
const HERO_IMAGE = `${IMG}photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=75`;

const GALLERY = [
  { src: `${IMG}photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=75`, alt: "Elegant plated dish at the restaurant" },
  { src: `${IMG}photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=75`, alt: "Warm restaurant dining room" },
  { src: `${IMG}photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=75`, alt: "Freshly prepared gourmet meal" },
  { src: `${IMG}photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=75`, alt: "Colourful dishes on a table" },
  { src: `${IMG}photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=75`, alt: "Healthy fresh food bowl" },
  { src: `${IMG}photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=75`, alt: "Fresh salad with vegetables" },
];

const WHY_US = [
  { title: "Fresh Ingredients", text: "Vegetables and spices bought fresh every morning." },
  { title: "Fast Delivery", text: "Hot food at your door, usually within 40 minutes." },
  { title: "Expert Chefs", text: "Recipes perfected over many years of cooking." },
  { title: "Hygiene First", text: "Clean kitchen, safe packaging, careful handling." },
];

const REVIEWS = [
  { name: "Aarti K.", text: "The butter chicken was creamy and perfectly spiced. Delivery was quick and the food was still hot!" },
  { name: "Rohan P.", text: "Beautiful ambience and the paneer tikka is the best I have had in Pune. Highly recommended." },
  { name: "Neha S.", text: "Ordering online was so easy. I could track my order and it arrived exactly on time." },
];

function Home() {
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [popularResponse, categoryResponse] = await Promise.all([getMenu({ popular: true }), getCategories()]);
      setPopular(popularResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(15,12,10,0.65), rgba(15,12,10,0.8)), url(${HERO_IMAGE})` }}>
        <div className="container hero-content">
          <p className="eyebrow">Fine dining · Delivery · Takeaway</p>
          <h1>Spice Route</h1>
          <p className="hero-tagline">Where every dish tells a story of spice, tradition and love.</p>
          <p className="hero-desc">Order your favourite dishes online and enjoy restaurant-quality food at home, at the counter or at our table.</p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-gold btn-large">Order Now</Link>
            <Link to="/menu" className="btn btn-outline btn-large">Explore Menu</Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="page-section" id="about">
        <div className="container about-grid">
          <SafeImage src={`${IMG}photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=75`} alt="Inside the Spice Route restaurant" className="about-image" />
          <div>
            <p className="eyebrow">Our Story</p>
            <h2>A Family Kitchen with a Fine-Dining Soul</h2>
            <p>Since 2012, Spice Route has served food made the slow way: hand-ground masalas, fresh produce and recipes passed down through generations.</p>
            <p>Whether you dine with us or order at home, we want every plate to feel like a celebration.</p>
          </div>
        </div>
      </section>

      {/* Popular dishes */}
      <section className="page-section dark-section">
        <div className="container">
          <p className="eyebrow center-text">Chef's Choice</p>
          <h2 className="center-text">Signature Dishes</h2>
          {loading && <Loading text="Loading dishes..." />}
          {error && <ErrorBox message={error} onRetry={loadData} />}
          {!loading && !error && popular.length === 0 && <p className="center-text">No signature dishes yet.</p>}
          <div className="food-grid">
            {popular.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-section">
        <div className="container">
          <p className="eyebrow center-text">Explore</p>
          <h2 className="center-text">Food Categories</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <Link to={`/menu?category=${category.id}`} key={category.id} className="category-card">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span>View dishes →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="page-section dark-section">
        <div className="container">
          <h2 className="center-text">Why Choose Us</h2>
          <div className="why-grid">
            {WHY_US.map((item) => (
              <div className="why-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="page-section">
        <div className="container">
          <h2 className="center-text">Gallery</h2>
          <div className="gallery-grid">
            {GALLERY.map((photo) => (
              <SafeImage key={photo.src} src={photo.src} alt={photo.alt} className="gallery-image" />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="page-section dark-section">
        <div className="container">
          <h2 className="center-text">What Our Guests Say</h2>
          <div className="review-grid">
            {REVIEWS.map((review) => (
              <blockquote className="review-card" key={review.name}>
                <p className="stars" aria-label="5 out of 5 stars">★★★★★</p>
                <p>"{review.text}"</p>
                <footer>— {review.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Opening hours + location */}
      <section className="page-section">
        <div className="container info-grid">
          <div className="info-card">
            <h3>Opening Hours</h3>
            <p>Monday – Friday: 11:00 am – 11:00 pm</p>
            <p>Saturday – Sunday: 10:00 am – 12:00 am</p>
          </div>
          <div className="info-card">
            <h3>Location & Contact</h3>
            <p>12 MG Road, Pune, Maharashtra 411001</p>
            <p>Phone: +91 98765 43210</p>
            <p>Email: hello@spiceroute.example</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
