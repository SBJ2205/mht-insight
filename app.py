from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import pickle
import os
import logging

app = Flask(__name__)
CORS(app)
app.secret_key = 'your-secret-key-change-this-in-production'

# Add custom template filters
@app.template_filter('tojson')
def tojson_filter(obj):
    import json
    return json.dumps(obj)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MLCollegeRecommender:
    def __init__(self, csv_path='public/data/colleges.csv'):
        self.csv_path = csv_path
        self.df = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.kmeans_model = None
        self.classifier = None
        self.load_data()
        self.train_models()
    
    def load_data(self):
        """Load and preprocess college data"""
        try:
            self.df = pd.read_csv(self.csv_path)
            logger.info(f"Loaded {len(self.df)} college records")
            
            # Clean and preprocess data
            self.df = self.df.dropna(subset=['college_name', 'seat_type', 'branch', 'min', 'max', 'mean'])
            
            # Create additional features
            self.df['competitiveness'] = (self.df['max'] - self.df['min']) / self.df['mean']
            self.df['cutoff_range'] = self.df['max'] - self.df['min']
            self.df['is_government'] = self.df['college_name'].str.contains(
                'government|coep|vjti|institute of technology', case=False, na=False
            ).astype(int)
            
            logger.info("Data preprocessing completed")
            
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def encode_categorical_features(self):
        """Encode categorical features"""
        categorical_features = ['seat_type', 'branch']
        
        for feature in categorical_features:
            if feature not in self.label_encoders:
                self.label_encoders[feature] = LabelEncoder()
                self.df[f'{feature}_encoded'] = self.label_encoders[feature].fit_transform(self.df[feature])
    
    def extract_features_for_colleges(self, filtered_df, user_percentile, seat_type=None, branch=None):
        """Extract features for filtered colleges only (optimized)"""
        features = []
        
        # Basic college features for filtered data
        features.extend([
            filtered_df['min'].values,
            filtered_df['max'].values,
            filtered_df['mean'].values,
            filtered_df['count'].values,
            filtered_df['competitiveness'].values,
            filtered_df['cutoff_range'].values,
            filtered_df['is_government'].values
        ])
        
        # User-specific features for filtered data
        percentile_diff = user_percentile - filtered_df['min'].values
        percentile_ratio = user_percentile / filtered_df['mean'].values
        percentile_advantage = np.maximum(0, percentile_diff)
        percentile_risk = np.maximum(0, -percentile_diff)
        
        features.extend([
            percentile_diff,
            percentile_ratio,
            percentile_advantage,
            percentile_risk
        ])
        
        # Categorical features
        if seat_type:
            seat_type_encoded = self.label_encoders['seat_type'].transform([seat_type])[0]
            features.append(np.full(len(filtered_df), seat_type_encoded))
        
        if branch:
            branch_encoded = self.label_encoders['branch'].transform([branch])[0]
            features.append(np.full(len(filtered_df), branch_encoded))
        
        return np.column_stack(features)
    
    def extract_features(self, user_percentile, seat_type=None, branch=None):
        """Extract features for ML models (for clustering)"""
        features = []
        
        # Basic college features
        features.extend([
            self.df['min'].values,
            self.df['max'].values,
            self.df['mean'].values,
            self.df['count'].values,
            self.df['competitiveness'].values,
            self.df['cutoff_range'].values,
            self.df['is_government'].values
        ])
        
        # User-specific features
        percentile_diff = user_percentile - self.df['min'].values
        percentile_ratio = user_percentile / self.df['mean'].values
        percentile_advantage = np.maximum(0, percentile_diff)
        percentile_risk = np.maximum(0, -percentile_diff)
        
        features.extend([
            percentile_diff,
            percentile_ratio,
            percentile_advantage,
            percentile_risk
        ])
        
        # Categorical features
        if seat_type:
            seat_type_encoded = self.label_encoders['seat_type'].transform([seat_type])[0]
            features.append(np.full(len(self.df), seat_type_encoded))
        
        if branch:
            branch_encoded = self.label_encoders['branch'].transform([branch])[0]
            features.append(np.full(len(self.df), branch_encoded))
        
        return np.column_stack(features)
    
    def train_models(self):
        """Train ML models"""
        try:
            self.encode_categorical_features()
            
            # Prepare features for clustering
            clustering_features = [
                self.df['min'].values,
                self.df['max'].values,
                self.df['mean'].values,
                self.df['competitiveness'].values,
                self.df['is_government'].values
            ]
            X_cluster = np.column_stack(clustering_features)
            X_cluster_scaled = self.scaler.fit_transform(X_cluster)
            
            # Train K-Means clustering
            self.kmeans_model = KMeans(n_clusters=5, random_state=42, n_init=10)
            self.df['cluster'] = self.kmeans_model.fit_predict(X_cluster_scaled)
            
            logger.info("ML models trained successfully")
            
        except Exception as e:
            logger.error(f"Error training models: {e}")
            raise
    
    def get_recommendations(self, user_percentile, seat_type='ALL', branch='ALL', college_type='ALL'):
        """Get ML-powered college recommendations"""
        try:
            logger.info(f"Getting recommendations for percentile: {user_percentile}, seat_type: {seat_type}, branch: {branch}")
            # Filter data based on preferences
            filtered_df = self.df.copy()
            
            if seat_type != 'ALL':
                filtered_df = filtered_df[filtered_df['seat_type'] == seat_type]
            
            if branch != 'ALL':
                filtered_df = filtered_df[filtered_df['branch'] == branch]
            
            if college_type == 'GOVERNMENT':
                filtered_df = filtered_df[filtered_df['is_government'] == 1]
            elif college_type == 'PRIVATE':
                filtered_df = filtered_df[filtered_df['is_government'] == 0]
            
            # More flexible percentile filtering
            percentile_diff = user_percentile - filtered_df['min']
            filtered_df = filtered_df[percentile_diff >= -5]  # Allow 5 points below cutoff
            
            if len(filtered_df) == 0:
                logger.warning("No colleges found matching criteria")
                return []
            
            logger.info(f"Found {len(filtered_df)} colleges after filtering")
            
            # Extract features for filtered colleges only
            features = self.extract_features_for_colleges(filtered_df, user_percentile, seat_type, branch)
            user_features = features[0] if len(features) > 0 else None
            
            if user_features is None:
                return []
            
            # Calculate similarities for filtered colleges
            college_features = features
            similarities = cosine_similarity([user_features], college_features)[0]
            
            # Calculate additional scores
            percentile_advantages = user_percentile - filtered_df['min'].values
            quality_scores = filtered_df['mean'].values / 100
            
            # Calculate final scores
            base_scores = similarities * 50  # Scale to 0-50
            percentile_boost = np.minimum(20, np.maximum(0, percentile_advantages) * 2)
            quality_boost = np.minimum(10, (filtered_df['mean'].values - 80) / 2)
            
            final_scores = base_scores + percentile_boost + quality_boost
            final_scores = np.minimum(100, final_scores)
            
            # Classify colleges
            classifications = []
            for advantage in percentile_advantages:
                if advantage >= 5:
                    classifications.append('SAFE')
                elif advantage >= -2:
                    classifications.append('MODERATE')
                else:
                    classifications.append('AMBITIOUS')
            
            # Calculate admission probabilities
            probabilities = []
            for advantage, competitiveness in zip(percentile_advantages, filtered_df['competitiveness'].values):
                if advantage > 0:
                    prob = min(0.95, 0.5 + (advantage / 20) * 0.4)
                else:
                    prob = max(0.05, 0.5 + (advantage / 10) * 0.45)
                
                # Adjust based on competitiveness
                if competitiveness < 0.1:
                    prob *= 0.8
                
                probabilities.append(max(0.01, min(0.99, prob)))
            
            # Create results
            results = []
            for i, (idx, row) in enumerate(filtered_df.iterrows()):
                results.append({
                    'college_name': row['college_name'],
                    'score_type': row['score_type'],
                    'seat_type': row['seat_type'],
                    'branch': row['branch'],
                    'sum': row['sum'],
                    'count': row['count'],
                    'max': row['max'],
                    'min': row['min'],
                    'mean': row['mean'],
                    'max-min': row['max-min'],
                    'max-mean': row['max-mean'],
                    'fitScore': int(final_scores[i]),
                    'isRecommended': percentile_advantages.iloc[i] >= 0 and percentile_advantages.iloc[i] <= 10,
                    'mlScore': similarities[i],
                    'admissionProbability': int(probabilities[i] * 100),
                    'classification': classifications[i],
                    'cluster': row['cluster']
                })
            
            # Sort by score
            results.sort(key=lambda x: x['fitScore'], reverse=True)
            
            return results[:100]  # Limit to top 100
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            # Fallback to simple filtering if ML fails
            return self.get_simple_recommendations(user_percentile, seat_type, branch, college_type)
    
    def get_simple_recommendations(self, user_percentile, seat_type='ALL', branch='ALL', college_type='ALL'):
        """Simple fallback recommendations without ML"""
        try:
            logger.info("Using simple fallback recommendations")
            
            # Filter data based on preferences
            filtered_df = self.df.copy()
            
            if seat_type != 'ALL':
                filtered_df = filtered_df[filtered_df['seat_type'] == seat_type]
            
            if branch != 'ALL':
                filtered_df = filtered_df[filtered_df['branch'] == branch]
            
            if college_type == 'GOVERNMENT':
                filtered_df = filtered_df[filtered_df['is_government'] == 1]
            elif college_type == 'PRIVATE':
                filtered_df = filtered_df[filtered_df['is_government'] == 0]
            
            # Simple percentile filtering
            percentile_diff = user_percentile - filtered_df['min']
            filtered_df = filtered_df[percentile_diff >= -5]
            
            if len(filtered_df) == 0:
                return []
            
            # Simple scoring
            results = []
            for idx, row in filtered_df.iterrows():
                percentile_advantage = user_percentile - row['min']
                
                # Simple score calculation
                base_score = 50
                if percentile_advantage > 0:
                    score = min(100, base_score + percentile_advantage * 3)
                else:
                    score = max(0, base_score + percentile_advantage * 5)
                
                # Classification
                if percentile_advantage >= 5:
                    classification = 'SAFE'
                elif percentile_advantage >= -2:
                    classification = 'MODERATE'
                else:
                    classification = 'AMBITIOUS'
                
                # Simple probability
                if percentile_advantage > 0:
                    probability = min(95, 50 + percentile_advantage * 4)
                else:
                    probability = max(5, 50 + percentile_advantage * 10)
                
                results.append({
                    'college_name': row['college_name'],
                    'score_type': row['score_type'],
                    'seat_type': row['seat_type'],
                    'branch': row['branch'],
                    'sum': row['sum'],
                    'count': row['count'],
                    'max': row['max'],
                    'min': row['min'],
                    'mean': row['mean'],
                    'max-min': row['max-min'],
                    'max-mean': row['max-mean'],
                    'fitScore': int(score),
                    'isRecommended': percentile_advantage >= 0 and percentile_advantage <= 10,
                    'mlScore': 0.5,  # Default ML score
                    'admissionProbability': int(probability),
                    'classification': classification,
                    'cluster': 0  # Default cluster
                })
            
            # Sort by score
            results.sort(key=lambda x: x['fitScore'], reverse=True)
            return results[:100]
            
        except Exception as e:
            logger.error(f"Error in simple recommendations: {e}")
            return []
    
    def get_ml_insights(self, recommendations):
        """Get ML insights for recommendations"""
        if not recommendations:
            return {
                'totalRecommendations': 0,
                'safeChoices': 0,
                'moderateChoices': 0,
                'ambitiousChoices': 0,
                'averageAdmissionProbability': 0,
                'topClusters': []
            }
        
        df_rec = pd.DataFrame(recommendations)
        
        safe_count = len(df_rec[df_rec['classification'] == 'SAFE'])
        moderate_count = len(df_rec[df_rec['classification'] == 'MODERATE'])
        ambitious_count = len(df_rec[df_rec['classification'] == 'AMBITIOUS'])
        
        avg_probability = df_rec['admissionProbability'].mean()
        
        # Get top clusters
        cluster_counts = df_rec['cluster'].value_counts().head(3)
        top_clusters = []
        
        for cluster_id, count in cluster_counts.items():
            cluster_colleges = df_rec[df_rec['cluster'] == cluster_id]
            avg_mean = cluster_colleges['mean'].mean()
            
            if avg_mean > 95:
                description = f"High-demand colleges"
            elif avg_mean > 90:
                description = f"Competitive colleges"
            elif avg_mean > 85:
                description = f"Moderate colleges"
            else:
                description = f"Accessible colleges"
            
            top_clusters.append({
                'cluster': int(cluster_id),
                'colleges': cluster_colleges['college_name'].tolist(),
                'description': description
            })
        
        return {
            'totalRecommendations': len(recommendations),
            'safeChoices': safe_count,
            'moderateChoices': moderate_count,
            'ambitiousChoices': ambitious_count,
            'averageAdmissionProbability': int(avg_probability),
            'topClusters': top_clusters
        }

