# Location API Integration

Free country, state, and city API integration for the Matrimonial application.

## 🌍 API Used

**Countries Now API** - https://countriesnow.space/api
- ✅ Completely free
- ✅ No API key required
- ✅ Supports all countries worldwide
- ✅ Provides countries, states, and cities

## 📡 Backend Endpoints

### Get All Countries
```http
GET /api/locations/countries
```

**Response:**
```json
{
  "status": true,
  "message": "Countries retrieved successfully",
  "data": [
    { "name": "India", "iso2": "IN", "iso3": "IND" },
    { "name": "United States", "iso2": "US", "iso3": "USA" },
    ...
  ]
}
```

### Get States for a Country
```http
GET /api/locations/states?country=India
```

**Response:**
```json
{
  "status": true,
  "message": "States retrieved successfully",
  "data": [
    { "name": "Maharashtra" },
    { "name": "Delhi" },
    ...
  ]
}
```

### Get Cities for a Country
```http
GET /api/locations/cities?country=India
```

**Response:**
```json
{
  "status": true,
  "message": "Cities retrieved successfully",
  "data": [
    { "name": "Mumbai" },
    { "name": "Delhi" },
    ...
  ]
}
```

## 💡 Features

1. **Caching**: Countries are cached for 24 hours to reduce API calls
2. **Fallback Data**: If API fails, returns common countries/cities for India
3. **Error Handling**: Graceful error handling with fallback responses
4. **Public Endpoints**: No authentication required

## 🎨 Frontend Usage

### LocationSelect Component

A reusable component for country/state/city selection:

```tsx
import LocationSelect from '@/components/LocationSelect';

<LocationSelect
  selectedCountry={country}
  selectedState={state}
  selectedCity={city}
  onCountryChange={(country) => setCountry(country)}
  onStateChange={(state) => setState(state)}
  onCityChange={(city) => setCity(city)}
/>
```

### Integrated Pages

- ✅ **Profile Edit Page** - Uses LocationSelect component
- ✅ **Registration Page** - Can be added for new user signup

## 🔧 Implementation Details

### Backend
- **Controller**: `backend/src/controllers/locationController.js`
- **Routes**: `backend/src/routes/locationRoutes.js`
- **External API**: Countries Now Space API

### Frontend
- **Component**: `frontend/components/LocationSelect.tsx`
- **API Client**: `frontend/lib/api.ts` - `locationApi` functions

## 📝 Usage Example

1. User selects a country from dropdown
2. States for that country are automatically loaded
3. User selects a state
4. Cities for that country are automatically loaded
5. User selects a city

The component handles all API calls automatically with loading states.

## 🚀 Benefits

- ✅ No manual data entry - reduces errors
- ✅ Standardized location data
- ✅ Better search/filter capabilities
- ✅ Supports international users
- ✅ Free API - no cost

