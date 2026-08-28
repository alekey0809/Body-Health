import React, { useState, useRef } from 'react';
import { 
  Database, Download, Upload, CheckCircle, AlertCircle, Loader2, 
  Users, CreditCard, Shield, FileJson, AlertTriangle, RefreshCw, X 
} from 'lucide-react';
import { downloadBackup, restoreBackup } from '../../../services/backupService';

const RespaldoView = () => {
  // Export states
  const [downloading, setDownloading] = useState(false);
  const [exportMessage, setExportMessage] = useState(null); // { type: 'success' | 'error', text: string, filename?: string }

  // Import states
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreMode, setRestoreMode] = useState('merge'); // 'merge' | 'overwrite'
  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null); // { type: 'success' | 'error', text: string, details?: any }
  const [fileError, setFileError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef(null);

  // Generar y descargar respaldo
  const handleGenerateBackup = async () => {
    setDownloading(true);
    setExportMessage(null);
    try {
      const filename = await downloadBackup();
      setExportMessage({
        type: 'success',
        text: 'Respaldo generado y descargado con éxito.',
        filename: filename
      });
    } catch (error) {
      console.error('Error al generar respaldo:', error);
      setExportMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al comunicarse con el servidor para generar el respaldo.'
      });
    } finally {
      setDownloading(false);
    }
  };

  // Selección y validación del archivo de respaldo
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setRestoreMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      setFileError('Solo se permiten archivos de respaldo en formato .json');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Ejecución de la restauración de datos
  const handleExecuteRestore = async () => {
    if (!selectedFile) return;

    setShowConfirmModal(false);
    setRestoring(true);
    setRestoreMessage(null);

    try {
      const result = await restoreBackup(selectedFile, restoreMode);
      setRestoreMessage({
        type: 'success',
        text: result.message || 'Restauración de datos ejecutada con éxito.',
        details: result.details
      });
      // Limpiar archivo seleccionado
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error al restaurar respaldo:', error);
      const serverMessage = error.response?.data?.message || 'Error al procesar el archivo de respaldo.';
      setRestoreMessage({
        type: 'error',
        text: serverMessage,
        details: error.response?.data?.error
      });
    } finally {
      setRestoring(false);
    }
  };

  // Disparar proceso de restauración
  const handleStartRestore = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Por favor, selecciona un archivo .json de respaldo.');
      return;
    }

    if (restoreMode === 'overwrite') {
      setShowConfirmModal(true);
    } else {
      handleExecuteRestore();
    }
  };

  return (
    <div>
      {/* Title Section */}
      <section className="page-title-section" style={{ marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Seguridad y Mantenimiento del Sistema
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            Gestión de Respaldos y Restauración
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', maxWidth: '46rem' }}>
            Exporta copias de seguridad de la base de datos o restaura información previamente respaldada en formato JSON de forma segura mediante transacciones con rollback automático.
          </p>
        </div>
      </section>

      {/* Main Grid: Export and Import */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        
        {/* Card 1: Generar Respaldo */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gap: '1.5rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(224, 23, 23, 0.2)', color: 'var(--primary)' }}>
                <Database size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Generar Respaldo</h3>
                <p style={{ fontSize: '0.75rem', color: '#a8a29e' }}>Formato JSON (.json)</p>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#d6d3d1', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Descarga un archivo con la definición del esquema y la totalidad de los registros de <strong>Usuarios</strong>, <strong>Pagos</strong> (facturas y detalles) y <strong>Membresías</strong>.
            </p>

            {exportMessage && (
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  backgroundColor: exportMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${exportMessage.type === 'success' ? '#22c55e' : '#ef4444'}`,
                  color: exportMessage.type === 'success' ? '#4ade80' : '#f87171'
                }}
              >
                {exportMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <div style={{ fontSize: '0.8125rem' }}>
                  <p style={{ fontWeight: '600' }}>{exportMessage.text}</p>
                  {exportMessage.filename && (
                    <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
                      {exportMessage.filename}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateBackup}
            disabled={downloading}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.7 : 1,
              borderRadius: '0.5rem',
              border: 'none',
              width: '100%',
              boxShadow: '0 4px 12px rgba(224, 23, 23, 0.4)'
            }}
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generando...
              </>
            ) : (
              <>
                <Download size={18} />
                Descargar Respaldo JSON
              </>
            )}
          </button>
        </div>

        {/* Card 2: Restaurar Respaldo */}
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #e7e5e4',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            gap: '1.25rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <Upload size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1c1917' }}>Restaurar Respaldo</h3>
                <p style={{ fontSize: '0.75rem', color: '#78716c' }}>Carga de archivo JSON con validación</p>
              </div>
            </div>

            {/* Input de archivo exclusivo para .json */}
            <form onSubmit={handleStartRestore}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#44403c', marginBottom: '0.5rem' }}>
                  Seleccionar Archivo de Respaldo (.json)
                </label>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json,application/json" 
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: fileError ? '2px dashed #ef4444' : selectedFile ? '2px solid #2563eb' : '2px dashed #d6d3d1',
                    borderRadius: '0.625rem',
                    padding: '1rem',
                    textAlign: 'center',
                    backgroundColor: selectedFile ? '#f0f9ff' : '#fafaf9',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FileJson size={24} style={{ color: selectedFile ? '#2563eb' : '#78716c', marginBottom: '0.375rem' }} />
                  {selectedFile ? (
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e40af', wordBreak: 'break-all' }}>
                        {selectedFile.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.125rem' }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB - Clic para cambiar
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#44403c' }}>
                        Selecciona un archivo .json
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#a8a29e', marginTop: '0.125rem' }}>
                        Limitado exclusivamente a respaldos compatibles
                      </p>
                    </div>
                  )}
                </div>

                {fileError && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: '600' }}>
                    {fileError}
                  </p>
                )}
              </div>

              {/* Selector de Modo de Restauración */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '700', color: '#44403c', marginBottom: '0.5rem' }}>
                  Modo de Restauración
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.5rem',
                      border: restoreMode === 'merge' ? '1px solid #2563eb' : '1px solid #e7e5e4',
                      backgroundColor: restoreMode === 'merge' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="restoreMode" 
                      value="merge" 
                      checked={restoreMode === 'merge'} 
                      onChange={(e) => setRestoreMode(e.target.value)}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1c1917' }}>Reintegrar Datos (Merge)</span>
                      <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.125rem' }}>
                        Conserva los datos actuales e inserta o actualiza únicamente los datos del respaldo.
                      </p>
                    </div>
                  </label>

                  <label 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '0.5rem',
                      border: restoreMode === 'overwrite' ? '1px solid #dc2626' : '1px solid #e7e5e4',
                      backgroundColor: restoreMode === 'overwrite' ? '#fef2f2' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="restoreMode" 
                      value="overwrite" 
                      checked={restoreMode === 'overwrite'} 
                      onChange={(e) => setRestoreMode(e.target.value)}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#b91c1c' }}>Sobrescribir Datos (Overwrite)</span>
                      <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.125rem' }}>
                        Elimina los registros actuales de las tablas clave y restaura exactamente los del respaldo.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={restoring || !selectedFile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: restoreMode === 'overwrite' ? '#dc2626' : '#2563eb',
                  cursor: restoring || !selectedFile ? 'not-allowed' : 'pointer',
                  opacity: restoring || !selectedFile ? 0.6 : 1,
                  borderRadius: '0.5rem',
                  border: 'none',
                  width: '100%',
                  transition: 'background-color 0.2s'
                }}
              >
                {restoring ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Ejecutando Transacción...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Restaurar Base de Datos
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Banner de Resultado de la Restauración */}
      {restoreMessage && (
        <div 
          style={{
            padding: '1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.875rem',
            backgroundColor: restoreMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${restoreMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: restoreMessage.type === 'success' ? '#15803d' : '#b91c1c'
          }}
        >
          {restoreMessage.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: '700', fontSize: '0.9375rem' }}>{restoreMessage.text}</h4>
            {restoreMessage.details && typeof restoreMessage.details === 'object' && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                <p><strong>Tablas procesadas:</strong> {restoreMessage.details.tablesRestored}</p>
                <p><strong>Filas afectadas:</strong> {restoreMessage.details.rowsProcessed}</p>
                <p><strong>Modo aplicado:</strong> {restoreMessage.details.mode === 'overwrite' ? 'Sobrescribir' : 'Reintegrar'}</p>
              </div>
            )}
            {restoreMessage.details && typeof restoreMessage.details === 'string' && (
              <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                Detalle del error: {restoreMessage.details}
              </p>
            )}
            {restoreMessage.type === 'error' && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontStyle: 'italic' }}>
                * Se ejecutó un rollback automático en la base de datos. Ningún dato fue alterado ni dañado.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Sobrescribir */}
      {showConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              maxWidth: '28rem',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setShowConfirmModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#78716c' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Confirmar Sobrescritura</h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#44403c', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              ¿Estás seguro de que deseas <strong>sobrescribir todos los datos actuales</strong> de las tablas clave? Esta acción limpiará los registros actuales e insertará la información proveniente del archivo <code>{selectedFile?.name}</code>.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d6d3d1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#44403c',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteRestore}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Sí, Sobrescribir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Included Tables Summary */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1c1917' }}>
        Tablas e Información Incluidas en el Respaldo
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Usuarios */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#fee2e2', color: '#dc2626' }}>
              <Users size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>Usuarios (`usuario`)</h4>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#78716c', lineHeight: '1.5' }}>
            Cuentas de usuario, nombres, apellidos, correo electrónico, documento de identidad, rol y datos de perfil.
          </p>
        </div>

        {/* Card 2: Pagos */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <CreditCard size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>Historial de Pagos (`factura`)</h4>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#78716c', lineHeight: '1.5' }}>
            Facturas emitidas, detalles de compra, precios unitarios, fechas/horas y catálogo de estados de pago (`estado_pago`).
          </p>
        </div>

        {/* Card 3: Membresías */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>Membresías (`membresia`)</h4>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#78716c', lineHeight: '1.5' }}>
            Planes contratados por los usuarios, fechas de inicio, fechas de vencimiento y estado de membresía general.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RespaldoView;

