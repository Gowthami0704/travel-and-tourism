#!/usr/bin/env python3
"""
evaluate_vendor_trust.py
Rigorous Empirical Evaluation Suite for Vendor Trust & Fraud Detection in Tamil Nadu Tourism.

Generates a realistic multi-pattern labelled dataset with 5 fraud typologies (with normal overlap),
evaluates Isolation Forest vs Rule-Based baseline across 10 random seeds,
computes Precision, Recall, F1, FPR, Confusion Matrix (Mean ± Std),
and saves authentic results to results/vendor_eval.json.
"""

import os
import json
import time
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')
os.makedirs(RESULTS_DIR, exist_ok=True)
OUTPUT_JSON = os.path.join(RESULTS_DIR, 'vendor_eval.json')

FEATURE_NAMES = [
    'avg_price',
    'price_deviation',
    'total_bookings',
    'cancellation_rate',
    'avg_review_rating',
    'negative_review_percentage',
    'kyc_status',
    'account_age_days',
    'response_time_avg',
    'refund_requests_count',
    'complaint_count'
]

def generate_synthetic_dataset(n_samples=1200, fraud_ratio=0.18, seed=42):
    """
    Generates realistic normal tourism operators and 5 distinct fraud typologies
    with intentional feature overlap to simulate authentic edge conditions.
    """
    np.random.seed(seed)
    n_fraud = int(n_samples * fraud_ratio)
    n_normal = n_samples - n_fraud

    # 1. Normal Vendors (Genuine local taxi fleets, homestays, tour guides)
    norm_price = np.random.normal(loc=1800, scale=450, size=n_normal).clip(600, 5500)
    norm_dev = np.random.normal(loc=0.04, scale=0.15, size=n_normal).clip(-0.35, 0.40)
    norm_bookings = np.random.geometric(p=0.03, size=n_normal).clip(5, 300)
    norm_cancel = np.random.beta(a=1.5, b=25, size=n_normal).clip(0.0, 0.12)
    norm_rating = np.random.normal(loc=4.5, scale=0.35, size=n_normal).clip(3.6, 5.0)
    norm_neg_pct = np.random.beta(a=1.0, b=30, size=n_normal).clip(0.0, 0.08)
    norm_kyc = np.random.choice([1.0, 1.0, 1.0, 0.0], size=n_normal) # 75% verified
    norm_age = np.random.uniform(45, 1200, size=n_normal)
    norm_resp = np.random.exponential(scale=20, size=n_normal).clip(3, 75) # mins
    norm_refunds = np.random.poisson(lam=0.3, size=n_normal).clip(0, 2)
    norm_complaints = np.random.poisson(lam=0.1, size=n_normal).clip(0, 1)

    X_normal = np.column_stack([
        norm_price, norm_dev, norm_bookings, norm_cancel, norm_rating,
        norm_neg_pct, norm_kyc, norm_age, norm_resp, norm_refunds, norm_complaints
    ])
    y_normal = np.zeros(n_normal, dtype=int) # 0 = Normal

    # 2. Fraudulent Vendors divided into 5 distinct realistic patterns
    fraud_sub_n = n_fraud // 5
    remainder = n_fraud - (fraud_sub_n * 5)
    
    fraud_chunks = []

    # Pattern A: New Account + Bait-and-Switch Cheap Price
    n_a = fraud_sub_n + remainder
    a_price = np.random.uniform(200, 600, n_a)
    a_dev = np.random.uniform(-0.80, -0.45, n_a)
    a_bookings = np.random.randint(0, 4, n_a)
    a_cancel = np.random.uniform(0.10, 0.40, n_a)
    a_rating = np.random.uniform(3.0, 4.8, n_a) # may have fake high rating
    a_neg_pct = np.random.uniform(0.05, 0.25, n_a)
    a_kyc = np.zeros(n_a)
    a_age = np.random.uniform(1, 14, n_a)
    a_resp = np.random.uniform(60, 400, n_a)
    a_refunds = np.random.randint(1, 4, n_a)
    a_complaints = np.random.randint(1, 3, n_a)
    fraud_chunks.append(np.column_stack([a_price, a_dev, a_bookings, a_cancel, a_rating, a_neg_pct, a_kyc, a_age, a_resp, a_refunds, a_complaints]))

    # Pattern B: Review Burst / Sybil Farm (Fabricated ratings + delayed response)
    n_b = fraud_sub_n
    b_price = np.random.uniform(1500, 2800, n_b)
    b_dev = np.random.uniform(-0.15, 0.20, n_b)
    b_bookings = np.random.randint(3, 15, n_b)
    b_cancel = np.random.uniform(0.15, 0.35, n_b)
    b_rating = np.random.uniform(4.85, 5.0, n_b) # unnaturally high rating
    b_neg_pct = np.random.uniform(0.0, 0.02, n_b)
    b_kyc = np.random.choice([0.0, 1.0], p=[0.7, 0.3], size=n_b)
    b_age = np.random.uniform(10, 35, n_b) # young account with sudden 5-star burst
    b_resp = np.random.uniform(180, 800, n_b)
    b_refunds = np.random.randint(2, 6, n_b)
    b_complaints = np.random.randint(2, 5, n_b)
    fraud_chunks.append(np.column_stack([b_price, b_dev, b_bookings, b_cancel, b_rating, b_neg_pct, b_kyc, b_age, b_resp, b_refunds, b_complaints]))

    # Pattern C: Unverified + Aggressive Price Gouging (Tourist exploitation)
    n_c = fraud_sub_n
    c_price = np.random.uniform(4200, 9500, n_c)
    c_dev = np.random.uniform(0.75, 2.5, n_c)
    c_bookings = np.random.randint(1, 20, n_c)
    c_cancel = np.random.uniform(0.20, 0.50, n_c)
    c_rating = np.random.uniform(2.2, 3.7, n_c)
    c_neg_pct = np.random.uniform(0.20, 0.55, n_c)
    c_kyc = np.zeros(n_c)
    c_age = np.random.uniform(20, 180, n_c)
    c_resp = np.random.uniform(90, 600, n_c)
    c_refunds = np.random.randint(3, 8, n_c)
    c_complaints = np.random.randint(2, 6, n_c)
    fraud_chunks.append(np.column_stack([c_price, c_dev, c_bookings, c_cancel, c_rating, c_neg_pct, c_kyc, c_age, c_resp, c_refunds, c_complaints]))

    # Pattern D: High Cancellation & Fraudulent Refund Default
    n_d = fraud_sub_n
    d_price = np.random.uniform(1600, 3200, n_d)
    d_dev = np.random.uniform(0.10, 0.40, n_d)
    d_bookings = np.random.randint(15, 60, n_d)
    d_cancel = np.random.uniform(0.40, 0.85, n_d)
    d_rating = np.random.uniform(1.8, 3.2, n_d)
    d_neg_pct = np.random.uniform(0.35, 0.70, n_d)
    d_kyc = np.random.choice([0.0, 1.0], p=[0.5, 0.5], size=n_d)
    d_age = np.random.uniform(60, 300, n_d)
    d_resp = np.random.uniform(300, 1200, n_d)
    d_refunds = np.random.randint(6, 16, n_d)
    d_complaints = np.random.randint(4, 11, n_d)
    fraud_chunks.append(np.column_stack([d_price, d_dev, d_bookings, d_cancel, d_rating, d_neg_pct, d_kyc, d_age, d_resp, d_refunds, d_complaints]))

    # Pattern E: Subtle Overlapping Edge Mix (Hard borderline cases)
    n_e = fraud_sub_n
    e_price = np.random.uniform(1400, 2600, n_e)
    e_dev = np.random.uniform(0.25, 0.45, n_e)
    e_bookings = np.random.randint(8, 30, n_e)
    e_cancel = np.random.uniform(0.12, 0.22, n_e)
    e_rating = np.random.uniform(3.5, 3.9, n_e) # borderline rating
    e_neg_pct = np.random.uniform(0.08, 0.16, n_e)
    e_kyc = np.random.choice([0.0, 1.0], p=[0.4, 0.6], size=n_e)
    e_age = np.random.uniform(30, 150, n_e)
    e_resp = np.random.uniform(45, 150, n_e)
    e_refunds = np.random.choice([1, 2, 3], size=n_e)
    e_complaints = np.random.choice([1, 2], size=n_e)
    fraud_chunks.append(np.column_stack([e_price, e_dev, e_bookings, e_cancel, e_rating, e_neg_pct, e_kyc, e_age, e_resp, e_refunds, e_complaints]))

    X_fraud = np.vstack(fraud_chunks)
    y_fraud = np.ones(n_fraud, dtype=int) # 1 = Fraud / Anomaly

    X = np.vstack([X_normal, X_fraud])
    y = np.concatenate([y_normal, y_fraud])

    # Shuffle
    indices = np.arange(len(y))
    np.random.shuffle(indices)
    return X[indices], y[indices]

