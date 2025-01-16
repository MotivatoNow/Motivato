import React from "react";
import './Home.css';
import '../../assets/styles/App.css';
import heroImage from "../../assets/images/whoareuspicture.jpg"; // Replace with actual image
import categoryIcon from "../../assets/images/whoareuspicture.jpg"; // Replace with actual icon/image
import serviceImage from "../../assets/images/whoareuspicture.jpg"; // Replace with actual image

const Home = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="hero_section">
        <div className="hero_content">
          <h1>Find the Perfect Talent for Your Project</h1>
          <p>Join the largest platform connecting students with companies.</p>
          <div className="hero_search">
            <input type="text" placeholder="What service are you looking for?" />
            <button>Search</button>
          </div>
        </div>
        <img src={heroImage} alt="Hero" className="hero_image" />
      </header>

      {/* Categories Section */}
      <section className="categories_section">
        <h2>Explore Categories</h2>
        <div className="categories_grid">
          {["Programming", "Design", "Writing", "Marketing"].map((category) => (
            <div className="category_card" key={category}>
              <img src={categoryIcon} alt={category} />
              <p>{category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="howitworks_section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Create a Profile</h3>
            <p>Sign up and showcase your skills.</p>
          </div>
          <div className="step">
            <h3>2. Find Opportunities</h3>
            <p>Browse projects that match your talents.</p>
          </div>
          <div className="step">
            <h3>3. Get Paid</h3>
            <p>Complete work and receive payment securely.</p>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="services_section">
        <h2>Popular Services</h2>
        <div className="services_grid">
          {[1, 2, 3, 4].map((service) => (
            <div className="service_card" key={service}>
              <img src={serviceImage} alt={`Service ${service}`} />
              <h3>Service Title</h3>
              <p>Short description of the service.</p>
              <button>Learn More</button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials_section">
        <h2>What Our Clients Say</h2>
        <div className="testimonials_grid">
          {[1, 2, 3].map((testimonial) => (
            <div className="testimonial_card" key={testimonial}>
              <p>"Fantastic platform to find skilled students!"</p>
              <h4>Client Name</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Motivato. All rights reserved.</p>
        <div className="footer_links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
