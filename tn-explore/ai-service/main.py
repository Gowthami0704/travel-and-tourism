from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="TN Explore — Vendor Trust & Fraud Scoring Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
model_path = os.path.join(os.path.dirname(__file__), 'isolation_forest.pkl')
if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
    except Exception as e:
        print(f"Notice: Could not load scikit-learn model ({e}). Using intelligent heuristic engine.")
        model = None

class VendorFeatures(BaseModel):
    vendor_age_days: int
    listing_count: int
    avg_rating: float
    review_velocity: float
    price_deviation: float
    complaint_count: int

@app.get("/")
def root():
    return {"status": "online", "model_loaded": model is not None, "service": "TN Explore Isolation Forest API"}

@app.post("/predict-trust")
def predict(f: VendorFeatures):
    if model is None:
        # Fallback heuristic
        score = 0.85
        if f.vendor_age_days < 7 and f.price_deviation > 0.5:
            score -= 0.4
        if f.avg_rating < 3.0:
            score -= 0.3
        if f.complaint_count > 0:
            score -= f.complaint_count * 0.15
        normalized = max(0.15, min(0.99, round(score, 3)))
        flag = "safe" if normalized > 0.6 else ("suspicious" if normalized > 0.3 else "flagged")
        return {"trust_score": normalized, "flag": flag}

    X = np.array([[
        f.vendor_age_days,
        f.listing_count,
        f.avg_rating,
        f.review_velocity,
        f.price_deviation,
        f.complaint_count
    ]])

    raw_score = model.decision_function(X)[0]
    # Decision function values are typically [-0.5, 0.5] where higher is more normal
    normalized = (raw_score + 0.5) / 1.0
    normalized = max(0.05, min(0.99, round(float(normalized), 3)))
    flag = "safe" if normalized > 0.6 else ("suspicious" if normalized > 0.35 else "flagged")

    return {
        "trust_score": normalized,
        "flag": flag,
        "raw_score": float(raw_score)
    }
