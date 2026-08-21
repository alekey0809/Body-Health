import { NoticiaModel } from '../models/noticia.model.js';

// Fallback por si la base de datos no está disponible o no tiene datos cargados
const defaultNoticias = [
  {
    n_id: 1,
    n_titulo: '5 Ejercicios Clave para Hipertrofia Muscular',
    n_contenido: 'Descubre los fundamentos biomecánicos para maximizar la ganancia muscular en tu rutina semanal.',
    n_imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD--EPeexjQ4pcMZ9AZsPTiszFiJyl9GP38aOobdQS5n7uxIBL9SBPLtu9RvRftdbNz-QpD4TBbjpgO2ON49YMMS0OBjdvxUnYMRC18gDiCYlPKpDmHui_8kpxFr15pvdKLm6Cy0_w2bu8B10IKcEtoGtBWr_HSyVsx6Iluj5BdxX9wB6stq4e2omsBmH_jGhs12dusaZ34419ewMQKwdLXzhiCffnEKxGhKQXwpLpnfnBZquvctSotSlVfV_7rjHwODNnb6G7vMIU',
    n_fecha_publicacion: '2026-07-20T00:00:00.000Z',
    n_fecha_creacion: '2026-07-20T00:00:00.000Z',
    n_estado: 'ACTIVA',
    autor_nombre: 'Carlos Mendoza'
  },
  {
    n_id: 2,
    n_titulo: 'Importancia de la Hidratación en Climas Cálidos',
    n_contenido: 'Consejos prácticos sobre reposición de electrolitos y regulación térmica durante la actividad física.',
    n_imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACH8Wa322I4hKi4uGEzW88GXa1MI5SgMMDwyRDSYsKmidKSZegHzoWde__K3j6yDZoPfI--VmqiSMSzx5kqze8W-6ISBv1LpNvTTdpWerqIQ1fTfEa9pWN_CIV-WGCdHsHFEvpKUSCbl-HcK4q8nCFMarFk1XyqYvdzPpmfQfZMceUz8DILR4v4G_6JpwBiTYaxmQTJshaJkWAxxIvi7RBonZ3VxvwMOIBpsgUPymu6w8CBwdiYibdYSgmKV9czong0ga35j3c2ac',
    n_fecha_publicacion: '2026-07-18T00:00:00.000Z',
    n_fecha_creacion: '2026-07-18T00:00:00.000Z',
    n_estado: 'ACTIVA',
    autor_nombre: 'Elena Valery'
  },
  {
    n_id: 3,
    n_titulo: 'Nuevos Horarios de Clases de CrossFit y Funcional',
    n_contenido: 'Ampliamos los turnos de la tarde y abrimos nuevo cupo matutino a partir del próximo lunes.',
    n_imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfYObRVaSy3_fRWvsOa0pclKKlZuSE0Isk6suSBJbsaQCZQ8r74VMJtOKm36AUbj-txura2YIvH12kEMdVVwtWwQlDi-akyghTrv7UUr-jiVap55xr0A0abIyKc75WoeYH00HKOlfdlQ2gpfwsjy0V3kvYxST4zuTqsl04ypKMcp1lnUzMw4TXVo1IK96sFeHPJDEYPoO-7uW8Nqltk3p4ScbNgDrfuvYzh3l8cLKOO0zHlxEUv54frO1AlLVNUcfnjxH0EzIGqfA',
    n_fecha_publicacion: '2026-07-15T00:00:00.000Z',
    n_fecha_creacion: '2026-07-15T00:00:00.000Z',
    n_estado: 'ACTIVA',
    autor_nombre: 'Admin BodyHealth'
  },
  {
    n_id: 4,
    n_titulo: 'Guía para Principiantes en la Práctica de Yoga',
    n_contenido: 'Una introducción a la respiración consciente, flexibilidad y posturas fundamentales para iniciarse.',
    n_imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPhwvb3NOxNEARMN9wkyx-xhCzgcH8Xev3KXQB5o6Rln9FNHH29pd5INA7nVDzfMum_CNuk-AjZ3rsC_l6y_Tky-xm8qTmEwSZOAZMk9-4whTX38jA7pz89fVVkADOUOXiMKkyP_jTceywqYSzBM8vDpH15hWy0Rq1HHRXijzuz2fw3bcqMH6rZ8ZvWFzSWJr_WR1IFmKt0KdlZlJlkPtYTIgw2ySEOv3yeSpnVZIXqI_-JVO4Z0iApxY6kUds43HtqyW2sg4Xd5M',
    n_fecha_publicacion: '2026-07-10T00:00:00.000Z',
    n_fecha_creacion: '2026-07-10T00:00:00.000Z',
    n_estado: 'INACTIVA',
    autor_nombre: 'Sofia Ramírez'
  }
];

