"""
CRM Formula Demonstrations - Triangle Problem Applied
====================================================

This demonstrates how the SAME formulas work for completely different businesses
Just like triangle formulas work for any triangle, these CRM formulas work for any business

Examples:
1. Real Estate Agency
2. SaaS Company  
3. E-commerce Store
4. Consulting Firm

Each uses the SAME formula with different variables
"""

from .crm_formulas import CRMFormulas

def demonstrate_triangle_problem():
    """
    Show how the same formula works for different business types
    Just like: Area = 0.5 * base * height works for ALL triangles
    """
    
    print("🧮 CRM FORMULA DEMONSTRATIONS")
    print("=" * 50)
    
    # ================================================================
    # EXAMPLE 1: REAL ESTATE AGENCY
    # ================================================================
    print("\n🏠 REAL ESTATE AGENCY")
    print("-" * 30)
    
    # Real estate variables
    real_estate_result = CRMFormulas.customer_lifecycle_formula(
        acquisition_stage="qualified",
        engagement_metrics={
            "property_views": 8,
            "brochure_downloads": 3,
            "email_opens": 12,
            "phone_calls": 2
        },
        conversion_events=["viewing_scheduled", "second_viewing", "offer_prepared"],
        retention_factors={
            "satisfaction_score": 8.5,
            "referral_given": True,
            "repeat_customer": False
        },
        advocacy_indicators=["testimonial_provided", "referral_given"],
        business_variables={
            "lifecycle_weights": {
                "acquisition": 0.20,  # Higher weight on acquisition
                "engagement": 0.25,
                "conversion": 0.30,   # Higher weight on conversion
                "retention": 0.15,    # Lower (one-time transactions)
                "advocacy": 0.10
            },
            "industry": "real_estate",
            "average_deal_size": 450000,
            "sales_cycle_days": 60
        }
    )
    
    print(f"Lifecycle Score: {real_estate_result['lifecycle_score']:.2f}")
    print(f"Customer Tier: {real_estate_result['customer_tier']}")
    print(f"Next Actions: {real_estate_result['next_recommended_actions']}")
    
    # ================================================================
    # EXAMPLE 2: SAAS COMPANY
    # ================================================================
    print("\n💻 SAAS COMPANY")
    print("-" * 30)
    
    # SaaS variables (same formula, different inputs)
    saas_result = CRMFormulas.customer_lifecycle_formula(
        acquisition_stage="trial",
        engagement_metrics={
            "login_frequency": 25,
            "features_used": 8,
            "email_opens": 6,
            "support_tickets": 1
        },
        conversion_events=["trial_started", "upgraded_plan", "payment_successful"],
        retention_factors={
            "satisfaction_score": 9.0,
            "usage_frequency": 28,  # Daily usage
            "churn_risk": 0.1
        },
        advocacy_indicators=["review_written", "referral_given"],
        business_variables={
            "lifecycle_weights": {
                "acquisition": 0.10,
                "engagement": 0.30,   # Higher weight on engagement
                "conversion": 0.20,
                "retention": 0.35,    # Higher weight on retention
                "advocacy": 0.05
            },
            "industry": "saas",
            "average_deal_size": 1200,
            "sales_cycle_days": 14
        }
    )
    
    print(f"Lifecycle Score: {saas_result['lifecycle_score']:.2f}")
    print(f"Customer Tier: {saas_result['customer_tier']}")
    print(f"Next Actions: {saas_result['next_recommended_actions']}")
    
    # ================================================================
    # EXAMPLE 3: E-COMMERCE STORE
    # ================================================================
    print("\n🛒 E-COMMERCE STORE")
    print("-" * 30)
    
    # E-commerce variables (same formula, different inputs)
    ecommerce_result = CRMFormulas.customer_lifecycle_formula(
        acquisition_stage="interested",
        engagement_metrics={
            "page_views": 45,
            "cart_additions": 6,
            "email_opens": 8,
            "social_interactions": 3
        },
        conversion_events=["purchase_made", "repeat_purchase"],
        retention_factors={
            "satisfaction_score": 8.0,
            "purchase_frequency": 4,
            "return_rate": 0.02
        },
        advocacy_indicators=["review_written", "social_share"],
        business_variables={
            "lifecycle_weights": {
                "acquisition": 0.15,
                "engagement": 0.25,
                "conversion": 0.35,   # Higher weight on conversion
                "retention": 0.20,
                "advocacy": 0.05
            },
            "industry": "ecommerce",
            "average_deal_size": 150,
            "sales_cycle_days": 3
        }
    )
    
    print(f"Lifecycle Score: {ecommerce_result['lifecycle_score']:.2f}")
    print(f"Customer Tier: {ecommerce_result['customer_tier']}")
    print(f"Next Actions: {ecommerce_result['next_recommended_actions']}")
    
    # ================================================================
    # EXAMPLE 4: CONSULTING FIRM
    # ================================================================
    print("\n🎯 CONSULTING FIRM")
    print("-" * 30)
    
    # Consulting variables (same formula, different inputs)
    consulting_result = CRMFormulas.customer_lifecycle_formula(
        acquisition_stage="evaluation",
        engagement_metrics={
            "proposal_requests": 2,
            "meeting_hours": 4,
            "email_exchanges": 15,
            "document_reviews": 3
        },
        conversion_events=["proposal_accepted", "contract_signed"],
        retention_factors={
            "satisfaction_score": 9.2,
            "project_renewals": 2,
            "expansion_projects": 1
        },
        advocacy_indicators=["case_study_participated", "referral_given", "testimonial_provided"],
        business_variables={
            "lifecycle_weights": {
                "acquisition": 0.25,   # Higher weight on acquisition
                "engagement": 0.30,    # Higher weight on engagement
                "conversion": 0.20,
                "retention": 0.15,
                "advocacy": 0.10
            },
            "industry": "consulting",
            "average_deal_size": 85000,
            "sales_cycle_days": 90
        }
    )
    
    print(f"Lifecycle Score: {consulting_result['lifecycle_score']:.2f}")
    print(f"Customer Tier: {consulting_result['customer_tier']}")
    print(f"Next Actions: {consulting_result['next_recommended_actions']}")

