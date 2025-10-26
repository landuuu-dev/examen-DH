import React from 'react';
import HeaderAdmin from './HeaderAdmin';

function PanelAdmin() {
  return (
    <>
    <section className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      <HeaderAdmin />
    </section>
    </>
)
}

export default PanelAdmin;
