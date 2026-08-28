import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { validateUserRegistration, sanitizeDocumentInput } from '../../utils/validationUtils';
import './global.css';

const RegistroPago = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        tipo_doc: 'CC',
        num_doc: '',
        dob: '',
        password: '',
        paymentMethod: 'tarjeta' // Tarjeta por defecto
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2. Manejador de cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'num_doc') {
            const sanitized = sanitizeDocumentInput(formData.tipo_doc, value);
            setFormData((prev) => ({ ...prev, num_doc: sanitized }));
        } else if (name === 'tipo_doc') {
            setFormData((prev) => ({
                ...prev,
                tipo_doc: value,
                num_doc: sanitizeDocumentInput(value, prev.num_doc)
            }));
        } else if (name === 'telefono') {
            const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, telefono: onlyDigits }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // 3. Manejador de selección del método de pago
    const handlePaymentSelect = (method) => {
        setFormData((prev) => ({
            ...prev,
            paymentMethod: method
        }));
    };

    // 4. Envío del Formulario (Paso 1 + Paso 2 en una sola API)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateUserRegistration({
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            email: formData.email,
            telefono: formData.telefono,
            tipo_doc: formData.tipo_doc,
            num_doc: formData.num_doc,
            password: formData.password
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            console.log('Datos consolidados listos para el Backend:', formData);
            if (register) {
                await register({
                    nombres: formData.nombres,
                    apellidos: formData.apellidos,
                    correo: formData.email,
                    contacto: formData.telefono,
                    idTipoDoc: formData.tipo_doc === 'CC' ? 1 : formData.tipo_doc === 'CE' ? 2 : formData.tipo_doc === 'PAS' ? 3 : 4,
                    numeroDoc: formData.num_doc,
                    contrasena: formData.password
                });
            }
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Error al completar la inscripción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="root-wrapper">
            {/* Header Principal */}
            <header className="home-header">
                <div className="header-brand">
                    <span className="material-symbols-outlined brand-icon">fitness_center</span>
                    <div className="home-logo">BODYHEALT</div>
                </div>
                <div className="header-actions">
                    <span className="home-tagline-badge">Inscripción Activa</span>
                </div>
            </header>

            <main className="unified-container">
                
                {/* COLUMNA IZQUIERDA: Editorial e Información del Plan */}
                <section className="editorial-pay-column">
                    <div className="home-tagline-badge" style={{ alignSelf: 'flex-start' }}>
                        Paso 1 y 2: Inscripción Express
                    </div>
                    <h2 className="editorial-title" style={{ fontSize: '3rem' }}>Completa tu Proceso</h2>
                    
                    {/* Resumen de Compra Integrado */}
                    <div className="summary-card">
                        <h3>Resumen de Compra</h3>
                        <div className="summary-details">
                            <div className="summary-concept">
                                <div className="concept-icon-box">
                                    <span className="material-symbols-outlined">fitness_center</span>
                                </div>
                                <div>
                                    <p className="concept-title">Plan Trimestral</p>
                                    <p className="concept-duration">Vence en 90 días</p>
                                </div>
                            </div>
                            <div className="summary-price-box">
                                <p className="summary-price">$37.500</p>
                                <p className="summary-tax">IVA Incluido</p>
                            </div>
                        </div>
                    </div>

                    {/* Arte Editorial Adaptado */}
                    <div className="editorial-art-wrapper" style={{ aspectRatio: '16/10' }}>
                        <img 
                            alt="Gym Atmosphere" 
                            className="editorial-image" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYGFYg2Sv1bcavwrUFAkyPI38PbziXkmOGdZ6dVyKe-1D2zWg4XOpO2v3eCTj095xOjkrKBO8oDAHh-cfQiwq9GivsGg8Y9N14YWokZ2BgGk3Fa8rwnbT0Z62AAL5OZAt4sMa_MKpX5Rf_SpGdJUw1z8wv-xVqFHEdYCMxmXt83n2ac0BnvL60t2umwCUeDqUKrQbTyAhNaHCjlrrVgoB3_3kSLjcseWvLGDtC1kG7sMScNvSzpR7MGqi700HFntNB7tHp82qtuRY"
                        />
                        <div className="gradient-overlay"></div>
                        <div className="quote-overlay">
                            <p className="editorial-quote">"La excelencia no es un acto, sino un hábito."</p>
                        </div>
                    </div>
                </section>

                {/* COLUMNA DERECHA: Formulario Unificado + Pasarela de Pago */}
                <section className="form-panel">
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '0.875rem 1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="unified-form" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        
                        {/* Subsección 1: Datos del Usuario (Paso 1) */}
                        <div className="form-segment">
                            <h3 className="form-segment-title">1. Información del Socio</h3>
                            
                            <div className="form-flex-row">
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="nombres">Nombres</label>
                                    <input 
                                        className="input-element" 
                                        id="nombres" 
                                        name="nombres" 
                                        placeholder="Ej. Juan Ignacio" 
                                        required 
                                        type="text"
                                        value={formData.nombres}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="apellidos">Apellidos</label>
                                    <input 
                                        className="input-element" 
                                        id="apellidos" 
                                        name="apellidos" 
                                        placeholder="Ej. Pérez García" 
                                        required 
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-flex-row">
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="email">Correo Electrónico</label>
                                    <input 
                                        className="input-element" 
                                        id="email" 
                                        name="email" 
                                        placeholder="juan@ejemplo.com" 
                                        required 
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="telefono">Número de Teléfono</label>
                                    <input 
                                        className="input-element" 
                                        id="telefono" 
                                        name="telefono" 
                                        placeholder="Ej. 3000000000" 
                                        maxLength={10}
                                        required 
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-flex-row">
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="tipo_doc">Tipo de Documento</label>
                                    <div className="custom-select-wrapper">
                                        <select 
                                            className="input-element" 
                                            id="tipo_doc" 
                                            name="tipo_doc" 
                                            required 
                                            value={formData.tipo_doc}
                                            onChange={handleInputChange}
                                            style={{ paddingRight: '2.5rem' }}
                                        >
                                            <option value="CC">Cédula de Ciudadanía (10 dígitos)</option>
                                            <option value="CE">Cédula de Extranjería (6 ó 7 dígitos)</option>
                                            <option value="PAS">Pasaporte</option>
                                            <option value="TI">Tarjeta de Identidad (10 dígitos)</option>
                                        </select>
                                        <span className="material-symbols-outlined select-arrow">expand_more</span>
                                    </div>
                                </div>
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="num_doc">Número de Documento</label>
                                    <input 
                                        className="input-element" 
                                        id="num_doc" 
                                        name="num_doc" 
                                        placeholder={
                                            formData.tipo_doc === 'CC' ? "Ej. 1020304050 (10 dígitos)" :
                                            formData.tipo_doc === 'CE' ? "Ej. 123456 (6 ó 7 dígitos)" :
                                            formData.tipo_doc === 'TI' ? "Ej. 1098765432 (10 dígitos)" : "Ej. AB123456"
                                        } 
                                        required 
                                        type="text"
                                        value={formData.num_doc}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-flex-row">
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="dob">Fecha de Nacimiento</label>
                                    <input 
                                        className="input-element" 
                                        id="dob" 
                                        name="dob" 
                                        required 
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-field-wrapper">
                                    <label className="input-label" htmlFor="password">Contraseña del Sistema</label>
                                    <input 
                                        className="input-element" 
                                        id="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required 
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                    <PasswordStrengthMeter password={formData.password} />
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '2rem' }}>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
                                    {loading ? 'Procesando...' : 'Completar Registro y Continuar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default RegistroPago;