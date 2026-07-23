import { Router } from 'express';
import { getPlanes, getPlanById, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller.js';

const router = Router();

router.get('/', getPlanes);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;
