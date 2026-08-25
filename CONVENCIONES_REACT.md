# Convenciones de Codificación y Seguridad React

## 1. Estructura del Proyecto

- Componentes funcionales con hooks (no clases)
- Nombrado de archivos: `PascalCase` para componentes, `camelCase` para archivos de utilidad
- Carpetas organizadas: `components/`, `pages/`, `context/`, `router/`, `services/`
- Export default al final de cada archivo de componente

## 2. Estilo de Código

### 2.1 Componentes
```jsx
function Componente({ prop1, prop2 }) {
  return <div>Contenido</div>;
}
export default Componente;
```

### 2.2 JSX
- Un solo elemento raíz en cada componente
- Atributos en orden: `className`, `style`, `onEvent`, `children`
- Usar comillas dobles para atributos HTML
- Auto-cierre para elementos que no tengan hijos

### 2.3 Hooks
- Nombre de hooks en `usePrefix`: `useAuth`, `useFetch`, etc.
- Los hooks deben estar en la parte superior de la función (Rules of Hooks)
- Dependencias explícitas en `useEffect` y `useMemo`

### 2.4 Importaciones
- React y ReactDOM primero
- Bibliotecas de terceros segundo
- Rutas absolutas desde `src/` (configurado en Vite/ESLint)
- Orden alfabético dentro de cada categoría

## 3. Seguridad

### 3.1 XSS (Cross-Site Scripting)
- Nunca insertar contenido usuario directamente en JSX sin sanitizar
- Usar `textContent` en lugar de `innerHTML` cuando sea posible
- Si es necesario usar `dangerouslySetHTML`, validar y limpiar el contenido

```jsx
// Mal
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Bueno
<div>{sanitizeHtml(userInput)}</div>
```

### 3.2 CSRF (Cross-Site Request Forgery)
- Incluir tokens CSRF en headers para requests POST/PUT/DELETE
- Usar bibliotecas como `axios` con interceptor de tokens

```jsx
// Interceptor en services/api.js
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3.3 Auth y Rutas
- Proteger rutas con contexto de autenticación
- Validar roles en el cliente y en el servidor
- Nunca confiar solo en validaciones del cliente

### 3.4 Inputs de Formularios
- Validar tipos de input en el cliente y servidor
- Usar `ref` de React para acceder al DOM cuando sea necesario
- Prevenir inyección en campos de texto

### 3.5 Dependencias
- Mantener `package.json` actualizado
- Usar `npm audit` regularmente
- Verificar versiones compatibles con React 19

## 4. Performance

- `useMemo` para cálculos costosos
- `useCallback` para callbacks que pasan a hijos
- `React.memo` para componentes que se renderizan frecuentemente
- Lazy loading con `React.lazy` y `Suspense`

## 5. Accesibilidad (a11y)
- Atributos `alt` descriptivos en imágenes
- Uso semántico de HTML (`nav`, `main`, `section`, `article`)
- Contraste de colores adecuado
- Navegación con teclado

## 6. Testing

- Componentes principales con Jest + React Testing Library
- Tests para contexto, hooks y rutas
- Coverage mínimo del 80%

## 7. Lint y Formatting

- `eslint` configurado con `react-hooks` y `react-refresh`
- `prettier` para formato consistente
- `npm run lint` antes de commits

## 8. Buenas Prácticas Adicionales

- Comentarios JSDoc para funciones públicas
- Variables descriptivas (evitar `data`, `resp`, `res` genéricas)
- Manejo de loading y error states consistente
- Archivos de contexto con tipos TypeScript cuando sea posible

---
*Última actualización: Agosto 2026*