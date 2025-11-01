import express from 'express';
import {
  getCountries,
  getCities,
  getStates,
  getDistricts,
} from '../controllers/locationController.js';

const router = express.Router();

/**
 * Location Routes - Public endpoints for country/state/district/city data
 */
router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/districts', getDistricts);
router.get('/cities', getCities);

export default router;

