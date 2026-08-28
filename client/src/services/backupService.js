import api, { getCsrfHeaders } from './api';

export const downloadBackup = async () => {
  const response = await api.get('/api/backup/export', {
    headers: getCsrfHeaders(),
    responseType: 'blob'
  });

  // Extraer nombre del archivo del header Content-Disposition
  let filename = '';
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  if (!filename) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    filename = `backup_sistema_${ts}.json`;
  }

  // Crear Blob y activar la descarga en el navegador
  const blob = new Blob([response.data], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return filename;
};

export const restoreBackup = async (file, mode = 'merge') => {
  const formData = new FormData();
  formData.append('backupFile', file);
  formData.append('mode', mode);

  const response = await api.post('/api/backup/restore', formData, {
    headers: {
      ...getCsrfHeaders(),
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

