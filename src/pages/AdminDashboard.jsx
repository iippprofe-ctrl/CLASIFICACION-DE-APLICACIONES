import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileSpreadsheet, Plus, Filter, Download, LogOut, Search, BarChart as BarChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const API_URL = 'https://script.google.com/macros/s/AKfycbyohjcQ8j16bTV97q2axzQnwgxtFISBS6Jsx0SSZwaRyUrO3X0QYR2TXuwiQIkbPK3hqQ/exec';
  const [activeTab, setActiveTab] = useState('stats');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', user: '', password: '', role: 'User' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    if (activeTab === 'results' || activeTab === 'stats' || activeTab === 'stats_visual') {
      fetchData();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mapeo inteligente de campos para soportar tildes del Excel
  const getFieldValue = (obj, field) => {
    const mappings = {
      'Area': ['Área', 'Area', 'area'],
      'Recomendacion': ['Recomendación', 'Recomendacion', 'recomendacion'],
      'Tecnico': ['Técnico', 'Tecnico', 'tecnico', 'usuario'],
      'Contextualizacion': ['Adaptabilidad', 'Contextualización', 'contextualizacion'],
      'Pertinencia': ['Pertinencia', 'Pertinencia Curricular', 'pertinencia'],
    };
    
    const possibleKeys = mappings[field] || [field, field.toLowerCase()];
    for (let key of possibleKeys) {
      if (obj[key] !== undefined) return obj[key];
    }
    return null;
  };

  const getGenericData = (field, fallback = 'No definido') => {
    const counts = {};
    responses.forEach(r => {
      const val = getFieldValue(r, field) || fallback;
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  };

  const getMultiSelectData = (field) => {
    const counts = {};
    responses.forEach(r => {
      const val = getFieldValue(r, field) || "";
      const parts = String(val).split(',').map(p => p.trim()).filter(p => p);
      parts.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // ... (handleCreateUser and stats calculation remain the same)

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?type=users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      // Enviamos los datos en la URL para máxima compatibilidad
      const queryParams = new URLSearchParams({
        action: 'createUser',
        nombre: newUser.name,
        usuario: newUser.user,
        password: newUser.password,
        rol: newUser.role
      }).toString();

      await fetch(`${API_URL}?${queryParams}`, {
        method: 'POST',
        mode: 'no-cors'
      });

      alert('Usuario creado exitosamente. Se reflejará en la lista en unos segundos.');
      setShowUserModal(false);
      setNewUser({ name: '', user: '', password: '', role: 'User' });
      
      // Recargar lista después de un breve delay
      setTimeout(() => fetchUsers(), 2000);
    } catch (error) {
      alert('Error al procesar la solicitud.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Estadísticas Reales basadas en los datos de Google Sheets
  const stats = [
    { label: 'Total Fichas', value: responses.length, icon: <FileSpreadsheet />, color: '#3b82f6' },
    { label: 'Técnicos', value: users.length || '...', icon: <Users />, color: '#10b981' },
    { label: 'Recomendadas', value: responses.filter(r => (r.Recomendacion || r.recomendacion) === 'Recomendado').length, icon: <Plus />, color: '#f59e0b' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredResponses = responses.filter(r => 
    (r.Aplicacion || r.aplicacion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.Tecnico || r.tecnico || r.usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.Area || r.area || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: '#1e3a8a', color: 'white', padding: '2rem' }}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Ministerio_de_Educacion_de_Bolivia.png" 
          alt="Logo" 
          style={{ height: '45px', marginBottom: '1.5rem', filter: 'brightness(0) invert(1)' }} 
        />
        <h2 style={{ color: 'white', marginBottom: '2.5rem', fontSize: '1.5rem' }}>EFCP Admin</h2>
        
        <nav>
          {[
            { id: 'stats', label: 'Dashboard', icon: <FileSpreadsheet size={20} /> },
            { id: 'stats_visual', label: 'Estadísticas Visuales', icon: <BarChartIcon size={20} /> },
            { id: 'users', label: 'Gestión Usuarios', icon: <Users size={20} /> },
            { id: 'results', label: 'Ver Resultados', icon: <Search size={20} /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                backgroundColor: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                transition: '0.2s'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={logout}
          style={{ 
            marginTop: 'auto', 
            position: 'absolute', 
            bottom: '2rem', 
            left: '2rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>
              {activeTab === 'stats' ? 'Panel de Control' : activeTab === 'users' ? 'Usuarios' : 'Resultados de Formularios'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Bienvenido, {user.name}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
              <Download size={18} /> Exportar Reporte
            </button>
            {activeTab === 'users' && (
              <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
                <Plus size={18} /> Nuevo Usuario
              </button>
            )}
          </div>
        </header>

        {activeTab === 'stats' && (
          <div className="dashboard-grid">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                  <h2 style={{ fontSize: '2rem', color: '#1e3a8a', fontWeight: '800' }}>{stat.value}</h2>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'stats_visual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>
            
            {/* Hero Section: Resumen Ejecutivo */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
              borderRadius: '24px', 
              padding: '3rem', 
              color: 'white',
              boxShadow: '0 20px 40px rgba(30, 58, 138, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Reporte de Calidad EFCP</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Análisis integral de herramientas tecnológicas en Aulas Conectadas</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1' }}>
                  {((responses.filter(r => getFieldValue(r, 'Recomendacion') === 'Recomendado').length / (responses.length || 1)) * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Índice de Recomendación</div>
              </div>
            </div>

            {/* Sección 1: Análisis de Calidad y Áreas */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '4px', height: '32px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: '700' }}>Impacto Curricular por Áreas</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'white' }}>
                  <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>Distribución de aplicaciones según el área académica de aplicación.</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getGenericData('Area')} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '12px', fontWeight: '600', fill: '#475569' }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <InfoStatCard 
                    title="Materia Predominante" 
                    value={getGenericData('Area').sort((a,b) => b.value - a.value)[0]?.name || 'N/A'} 
                    desc="Área con mayor cantidad de recursos registrados."
                  />
                  <InfoStatCard 
                    title="Licencias Gratuitas" 
                    value={getGenericData('Licencia').find(l => l.name === 'Gratuita')?.value || 0} 
                    desc="Herramientas de libre acceso para estudiantes."
                  />
                </div>
              </div>
            </section>

            {/* Sección 2: Perfil Técnico y Pedagógico */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
              <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e3a8a' }}>Conectividad</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={getGenericData('Conectividad')} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {getGenericData('Conectividad').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>Disponibilidad de uso Offline vs Online</p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e3a8a' }}>Idioma Predominante</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={getGenericData('Idioma')} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {getGenericData('Idioma').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>Barrera lingüística en las aplicaciones</p>
              </div>

              <div className="glass-card" style={{ padding: '2rem', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e3a8a' }}>Nivel de Usabilidad</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getGenericData('Usabilidad')}>
                    <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>Facilidad de uso para el estudiante</p>
              </div>
            </section>

            {/* Sección 3: Alcance Educativo */}
            <section className="glass-card" style={{ padding: '3rem', backgroundColor: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#1e293b', fontWeight: '800', marginBottom: '1rem' }}>Alcance por Nivel y Grados</h2>
                <p style={{ color: '#64748b' }}>Visualización de la cobertura educativa del software evaluado en los diferentes grados escolares.</p>
              </div>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMultiSelectData('Grados')}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: '600' }} />
                    <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card" style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1.2rem' }}>NOMBRE COMPLETO</th>
                  <th style={{ padding: '1.2rem' }}>USUARIO</th>
                  <th style={{ padding: '1.2rem' }}>ROL</th>
                  <th style={{ padding: '1.2rem' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>Cargando usuarios...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center' }}>No hay usuarios registrados.</td></tr>
                ) : users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem', fontWeight: '600' }}>{u.Nombre || u.nombre}</td>
                    <td style={{ padding: '1.2rem' }}>{u.Usuario || u.usuario}</td>
                    <td style={{ padding: '1.2rem' }}>
                       <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: (u.Rol || u.rol) === 'Master' ? '#eff6ff' : '#f1f5f9', color: (u.Rol || u.rol) === 'Master' ? '#3b82f6' : '#64748b', fontWeight: '600' }}>
                        {u.Rol || u.rol}
                       </span>
                    </td>
                    <td style={{ padding: '1.2rem' }}>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> Activo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="glass-card" style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #f1f5f9' }}>
            <div style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="Buscar por aplicación, área o técnico..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1.2rem' }}>APLICACIÓN</th>
                  <th style={{ padding: '1.2rem' }}>ÁREA</th>
                  <th style={{ padding: '1.2rem' }}>TÉCNICO</th>
                  <th style={{ padding: '1.2rem' }}>FECHA</th>
                  <th style={{ padding: '1.2rem' }}>FICHA</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Cargando registros...</td></tr>
                ) : filteredResponses.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No se encontraron registros.</td></tr>
                ) : filteredResponses.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem', fontWeight: '600', color: '#1e293b' }}>{r.Aplicacion || r.aplicacion}</td>
                    <td style={{ padding: '1.2rem', color: '#64748b' }}>{r.Area || r.area}</td>
                    <td style={{ padding: '1.2rem', color: '#64748b' }}>{r.Tecnico || r.tecnico || r.usuario}</td>
                    <td style={{ padding: '1.2rem', color: '#64748b' }}>{new Date(r.Fecha || r.Timestamp).toLocaleDateString()}</td>
                    <td style={{ padding: '1.2rem' }}>
                      <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: '#f1f5f9', color: '#1e3a8a', fontWeight: '600' }}>
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Modal Nuevo Usuario */}
        {showUserModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '450px', padding: '2rem', backgroundColor: 'white' }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1e3a8a' }}>Crear Nuevo Usuario</h2>
              <form onSubmit={handleCreateUser}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Nombre Completo</label>
                  <input type="text" className="input-field" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="Ej. Juan Pérez" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Usuario (Login)</label>
                  <input type="text" className="input-field" required value={newUser.user} onChange={e => setNewUser({...newUser, user: e.target.value})} placeholder="Ej. jperez" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Contraseña</label>
                  <input type="password" className="input-field" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" />
                </div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Rol del Usuario</label>
                  <select className="input-field" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="User">Técnico (Usuario Estándar)</option>
                    <option value="Master">Administrador (Acceso Total)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowUserModal(false)} className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#64748b' }}>Cancelar</button>
                  <button type="submit" disabled={isCreatingUser} className="btn btn-primary" style={{ flex: 1 }}>
                    {isCreatingUser ? 'Procesando...' : 'Guardar Usuario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

// Componente Auxiliar para Gráficos con Porcentajes
const ChartCard = ({ title, data, type }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: 'white', height: '350px', border: '1px solid #f1f5f9' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1e3a8a', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase' }}>{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} fichas`, 'Cantidad']} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          </PieChart>
        ) : (
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '10px', fontWeight: '600' }} />
            <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Tarjeta Informativa de Datos Clave
const InfoStatCard = ({ title, value, desc }) => (
  <div className="glass-card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</h4>
    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '0.5rem' }}>{value}</div>
    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</p>
  </div>
);

export default AdminDashboard;
