/**
 * Módulo de validaciones para registros de usuario
 */

// Regla de email
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

// Reglas de Contraseña Segura
export const getPasswordChecks = (password = '') => {
  const str = String(password);
  return {
    hasMinLength: str.length >= 8,
    hasUpper: /[A-Z]/.test(str),
    hasLower: /[a-z]/.test(str),
    hasNumber: /[0-9]/.test(str),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(str)
  };
};

export const validatePassword = (password = '') => {
  const checks = getPasswordChecks(password);
  const isValid = checks.hasMinLength && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial;
  
  const errors = [];
  if (!checks.hasMinLength) errors.push('Mínimo 8 caracteres');
  if (!checks.hasUpper) errors.push('Al menos una letra mayúscula (A-Z)');
  if (!checks.hasLower) errors.push('Al menos una letra minúscula (a-z)');
  if (!checks.hasNumber) errors.push('Al menos un número (0-9)');
  if (!checks.hasSpecial) errors.push('Al menos un carácter especial (ej. @, #, $, !, %)');

  return {
    isValid,
    checks,
    errors,
    errorMessage: isValid ? '' : `La contraseña debe cumplir: ${errors.join(', ')}.`
  };
};

/**
 * Validar Documento según Tipo de Documento:
 * idTipoDoc / tipoDoc:
 *  1 o "1" o "CC" -> Cédula de Ciudadanía: Solo números, exactamente 10 dígitos.
 *  2 o "2" o "CE" -> Cédula de Extranjería: Solo números, 6 o 7 dígitos.
 *  3 o "3" o "PAS" -> Pasaporte: Alfanumérico, 6 a 12 caracteres.
 *  4 o "4" o "TI" -> Tarjeta de Identidad: Solo números, exactamente 10 dígitos.
 */
export const validateDocument = (tipoDoc, numeroDoc) => {
  const docStr = String(numeroDoc || '').trim();
  const typeStr = String(tipoDoc || '').trim().toUpperCase();

  if (!docStr) {
    return { isValid: false, message: 'El número de documento es obligatorio.' };
  }

  // Cédula de Ciudadanía (CC / 1)
  if (typeStr === '1' || typeStr === 'CC') {
    if (!/^\d+$/.test(docStr)) {
      return { isValid: false, message: 'La Cédula de Ciudadanía solo debe contener números.' };
    }
    if (docStr.length !== 10) {
      return { isValid: false, message: 'La Cédula de Ciudadanía debe tener exactamente 10 dígitos numéricos.' };
    }
  } 
  // Cédula de Extranjería (CE / 2)
  else if (typeStr === '2' || typeStr === 'CE') {
    if (!/^\d+$/.test(docStr)) {
      return { isValid: false, message: 'La Cédula de Extranjería solo debe contener números.' };
    }
    if (docStr.length !== 6 && docStr.length !== 7) {
      return { isValid: false, message: 'La Cédula de Extranjería debe tener 6 o 7 dígitos numéricos.' };
    }
  } 
  // Tarjeta de Identidad (TI / 4)
  else if (typeStr === '4' || typeStr === 'TI') {
    if (!/^\d+$/.test(docStr)) {
      return { isValid: false, message: 'La Tarjeta de Identidad solo debe contener números.' };
    }
    if (docStr.length !== 10) {
      return { isValid: false, message: 'La Tarjeta de Identidad debe tener exactamente 10 dígitos numéricos.' };
    }
  }
  // Pasaporte (PAS / 3)
  else if (typeStr === '3' || typeStr === 'PAS') {
    if (!/^[a-zA-Z0-9]+$/.test(docStr)) {
      return { isValid: false, message: 'El Pasaporte solo puede contener letras y números.' };
    }
    if (docStr.length < 6 || docStr.length > 12) {
      return { isValid: false, message: 'El Pasaporte debe tener entre 6 y 12 caracteres.' };
    }
  }

  return { isValid: true, message: '' };
};

