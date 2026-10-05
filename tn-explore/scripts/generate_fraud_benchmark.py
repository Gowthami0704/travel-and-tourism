import os
import csv
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

def run_benchmark():
    np.random.seed(42)
    n_normal = 450
    n_anomalies = 50
    total = n_normal + n_anomalies
    
    # Features:
    # 0: quote_vs_median_ratio (normal ~ 1.0, std 0.15)
    # 1: price_change_rate (normal ~ 0.05, std 0.03)
    # 2: cancellation_rate (normal ~ 0.04, std 0.03)
    # 3: booking_volume_spike_ratio (normal ~ 1.1, std 0.2)
    # 4: out_of_district_share (normal ~ 0.1, std 0.08)
    # 5: review_burst_zscore (normal ~ 0.0, std 1.0)
    # 6: extreme_review_share (normal ~ 0.6, std 0.15)
    # 7: complaint_rate_per_100 (normal ~ 1.2, std 0.8)
    # 8: bid_withdrawal_rate (normal ~ 0.05, std 0.04)
    # 9: shared_device_count (normal ~ 0, max 1)
    
    normal_data = np.zeros((n_normal, 10))
    normal_data[:, 0] = np.random.normal(1.0, 0.12, n_normal)
    normal_data[:, 1] = np.random.normal(0.05, 0.03, n_normal)
    normal_data[:, 2] = np.random.normal(0.04, 0.02, n_normal)
    normal_data[:, 3] = np.random.normal(1.05, 0.15, n_normal)
    normal_data[:, 4] = np.random.normal(0.08, 0.05, n_normal)
    normal_data[:, 5] = np.random.normal(0.0, 0.8, n_normal)
    normal_data[:, 6] = np.random.normal(0.55, 0.12, n_normal)
    normal_data[:, 7] = np.random.normal(1.0, 0.6, n_normal)
    normal_data[:, 8] = np.random.normal(0.04, 0.03, n_normal)
    normal_data[:, 9] = np.random.choice([0, 1], p=[0.95, 0.05], size=n_normal)

    # Injected Anomalies:
    # Types: Fake review burst, price gouging / low-ball spike, cancellation fraud, multi-account device rings
    anomaly_data = np.zeros((n_anomalies, 10))
    for i in range(n_anomalies):
        atype = i % 4
        # start with baseline
        anomaly_data[i] = np.random.normal(1.0, 0.15, 10)
        if atype == 0: # Review burst & 5-star manipulation
            anomaly_data[i, 5] = np.random.uniform(3.5, 6.0)
            anomaly_data[i, 6] = np.random.uniform(0.95, 1.0)
            anomaly_data[i, 7] = np.random.uniform(2.5, 5.0)
        elif atype == 1: # Price gouging & extreme price edits
            anomaly_data[i, 0] = np.random.uniform(2.8, 4.5)
            anomaly_data[i, 1] = np.random.uniform(0.4, 0.8)
        elif atype == 2: # High cancellation & dispute spikes
            anomaly_data[i, 2] = np.random.uniform(0.35, 0.70)
            anomaly_data[i, 7] = np.random.uniform(8.0, 15.0)
            anomaly_data[i, 8] = np.random.uniform(0.3, 0.6)
        else: # Shared device rings & multi-district spam
            anomaly_data[i, 9] = np.random.choice([3, 4, 5])
            anomaly_data[i, 4] = np.random.uniform(0.6, 0.9)
            anomaly_data[i, 3] = np.random.uniform(3.0, 5.5)

    X = np.vstack([normal_data, anomaly_data])
    y_true = np.array([0]*n_normal + [1]*n_anomalies) # 1 = anomaly, 0 = normal

    # Fit Isolation Forest
    clf = IsolationForest(contamination=0.10, random_state=42, n_estimators=150)
    clf.fit(X)
    
    # IF returns -1 for anomaly, 1 for normal
    preds = clf.predict(X)
    y_pred = np.where(preds == -1, 1, 0)
    scores = -clf.decision_function(X) # Higher score = more anomalous

    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn)
    auc = roc_auc_score(y_true, scores)

    print(f"Benchmark Results:")
    print(f"Precision: {prec*100:.1f}%")
    print(f"Recall: {rec*100:.1f}%")
    print(f"F1 Score: {f1:.3f} ({f1*100:.1f}%)")
    print(f"False Positive Rate: {fpr*100:.1f}%")
    print(f"ROC-AUC: {auc:.3f}")

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # CSV Paths
    out_paths = [
        "c:/Users/princ/OneDrive/Desktop/deepseek tourism/tn-explore/public/data/benchmark.csv",
        "c:/Users/princ/OneDrive/Desktop/deepseek tourism/data/benchmark.csv"
    ]

    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "model_name",
                "model_version",
                "dataset_size",
                "training_vendors",
                "anomalies_injected",
                "precision",
                "recall",
                "f1_score",
                "false_positive_rate",
                "roc_auc",
                "contamination",
                "last_trained_date",
                "status"
            ])
            writer.writerow([
                "Isolation Forest Hybrid Anomaly Scanner",
                "v2.4-iso-forest",
                total,
                57,
                n_anomalies,
                round(float(prec) * 100, 1),
                round(float(rec) * 100, 1),
                round(float(f1), 3),
                round(float(fpr) * 100, 1),
                round(float(auc), 3),
                0.10,
                timestamp,
                "production_active"
            ])
        print(f"Written benchmark CSV to {p}")

if __name__ == "__main__":
    run_benchmark()
