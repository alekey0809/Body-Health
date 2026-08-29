/**
 * Utilidades para cálculos de métricas físicas
 * IMC, ICC, ICA, comparación histórica, etc.
 */

/**
 * Calcula el Índice de Masa Corporal (IMC)
 * Fórmula: Peso (kg) / Altura (m)²
 * @param {number} pesoKg - Peso en kilogramos
 * @param {number} alturaCm - Altura en centímetros
 * @returns {number|null} IMC redondeado a 1 decimal o null si datos inválidos
 */
export const calculateIMC = (pesoKg, alturaCm) => {
  if (!pesoKg || !alturaCm || alturaCm <= 0) return null;
  const alturaM = alturaCm / 100;
  const imc = pesoKg / (alturaM * alturaM);
  return Math.round(imc * 10) / 10;
};

/**
 * Obtiene la clasificación del IMC según OMS
 * @param {number} imc - Valor del IMC
 * @returns {object} Clasificación con label, color y rango
 */
export const getIMCClassification = (imc) => {
  if (imc === null) return { label: 'Sin datos', color: 'var(--on-surface-variant)', range: '' };
  if (imc < 18.5) return { label: 'Bajo peso', color: '#3b82f6', range: '< 18.5' };
  if (imc < 25) return { label: 'Normal', color: '#22c55e', range: '18.5 - 24.9' };
  if (imc < 30) return { label: 'Sobrepeso', color: '#f59e0b', range: '25 - 29.9' };
  if (imc < 35) return { label: 'Obesidad I', color: '#ef4444', range: '30 - 34.9' };
  if (imc < 40) return { label: 'Obesidad II', color: '#dc2626', range: '35 - 39.9' };
  return { label: 'Obesidad III', color: '#991b1b', range: '≥ 40' };
};

/**
 * Calcula el Índice Cintura-Cadera (ICC)
 * Fórmula: Cintura (cm) / Cadera (cm)
 * @param {number} cinturaCm - Medida de cintura en cm
 * @param {number} caderaCm - Medida de cadera en cm
 * @returns {number|null} ICC redondeado a 2 decimales o null si datos inválidos
 */
export const calculateICC = (cinturaCm, caderaCm) => {
  if (!cinturaCm || !caderaCm || caderaCm <= 0) return null;
  const icc = cinturaCm / caderaCm;
  return Math.round(icc * 100) / 100;
};

/**
 * Obtiene la clasificación del ICC según género
 * @param {number} icc - Valor del ICC
 * @param {string} genero - 'M' para masculino, 'F' para femenino
 * @returns {object} Clasificación con label, color y riesgo
 */
export const getICCClassification = (icc, genero) => {
  if (icc === null) return { label: 'Sin datos', color: 'var(--on-surface-variant)', riesgo: '' };
  
  if (genero === 'M') {
    if (icc < 0.90) return { label: 'Bajo riesgo', color: '#22c55e', riesgo: 'Bajo' };
    if (icc <= 1.0) return { label: 'Riesgo moderado', color: '#f59e0b', riesgo: 'Moderado' };
    return { label: 'Alto riesgo', color: '#ef4444', riesgo: 'Alto' };
  } else {
    if (icc < 0.80) return { label: 'Bajo riesgo', color: '#22c55e', riesgo: 'Bajo' };
    if (icc <= 0.85) return { label: 'Riesgo moderado', color: '#f59e0b', riesgo: 'Moderado' };
    return { label: 'Alto riesgo', color: '#ef4444', riesgo: 'Alto' };
  }
};

/**
 * Calcula el Índice Cintura-Altura (ICA)
 * Fórmula: Cintura (cm) / Altura (cm)
 * Rango saludable: < 0.5
 * @param {number} cinturaCm - Medida de cintura en cm
 * @param {number} alturaCm - Altura en cm
 * @returns {number|null} ICA redondeado a 3 decimales o null si datos inválidos
 */
export const calculateICA = (cinturaCm, alturaCm) => {
  if (!cinturaCm || !alturaCm || alturaCm <= 0) return null;
  const ica = cinturaCm / alturaCm;
  return Math.round(ica * 1000) / 1000;
};

/**
 * Obtiene la clasificación del ICA
 * Saludable: < 0.5
 * @param {number} ica - Valor del ICA
 * @returns {object} Clasificación con label, color y estado
 */
export const getICAClassification = (ica) => {
  if (ica === null) return { label: 'Sin datos', color: 'var(--on-surface-variant)', estado: '' };
  if (ica < 0.5) return { label: 'Saludable ✓', color: '#22c55e', estado: 'Saludable', healthy: true };
  if (ica < 0.6) return { label: 'Riesgo aumentado', color: '#f59e0b', estado: 'Precaución', healthy: false };
  return { label: 'Riesgo alto', color: '#ef4444', estado: 'Riesgo', healthy: false };
};