# Initialize the recommender
recommender = None

# Web routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        try:
            percentile = float(request.form.get('percentile', 0))
            seat_type = request.form.get('seatType', 'ALL')
            branch = request.form.get('branch', 'ALL')
            college_type = request.form.get('collegeType', 'ALL')
            
            if percentile <= 0:
                flash('Please enter a valid percentile', 'error')
                return redirect(url_for('index'))
            
            recommendations = recommender.get_recommendations(
                percentile, seat_type, branch, college_type
            )
            
            insights = recommender.get_ml_insights(recommendations)
            
            return render_template('results.html', 
                                 colleges=recommendations, 
                                 insights=insights,
                                 preferences={
                                     'percentile': percentile,
                                     'seatType': seat_type,
                                     'branch': branch,
                                     'collegeType': college_type
                                 })
            
        except Exception as e:
            logger.error(f"Error in search: {e}")
            flash('Error processing your request. Please try again.', 'error')
            return redirect(url_for('index'))
    
    return redirect(url_for('index'))

# API routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Python ML Backend is running'})

@app.route('/api/colleges', methods=['POST'])
def get_colleges():
    try:
        data = request.get_json()
        
        percentile = data.get('percentile', 0)
        seat_type = data.get('seatType', 'ALL')
        branch = data.get('branch', 'ALL')
        college_type = data.get('collegeType', 'ALL')
        
        if percentile <= 0:
            return jsonify({'error': 'Invalid percentile'}), 400
        
        recommendations = recommender.get_recommendations(
            percentile, seat_type, branch, college_type
        )
        
        insights = recommender.get_ml_insights(recommendations)
        
        return jsonify({
            'colleges': recommendations,
            'insights': insights
        })
        
    except Exception as e:
        logger.error(f"Error in get_colleges: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/colleges/all', methods=['GET'])
def get_all_colleges():
    try:
        if recommender is None:
            return jsonify({'error': 'Recommender not initialized'}), 500
        
        # Return basic college data
        colleges = recommender.df[['college_name', 'seat_type', 'branch', 'min', 'max', 'mean', 'count']].to_dict('records')
        
        return jsonify({'colleges': colleges})
        
    except Exception as e:
        logger.error(f"Error in get_all_colleges: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/seat-types', methods=['GET'])
def get_seat_types():
    try:
        if recommender is None:
            return jsonify({'error': 'Recommender not initialized'}), 500
        
        seat_types = ['ALL'] + sorted(recommender.df['seat_type'].unique().tolist())
        
        return jsonify({'seatTypes': seat_types})
        
    except Exception as e:
        logger.error(f"Error in get_seat_types: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/branches', methods=['GET'])
def get_branches():
    try:
        if recommender is None:
            return jsonify({'error': 'Recommender not initialized'}), 500
        
        branches = ['ALL'] + sorted(recommender.df['branch'].unique().tolist())
        
        return jsonify({'branches': branches})
        
    except Exception as e:
        logger.error(f"Error in get_branches: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        # Initialize recommender
        recommender = MLCollegeRecommender('public/data/colleges.csv')
        logger.info("Python ML Backend initialized successfully")
        
        # Run the app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        logger.error(f"Failed to initialize backend: {e}")
        print(f"Error: {e}")

