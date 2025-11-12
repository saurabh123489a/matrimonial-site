import express from 'express';
import {
  getEducationOptions,
  getOccupationOptions,
  getProfessionOptions,
  getReligionOptions,
  getSalaryOptions,
} from '../controllers/metaDataController.js';

const router = express.Router();

/**
 * Meta Data Routes - Public endpoints for dropdown options
 * Education, Occupation, Religion, Salary Ranges
 */

router.get('/education', getEducationOptions);
router.get('/occupation', getOccupationOptions);
router.get('/profession', getProfessionOptions);
router.get('/religion', getReligionOptions);
router.get('/salary', getSalaryOptions);

export default router;

