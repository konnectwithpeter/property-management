import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

const PropertyTable = ({ properties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  // Debugging to see if properties data is coming through
  useEffect(() => {
    console.log('Properties data:', properties);
  }, [properties]);

  const handleAccordionToggle = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProperties = properties.filter((property) => {
    const location = property.location?.toLowerCase() || '';
    const house = property.house?.toLowerCase() || '';
    const block = property.block?.toLowerCase() || '';

    return (
      location.includes(searchTerm.toLowerCase()) ||
      house.includes(searchTerm.toLowerCase()) ||
      block.includes(searchTerm.toLowerCase())
    );
  });

  const columnDefs = [
    {
      headerName: 'House',
      field: 'house',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Block',
      field: 'block',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Location',
      field: 'location',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Landlord',
      field: 'landlord.first_name',
      flex: 1,
      valueGetter: (params) => {
        const landlord = params.data.landlord;
        return landlord ? `${landlord.first_name} ${landlord.last_name}` : 'N/A';
      },
    },
    {
      headerName: 'Tenants',
      field: 'tenants',
      flex: 1,
      valueGetter: (params) => params.data.tenants?.length || 0,
    },
  ];

  const renderInvoices = (invoices) => {
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return <p>No invoices available</p>;
    }

    return invoices.map((invoice) => (
      <div key={invoice.id} className="mb-4">
        <h4 className="font-bold">Invoice ID: {invoice.id}</h4>
        <p>Total Amount: <span className="font-semibold">${invoice.total_amount}</span></p>
        <p>Status: <span className={invoice.paid ? 'text-green-500' : 'text-red-500'}>
          {invoice.paid ? 'Paid' : 'Unpaid'}</span>
        </p>
        <p>Billing Period: {invoice.billing_period_start} to {invoice.billing_period_end}</p>
        <a href={invoice.file} target="_blank" rel="noopener noreferrer" className="text-blue-600">Download Invoice</a>
        <hr className="my-2" />
      </div>
    ));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Property Management</h1>
      <Input
        placeholder="Search by house, block, or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
        {/* Debugging rowData */}
        <AgGridReact
          rowData={filteredProperties}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          animateRows={true}
          onRowClicked={(event) => handleAccordionToggle(event.data.id)}
        />
      </div>
      {filteredProperties.map((property) => (
        <Accordion key={property.id} open={expandedRows[property.id]} className="my-2">
          <AccordionItem>
            <AccordionTrigger onClick={() => handleAccordionToggle(property.id)}>
              {property.location} - {property.house}
            </AccordionTrigger>
            <AccordionContent>
              {renderInvoices(property.invoices)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default PropertyTable;