def rule_based_classifier(X):
    """
    Deterministic baseline heuristic rule classifier:
    Flags if (unverified & high price dev) OR (cancel > 30%) OR (complaints >= 3)
    """
    preds = []
    for row in X:
        dev = abs(row[1])
        cancel = row[3]
        kyc = row[6]
        complaints = row[10]
        
        is_flagged = False
        if (kyc == 0.0 and dev > 0.50):
            is_flagged = True
        elif cancel > 0.30:
            is_flagged = True
        elif complaints >= 3:
            is_flagged = True
        preds.append(1 if is_flagged else 0)
    return np.array(preds)

def run_multi_seed_evaluation(seeds=(42, 101, 202, 303, 404, 505, 606, 707, 808, 909)):
    print(f"[*] Running 10-Seed Empirical Evaluation for Isolation Forest vs Rule-Based Baseline...")
    
    if_metrics = {'precision': [], 'recall': [], 'f1': [], 'fpr': [], 'accuracy': []}
    rule_metrics = {'precision': [], 'recall': [], 'f1': [], 'fpr': [], 'accuracy': []}
    
    last_cm_if = None
    last_cm_rule = None

    for seed in seeds:
        X, y = generate_synthetic_dataset(n_samples=1200, fraud_ratio=0.18, seed=seed)
        
        # Train / Test split 70% / 30%
        split_idx = int(len(X) * 0.70)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        # 1. Isolation Forest Evaluation
        contamination = 0.18
        clf = IsolationForest(
            n_estimators=150,
            contamination=contamination,
            max_samples='auto',
            random_state=seed
        )
        clf.fit(X_train)
        
        # Isolation Forest outputs -1 for anomaly, 1 for normal
        raw_preds = clf.predict(X_test)
        if_preds = np.where(raw_preds == -1, 1, 0) # 1 = anomaly/fraud

        cm = confusion_matrix(y_test, if_preds, labels=[0, 1])
        tn, fp, fn, tp = cm.ravel()
        
        prec = precision_score(y_test, if_preds, zero_division=0)
        rec = recall_score(y_test, if_preds, zero_division=0)
        f1 = f1_score(y_test, if_preds, zero_division=0)
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        acc = (tp + tn) / len(y_test)

        if_metrics['precision'].append(prec)
        if_metrics['recall'].append(rec)
        if_metrics['f1'].append(f1)
        if_metrics['fpr'].append(fpr)
        if_metrics['accuracy'].append(acc)
        last_cm_if = cm

        # 2. Rule-Based Baseline Evaluation
        rule_preds = rule_based_classifier(X_test)
        cm_r = confusion_matrix(y_test, rule_preds, labels=[0, 1])
        tn_r, fp_r, fn_r, tp_r = cm_r.ravel()

        prec_r = precision_score(y_test, rule_preds, zero_division=0)
        rec_r = recall_score(y_test, rule_preds, zero_division=0)
        f1_r = f1_score(y_test, rule_preds, zero_division=0)
        fpr_r = fp_r / (fp_r + tn_r) if (fp_r + tn_r) > 0 else 0.0
        acc_r = (tp_r + tn_r) / len(y_test)

        rule_metrics['precision'].append(prec_r)
        rule_metrics['recall'].append(rec_r)
        rule_metrics['f1'].append(f1_r)
        rule_metrics['fpr'].append(fpr_r)
        rule_metrics['accuracy'].append(acc_r)
        last_cm_rule = cm_r

    summary = {
        "evaluation_title": "Multi-Seed Empirical Benchmark: Isolation Forest vs Rule-Based Baseline",
        "evaluated_at": time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
        "dataset_metadata": {
            "total_samples": 1200,
            "test_split_samples": 360,
            "fraud_ratio": 0.18,
            "features_evaluated": FEATURE_NAMES,
            "fraud_patterns": [
                "New Account + Bait-and-Switch Cheap Price",
                "Review Burst / Sybil Rating Spike",
                "Unverified KYC + Price Gouging",
                "High Cancellation & Refund Default",
                "Subtle Overlapping Edge Anomaly"
            ],
            "seeds_tested": list(seeds)
        },
        "isolation_forest_model": {
            "name": "District-Wise Multi-Feature Isolation Forest (Proposed)",
            "precision": {
                "mean": round(float(np.mean(if_metrics['precision'])), 4),
                "std": round(float(np.std(if_metrics['precision'])), 4),
                "formatted": f"{np.mean(if_metrics['precision'])*100:.1f}% ± {np.std(if_metrics['precision'])*100:.1f}%"
            },
            "recall": {
                "mean": round(float(np.mean(if_metrics['recall'])), 4),
                "std": round(float(np.std(if_metrics['recall'])), 4),
                "formatted": f"{np.mean(if_metrics['recall'])*100:.1f}% ± {np.std(if_metrics['recall'])*100:.1f}%"
            },
            "f1_score": {
                "mean": round(float(np.mean(if_metrics['f1'])), 4),
                "std": round(float(np.std(if_metrics['f1'])), 4),
                "formatted": f"{np.mean(if_metrics['f1']):.3f} ± {np.std(if_metrics['f1']):.3f}"
            },
            "fpr": {
                "mean": round(float(np.mean(if_metrics['fpr'])), 4),
                "std": round(float(np.std(if_metrics['fpr'])), 4),
                "formatted": f"{np.mean(if_metrics['fpr'])*100:.1f}% ± {np.std(if_metrics['fpr'])*100:.1f}%"
            },
            "accuracy": {
                "mean": round(float(np.mean(if_metrics['accuracy'])), 4),
                "std": round(float(np.std(if_metrics['accuracy'])), 4),
                "formatted": f"{np.mean(if_metrics['accuracy'])*100:.1f}% ± {np.std(if_metrics['accuracy'])*100:.1f}%"
            },
            "confusion_matrix_sample": {
                "true_negative": int(last_cm_if[0][0]),
                "false_positive": int(last_cm_if[0][1]),
                "false_negative": int(last_cm_if[1][0]),
                "true_positive": int(last_cm_if[1][1])
            }
        },
        "rule_based_baseline": {
            "name": "Deterministic Rule-Based Filtering (Group 1 Baseline)",
            "precision": {
                "mean": round(float(np.mean(rule_metrics['precision'])), 4),
                "std": round(float(np.std(rule_metrics['precision'])), 4),
                "formatted": f"{np.mean(rule_metrics['precision'])*100:.1f}% ± {np.std(rule_metrics['precision'])*100:.1f}%"
            },
            "recall": {
                "mean": round(float(np.mean(rule_metrics['recall'])), 4),
                "std": round(float(np.std(rule_metrics['recall'])), 4),
                "formatted": f"{np.mean(rule_metrics['recall'])*100:.1f}% ± {np.std(rule_metrics['recall'])*100:.1f}%"
            },
            "f1_score": {
                "mean": round(float(np.mean(rule_metrics['f1'])), 4),
                "std": round(float(np.std(rule_metrics['f1'])), 4),
                "formatted": f"{np.mean(rule_metrics['f1']):.3f} ± {np.std(rule_metrics['f1']):.3f}"
            },
            "fpr": {
                "mean": round(float(np.mean(rule_metrics['fpr'])), 4),
                "std": round(float(np.std(rule_metrics['fpr'])), 4),
                "formatted": f"{np.mean(rule_metrics['fpr'])*100:.1f}% ± {np.std(rule_metrics['fpr'])*100:.1f}%"
            },
            "accuracy": {
                "mean": round(float(np.mean(rule_metrics['accuracy'])), 4),
                "std": round(float(np.std(rule_metrics['accuracy'])), 4),
                "formatted": f"{np.mean(rule_metrics['accuracy'])*100:.1f}% ± {np.std(rule_metrics['accuracy'])*100:.1f}%"
            },
            "confusion_matrix_sample": {
                "true_negative": int(last_cm_rule[0][0]),
                "false_positive": int(last_cm_rule[0][1]),
                "false_negative": int(last_cm_rule[1][0]),
                "true_positive": int(last_cm_rule[1][1])
            }
        }
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

    print("\n" + "="*80)
    print(" [RESULTS] EMPIRICAL MULTI-SEED EVALUATION SAVED TO:")
    print(f" -> {OUTPUT_JSON}")
    print("="*80)
    print(f" Proposed Isolation Forest F1: {summary['isolation_forest_model']['f1_score']['formatted']}")
    print(f" Proposed Isolation Forest Precision: {summary['isolation_forest_model']['precision']['formatted']}")
    print(f" Proposed Isolation Forest Recall: {summary['isolation_forest_model']['recall']['formatted']}")
    print(f" Proposed Isolation Forest FPR: {summary['isolation_forest_model']['fpr']['formatted']}")
    print("-" * 80)
    print(f" Baseline Rule-Based F1: {summary['rule_based_baseline']['f1_score']['formatted']}")
    print(f" Baseline Rule-Based Recall: {summary['rule_based_baseline']['recall']['formatted']}")
    print("="*80 + "\n")

    return summary

if __name__ == '__main__':
    run_multi_seed_evaluation()
