import React, { useState, useEffect, useContext } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const stripePromise = loadStripe("your_publishable_key"); // Replace with your Stripe publishable key

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    try {
      const { data } = await axios.post(
        "/api/tests/create-checkout-session",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <CardElement />
      <Button
        type="submit"
        variant="primary"
        disabled={!stripe}
        className="mt-3"
      >
        Pay ₹499 for 10 Exam Credits
      </Button>
    </form>
  );
}

function Payment() {
  const { user } = useContext(AuthContext);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await axios.get("/api/tests/payment", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCredits(res.data.examcredits);
      } catch (err) {
        console.error(err);
      }
    };
    if (user && user.user_type === "professor") {
      fetchCredits();
    }
  }, [user]);

  if (!user || user.user_type !== "professor") {
    return (
      <Container>
        <h2>Unauthorized Access</h2>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Manage Exam Credits</h2>
      <p>Current Credits: {credits}</p>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </Container>
  );
}

export default Payment;
