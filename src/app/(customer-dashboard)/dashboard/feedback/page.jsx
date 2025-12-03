// Feedback.jsx
"use client";
import React, { useState } from "react";
import "./feedback.css";
import { Star, Send, ThumbsUp, Quote, User, Calendar } from "lucide-react";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Sample past feedback
  const pastFeedback = [
    {
      id: 1,
      rating: 5,
      comment: "Amazing service! My iPhone screen was replaced in under 2 hours. The engineer was super friendly.",
      recommend: true,
      date: "Nov 28, 2025",
      service: "iPhone 15 Pro – Screen Replacement",
    },
    {
      id: 2,
      rating: 4,
      comment: "Good experience overall. Repair took a bit longer than expected but quality is excellent.",
      recommend: true,
      date: "Nov 10, 2025",
      service: "MacBook Pro – Battery Replacement",
    },
    {
      id: 3,
      rating: 5,
      comment: "Best repair service I've used. Transparent pricing and fast pickup/delivery!",
      recommend: true,
      date: "Oct 22, 2025",
      service: "Galaxy S24 – Back Glass",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || wouldRecommend === null) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment("");
      setWouldRecommend(null);
    }, 3000);
  };

  const renderStars = (currentRating, isInteractive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={isInteractive ? 42 : 18}
        className={
          star <= (isInteractive ? hoverRating || rating : currentRating)
            ? "star filled"
            : "star"
        }
        onMouseEnter={() => isInteractive && setHoverRating(star)}
        onMouseLeave={() => isInteractive && setHoverRating(0)}
        onClick={() => isInteractive && setRating(star)}
        style={{ cursor: isInteractive ? "pointer" : "default" }}
      />
    ));
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <h1>Feedback & Reviews</h1>
        <p>We’d love to hear about your experience with TecNurx</p>
      </div>

      {/* Feedback Form */}
      <div className="feedback-form-container">
        <form className="feedback-form" onSubmit={handleSubmit}>
          <h2>How was your recent repair?</h2>

          {/* Star Rating */}
          <div className="rating-section">
            <p>Rate your experience</p>
            <div className="stars-interactive">
              {renderStars(rating, true)}
            </div>
            <span className="rating-text">
              {rating === 5 && "Amazing!"}
              {rating === 4 && "Good"}
              {rating === 3 && "Okay"}
              {rating === 2 && "Not Great"}
              {rating === 1 && "Poor"}
              {rating === 0 && "Tap a star to rate"}
            </span>
          </div>

          {/* Comments */}
          <div className="form-group">
            <label>Tell us more (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? What can we improve?"
              rows="5"
            />
          </div>

          {/* Recommend Toggle */}
          <div className="recommend-section">
            <p>Would you recommend TecNurx to a friend?</p>
            <div className="recommend-buttons">
              <button
                type="button"
                className={wouldRecommend === true ? "active yes" : ""}
                onClick={() => setWouldRecommend(true)}
              >
                <ThumbsUp size={20} />
                Yes
              </button>
              <button
                type="button"
                className={wouldRecommend === false ? "active no" : ""}
                onClick={() => setWouldRecommend(false)}
              >
                No
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="submit-feedback-btn"
            disabled={rating === 0 || wouldRecommend === null || submitted}
          >
            {submitted ? (
              <>Submitted Successfully!</>
            ) : (
              <>
                <Send size={18} />
                Submit Feedback
              </>
            )}
          </button>

          {submitted && (
            <div className="success-message">
              Thank you for your feedback! It helps us improve
            </div>
          )}
        </form>
      </div>

      {/* Previous Feedback */}
      <div className="previous-feedback">
        <h2>Your Previous Reviews</h2>
        {pastFeedback.length > 0 ? (
          <div className="feedback-list">
            {pastFeedback.map((fb) => (
              <div key={fb.id} className="feedback-card">
                <div className="feedback-header-card">
                  <div className="service-name">{fb.service}</div>
                  <div className="feedback-date">
                    <Calendar size={14} />
                    {fb.date}
                  </div>
                </div>

                <div className="feedback-rating">
                  {renderStars(fb.rating)}
                  <span className="recommend-badge">
                    {fb.recommend ? "Recommended" : "Not Recommended"}
                  </span>
                </div>

                {fb.comment && (
                  <div className="feedback-comment">
                    <Quote size={18} />
                    <p>{fb.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-feedback">You haven’t submitted any feedback yet.</p>
        )}
      </div>

      {/* Optional: Testimonials Carousel */}
      <div className="testimonials">
        <h2>What Others Are Saying</h2>
        <div className="testimonial-carousel">
          <div className="testimonial">
            <Quote size={32} className="quote-icon" />
            <p>
              "TecNurx saved my phone twice this year. Fast, reliable, and way cheaper than Apple!"
            </p>
            <div className="testimonial-author">
              <User size={20} />
              <span>Sarah K. • iPhone 14 Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;