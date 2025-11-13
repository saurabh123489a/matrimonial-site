# Horoscope Matching System - 36 Gunas

## Overview
The horoscope matching system calculates compatibility between two profiles based on traditional Indian astrology (36 Gunas matching). This system evaluates 8 different aspects (Ashtakoota) to determine marital compatibility.

## How It Works

### 1. Button Visibility
- The horoscope matching button (🔮) appears on profile cards **only if** the profile has horoscope details (either `rashi` or `nakshatra`)
- Location: Profile card action buttons (next to Interest and Shortlist buttons)
- Color: Purple-themed button with crystal ball emoji

### 2. User Flow
1. User clicks the 🔮 button on a profile card
2. System checks if user is logged in
3. If logged in, opens a modal showing:
   - Loading state while calculating
   - Overall matching score (out of 36)
   - Percentage match
   - Status (excellent/good/moderate/average/low)
   - Detailed breakdown of all 8 aspects
   - Doshas (incompatibilities) if any
   - Horoscope information for both users

### 3. The 8 Aspects (Ashtakoota)

#### Varna (4 points)
- **Purpose**: Social compatibility
- **Calculation**: Based on Rashi (Moon Sign)
- **Scores**:
  - Same Varna: 4 points (Perfect)
  - Adjacent Varna: 2 points (Good)
  - Different Varna: 0 points (Basic)

#### Vasya (2 points)
- **Purpose**: Mutual attraction and dominance
- **Calculation**: Based on Rashi compatibility
- **Scores**:
  - Opposite signs: 2 points (Perfect attraction)
  - Compatible signs: 1 point (Good attraction)
  - Others: 0 points (Basic)

#### Tara (3 points)
- **Purpose**: Mutual welfare and beneficence
- **Calculation**: Based on Nakshatra (Star) distance and compatibility
- **Scores**:
  - Same/Adjacent Nakshatra: 3 points
  - Nearby Nakshatras: 2 points
  - Others: 1 point

#### Yoni (4 points)
- **Purpose**: Physical and sexual compatibility
- **Calculation**: Based on Nakshatra compatibility groups
- **Scores**:
  - Same friendly group: 4 points (Perfect)
  - Others: 2 points (Moderate)

#### Graha Maitri (5 points)
- **Purpose**: Planetary friendship
- **Calculation**: Based on Rashi compatibility matrix
- **Scores**:
  - Compatible signs: 5 points (Excellent)
  - Neutral signs: 3 points (Good)
  - Others: 1 point (Basic)

#### Gana (6 points)
- **Purpose**: Mental and behavioral compatibility
- **Categories**: Deva (God), Manushya (Human), Rakshasa (Demon)
- **Scores**:
  - Same Gana: 6 points (Perfect)
  - Deva-Manushya: 3 points (Acceptable)
  - With Rakshasa: 0 points (Incompatible - Dosha)

#### Bhakoot (7 points)
- **Purpose**: Emotional compatibility and financial prosperity
- **Calculation**: Based on Rashi compatibility and incompatibility
- **Scores**:
  - Compatible signs: 7 points (Excellent)
  - Bhakoot incompatible pairs: 0 points (Dosha)
  - Others: 3 points (Moderate)

#### Nadi (8 points) - **MOST IMPORTANT**
- **Purpose**: Health and progeny compatibility
- **Categories**: Adi, Madhya, Antya
- **Scores**:
  - Different Nadi: 8 points (Perfect)
  - Same Nadi: 0 points (Highly incompatible - Major Dosha)

### 4. Scoring System

**Total Score Calculation:**
```
Total = Varna + Vasya + Tara + Yoni + Graha Maitri + Gana + Bhakoot + Nadi
Maximum = 36 points
Percentage = (Total Score / 36) × 100
```

**Status Thresholds:**
- **Excellent**: ≥75% (27+ points) - Highly compatible
- **Good**: 60-74% (22-26 points) - Good compatibility
- **Moderate**: 45-59% (16-21 points) - Moderate compatibility
- **Average**: 30-44% (11-15 points) - Average compatibility
- **Low**: <30% (<11 points) - Low compatibility, not recommended

### 5. Doshas (Incompatibilities)

The system detects and warns about three major doshas:

1. **Nadi Dosha**: Same Nadi (most critical)
2. **Gana Dosha**: Incompatible Gana combination
3. **Bhakoot Dosha**: Incompatible Rashi pairs

If any dosha is detected, it's prominently displayed in red in the modal.

## Technical Implementation

### Backend
- **Service**: `backend/src/services/horoscopeService.js`
- **Controller**: `backend/src/controllers/horoscopeController.js`
- **Route**: `GET /api/horoscope/match/:userId`
- **Authentication**: Required (user must be logged in)

### Frontend
- **Component**: `frontend/components/EnhancedProfileCard.tsx`
- **API**: `horoscopeApi.getMatch(userId)`
- **Modal**: Shows detailed breakdown with color-coded aspects

### Data Requirements
Both users need horoscope details:
- `rashi` (Moon Sign) - Required for most calculations
- `nakshatra` (Star) - Required for Nadi, Tara, Yoni, Gana

If insufficient data is available, the system returns:
- Status: `insufficient_data`
- Message: "Insufficient horoscope information for matching"
- Score: 0/36

## UI/UX Features

1. **Button**: Purple-themed with 🔮 emoji, appears only when horoscope data exists
2. **Modal**: 
   - Gradient header (purple to pink)
   - Large score display
   - Color-coded status (green/blue/yellow/orange)
   - Detailed breakdown cards (green/blue for matched, red for unmatched)
   - Dosha warnings in red
   - Horoscope info for both users
3. **Loading State**: Spinner with "Calculating horoscope match..." message
4. **Error Handling**: Red error banner if calculation fails

## API Response Format

```json
{
  "status": true,
  "message": "Horoscope matching calculated successfully",
  "data": {
    "totalScore": 28,
    "maxScore": 36,
    "percentage": 78,
    "status": "excellent",
    "message": "Excellent match! Highly compatible",
    "doshas": [],
    "details": [
      {
        "name": "Varna",
        "score": 4,
        "max": 4,
        "matched": true,
        "detail": "Same Varna - Perfect match"
      },
      // ... 7 more aspects
    ],
    "horoscope1": {
      "rashi": "Leo",
      "nakshatra": "Magha",
      "starSign": "Leo"
    },
    "horoscope2": {
      "rashi": "Aries",
      "nakshatra": "Ashwini",
      "starSign": "Aries"
    }
  }
}
```

## Future Enhancements

1. Add more detailed Nakshatra calculations
2. Include Mangal Dosha (Mars incompatibility) check
3. Add matching history/saved matches
4. Export matching report as PDF
5. Add explanations for each aspect
6. Support for different regional astrology systems


