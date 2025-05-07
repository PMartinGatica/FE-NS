import React from 'react';
import Tarjeta from './Tarjeta';
import TablaPrimeNtf from './TablaPrimeNtf';

// Importación correcta de hooks con export default
import useMQS from '../hooks/useMQS';
import useMes from '../hooks/useMes';
import useYield from '../hooks/useYield';

// Componentes temporales para sustituir los que faltan
const TablaControlesDiarios = () => (
  <Tarjeta titulo="Controles Diarios">
    <p>Tabla de controles diarios (componente por implementar)</p>
  </Tarjeta>
);

const OrganizacionChart = () => (
  <Tarjeta titulo="Organigrama">
    <p>Organigrama de la empresa (componente por implementar)</p>
  </Tarjeta>
);

const PaginaDocumentos = ({ currentUser }) => (
  <Tarjeta titulo="Documentos">
    <p>Página de documentos para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

const PaginaLanzamientos = ({ currentUser }) => (
  <Tarjeta titulo="Lanzamientos">
    <p>Página de lanzamientos para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

const PaginaFormacion = ({ currentUser }) => (
  <Tarjeta titulo="Formación">
    <p>Página de formación para usuario: {currentUser?.nombre || 'Invitado'}</p>
  </Tarjeta>
);

const ContenidoTablero = ({ activePage, user }) => {
  // Usa los hooks correctamente importados
  const { topFailures, cargando: cargandoMQS, error: errorMQS } = useMQS();
  const { datosMes, cargando: cargandoMes, error: errorMes } = useMes();
  const { datosYield, cargando: cargandoYield, error: errorYield } = useYield();

  // Contenido de la página principal
  const renderPaginaInicio = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Tarjeta titulo="Metrics Prime / NTF por Línea">
          {cargandoMQS ? (
            <p>Cargando métricas...</p>
          ) : errorMQS ? (
            <p>Error al cargar datos: {errorMQS.message}</p>
          ) : (
            <TablaPrimeNtf data={topFailures} />
          )}
        </Tarjeta>
        
        <Tarjeta titulo="Datos de MES">
          {cargandoMes ? (
            <p>Cargando datos de MES...</p>
          ) : errorMes ? (
            <p>Error al cargar datos: {errorMes.message}</p>
          ) : (
            <p>Datos de MES cargados: {datosMes.length} registros</p>
          )}
        </Tarjeta>
        
        <Tarjeta titulo="Datos de Yield">
          {cargandoYield ? (
            <p>Cargando datos de Yield...</p>
          ) : errorYield ? (
            <p>Error al cargar datos: {errorYield.message}</p>
          ) : (
            <p>Datos de Yield cargados: {datosYield.length} registros</p>
          )}
        </Tarjeta>
      </div>
      <TablaControlesDiarios />
      <OrganizacionChart />
    </>
  );

  // Renderizar contenido según la página activa
  switch (activePage) {
    case 'inicio':
      return renderPaginaInicio();
    case 'documentos':
      return <PaginaDocumentos currentUser={user} />;
    case 'controles':
      return <Tarjeta titulo="Registrar Control">Formulario de controles (por implementar)</Tarjeta>;
    case 'reportes':
      return <Tarjeta titulo="Visualizar Reportes">Panel de reportes (por implementar)</Tarjeta>;
    case 'lanzamientos':
      return <PaginaLanzamientos currentUser={user} />;
    case 'formacion':
      return <PaginaFormacion currentUser={user} />;
    default:
      return <Tarjeta titulo="Página no encontrada">Esta página no está implementada</Tarjeta>;
  }
};

export default ContenidoTablero;