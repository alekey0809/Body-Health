import { Router } from 'express';
import { getPlanes, getPlanById, createPlan, updatePlan, deletePlan, getMembresiasByPlan } from '../controllers/plan.controller.js';

const router = Router();

router.get('/', getPlanes);
router.get('/:id', getPlanById);
router.get('/:id/membresias', getMembresiasByPlan);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;