/**
 * Calcula el porcentaje de grasa corporal (RFM - Relative Fat Mass)
 * Woolcott & Bergman 2018
 * Hombres: RFM = 64 - (20 * altura / cintura)
 * Mujeres: RFM = 76 - (20 * altura / cintura)
 * @param {string} genero - 'M' o 'F'
 * @param {number} alturaCm - Altura en cm
 * @param {number} cinturaCm - Cintura en cm
 * @returns {number|null} % grasa redondeado a 1 decimal
 */
export const calculateRFM = (genero, alturaCm, cinturaCm) => {
  if (!genero || !alturaCm || !cinturaCm || cinturaCm <= 0) return null;
  
  if (genero === 'M') {
    const rfm = 64 - (20 * alturaCm / cinturaCm);
    return Math.round(Math.max(0, Math.min(100, rfm)) * 10) / 10;
  } else if (genero === 'F') {
    const rfm = 76 - (20 * alturaCm / cinturaCm);
    return Math.round(Math.max(0, Math.min(100, rfm)) * 10) / 10;
  }
  return null;
};

/**
 * Obtiene la clasificación del % grasa (RFM)
 * @param {number} rfm - Porcentaje de grasa
 * @param {string} genero - 'M' o 'F'
 * @returns {object} Clasificación
 */
export const getRFMClassification = (rfm, genero) => {
  if (rfm === null) return { label: 'Sin datos', color: 'var(--on-surface-variant)', categoria: '' };
  
  if (genero === 'M') {
    if (rfm < 6) return { label: 'Grasa esencial', color: '#3b82f6', categoria: 'Esencial' };
    if (rfm < 14) return { label: 'Deportista', color: '#22c55e', categoria: 'Deportista' };
    if (rfm < 20) return { label: 'Fitness', color: '#84cc16', categoria: 'Fitness' };
    if (rfm < 25) return { label: 'Promedio', color: '#f59e0b', categoria: 'Promedio' };
    return { label: 'Obesidad', color: '#ef4444', categoria: 'Obesidad' };
  } else {
    if (rfm < 14) return { label: 'Grasa esencial', color: '#3b82f6', categoria: 'Esencial' };
    if (rfm < 21) return { label: 'Deportista', color: '#22c55e', categoria: 'Deportista' };
    if (rfm < 25) return { label: 'Fitness', color: '#84cc16', categoria: 'Fitness' };
    if (rfm < 32) return { label: 'Promedio', color: '#f59e0b', categoria: 'Promedio' };
    return { label: 'Obesidad', color: '#ef4444', categoria: 'Obesidad' };
  }
};

/**
 * Calcula la diferencia absoluta y porcentual entre dos valores
 * @param {number} valorInicial - Valor inicial (primera medición)
 * @param {number} valorFinal - Valor final (última medición)
 * @returns {object|null} Objeto con diferencia absoluta, porcentual y tendencia
 */
export const calculateChange = (valorInicial, valorFinal) => {
  if (valorInicial === null || valorInicial === undefined || 
      valorFinal === null || valorFinal === undefined ||
      valorInicial === 0) return null;
  
  const absoluta = valorFinal - valorInicial;
  const porcentual = ((absoluta / valorInicial) * 100);
  
  return {
    absoluta: Math.round(absoluta * 100) / 100,
    porcentual: Math.round(porcentual * 100) / 100,
    tendencia: absoluta > 0 ? 'up' : absoluta < 0 ? 'down' : 'stable',
    mejoro: absoluta < 0 // Para peso y cintura, bajar es mejorar
  };
};

/**
 * Formatea el cambio para mostrar en UI
 * Ejemplo: "90 cm → 84 cm (-6 cm / -6.7%)"
 * @param {string} label - Etiqueta de la medida
 * @param {number} inicial - Valor inicial
 * @param {number} final - Valor final
 * @param {string} unidad - Unidad de medida
 * @returns {string|null} String formateado
 */
export const formatChange = (label, inicial, final, unidad = '') => {
  const change = calculateChange(inicial, final);
  if (!change) return null;
  
  const signoAbs = change.absoluta >= 0 ? '+' : '';
  const signoPct = change.porcentual >= 0 ? '+' : '';
  
  return `${label}: ${inicial}${unidad} → ${final}${unidad} (${signoAbs}${change.absoluta}${unidad} / ${signoPct}${change.porcentual}%)`;
};