export const getNoticias = async (req, res) => {
    const { estado } = req.query;
    try {
        let noticias;
        if (estado && estado.toUpperCase() === 'ACTIVA') {
            noticias = await NoticiaModel.getActivas();
        } else {
            noticias = await NoticiaModel.getAll();
        }

        if (noticias && noticias.length > 0) {
            return res.json(noticias);
        }
        
        // Si no hay filas aún en la BD, responder con fallbacks según filtro
        const filteredFallback = estado && estado.toUpperCase() === 'ACTIVA'
            ? defaultNoticias.filter(n => n.n_estado === 'ACTIVA')
            : defaultNoticias;
        return res.json(filteredFallback);
    } catch (error) {
        console.error('Error al obtener noticias de la BD:', error.message);
        const filteredFallback = estado && estado.toUpperCase() === 'ACTIVA'
            ? defaultNoticias.filter(n => n.n_estado === 'ACTIVA')
            : defaultNoticias;
        return res.json(filteredFallback);
    }
};

export const getNoticiaById = async (req, res) => {
    const { id } = req.params;
    try {
        const noticia = await NoticiaModel.getById(id);
        if (noticia) {
            return res.json(noticia);
        }
        const fallback = defaultNoticias.find(n => String(n.n_id) === String(id)) || defaultNoticias[0];
        return res.json(fallback);
    } catch (error) {
        console.error('Error al obtener la noticia por ID:', error.message);
        const fallback = defaultNoticias.find(n => String(n.n_id) === String(id)) || defaultNoticias[0];
        return res.json(fallback);
    }
};

export const createNoticia = async (req, res) => {
    try {
        const { n_u_id, n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_estado } = req.body;
        
        if (!n_titulo || !n_contenido) {
            return res.status(400).json({ message: 'El título y el contenido son obligatorios.' });
        }

        const newNoticia = await NoticiaModel.create({
            n_u_id,
            n_titulo,
            n_contenido,
            n_imagen,
            n_fecha_publicacion,
            n_estado: n_estado || 'ACTIVA'
        });
        
        return res.status(201).json(newNoticia);
    } catch (error) {
        console.error('Error al crear noticia:', error);
        return res.status(500).json({ message: 'Error al crear la noticia', error: error.message });
    }
};

export const updateNoticia = async (req, res) => {
    const { id } = req.params;
    try {
        const { n_titulo, n_contenido, n_imagen, n_fecha_publicacion, n_estado } = req.body;
        
        if (!n_titulo || !n_contenido) {
            return res.status(400).json({ message: 'El título y el contenido son obligatorios.' });
        }

        const updatedNoticia = await NoticiaModel.update(id, {
            n_titulo,
            n_contenido,
            n_imagen,
            n_fecha_publicacion,
            n_estado
        });
        
        return res.json(updatedNoticia);
    } catch (error) {
        console.error('Error al actualizar noticia:', error);
        return res.status(500).json({ message: 'Error al actualizar la noticia', error: error.message });
    }
};

export const deleteNoticia = async (req, res) => {
    const { id } = req.params;
    try {
        await NoticiaModel.delete(id);
        return res.json({ message: 'Noticia eliminada correctamente', id });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        return res.status(500).json({ message: 'Error al eliminar la noticia', error: error.message });
    }
};
