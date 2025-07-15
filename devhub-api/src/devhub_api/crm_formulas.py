"""
CRM Universal Formulas - Mathematical Approach to Business Relationships
==================================================================

This module contains universal formulas that work for ANY business, regardless of industry.
Like mathematical formulas, these work by plugging in the correct variables.

Example: Customer Lifecycle Formula
-----------------------------------
Variables: Acquisition → Engagement → Conversion → Retention → Advocacy
Formula: LC = f(A, E, C, R, Ad) where each variable can be customized per business

Triangle Problem Applied to CRM:
- Problem A: Real Estate Lead → Formula: LC(property_inquiry, viewing, offer, purchase, referral)
- Problem B: SaaS Lead → Formula: LC(signup, trial, subscription, renewal, upgrade)
- Problem C: E-commerce Lead → Formula: LC(browse, cart, purchase, repeat, review)

Same formula, different variables = Universal solution
"""

from typing import Dict, List, Any, Optional

class CRMFormulas:
    """Universal CRM formulas that work for any business"""
    
    # ====================================================================
    # FORMULA 1: CUSTOMER LIFECYCLE FORMULA
    # ====================================================================
    
    @staticmethod
    def customer_lifecycle_formula(
        acquisition_stage: str,
        engagement_metrics: Dict[str, Any],
        conversion_events: List[str],
        retention_factors: Dict[str, Any],
        advocacy_indicators: List[str],
        business_variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Universal Customer Lifecycle Formula
        
        Formula: LC = f(A, E, C, R, Ad, BV)
        Where:
        - A = Acquisition (how customer enters your business)
        - E = Engagement (how customer interacts)
        - C = Conversion (how customer becomes paying)
        - R = Retention (how customer stays)
        - Ad = Advocacy (how customer promotes you)
        - BV = Business Variables (industry-specific factors)
        
        Works for ANY business by plugging in appropriate variables
        """
        
        # Calculate lifecycle score using universal formula
        acquisition_score = CRMFormulas._calculate_stage_score(acquisition_stage)
        engagement_score = CRMFormulas._calculate_engagement_score(engagement_metrics)
        conversion_score = CRMFormulas._calculate_conversion_score(conversion_events)
        retention_score = CRMFormulas._calculate_retention_score(retention_factors)
        advocacy_score = CRMFormulas._calculate_advocacy_score(advocacy_indicators)
        
        # Apply business-specific weightings
        weights = business_variables.get('lifecycle_weights', {
            'acquisition': 0.15,
            'engagement': 0.25,
            'conversion': 0.25,
            'retention': 0.25,
            'advocacy': 0.10
        }) if business_variables else {
            'acquisition': 0.15,
            'engagement': 0.25,
            'conversion': 0.25,
            'retention': 0.25,
            'advocacy': 0.10
        }
        
        # Universal lifecycle formula
        lifecycle_score = (
            acquisition_score * weights['acquisition'] +
            engagement_score * weights['engagement'] +
            conversion_score * weights['conversion'] +
            retention_score * weights['retention'] +
            advocacy_score * weights['advocacy']
        )
        
        return {
            'lifecycle_score': lifecycle_score,
            'stage_breakdown': {
                'acquisition': acquisition_score,
                'engagement': engagement_score,
                'conversion': conversion_score,
                'retention': retention_score,
                'advocacy': advocacy_score
            },
            'next_recommended_actions': CRMFormulas._generate_next_actions(
                lifecycle_score, business_variables
            ),
            'customer_tier': CRMFormulas._determine_customer_tier(lifecycle_score)
        }
    
    # ====================================================================
    # FORMULA 2: SALES PIPELINE FORMULA
    # ====================================================================
    
    @staticmethod
    def sales_pipeline_formula(
        pipeline_stages: List[str],
        stage_probabilities: Dict[str, float],
        deal_value: float,
        time_in_stage: Dict[str, int],
        customer_signals: Dict[str, Any],
        business_variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Universal Sales Pipeline Formula
        
        Formula: SP = f(S, P, V, T, CS, BV)
        Where:
        - S = Stages (customizable pipeline stages)
        - P = Probabilities (conversion rates per stage)
        - V = Value (deal/opportunity value)
        - T = Time (velocity through pipeline)
        - CS = Customer Signals (buying indicators)
        - BV = Business Variables (industry factors)
        
        Examples:
        - B2B SaaS: ['lead', 'qualified', 'demo', 'proposal', 'negotiation', 'closed']
        - Real Estate: ['inquiry', 'viewing', 'offer', 'inspection', 'contract', 'closing']
        - E-commerce: ['browse', 'cart', 'checkout', 'payment', 'fulfillment', 'delivery']
        """
        
        # Calculate pipeline health using universal formula
        stage_velocity = CRMFormulas._calculate_stage_velocity(pipeline_stages, time_in_stage)
        conversion_probability = CRMFormulas._calculate_conversion_probability(
            stage_probabilities, customer_signals
        )
        revenue_forecast = deal_value * conversion_probability
        
        # Apply business-specific factors
        industry_multiplier = business_variables.get('industry_multiplier', 1.0) if business_variables else 1.0
        seasonality_factor = business_variables.get('seasonality_factor', 1.0) if business_variables else 1.0
        
        # Universal pipeline formula
        pipeline_score = (stage_velocity * 0.3 + conversion_probability * 0.7) * industry_multiplier * seasonality_factor
        
        return {
            'pipeline_score': pipeline_score,
            'conversion_probability': conversion_probability,
            'revenue_forecast': revenue_forecast,
            'stage_velocity': stage_velocity,
            'recommended_actions': CRMFormulas._generate_pipeline_actions(
                pipeline_score, pipeline_stages, business_variables
            ),
            'risk_factors': CRMFormulas._identify_risk_factors(time_in_stage, stage_probabilities)
        }
    
    # ====================================================================
    # FORMULA 3: COMMUNICATION EFFECTIVENESS FORMULA
    # ====================================================================
    
    @staticmethod
    def communication_effectiveness_formula(
        communication_channels: List[str],
        message_types: Dict[str, str],
        response_rates: Dict[str, float],
        engagement_metrics: Dict[str, Any],
        customer_preferences: Dict[str, Any],
        business_variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Universal Communication Effectiveness Formula
        
        Formula: CE = f(CH, MT, RR, EM, CP, BV)
        Where:
        - CH = Channels (email, phone, SMS, social, etc.)
        - MT = Message Types (promotional, educational, transactional)
        - RR = Response Rates (channel effectiveness)
        - EM = Engagement Metrics (opens, clicks, replies)
        - CP = Customer Preferences (preferred channels/timing)
        - BV = Business Variables (industry communication norms)
        
        Works for any communication strategy across any business
        """
        
        # Calculate communication effectiveness using universal formula
        channel_effectiveness = CRMFormulas._calculate_channel_effectiveness(
            communication_channels, response_rates, engagement_metrics
        )
        
        message_effectiveness = CRMFormulas._calculate_message_effectiveness(
            message_types, response_rates
        )
        
        preference_alignment = CRMFormulas._calculate_preference_alignment(
            customer_preferences, communication_channels
        )
        
        # Apply business context
        industry_norms = business_variables.get('communication_norms', {}) if business_variables else {}
        
        # Universal communication formula
        communication_score = (
            channel_effectiveness * 0.4 +
            message_effectiveness * 0.3 +
            preference_alignment * 0.3
        )
        
        return {
            'communication_score': communication_score,
            'optimal_channels': CRMFormulas._identify_optimal_channels(channel_effectiveness),
            'message_recommendations': CRMFormulas._generate_message_recommendations(
                message_effectiveness, business_variables
            ),
            'timing_optimization': CRMFormulas._optimize_communication_timing(
                customer_preferences, industry_norms
            ),
            'next_communication_plan': CRMFormulas._generate_communication_plan(
                communication_score, business_variables
            )
        }
    
    # ====================================================================
    # FORMULA 4: CUSTOMER VALUE FORMULA
    # ====================================================================
    
    @staticmethod
    def customer_value_formula(
        revenue_history: List[float],
        interaction_frequency: int,
        referral_count: int,
        support_cost: float,
        retention_probability: float,
        business_variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Universal Customer Value Formula
        
        Formula: CV = f(RH, IF, RC, SC, RP, BV)
        Where:
        - RH = Revenue History (past purchases/transactions)
        - IF = Interaction Frequency (engagement level)
        - RC = Referral Count (advocacy value)
        - SC = Support Cost (cost to serve)
        - RP = Retention Probability (likelihood to stay)
        - BV = Business Variables (industry-specific factors)
        
        Calculates universal customer value regardless of business model
        """
        
        # Calculate components using universal formulas
        revenue_value = sum(revenue_history) if revenue_history else 0
        engagement_value = interaction_frequency * business_variables.get('engagement_multiplier', 1.0) if business_variables else interaction_frequency
        referral_value = referral_count * business_variables.get('referral_value', 100) if business_variables else referral_count * 100
        
        # Universal customer value formula
        gross_value = revenue_value + engagement_value + referral_value
        net_value = gross_value - support_cost
        lifetime_value = net_value * retention_probability
        
        return {
            'customer_value': net_value,
            'lifetime_value': lifetime_value,
            'value_tier': CRMFormulas._determine_value_tier(net_value),
            'value_breakdown': {
                'revenue_value': revenue_value,
                'engagement_value': engagement_value,
                'referral_value': referral_value,
                'support_cost': support_cost
            },
            'optimization_recommendations': CRMFormulas._generate_value_optimization(
                net_value, business_variables
            )
        }
    
    # ====================================================================
    # HELPER METHODS (INTERNAL FORMULA CALCULATIONS)
    # ====================================================================
    
    @staticmethod
    def _calculate_stage_score(stage: str) -> float:
        """Calculate score for acquisition stage"""
        stage_scores = {
            'unknown': 0.1,
            'lead': 0.2,
            'qualified': 0.4,
            'interested': 0.6,
            'evaluation': 0.8,
            'ready': 1.0
        }
        return stage_scores.get(stage.lower(), 0.1)
    
    @staticmethod
    def _calculate_engagement_score(metrics: Dict[str, Any]) -> float:
        """Calculate engagement score from metrics"""
        if not metrics:
            return 0.0
        
        # Universal engagement calculation
        score = 0.0
        max_score = 1.0
        
        # Email engagement
        if 'email_opens' in metrics:
            score += min(metrics['email_opens'] / 10, 0.2)
        
        # Website engagement
        if 'page_views' in metrics:
            score += min(metrics['page_views'] / 50, 0.2)
        
        # Social engagement
        if 'social_interactions' in metrics:
            score += min(metrics['social_interactions'] / 20, 0.2)
        
        # Direct engagement
        if 'direct_interactions' in metrics:
            score += min(metrics['direct_interactions'] / 5, 0.4)
        
        return min(score, max_score)
    
    @staticmethod
    def _calculate_conversion_score(events: List[str]) -> float:
        """Calculate conversion score from events"""
        if not events:
            return 0.0
        
        conversion_values = {
            'trial_started': 0.3,
            'demo_requested': 0.4,
            'quote_requested': 0.5,
            'proposal_sent': 0.6,
            'contract_signed': 0.8,
            'payment_made': 1.0
        }
        
        return max([conversion_values.get(event.lower(), 0.1) for event in events])
    
    @staticmethod
    def _calculate_retention_score(factors: Dict[str, Any]) -> float:
        """Calculate retention score from factors"""
        if not factors:
            return 0.0
        
        score = 0.0
        
        # Satisfaction score
        if 'satisfaction_score' in factors:
            score += factors['satisfaction_score'] / 10 * 0.4
        
        # Usage frequency
        if 'usage_frequency' in factors:
            score += min(factors['usage_frequency'] / 30, 0.3)
        
        # Support interactions
        if 'support_interactions' in factors:
            score += max(0, 0.3 - factors['support_interactions'] / 20)
        
        return min(score, 1.0)
    
    @staticmethod
    def _calculate_advocacy_score(indicators: List[str]) -> float:
        """Calculate advocacy score from indicators"""
        if not indicators:
            return 0.0
        
        advocacy_values = {
            'referral_given': 0.4,
            'testimonial_provided': 0.3,
            'review_written': 0.2,
            'social_share': 0.1,
            'case_study_participated': 0.5
        }
        
        return min(sum([advocacy_values.get(indicator.lower(), 0.0) for indicator in indicators]), 1.0)
    
    @staticmethod
    def _generate_next_actions(score: float, business_vars: Optional[Dict[str, Any]]) -> List[str]:
        """Generate recommended next actions based on score"""
        if score < 0.3:
            return ['Increase engagement', 'Provide value-add content', 'Schedule follow-up']
        elif score < 0.6:
            return ['Nurture relationship', 'Provide product demo', 'Share case studies']
        else:
            return ['Convert to customer', 'Upsell opportunity', 'Request referral']
    
    @staticmethod
    def _determine_customer_tier(score: float) -> str:
        """Determine customer tier based on score"""
        if score >= 0.8:
            return 'VIP'
        elif score >= 0.6:
            return 'Gold'
        elif score >= 0.4:
            return 'Silver'
        else:
            return 'Bronze'
    
    @staticmethod
    def _calculate_stage_velocity(stages: List[str], time_in_stage: Dict[str, int]) -> float:
        """Calculate how quickly deals move through pipeline"""
        if not stages or not time_in_stage:
            return 0.0
        
        average_time = sum(time_in_stage.values()) / len(time_in_stage)
        # Velocity is inverse of time (faster = higher score)
        return 1.0 / (1.0 + average_time / 30)  # Normalize to 30-day average
    
    @staticmethod
    def _calculate_conversion_probability(probabilities: Dict[str, float], signals: Dict[str, Any]) -> float:
        """Calculate probability of conversion"""
        if not probabilities:
            return 0.0
        
        base_probability = sum(probabilities.values()) / len(probabilities)
        
        # Adjust based on customer signals
        signal_boost = 0.0
        if signals:
            if signals.get('high_engagement', False):
                signal_boost += 0.1
            if signals.get('budget_confirmed', False):
                signal_boost += 0.2
            if signals.get('decision_maker', False):
                signal_boost += 0.15
        
        return min(base_probability + signal_boost, 1.0)
    
    @staticmethod
    def _generate_pipeline_actions(score: float, stages: List[str], business_vars: Optional[Dict[str, Any]]) -> List[str]:
        """Generate pipeline-specific actions"""
        if score < 0.3:
            return ['Qualify opportunity', 'Understand needs', 'Build rapport']
        elif score < 0.6:
            return ['Present solution', 'Handle objections', 'Provide references']
        else:
            return ['Negotiate terms', 'Prepare contract', 'Close deal']
    
    @staticmethod
    def _identify_risk_factors(time_in_stage: Dict[str, int], probabilities: Dict[str, float]) -> List[str]:
        """Identify potential risks in pipeline"""
        risks: List[str] = []
        
        # Check for stalled deals
        for stage, time in time_in_stage.items():
            if time > 30:  # More than 30 days in stage
                risks.append(f'Stalled in {stage} stage')
        
        # Check for low conversion probability
        avg_probability = sum(probabilities.values()) / len(probabilities) if probabilities else 0
        if avg_probability < 0.3:
            risks.append('Low conversion probability')
        
        return risks
    
    @staticmethod
    def _calculate_channel_effectiveness(channels: List[str], response_rates: Dict[str, float], metrics: Dict[str, Any]) -> float:
        """Calculate effectiveness of communication channels"""
        if not channels or not response_rates:
            return 0.0
        
        total_effectiveness = 0.0
        for channel in channels:
            channel_rate = response_rates.get(channel, 0.0)
            total_effectiveness += channel_rate
        
        return total_effectiveness / len(channels)
    
    @staticmethod
    def _calculate_message_effectiveness(message_types: Dict[str, str], response_rates: Dict[str, float]) -> float:
        """Calculate effectiveness of message types"""
        if not message_types:
            return 0.0
        
        effectiveness_scores = {
            'promotional': 0.3,
            'educational': 0.6,
            'transactional': 0.8,
            'personal': 0.9
        }
        
        total_score = 0.0
        for msg_type in message_types.values():
            total_score += effectiveness_scores.get(msg_type.lower(), 0.1)
        
        return total_score / len(message_types)
    
    @staticmethod
    def _calculate_preference_alignment(preferences: Dict[str, Any], channels: List[str]) -> float:
        """Calculate alignment between customer preferences and communication channels"""
        if not preferences or not channels:
            return 0.0
        
        preferred_channels = preferences.get('preferred_channels', [])
        if not preferred_channels:
            return 0.5  # Neutral if no preferences
        
        alignment = 0.0
        for channel in channels:
            if channel in preferred_channels:
                alignment += 1.0
        
        return alignment / len(channels)
    
    @staticmethod
    def _identify_optimal_channels(effectiveness: float) -> List[str]:
        """Identify optimal communication channels"""
        if effectiveness > 0.7:
            return ['email', 'phone', 'in-person']
        elif effectiveness > 0.4:
            return ['email', 'phone']
        else:
            return ['email']
    
    @staticmethod
    def _generate_message_recommendations(effectiveness: float, business_vars: Optional[Dict[str, Any]]) -> List[str]:
        """Generate message recommendations"""
        if effectiveness < 0.4:
            return ['Personalize messages', 'Improve subject lines', 'Segment audience']
        else:
            return ['Maintain current approach', 'Test new variations', 'Scale successful messages']
    
    @staticmethod
    def _optimize_communication_timing(preferences: Dict[str, Any], industry_norms: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize communication timing"""
        optimal_times = preferences.get('optimal_times', {})
        if not optimal_times:
            # Use industry defaults
            optimal_times = industry_norms.get('communication_times', {
                'email': '9:00 AM',
                'phone': '2:00 PM',
                'sms': '11:00 AM'
            })
        
        return {
            'recommended_times': optimal_times,
            'frequency': preferences.get('frequency', 'weekly'),
            'timezone': preferences.get('timezone', 'UTC')
        }
    
    @staticmethod
    def _generate_communication_plan(score: float, business_vars: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate next communication plan"""
        if score < 0.3:
            return {
                'frequency': 'weekly',
                'channels': ['email'],
                'message_type': 'educational',
                'priority': 'nurture'
            }
        elif score < 0.6:
            return {
                'frequency': 'bi-weekly',
                'channels': ['email', 'phone'],
                'message_type': 'mixed',
                'priority': 'engage'
            }
        else:
            return {
                'frequency': 'as-needed',
                'channels': ['phone', 'in-person'],
                'message_type': 'transactional',
                'priority': 'convert'
            }
    
    @staticmethod
    def _determine_value_tier(value: float) -> str:
        """Determine customer value tier"""
        if value >= 10000:
            return 'Enterprise'
        elif value >= 5000:
            return 'Premium'
        elif value >= 1000:
            return 'Standard'
        else:
            return 'Basic'
    
    @staticmethod
    def _generate_value_optimization(value: float, business_vars: Optional[Dict[str, Any]]) -> List[str]:
        """Generate value optimization recommendations"""
        if value < 1000:
            return ['Increase engagement', 'Provide more value', 'Reduce support costs']
        elif value < 5000:
            return ['Upsell opportunities', 'Improve retention', 'Encourage referrals']
        else:
            return ['Maintain relationship', 'Expand account', 'Strategic partnership']
