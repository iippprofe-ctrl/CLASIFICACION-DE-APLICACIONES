import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Download, LogOut, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserForm = () => {
  const { user, logout } = useAuth();
  const initialState = {
    area: '',
    aplicacion: '',
    conectividad: '',
    compatibilidad: [],
    compatibilidadOtro: '',
    licencia: '',
    idioma: '',
    usabilidad: '',
    pertinencia: '',
    rol: '',
    contextualizacion: '',
    nivel: [],
    grados: [],
    recomendacion: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckbox = (id, option, checked) => {
    const current = formData[id] || [];
    const updated = checked 
      ? [...current, option]
      : current.filter(o => o !== option);
    setFormData(prev => ({ ...prev, [id]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos obligatorios
    const requiredFields = [
      { id: 'area', label: 'Área' },
      { id: 'aplicacion', label: 'Aplicación' },
      { id: 'conectividad', label: 'Conectividad' },
      { id: 'licencia', label: 'Licencia' },
      { id: 'idioma', label: 'Idioma' },
      { id: 'usabilidad', label: 'Usabilidad' },
      { id: 'pertinencia', label: 'Pertinencia Curricular' },
      { id: 'rol', label: 'Rol Protagónico' },
      { id: 'contextualizacion', label: 'Contextualización' },
      { id: 'recomendacion', label: 'Recomendación Final' }
    ];

    for (const field of requiredFields) {
      if (!formData[field.id]) {
        alert(`Por favor, complete el campo: ${field.label}`);
        return;
      }
    }

    if (formData.compatibilidad.length === 0 && !formData.compatibilidadOtro) {
      alert('Por favor, seleccione al menos una opción de Compatibilidad.');
      return;
    }
    if (formData.nivel.length === 0) {
      alert('Por favor, seleccione al menos un Nivel Educativo.');
      return;
    }
    if (formData.grados.length === 0) {
      alert('Por favor, seleccione al menos un Grado sugerido.');
      return;
    }

    setIsSubmitting(true);
    const API_URL = 'https://script.google.com/macros/s/AKfycbyohjcQ8j16bTV97q2axzQnwgxtFISBS6Jsx0SSZwaRyUrO3X0QYR2TXuwiQIkbPK3hqQ/exec';

    try {
      const params = new URLSearchParams();
      params.append('usuario', user.name);
      params.append('area', formData.area);
      params.append('aplicacion', formData.aplicacion);
      params.append('conectividad', formData.conectividad);
      params.append('compatibilidad', (formData.compatibilidad || []).join(", ") + (formData.compatibilidadOtro ? ` (${formData.compatibilidadOtro})` : ""));
      params.append('licencia', formData.licencia);
      params.append('idioma', formData.idioma);
      params.append('usabilidad', formData.usabilidad);
      params.append('pertinencia', formData.pertinencia);
      params.append('rol', formData.rol);
      params.append('contextualizacion', formData.contextualizacion);
      params.append('nivel', (formData.nivel || []).join(", "));
      params.append('grados', (formData.grados || []).join(", "));
      params.append('recomendacion', formData.recomendacion);

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: params,
      });

      alert('¡Ficha enviada con éxito! Iniciando descarga del PDF...');
      await generatePDF();
      
      // RESET DEL FORMULARIO
      setFormData(initialState);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Verifique su conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    const input = document.getElementById('pdf-template');
    input.style.display = 'flex'; // Use flex for centering
    const canvas = await html2canvas(input, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    // Tamaño Carta: 215.9 x 279.4 mm
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`FECP_01_${formData.aplicacion || 'Ficha'}.pdf`);
    input.style.display = 'none';
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Ministerio_de_Educacion_de_Bolivia.png" 
              alt="Logo MINEDU" 
              style={{ height: '50px', objectFit: 'contain' }} 
            />
            <div>
              <h1 style={{ fontSize: '1.6rem', color: '#1e3a8a', fontWeight: '800' }}>FECP-01 | Aulas Conectadas</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>Técnico Responsable: <span style={{ fontWeight: '700', color: '#1e3a8a' }}>{user.name}</span></p>
            </div>
          </div>
          <button onClick={logout} className="btn" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#ef4444' }}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '2.5rem', backgroundColor: 'white' }}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Área</label>
                <input type="text" className="input-field" onChange={(e) => handleChange('area', e.target.value)} required placeholder="Ej. Matemáticas" />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Aplicación</label>
                <input type="text" className="input-field" onChange={(e) => handleChange('aplicacion', e.target.value)} required placeholder="Nombre del software" />
              </div>
            </div>

            {/* SECCIÓN I: CARACTERÍSTICAS TÉCNICAS */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#1e3a8a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> I. CARACTERÍSTICAS TÉCNICAS
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Conectividad</h3>
                  {['Online', 'Offline', 'Mixto'].map(opt => (
                    <label key={opt} style={{ display: 'block', marginBottom: '0.6rem', cursor: 'pointer' }}>
                      <input type="radio" name="conectividad" onChange={() => handleChange('conectividad', opt)} required /> {opt}
                    </label>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Compatibilidad</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {['Windows', 'Linux', 'Web'].map(opt => (
                      <label key={opt} style={{ cursor: 'pointer' }}>
                        <input type="checkbox" onChange={(e) => handleCheckbox('compatibilidad', opt, e.target.checked)} /> {opt}
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>Otro:</label>
                    <input type="text" className="input-field" style={{ padding: '0.4rem', marginTop: '0.2rem' }} onChange={(e) => handleChange('compatibilidadOtro', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Accesibilidad</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>Licencia:</label>
                      <select className="input-field" value={formData.licencia} onChange={(e) => handleChange('licencia', e.target.value)} required>
                        <option value="">Seleccione...</option>
                        <option value="Gratuita">Gratuita</option>
                        <option value="Paga">Paga</option>
                        <option value="Demo">Demo / Trial</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem' }}>Idioma:</label>
                      <select className="input-field" value={formData.idioma} onChange={(e) => handleChange('idioma', e.target.value)} required>
                        <option value="">Seleccione...</option>
                        <option value="Castellano">Castellano</option>
                        <option value="Inglés">Inglés</option>
                        <option value="Originario">Originario</option>
                        <option value="Bilingüe">Bilingüe</option>
                        <option value="Multilingüe">Multilingüe</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Usabilidad</h3>
                  <select className="input-field" onChange={(e) => handleChange('usabilidad', e.target.value)} required>
                    <option value="">Seleccione Nivel...</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN II: CARACTERÍSTICAS PEDAGÓGICAS */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#1e3a8a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> II. CARACTERÍSTICAS PEDAGÓGICAS
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Calidad Curricular</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>Pertinencia Curricular:</label>
                    <select className="input-field" onChange={(e) => handleChange('pertinencia', e.target.value)} required>
                      <option value="">Seleccione...</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem' }}>Rol Protagónico:</label>
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.4rem' }}>
                      {['Activo', 'Pasivo', 'Colaborativo'].map(opt => (
                        <label key={opt} style={{ fontSize: '0.9rem' }}>
                          <input type="radio" name="rol" onChange={() => handleChange('rol', opt)} /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Adaptación y Nivel</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>Contextualización (¿Es adaptable?):</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
                      <label><input type="radio" name="context" onChange={() => handleChange('contextualizacion', 'Sí')} /> Sí</label>
                      <label><input type="radio" name="context" onChange={() => handleChange('contextualizacion', 'No')} /> No</label>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem' }}>Nivel Educativo Sugerido:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                      <label><input type="checkbox" onChange={(e) => handleCheckbox('nivel', 'Primaria', e.target.checked)} /> Primaria</label>
                      <label><input type="checkbox" onChange={(e) => handleCheckbox('nivel', 'Secundaria', e.target.checked)} /> Secundaria</label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1rem' }}>Grados Específicos Sugeridos</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  {['1ro', '2do', '3ro', '4to', '5to', '6to'].map(opt => (
                    <label key={opt} style={{ cursor: 'pointer', fontWeight: '500' }}>
                      <input type="checkbox" onChange={(e) => handleCheckbox('grados', opt, e.target.checked)} /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontWeight: '700', color: '#1e3a8a', display: 'block', marginBottom: '0.8rem' }}>RECOMENDACIÓN FINAL</label>
              <div style={{ display: 'flex', gap: '2rem' }}>
                {['Recomendado', 'Recomendado con Reservas', 'No Recomendado'].map(opt => (
                  <label key={opt} style={{ padding: '0.8rem 1.2rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="recom" onChange={() => handleChange('recomendacion', opt)} /> {opt}
                  </label>
                ))}
              </div>
            </div>


            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
              {isSubmitting ? 'Guardando...' : 'FINALIZAR Y GENERAR PDF'} <Download size={20} />
            </button>
          </form>
        </motion.div>
      </div>

      {/* PDF TEMPLATE - RÉPLICA EXACTA Y CENTRADA */}
      <div id="pdf-template" style={{ 
        display: 'none', 
        width: '215.9mm', 
        minHeight: '279.4mm', 
        padding: '10mm 15mm 15mm 15mm', 
        backgroundColor: 'white', 
        color: 'black', 
        fontFamily: 'Arial, sans-serif', 
        fontSize: '10pt',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Marca de Agua */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: '0.04', width: '120mm', zIndex: 0 }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Escudo_de_Bolivia.svg/800px-Escudo_de_Bolivia.svg.png" alt="watermark" style={{ width: '100%' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '185mm', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo Superior Izquierdo */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8mm' }}>
            <img 
              crossOrigin="anonymous"
              src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Ministerio_de_Educacion_de_Bolivia.png" 
              alt="logo" 
              style={{ height: '25mm', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
            <h2 style={{ fontSize: '11pt', margin: 0, fontWeight: 'bold' }}>FICHA DE EXPLORACIÓN Y CLASIFICACIÓN DE PROGRAMAS (FECP-01)</h2>
            <p style={{ fontSize: '10pt', margin: '1mm 0 0', fontStyle: 'italic', fontWeight: 'bold' }}>Programa Nacional "Aulas Conectadas"</p>
          </div>

          <div style={{ marginBottom: '5mm', fontSize: '10.5pt' }}>
            <p style={{ margin: '1mm 0' }}><strong>Área:</strong> <u>&nbsp; {formData.area} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
            <p style={{ margin: '1mm 0' }}><strong>Técnico:</strong> <u>&nbsp; {user.name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
            <p style={{ margin: '1mm 0' }}><strong>Aplicación:</strong> <u>&nbsp; {formData.aplicacion} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.2px solid black', fontSize: '8.5pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc' }}>
                <th style={{ border: '1.2px solid black', padding: '1.5mm', width: '25%', fontWeight: 'bold' }}>SECCIÓN</th>
                <th style={{ border: '1.2px solid black', padding: '1.5mm', width: '40%', fontWeight: 'bold' }}>CRITERIOS DE EVALUACIÓN</th>
                <th style={{ border: '1.2px solid black', padding: '1.5mm', fontWeight: 'bold' }}>DETALLES Y OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="4" style={{ border: '1.2px solid black', padding: '4mm 2mm', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>I. CARACTERÍSTICAS TÉCNICAS</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Conectividad:</strong> entornos con y sin conexión.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.conectividad === 'Online' ? 'X' : ' '}) Online &nbsp; ({formData.conectividad === 'Offline' ? 'X' : ' '}) Offline <br/>
                  ({formData.conectividad === 'Mixto' ? 'X' : ' '}) Mixto
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Compatibilidad:</strong> ejecución en portátiles.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.compatibilidad?.includes('Windows') ? 'X' : ' '}) Windows &nbsp; ({formData.compatibilidad?.includes('Linux') ? 'X' : ' '}) Linux <br/>
                  ({formData.compatibilidad?.includes('Web') ? 'X' : ' '}) Web &nbsp; ({formData.compatibilidadOtro ? 'X' : ' '}) Otro: <u>{formData.compatibilidadOtro}</u>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Accesibilidad:</strong> Idioma y licencia.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  Licencia: <u>{formData.licencia}</u> &nbsp; Idioma: <u>{formData.idioma}</u>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Usabilidad:</strong> facilidad de uso por nivel.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.usabilidad === 'Alta' ? 'X' : ' '}) Alta &nbsp; ({formData.usabilidad === 'Media' ? 'X' : ' '}) Media &nbsp; ({formData.usabilidad === 'Baja' ? 'X' : ' '}) Baja
                </td>
              </tr>
              <tr>
                <td rowSpan="5" style={{ border: '1.2px solid black', padding: '4mm 2mm', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }}>II. CARACTERÍSTICAS PEDAGÓGICAS</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Pertinencia curricular:</strong> vinculación con contenidos.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.pertinencia === 'Alta' ? 'X' : ' '}) Alta &nbsp; ({formData.pertinencia === 'Media' ? 'X' : ' '}) Media &nbsp; ({formData.pertinencia === 'Baja' ? 'X' : ' '}) Baja
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Rol protagónico:</strong> centro del aprendizaje.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.rol === 'Activo' ? 'X' : ' '}) Activo &nbsp; ({formData.rol === 'Pasivo' ? 'X' : ' '}) Pasivo <br/>
                  ({formData.rol === 'Colaborativo' ? 'X' : ' '}) Colaborativo
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Contextualización:</strong> Adaptación sociocultural.</td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ¿Es adaptable? &nbsp; ({formData.contextualizacion === 'Sí' ? 'X' : ' '}) Sí &nbsp; ({formData.contextualizacion === 'No' ? 'X' : ' '}) No
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Nivel educativo sugerido.</strong></td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  ({formData.nivel?.includes('Primaria') ? 'X' : ' '}) Primaria &nbsp; ({formData.nivel?.includes('Secundaria') ? 'X' : ' '}) Secundaria
                </td>
              </tr>
              <tr>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}><strong>Grados sugeridos.</strong></td>
                <td style={{ border: '1.2px solid black', padding: '1.2mm 2mm' }}>
                  {['1ro', '2do', '3ro', '4to', '5to', '6to'].map(g => (
                     <span key={g} style={{ marginRight: '2.5mm' }}>({formData.grados?.includes(g) ? 'X' : ' '}) {g}</span>
                  ))}
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1.2px solid black', padding: '2mm', fontWeight: 'bold' }}>Recomendación del uso de la aplicación.</td>
                <td style={{ border: '1.2px solid black', padding: '2mm' }}>
                  ({formData.recomendacion === 'Recomendado' ? 'X' : ' '}) Rec. &nbsp;
                  ({formData.recomendacion === 'Recomendado con Reservas' ? 'X' : ' '}) Rec. c/Reservas <br/>
                  ({formData.recomendacion === 'No Recomendado' ? 'X' : ' '}) No Recomendado
                </td>
              </tr>
            </tbody>
          </table>

          {/* Área de Firma con más espacio */}
          <div style={{ marginTop: 'auto', marginBottom: '15mm', textAlign: 'center', paddingTop: '35mm' }}>
            <div style={{ width: '85mm', borderTop: '1.2px solid black', margin: '0 auto', paddingTop: '2.5mm' }}>
              <strong style={{ fontSize: '10pt' }}>FIRMA Y SELLO DEL TÉCNICO</strong>
            </div>
          </div>

          {/* Footer Ajustado */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
             <div style={{ textAlign: 'right', fontSize: '7.5pt', color: '#444', lineHeight: '1.2' }}>
                <strong style={{ color: '#000' }}>MINISTERIO DE EDUCACIÓN</strong><br/>
                Av. Arce, Nº 2147<br/>
                Teléfonos: +591 (2) 2442144 - 2681200<br/>
                La Paz - Bolivia
             </div>
          </div>

          {/* Barra de colores al final */}
          <div style={{ position: 'absolute', bottom: '-15mm', left: '-15mm', width: '215.9mm', height: '3mm', display: 'flex' }}>
            <div style={{ flex: 1, backgroundColor: '#ED1C24' }}></div>
            <div style={{ flex: 1, backgroundColor: '#FFF200' }}></div>
            <div style={{ flex: 1, backgroundColor: '#00A651' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