def demonstrate_sales_pipeline_formula():
    """
    Show how the same sales pipeline formula works for different businesses
    """
    
    print("\n\n📈 SALES PIPELINE FORMULA DEMONSTRATIONS")
    print("=" * 50)
    
    # ================================================================
    # REAL ESTATE PIPELINE
    # ================================================================
    print("\n🏠 REAL ESTATE PIPELINE")
    print("-" * 30)
    
    real_estate_pipeline = CRMFormulas.sales_pipeline_formula(
        pipeline_stages=["inquiry", "qualified", "viewing", "offer", "negotiation", "closing"],
        stage_probabilities={
            "inquiry": 0.30,
            "qualified": 0.60,
            "viewing": 0.75,
            "offer": 0.85,
            "negotiation": 0.90,
            "closing": 0.95
        },
        deal_value=450000,
        time_in_stage={
            "inquiry": 3,
            "qualified": 7,
            "viewing": 14,
            "offer": 21,
            "negotiation": 10,
            "closing": 5
        },
        customer_signals={
            "budget_confirmed": True,
            "decision_maker": True,
            "timeline_confirmed": True,
            "high_engagement": True
        },
        business_variables={
            "industry_multiplier": 1.2,  # Real estate premium
            "seasonality_factor": 1.1,   # Spring buying season
            "average_cycle_days": 60
        }
    )
    
    print(f"Pipeline Score: {real_estate_pipeline['pipeline_score']:.2f}")
    print(f"Conversion Probability: {real_estate_pipeline['conversion_probability']:.2f}")
    print(f"Revenue Forecast: ${real_estate_pipeline['revenue_forecast']:,.2f}")
    print(f"Recommended Actions: {real_estate_pipeline['recommended_actions']}")
    
    # ================================================================
    # SAAS PIPELINE
    # ================================================================
    print("\n💻 SAAS PIPELINE")
    print("-" * 30)
    
    saas_pipeline = CRMFormulas.sales_pipeline_formula(
        pipeline_stages=["lead", "qualified", "demo", "trial", "proposal", "negotiation", "closed"],
        stage_probabilities={
            "lead": 0.15,
            "qualified": 0.35,
            "demo": 0.55,
            "trial": 0.70,
            "proposal": 0.80,
            "negotiation": 0.85,
            "closed": 0.90
        },
        deal_value=12000,  # Annual subscription
        time_in_stage={
            "lead": 2,
            "qualified": 5,
            "demo": 3,
            "trial": 14,
            "proposal": 7,
            "negotiation": 4,
            "closed": 1
        },
        customer_signals={
            "budget_confirmed": True,
            "decision_maker": False,  # Committee decision
            "timeline_confirmed": True,
            "high_engagement": True
        },
        business_variables={
            "industry_multiplier": 1.0,
            "seasonality_factor": 0.9,  # Q4 budget constraints
            "average_cycle_days": 30
        }
    )
    
    print(f"Pipeline Score: {saas_pipeline['pipeline_score']:.2f}")
    print(f"Conversion Probability: {saas_pipeline['conversion_probability']:.2f}")
    print(f"Revenue Forecast: ${saas_pipeline['revenue_forecast']:,.2f}")
    print(f"Recommended Actions: {saas_pipeline['recommended_actions']}")

