import { Router } from 'express';
import { 
    getNoticias, 
    getNoticiaById, 
    createNoticia, 
    updateNoticia, 
    deleteNoticia 
} from '../controllers/noticia.controller.js';

const router = Router();

router.get('/', getNoticias);
router.get('/:id', getNoticiaById);
router.post('/', createNoticia);
router.put('/:id', updateNoticia);
router.delete('/:id', deleteNoticia);

export default router;
