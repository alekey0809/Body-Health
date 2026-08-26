import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2, Trash2, Eye, X } from 'lucide-react';
import api from '../../../services/api';

const DIAS = [
  { num: 1, nombre: 'Lunes' },
  { num: 2, nombre: 'Martes' },
  { num: 3, nombre: 'Miércoles' },
  { num: 4, nombre: 'Jueves' },
  { num: 5, nombre: 'Viernes' },
  { num: 6, nombre: 'Sábado' },
  { num: 7, nombre: 'Domingo' },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const RutinasView = () => {
  const [uploading, setUploading] = useState({});
  const [status, setStatus] = useState({});
  const [messages, setMessages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const fileInputs = useRef({});

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/rutinas/status/all');
      if (res.data.ok) {
        const newStatus = {};
        res.data.days.forEach(d => { newStatus[d.day] = d.exists; });
        setStatus(newStatus);
      }
    } catch (err) {
      console.error('Error al obtener estado de rutinas:', err);
    }
  };

  const handleFileChange = (e, day) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setMessages(prev => ({ ...prev, [day]: { type: 'error', text: 'Solo se permiten archivos PDF' } }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessages(prev => ({ ...prev, [day]: { type: 'error', text: 'El archivo supera los 10MB' } }));
      return;
    }
    setSelectedFiles(prev => ({ ...prev, [day]: file }));
    setMessages(prev => ({ ...prev, [day]: { type: 'info', text: `${file.name} seleccionado` } }));
  };

  const clearFile = (day) => {
    setSelectedFiles(prev => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
    setMessages(prev => {
      const next = { ...prev };
      delete next[day];
      return next;
    });
    if (fileInputs.current[day]) {
      fileInputs.current[day].value = '';
    }
  };

  const handleUpload = async (day) => {
    const file = selectedFiles[day];
    if (!file) {
      setMessages(prev => ({ ...prev, [day]: { type: 'error', text: 'Selecciona un archivo PDF primero' } }));
      return;
    }

    setUploading(prev => ({ ...prev, [day]: true }));
    setMessages(prev => ({ ...prev, [day]: { type: 'info', text: 'Subiendo...' } }));

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await api.post(`/api/rutinas/upload/${day}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.ok) {
        setStatus(prev => ({ ...prev, [day]: true }));
        setMessages(prev => ({ ...prev, [day]: { type: 'success', text: res.data.message } }));
        clearFile(day);
      } else {
        setMessages(prev => ({ ...prev, [day]: { type: 'error', text: res.data.error || 'Error al subir' } }));
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error de conexión';
      setMessages(prev => ({ ...prev, [day]: { type: 'error', text: msg } }));
    } finally {
      setUploading(prev => ({ ...prev, [day]: false }));
    }
  };

  const handleView = (day) => {
    window.open(`${BACKEND_URL}/api/rutinas/${day}`, '_blank');
  };

  const handleDelete = async (day) => {
    if (!confirm(`¿Eliminar PDF del ${DIAS.find(d => d.num === day).nombre}?`)) return;
    setMessages(prev => ({ ...prev, [day]: { type: 'info', text: 'Eliminando...' } }));
    try {
      const res = await api.delete(`/api/rutinas/${day}`);
      if (res.data.ok) {
        setStatus(prev => ({ ...prev, [day]: false }));
        setMessages(prev => ({ ...prev, [day]: { type: 'success', text: res.data.message } }));
      } else {
        setMessages(prev => ({ ...prev, [day]: { type: 'error', text: res.data.error || 'Error al eliminar' } }));
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Error de conexión';
      setMessages(prev => ({ ...prev, [day]: { type: 'error', text: msg } }));
    }
  };

  return (
    <div className="rutinas-view">
      <div className="rutinas-header">
        <h2>Subir Rutinas Semanales (PDF)</h2>
        <p className="rutinas-subtitle">Un archivo por día. Se sobrescribe automáticamente.</p>
      </div>

      <div className="rutinas-grid">
        {DIAS.map(({ num, nombre }) => (
          <div key={num} className="rutina-card">
            <div className="rutina-day-header">
              <span className="day-number">Día {num}</span>
              <span className="day-name">{nombre}</span>
            </div>

            <div className="rutina-status">
              {status[num] ? (
                <span className="status-badge uploaded">
                  <FileCheck size={14} /> Subido
                </span>
              ) : (
                <span className="status-badge pending">
                  <AlertCircle size={14} /> Pendiente
                </span>
              )}
            </div>

            <input
              type="file"
              accept=".pdf"
              data-day={num}
              onChange={(e) => handleFileChange(e, num)}
              className="file-input"
              id={`file-${num}`}
              disabled={uploading[num]}
              ref={(el) => { fileInputs.current[num] = el; }}
            />

            <div className="rutina-actions">
              {selectedFiles[num] ? (
                <div className="file-selected">
                  <span className="file-name">
                    <Upload size={14} /> {selectedFiles[num].name}
                  </span>
                  <button 
                    className="btn-upload" 
                    onClick={() => handleUpload(num)}
                    disabled={uploading[num]}
                  >
                    {uploading[num] ? (
                      <>
                        <Loader2 size={16} className="spin" /> Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Subir PDF
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-clear" 
                    onClick={() => clearFile(num)}
                    disabled={uploading[num]}
                    title="Cancelar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor={`file-${num}`} className="btn-select-file" disabled={uploading[num]}>
                  <Upload size={16} />
                  Seleccionar PDF
                </label>
              )}

              {status[num] && !selectedFiles[num] && (
                <>
                  <button className="btn-view" onClick={() => handleView(num)} title="Ver PDF">
                    <Eye size={16} />
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(num)} title="Eliminar PDF">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>

            {messages[num] && (
              <div className={`rutina-message ${messages[num].type}`}>
                {messages[num].text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RutinasView;