// Validar nombres / apellidos
export const validateName = (value, fieldName = 'nombre') => {
  const str = String(value || '').trim();
  if (!str) return { isValid: false, message: `El campo ${fieldName} es obligatorio.` };
  if (str.length < 2) return { isValid: false, message: `El campo ${fieldName} debe tener al menos 2 caracteres.` };
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(str)) {
    return { isValid: false, message: `El campo ${fieldName} solo debe contener letras.` };
  }
  return { isValid: true, message: '' };
};

// Validar teléfono / contacto
export const validatePhone = (phone) => {
  const str = String(phone || '').trim();
  if (!str) return { isValid: true, message: '' }; // Opcional o validado si es requerido
  if (!/^\d+$/.test(str)) {
    return { isValid: false, message: 'El número de teléfono solo debe contener números.' };
  }
  if (str.length < 7 || str.length > 10) {
    return { isValid: false, message: 'El número de teléfono debe tener entre 7 y 10 dígitos.' };
  }
  return { isValid: true, message: '' };
};

// Sanitizador de entrada para número de documento según tipo de documento
export const sanitizeDocumentInput = (tipoDoc, inputVal) => {
  const typeStr = String(tipoDoc || '').trim().toUpperCase();
  // Si es CC (1), CE (2) o TI (4), filtrar solo dígitos
  if (typeStr === '1' || typeStr === 'CC' || typeStr === '2' || typeStr === 'CE' || typeStr === '4' || typeStr === 'TI') {
    const onlyDigits = inputVal.replace(/\D/g, '');
    if (typeStr === '1' || typeStr === 'CC' || typeStr === '4' || typeStr === 'TI') {
      return onlyDigits.slice(0, 10);
    }
    if (typeStr === '2' || typeStr === 'CE') {
      return onlyDigits.slice(0, 7);
    }
    return onlyDigits;
  }
  // Pasaporte (3) -> alfanumérico en mayúsculas max 12
  if (typeStr === '3' || typeStr === 'PAS') {
    return inputVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
  }
  return inputVal;
};

// Función consolidada de validación de formulario de registro
export const validateUserRegistration = ({
  nombres,
  apellidos,
  correo,
  email,
  contrasena,
  password,
  idTipoDoc,
  tipo_doc,
  numeroDoc,
  num_doc,
  contacto,
  telefono
}) => {
  const finalEmail = correo || email;
  const finalPassword = contrasena !== undefined ? contrasena : password;
  const finalTipoDoc = idTipoDoc !== undefined ? idTipoDoc : tipo_doc;
  const finalNumDoc = numeroDoc !== undefined ? numeroDoc : num_doc;
  const finalContacto = contacto !== undefined ? contacto : telefono;

  // 1. Validar Nombres y Apellidos
  const nombresVal = validateName(nombres, 'Nombres');
  if (!nombresVal.isValid) return nombresVal.message;

  const apellidosVal = validateName(apellidos, 'Apellidos');
  if (!apellidosVal.isValid) return apellidosVal.message;

  // 2. Validar Correo
  if (!finalEmail || !validateEmail(finalEmail)) {
    return 'Ingresa un correo electrónico válido (ejemplo: usuario@ejemplo.com).';
  }

  // 3. Validar Teléfono si viene proporcionado
  if (finalContacto) {
    const phoneVal = validatePhone(finalContacto);
    if (!phoneVal.isValid) return phoneVal.message;
  }

  // 4. Validar Documento
  const docVal = validateDocument(finalTipoDoc, finalNumDoc);
  if (!docVal.isValid) return docVal.message;

  // 5. Validar Contraseña (si se requiere contraseña)
  if (finalPassword !== undefined) {
    const passVal = validatePassword(finalPassword);
    if (!passVal.isValid) return passVal.errorMessage;
  }

  return null; // Sin errores
};