def demonstrate_communication_formula():
    """
    Show how the same communication formula works for different businesses
    """
    
    print("\n\n📧 COMMUNICATION FORMULA DEMONSTRATIONS")
    print("=" * 50)
    
    # ================================================================
    # B2B COMMUNICATION
    # ================================================================
    print("\n🏢 B2B COMMUNICATION")
    print("-" * 30)
    
    b2b_communication = CRMFormulas.communication_effectiveness_formula(
        communication_channels=["email", "phone", "linkedin", "in_person"],
        message_types={
            "email_1": "educational",
            "email_2": "promotional",
            "phone_1": "personal",
            "linkedin_1": "professional"
        },
        response_rates={
            "email": 0.12,
            "phone": 0.35,
            "linkedin": 0.08,
            "in_person": 0.85
        },
        engagement_metrics={
            "open_rate": 0.24,
            "click_rate": 0.03,
            "response_rate": 0.12
        },
        customer_preferences={
            "preferred_channels": ["email", "phone"],
            "optimal_times": {
                "email": "9:00 AM",
                "phone": "2:00 PM"
            },
            "frequency": "weekly"
        },
        business_variables={
            "communication_norms": {
                "professional_tone": True,
                "follow_up_frequency": 7,
                "preferred_day": "Tuesday"
            }
        }
    )
    
    print(f"Communication Score: {b2b_communication['communication_score']:.2f}")
    print(f"Optimal Channels: {b2b_communication['optimal_channels']}")
    print(f"Message Recommendations: {b2b_communication['message_recommendations']}")
    
    # ================================================================
    # B2C COMMUNICATION
    # ================================================================
    print("\n👥 B2C COMMUNICATION")
    print("-" * 30)
    
    b2c_communication = CRMFormulas.communication_effectiveness_formula(
        communication_channels=["email", "sms", "social", "push_notification"],
        message_types={
            "email_1": "promotional",
            "sms_1": "transactional",
            "social_1": "engaging",
            "push_1": "promotional"
        },
        response_rates={
            "email": 0.08,
            "sms": 0.25,
            "social": 0.15,
            "push_notification": 0.20
        },
        engagement_metrics={
            "open_rate": 0.18,
            "click_rate": 0.05,
            "response_rate": 0.15
        },
        customer_preferences={
            "preferred_channels": ["sms", "push_notification"],
            "optimal_times": {
                "sms": "11:00 AM",
                "push_notification": "7:00 PM"
            },
            "frequency": "daily"
        },
        business_variables={
            "communication_norms": {
                "casual_tone": True,
                "follow_up_frequency": 1,
                "preferred_day": "Friday"
            }
        }
    )
    
    print(f"Communication Score: {b2c_communication['communication_score']:.2f}")
    print(f"Optimal Channels: {b2c_communication['optimal_channels']}")
    print(f"Message Recommendations: {b2c_communication['message_recommendations']}")

if __name__ == "__main__":
    demonstrate_triangle_problem()
    demonstrate_sales_pipeline_formula()
    demonstrate_communication_formula()
    
    print("\n\n🎯 CONCLUSION")
    print("=" * 50)
    print("✅ Same formulas work for ALL businesses")
    print("✅ Just plug in different variables")
    print("✅ Universal, scalable, maintainable")
    print("✅ No hardcoded business logic")
    print("✅ Mathematical approach to CRM")
    print("\n🧮 Triangle Problem Solved! 🧮")
