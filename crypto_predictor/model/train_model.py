from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import joblib
import os
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier

def train(df):
    print("Starting enhanced model training...")
    
    # Drop the last few rows where Next_Close is NaN
    df = df.dropna(subset=['Next_Close'])
    
    # Define expanded feature set
    features = [
        'Close', 'Volume', 'MA14', 'MA50', 'Price_Change', 
        'RSI', 'MACD', 'MACD_Signal', 'MACD_Hist', 'Volatility'
    ]
    
    # Add additional ratio features
    # Use .loc to avoid SettingWithCopyWarning
    df.loc[:, 'RSI_Change'] = df['RSI'].diff()
    df.loc[:, 'MACD_Change'] = df['MACD'].diff()
    df.loc[:, 'MA_Ratio'] = df['MA14'] / df['MA50']
    df.loc[:, 'Price_MA14_Ratio'] = df['Close'] / df['MA14']
    
    # Add more features to the list
    additional_features = ['RSI_Change', 'MACD_Change', 'MA_Ratio', 'Price_MA14_Ratio']
    features.extend(additional_features)
    
    # Replace infinite values with NaN and then fill NaN values
    df = df.replace([np.inf, -np.inf], np.nan)
    
    # Calculate column means for filling missing values (excluding infinite and NaN)
    # This is better than filling with 0
    col_means = df[features].mean()
    
    # Fill NaN values with calculated means
    df = df.fillna(col_means)
    
    # Double-check for any remaining NaNs or infinite values
    # If any still exist, replace with appropriate values (0 or means)
    if df[features].isnull().any().any() or np.isinf(df[features]).any().any():
        print("Warning: Still found NaN or infinite values after initial cleaning. Applying final cleaning...")
        df[features] = df[features].replace([np.inf, -np.inf], np.nan)
        df[features] = df[features].fillna(0)
    
    X = df[features]
    y = df['Signal']
    
    # Ensure X has no NaN or infinite values
    X = X.replace([np.inf, -np.inf], 0)
    X = X.fillna(0)
    
    # Encode the target labels to integers
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Store the label mapping
    label_mapping = {i: label for i, label in enumerate(label_encoder.classes_)}
    print(f"Label mapping: {label_mapping}")
    
    # Create directory for saved models
    os.makedirs('model/saved', exist_ok=True)
    joblib.dump(label_encoder, 'model/saved/label_encoder.pkl')
    
    # Use time series split for better evaluation
    tscv = TimeSeriesSplit(n_splits=5)
    
    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save the scaler for prediction
    joblib.dump(scaler, 'model/saved/scaler.pkl')
    
    # Split the data using time-based ordering (keep last 20% for testing)
    split_idx = int(len(X_scaled) * 0.8)
    X_train, X_test = X_scaled[:split_idx], X_scaled[split_idx:]
    y_train, y_test = y_encoded[:split_idx], y_encoded[split_idx:]
    
    print(f"Training set size: {len(X_train)}, Test set size: {len(X_test)}")
    
    # Define models with hyperparameter tuning
    
    # 1. Random Forest with hyperparameter tuning
    print("Tuning Random Forest hyperparameters...")
    rf_param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5],
        'class_weight': [None, 'balanced']
    }
    
    rf_grid = GridSearchCV(
        RandomForestClassifier(random_state=42),
        param_grid=rf_param_grid,
        cv=tscv,
        scoring='accuracy',
        n_jobs=-1,
        verbose=1
    )
    
    rf_grid.fit(X_train, y_train)
    rf_best = rf_grid.best_estimator_
    rf_accuracy = rf_best.score(X_test, y_test)
    print(f"Random Forest Best Parameters: {rf_grid.best_params_}")
    print(f"Random Forest Best Accuracy: {rf_accuracy:.4f}")
    
    # 2. XGBoost with hyperparameter tuning
    print("Tuning XGBoost hyperparameters...")
    xgb_param_grid = {
        'n_estimators': [100, 200],
        'learning_rate': [0.01, 0.1],
        'max_depth': [3, 5, 7],
        'subsample': [0.8, 1.0],
        'colsample_bytree': [0.8, 1.0]
    }
    
    xgb_grid = GridSearchCV(
        xgb.XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='logloss'),
        param_grid=xgb_param_grid,
        cv=tscv,
        scoring='accuracy',
        n_jobs=-1,
        verbose=1
    )
    
    xgb_grid.fit(X_train, y_train)
    xgb_best = xgb_grid.best_estimator_
    xgb_accuracy = xgb_best.score(X_test, y_test)
    print(f"XGBoost Best Parameters: {xgb_grid.best_params_}")
    print(f"XGBoost Best Accuracy: {xgb_accuracy:.4f}")
    
    # 3. Gradient Boosting
    print("Tuning Gradient Boosting hyperparameters...")
    gb_param_grid = {
        'n_estimators': [100, 200],
        'learning_rate': [0.01, 0.1],
        'max_depth': [3, 5],
        'subsample': [0.8, 1.0]
    }
    
    gb_grid = GridSearchCV(
        GradientBoostingClassifier(random_state=42),
        param_grid=gb_param_grid,
        cv=tscv,
        scoring='accuracy',
        n_jobs=-1,
        verbose=1
    )
    
    gb_grid.fit(X_train, y_train)
    gb_best = gb_grid.best_estimator_
    gb_accuracy = gb_best.score(X_test, y_test)
    print(f"Gradient Boosting Best Parameters: {gb_grid.best_params_}")
    print(f"Gradient Boosting Best Accuracy: {gb_accuracy:.4f}")
    
    # 4. SVM 
    print("Training SVM model...")
    svm_model = SVC(probability=True, random_state=42)
    svm_model.fit(X_train, y_train)
    svm_accuracy = svm_model.score(X_test, y_test)
    print(f"SVM Accuracy: {svm_accuracy:.4f}")
    
    # 5. Neural Network MLP
    print("Training Neural Network model...")
    nn_model = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=500, 
                            early_stopping=True, random_state=42)
    nn_model.fit(X_train, y_train)
    nn_accuracy = nn_model.score(X_test, y_test)
    print(f"Neural Network Accuracy: {nn_accuracy:.4f}")
    
    # Create ensemble model (voting classifier)
    print("Creating ensemble model...")
    ensemble = VotingClassifier(estimators=[
        ('rf', rf_best),
        ('xgb', xgb_best),
        ('gb', gb_best),
        ('svm', svm_model),
        ('nn', nn_model)
    ], voting='soft')
    
    ensemble.fit(X_train, y_train)
    ensemble_accuracy = ensemble.score(X_test, y_test)
    print(f"Ensemble Model Accuracy: {ensemble_accuracy:.4f}")
    
    # Choose the best model based on test accuracy
    models = {
        'Random Forest': (rf_best, rf_accuracy),
        'XGBoost': (xgb_best, xgb_accuracy),
        'Gradient Boosting': (gb_best, gb_accuracy),
        'SVM': (svm_model, svm_accuracy),
        'Neural Network': (nn_model, nn_accuracy),
        'Ensemble': (ensemble, ensemble_accuracy)
    }
    
    best_model_name = max(models, key=lambda k: models[k][1])
    best_model, best_accuracy = models[best_model_name]
    
    print(f"\nBest Model: {best_model_name} with accuracy: {best_accuracy:.4f}")
    
    # Detailed evaluation of best model
    y_pred = best_model.predict(X_test)
    
    # Convert predicted numerical labels back to string labels for reporting
    y_test_decoded = label_encoder.inverse_transform(y_test)
    y_pred_decoded = label_encoder.inverse_transform(y_pred)
    
    print("\nClassification Report:")
    print(classification_report(y_test_decoded, y_pred_decoded))
    
    # Feature importance for tree-based models
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        indices = np.argsort(importances)[::-1]
        print("\nFeature Importance:")
        for i in range(len(features)):
            print(f"{features[indices[i]]}: {importances[indices[i]]:.4f}")
    
        # Plot feature importance
        plt.figure(figsize=(10, 6))
        plt.title(f"Feature Importances ({best_model_name})")
        plt.barh(range(len(indices)), importances[indices], align='center')
        plt.yticks(range(len(indices)), [features[i] for i in indices])
        plt.xlabel('Relative Importance')
        os.makedirs('reports', exist_ok=True)
        plt.savefig('reports/feature_importance.png')
    
    # Save all models separately
    model_dir = 'model/saved/candidates'
    os.makedirs(model_dir, exist_ok=True)
    for name, (model, _) in models.items():
        model_filename = os.path.join(model_dir, f"{name.lower().replace(' ', '_')}.pkl")
        joblib.dump(model, model_filename)
    
    # Save the best model
    joblib.dump(best_model, 'model/saved/best_model.pkl')
    
    # Save the feature list
    with open('model/saved/features.txt', 'w') as f:
        for feature in features:
            f.write(f"{feature}\n")
    
    # Learning curve plot
    try:
        from sklearn.model_selection import learning_curve
        
        train_sizes, train_scores, test_scores = learning_curve(
            best_model, X_scaled, y_encoded, cv=tscv, n_jobs=-1,
            train_sizes=np.linspace(0.1, 1.0, 10), scoring='accuracy'
        )
        
        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        test_mean = np.mean(test_scores, axis=1)
        test_std = np.std(test_scores, axis=1)
        
        plt.figure(figsize=(10, 6))
        plt.plot(train_sizes, train_mean, label='Training score', color='blue', marker='o')
        plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.15, color='blue')
        plt.plot(train_sizes, test_mean, label='Cross-validation score', color='green', marker='s')
        plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.15, color='green')
        plt.title('Learning Curve')
        plt.xlabel('Training Examples')
        plt.ylabel('Accuracy Score')
        plt.legend(loc='lower right')
        plt.grid(True)
        plt.savefig('reports/learning_curve.png')
    except Exception as e:
        print(f"Could not generate learning curve: {e}")
    
    return best_model
