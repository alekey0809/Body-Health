import React from 'react';
import { getPasswordChecks } from '../../utils/validationUtils';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password = '' }) => {
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const passedCount = Object.values(checks).filter(Boolean).length;

  let strengthLabel = 'Muy débil';
  let strengthColor = '#ef4444'; // Red
  let progressWidth = '20%';

  if (passedCount === 2 || passedCount === 3) {
    strengthLabel = 'Media';
    strengthColor = '#f59e0b'; // Amber
    progressWidth = '60%';
  } else if (passedCount === 4) {
    strengthLabel = 'Buena';
    strengthColor = '#3b82f6'; // Blue
    progressWidth = '80%';
  } else if (passedCount === 5) {
    strengthLabel = 'Fuerte (Excelente)';
    strengthColor = '#22c55e'; // Green
    progressWidth = '100%';
  }

  const items = [
    { key: 'hasMinLength', label: 'Mínimo 8 caracteres' },
    { key: 'hasUpper', label: 'Al menos 1 letra mayúscula (A-Z)' },
    { key: 'hasLower', label: 'Al menos 1 letra minúscula (a-z)' },
    { key: 'hasNumber', label: 'Al menos 1 número (0-9)' },
    { key: 'hasSpecial', label: 'Al menos 1 carácter especial (@, #, $, !, %, etc.)' },
  ];

  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.875rem',
      backgroundColor: '#fafaf9',
      border: '1px solid var(--outline-variant, #e7e5e4)',
      borderRadius: '0.5rem',
      fontSize: '0.8rem'
    }}>
      {/* Indicador de Fuerza */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: '600', color: '#44403c' }}>Seguridad de la contraseña:</span>
        <span style={{ fontWeight: '700', color: strengthColor }}>{strengthLabel}</span>
      </div>

      {/* Barra de Progreso */}
      <div style={{
        height: '6px',
        width: '100%',
        backgroundColor: '#e7e5e4',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          height: '100%',
          width: progressWidth,
          backgroundColor: strengthColor,
          transition: 'all 0.3s ease'
        }} />
      </div>

      {/* Lista de Requisitos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {items.map((item) => {
          const isPassed = checks[item.key];
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isPassed ? '#15803d' : '#78716c' }}>
              {isPassed ? (
                <Check size={14} color="#16a34a" strokeWidth={3} />
              ) : (
                <X size={14} color="#a8a29e" strokeWidth={2} />
              )}
              <span style={{ fontWeight: isPassed ? '600' : '400' }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
