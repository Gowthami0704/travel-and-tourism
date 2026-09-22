import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

def train():
    np.random.seed(42)
    n_normal = 400
    n_anomalies = 100

    normal_age = np.random.uniform(30, 730, n_normal)
    normal_listings = np.random.uniform(2, 20, n_normal)
    normal_rating = np.random.uniform(3.8, 5.0, n_normal)
    normal_velocity = np.random.uniform(0.5, 5.0, n_normal)
    normal_deviation = np.random.uniform(0.0, 0.35, n_normal)
    normal_complaints = np.random.choice([0, 0, 0, 1], n_normal)

    normal_data = np.column_stack([
        normal_age, normal_listings, normal_rating, normal_velocity, normal_deviation, normal_complaints
    ])

    anom_age = np.random.uniform(1, 10, n_anomalies)
    anom_listings = np.random.uniform(1, 30, n_anomalies)
    anom_rating = np.random.uniform(1.0, 3.2, n_anomalies)
    anom_velocity = np.random.uniform(10.0, 50.0, n_anomalies)
    anom_deviation = np.random.uniform(0.7, 2.5, n_anomalies)
    anom_complaints = np.random.randint(2, 8, n_anomalies)

    anomaly_data = np.column_stack([
        anom_age, anom_listings, anom_rating, anom_velocity, anom_deviation, anom_complaints
    ])

    X = np.vstack([normal_data, anomaly_data])

    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(X)

    joblib.dump(model, 'ai-service/isolation_forest.pkl')
    print("[SUCCESS] Isolation Forest trained and saved to ai-service/isolation_forest.pkl")

if __name__ == '__main__':
    train()
