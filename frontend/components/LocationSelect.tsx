'use client';

import { useState, useEffect } from 'react';
import { locationApi } from '@/lib/api';

interface LocationSelectProps {
  selectedCountry?: string;
  selectedState?: string;
  selectedCity?: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  showCountry?: boolean;
  showState?: boolean;
  showCity?: boolean;
}

export default function LocationSelect({
  selectedCountry = '',
  selectedState = '',
  selectedCity = '',
  onCountryChange,
  onStateChange,
  onCityChange,
  showCountry = true,
  showState = true,
  showCity = true,
}: LocationSelectProps) {
  const [countries, setCountries] = useState<Array<{ name: string; iso2: string; iso3: string }>>([]);
  const [states, setStates] = useState<Array<{ name: string }>>([]);
  const [cities, setCities] = useState<Array<{ name: string }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await locationApi.getCountries();
        if (response.status) {
          setCountries(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry || !showState) {
      setStates([]);
      if (!selectedCountry) {
        onStateChange('');
        onCityChange('');
      }
      return;
    }

    const loadStates = async () => {
      setLoadingStates(true);
      setStates([]); // Clear states while loading
      try {
        const response = await locationApi.getStates(selectedCountry);
        if (response.status && response.data) {
          setStates(response.data || []);
        } else {
          console.warn('States API returned no data:', response);
          setStates([]);
        }
      } catch (error: any) {
        console.error('Failed to load states:', error);
        // Show user-friendly error
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Network Error - No response received');
        }
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };

    loadStates();
    // Reset state and city when country changes
    if (selectedCountry) {
      onStateChange('');
      onCityChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, showState]);

  // Load cities when country AND state changes (state is required)
  useEffect(() => {
    if (!selectedCountry || !selectedState || !showCity) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      setCities([]); // Clear cities while loading
      try {
        // Pass state for proper filtering (state is required)
        const response = await locationApi.getCities(selectedCountry, selectedState);
        if (response.status && response.data) {
          setCities(response.data);
        } else {
          console.warn('Cities API returned no data:', response);
          setCities([]);
        }
      } catch (error: any) {
        console.error('Failed to load cities:', error);
        // Show user-friendly error
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('Network Error - No response received');
        }
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    // Small delay to ensure state is properly set before loading cities
    const timeoutId = setTimeout(() => {
      loadCities();
    }, 100);

    // Reset city when state changes
    if (selectedState) {
      onCityChange('');
    }

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedState, showCity]);

  return (
    <div className="space-y-4">
      {showCountry && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={loadingCountries}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 disabled:opacity-50"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.iso2} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showState && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
            {loadingStates && (
              <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
            )}
          </label>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={!selectedCountry || loadingStates}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 disabled:opacity-50"
          >
            <option value="">
              {!selectedCountry ? 'Select Country first' : loadingStates ? 'Loading states...' : 'Select State'}
            </option>
            {states.map((state, index) => (
              <option key={index} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          {!selectedCountry && (
            <p className="mt-1 text-xs text-gray-500">
              Please select a country first
            </p>
          )}
        </div>
      )}

      {showCity && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
            {loadingCities && (
              <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
            )}
          </label>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!selectedCountry || !selectedState || loadingCities}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 disabled:opacity-50"
          >
            <option value="">
              {!selectedState 
                ? 'Select State first' 
                : loadingCities 
                  ? 'Loading cities...' 
                  : cities.length === 0 
                    ? 'No cities found' 
                    : 'Select City'}
            </option>
            {cities.map((city, index) => (
              <option key={index} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          {!selectedState && selectedCountry && (
            <p className="mt-1 text-xs text-gray-500">
              Please select a state first to see cities
            </p>
          )}
          {!loadingCities && cities.length === 0 && selectedCountry && selectedState && (
            <p className="mt-1 text-xs text-gray-500">
              No cities available for this state
            </p>
          )}
        </div>
      )}
    </div>
  );
}

