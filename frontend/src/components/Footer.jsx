import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <h3 className="logo">
            Spice<span>Route</span>
          </h3>
          <p>Authentic flavours, freshly cooked and delivered with care.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/track">Track Order</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>12 MG Road, Pune, Maharashtra 411001</p>
          <p>+91 98765 43210</p>
          <p>hello@spiceroute.example</p>
        </div>
        <div>
          <h4>Opening Hours</h4>
          <p>Mon – Fri: 11:00 am – 11:00 pm</p>
          <p>Sat – Sun: 10:00 am – 12:00 am</p>
          <Link to="/admin/login" className="staff-link">Staff login</Link>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Spice Route. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
