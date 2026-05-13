export const EFCP_FIELDS = [
  { id: 'area', label: 'Área', type: 'text', placeholder: 'Ej. Tecnología' },
  { id: 'tecnico', label: 'Técnico Responsable', type: 'text', placeholder: 'Nombre del técnico' },
  { id: 'aplicacion', label: 'Nombre de la Aplicación', type: 'text', placeholder: 'Ej. GeoGebra' },
  { 
    id: 'conectividad', 
    label: 'Conectividad', 
    type: 'radio', 
    options: ['Online', 'Offline', 'Mixto'] 
  },
  { 
    id: 'compatibilidad', 
    label: 'Compatibilidad', 
    type: 'checkbox-group', 
    options: ['Windows', 'Linux', 'Android', 'iOS', 'Web'] 
  },
  { 
    id: 'usabilidad', 
    label: 'Nivel de Usabilidad', 
    type: 'select', 
    options: ['Alta', 'Media', 'Baja'] 
  },
  { 
    id: 'pertinencia', 
    label: 'Pertinencia Curricular', 
    type: 'select', 
    options: ['Alta', 'Media', 'Baja'] 
  },
  { 
    id: 'rol', 
    label: 'Rol Protagónico', 
    type: 'radio', 
    options: ['Activo', 'Pasivo', 'Colaborativo'] 
  },
  { 
    id: 'contextualizacion', 
    label: '¿Permite Contextualización?', 
    type: 'radio', 
    options: ['Sí', 'No'] 
  },
  { 
    id: 'nivel', 
    label: 'Nivel Educativo', 
    type: 'checkbox-group', 
    options: ['Primaria', 'Secundaria'] 
  },
  { 
    id: 'grados', 
    label: 'Grados', 
    type: 'checkbox-group', 
    options: ['1ro', '2do', '3ro', '4to', '5to', '6to'] 
  },
  { 
    id: 'recomendacion', 
    label: 'Recomendación Final', 
    type: 'select', 
    options: ['Recomendado', 'Recomendado con reservas', 'No recomendado'] 
  },
  { id: 'observaciones', label: 'Observaciones', type: 'textarea' }
];