/**
 * Prepara los datos para el gráfico de evolución temporal
 * @param {Array} valoraciones - Array de valoraciones ordenadas por fecha ascendente
 * @returns {Array} Datos formateados para Recharts
 */
export const prepareChartData = (valoraciones) => {
  if (!valoraciones || valoraciones.length === 0) return [];
  
  // Ordenar por fecha ascendente
  const sorted = [...valoraciones].sort((a, b) => 
    new Date(a.vf_fecha_registro) - new Date(b.vf_fecha_registro)
  );
  
  return sorted.map(v => ({
    fecha: v.vf_fecha_registro,
    label: new Date(v.vf_fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    peso: v.vf_peso_kg,
    cintura: v.vf_medida_cintura,
    cadera: v.vf_medida_cadera,
    pecho: v.vf_medida_pecho,
    imc: calculateIMC(v.vf_peso_kg, v.vf_estatura_cm),
    icc: calculateICC(v.vf_medida_cintura, v.vf_medida_cadera),
    ica: calculateICA(v.vf_medida_cintura, v.vf_estatura_cm),
  }));
};

/**
 * Calcula todas las métricas para una valoración
 * @param {object} valoracion - Objeto con datos de la valoración
 * @param {string} genero - Género del usuario ('M' o 'F')
 * @returns {object} Objeto con todas las métricas calculadas
 */
export const calculateAllMetrics = (valoracion, genero) => {
  if (!valoracion) return null;
  
  const { vf_peso_kg, vf_estatura_cm, vf_medida_cintura, vf_medida_cadera, vf_medida_pecho } = valoracion;
  
  const imc = calculateIMC(vf_peso_kg, vf_estatura_cm);
  const icc = calculateICC(vf_medida_cintura, vf_medida_cadera);
  const ica = calculateICA(vf_medida_cintura, vf_estatura_cm);
  const rfm = calculateRFM(genero, vf_estatura_cm, vf_medida_cintura);
  
  return {
    imc: { value: imc, ...getIMCClassification(imc) },
    icc: { value: icc, ...getICCClassification(icc, genero) },
    ica: { value: ica, ...getICAClassification(ica) },
    rfm: { value: rfm, ...getRFMClassification(rfm, genero) },
    raw: {
      peso: vf_peso_kg,
      altura: vf_estatura_cm,
      cintura: vf_medida_cintura,
      cadera: vf_medida_cadera,
      pecho: vf_medida_pecho,
    }
  };
};

/**
 * Genera la comparación histórica entre primera y última medición
 * @param {Array} valoraciones - Array de valoraciones ordenadas por fecha
 * @param {string} genero - Género del usuario
 * @returns {object} Objeto con comparativas y métricas actuales
 */
export const generateHistoricalComparison = (valoraciones, genero) => {
  if (!valoraciones || valoraciones.length === 0) return null;
  
  const sorted = [...valoraciones].sort((a, b) => 
    new Date(a.vf_fecha_registro) - new Date(b.vf_fecha_registro)
  );
  
  const primera = sorted[0];
  const ultima = sorted[sorted.length - 1];
  const hayCambio = sorted.length > 1;
  
  const metricasActuales = calculateAllMetrics(ultima, genero);
  const metricasIniciales = calculateAllMetrics(primera, genero);
  
  const comparativas = hayCambio ? {
    peso: calculateChange(primera.vf_peso_kg, ultima.vf_peso_kg),
    cintura: calculateChange(primera.vf_medida_cintura, ultima.vf_medida_cintura),
    cadera: calculateChange(primera.vf_medida_cadera, ultima.vf_medida_cadera),
    pecho: calculateChange(primera.vf_medida_pecho, ultima.vf_medida_pecho),
    imc: calculateChange(
      calculateIMC(primera.vf_peso_kg, primera.vf_estatura_cm),
      calculateIMC(ultima.vf_peso_kg, ultima.vf_estatura_cm)
    ),
    icc: calculateChange(
      calculateICC(primera.vf_medida_cintura, primera.vf_medida_cadera),
      calculateICC(ultima.vf_medida_cintura, ultima.vf_medida_cadera)
    ),
    ica: calculateChange(
      calculateICA(primera.vf_medida_cintura, primera.vf_estatura_cm),
      calculateICA(ultima.vf_medida_cintura, ultima.vf_estatura_cm)
    ),
  } : null;
  
  return {
    primeraFecha: primera.vf_fecha_registro,
    ultimaFecha: ultima.vf_fecha_registro,
    totalMediciones: sorted.length,
    hayCambio,
    metricasActuales,
    metricasIniciales,
    comparativas,
    historial: sorted,
  };
};