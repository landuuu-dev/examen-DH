import React, { useState } from 'react'; 
import './adminEstilos.css'; 
import TourForm from './TourForm';
import ProductosTable from './ProductosTable';
import CategoriasForm from './CategoriasForm';
import ListaCategorias from './ListaCategorias';

function HeaderAdmin() {

  const [activeComponent, setActiveComponent] = useState('Crear tour');
  // Creamos una variable de estado llamada activeComponent
  // Contendrá el nombre del componente que queremos mostrar actualmente
  // Inicializamos con "Crear tour" para que al cargar la página se muestre TourForm
  // setActiveComponent es la función que usamos para cambiar el estado

  const componentsMap = {
    'Crear tour': <TourForm />,
    'Lista Tour': <ProductosTable />,
    'Categoria': <CategoriasForm />,
    'Lista categorias': <ListaCategorias />
  };
  // Creamos un objeto que mapea el nombre de cada botón con el componente correspondiente
  // La clave (ej: "Crear tour") es lo que aparecerá en el botón
  // El valor (ej: <TourForm />) es el componente que se renderiza cuando ese botón está activo

  return (
    <div className="header-admin-container">
      {/* Contenedor principal con padding, fondo gris, bordes redondeados y sombra */}

      <div className="header-admin-buttons">
        {Object.keys(componentsMap).map((label) => (
          // Object.keys(componentsMap) devuelve un array con las claves del objeto: 
          // ["Crear tour", "Lista Tour", "Categoria", "Lista categorias"]
          // .map recorre cada elemento de ese array y devuelve un botón por cada clave

          <button
            key={label} 
            // React necesita un key único para cada elemento de la lista 
            // Esto ayuda a optimizar el renderizado y actualización de la UI

            onClick={() => setActiveComponent(label)}
            // Al hacer clic en el botón, cambiamos el estado activeComponent al nombre del botón
            // Esto hace que se muestre el componente correspondiente en el contenedor de abajo

            className={`header-admin-button ${activeComponent === label ? 'active' : ''}`}
            // Si el botón corresponde al componente activo, se le agrega la clase 'active'
            // Esto permite que cambie de estilo (color de fondo, texto blanco, etc.)
          >
            {label}
            {/* Mostramos el texto del botón */}
          </button>
        ))}
      </div>

    {/* Contenedor donde se mostrará el componente activo */}
      <div className="header-admin-content">

        {activeComponent && (
          // Solo renderizamos algo si activeComponent NO es null
          <>
            {componentsMap[activeComponent]}
            {/* Mostramos el componente correspondiente según el estado */}

            <div className="cerrar-container">
              {/* Contenedor para el botón "Cerrar" debajo del componente */}

              <button
                onClick={() => setActiveComponent(null)}
                // Al hacer clic, ponemos activeComponent en null
                // Esto oculta el componente activo
                className="cerrar-button"
              >
                Cerrar
                {/* Texto del botón */}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeaderAdmin;
// Exportamos el componente para poder usarlo en PanelAdmin u otros archivos

/* 
Este componente HeaderAdmin funciona como un panel de administración con “pestañas” para mostrar diferentes componentes. 

1. `activeComponent` es un estado que guarda el nombre del componente que debe mostrarse actualmente. Inicialmente es 'Crear tour', por lo que al cargar la página se muestra TourForm.
2. `componentsMap` es un objeto que mapea los nombres de los botones a los componentes JSX correspondientes. Por ejemplo, 'Lista Tour' apunta a <ProductosTable />.
3. La sección de botones recorre las claves del objeto con `Object.keys(componentsMap).map()`, generando un botón para cada opción. Al hacer clic en un botón, se actualiza `activeComponent` con ese nombre, lo que hace que el componente correspondiente se renderice.
4. La sección de contenido usa un short-circuit (`activeComponent && (...)`) para mostrar solo si hay un componente activo. Dentro se renderiza:
   - `{componentsMap[activeComponent]}`: React busca la clave en el objeto y renderiza el componente correspondiente.
   - El botón "Cerrar", que al hacer clic pone `activeComponent` en null, ocultando todo el bloque.
5. Todo el bloque de contenido y el botón "Cerrar" se renderizan juntos; si `activeComponent` es null, nada se muestra.
En resumen, este componente permite cambiar dinámicamente qué subcomponente se ve, manteniendo un solo estado para controlarlo y un botón para ocultarlo.
*/