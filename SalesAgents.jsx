import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SalesAgents = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [agentData, setAgentData] = useState([]);

    useEffect(() => {
    const key = `${String(selectedMonth).padStart(2, '0')}-${selectedYear}`;
    const allAgents = JSON.parse(localStorage.getItem('All Agents') || '{}');
    setAgentData(allAgents[key] || []);
  }, [selectedMonth, selectedYear]);

  const grandTotal = agentData.reduce(
  (acc, agent) => {
    acc.total += Number(agent.total) || 0;
    return acc;
  },
  { total: 0 }
);


  // 🔹 Calculate Grand Totals
const grandTotals = agentData.reduce(
  (acc, agent) => {
    acc.localSale += Number(agent.localSale || 0);
    acc.specialSale += Number(agent.specialSale || 0);
    acc.total += Number(agent.total || 0);
    acc.commissionLocal += Number(agent.commissionLocal || 0);
    acc.commissionSpecial += Number(agent.commissionSpecial || 0);
    acc.fuel += Number(agent.fuel || 0);
    acc.discountLocal += Number(agent.discountLocal || 0);
    acc.discountSpecial += Number(agent.discountSpecial || 0);
    acc.hvan += Number(agent.hvan || 0);
    acc.misc += Number(agent.misc || 0);
    acc.net += Number(agent.net || 0);
    acc.cash += Number(agent.cash || 0);
    acc.short += Number(agent.short || 0);
    return acc;
  },
  {
    localSale: 0,
    specialSale: 0,
    total: 0,
    commissionLocal: 0,
    commissionSpecial: 0,
    fuel: 0,
    discountLocal: 0,
    discountSpecial: 0,
    hvan: 0,
    misc: 0,
    net: 0,
    cash: 0,
    short: 0,
  }
);

const formatValue = (value) => {
  const num = Number(value);
  return isNaN(num) || num === 0 ? '—' : num.toLocaleString();
};

const handleExportPDF = () => {
  
  const formatNumber = (value) => {
  const num = Number(value);
  return isNaN(num) || num === 0 ? '—' : num.toLocaleString();
};

  const doc = new jsPDF('landscape', 'pt', 'a4');
doc.setFontSize(12);

// 🟡 Title
doc.setFontSize(16);
doc.text('Global Trading Company', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

// 🟡 Summary Row (Top Info)
const pageWidth = doc.internal.pageSize.getWidth();

const totalAgents = agentData.length;
const totalSales = grandTotals.total.toLocaleString();
const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });
const fullDateLabel = `${monthName} ${selectedYear}`;

// 🔹 Total Agents (left)
doc.setFontSize(10);
doc.text(`Total Agents: ${totalAgents}`, 40, 70);

// 🔹 Total Sale (center)
doc.text(`Total Sale: ${totalSales}`, pageWidth / 2, 70, { align: 'center' });

// 🔹 Date (right)
doc.text(fullDateLabel, pageWidth - 60, 70, { align: 'right' });

// 🟢 Now continue with your main table

  // Table Headers
  const head = [[
    'Name', 'From', 'Sale', 'Total',
    'Commission', 'Fuel', 'Discount',
    'H.Van', 'Misc.', 'Net', 'Cash', 'Short'
  ]];

  // Table Body
  // 🔸 MAIN TABLE
autoTable(doc, {
  startY: 75,
  head: [[
    'Date', 'Type', 'Sale', 'Total', 'Fuel',
    'Commission', 'H.Van', 'Discount', 'Misc',
    'Net', 'Cash', 'Short'
  ]],
body: agentData.flatMap((row, index) => {
  const total = Number(row.total) || 0;

  return [
    [
      { content: row.name || '—', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [224, 224, 224] } },
      { content: 'Local', styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.localSale), styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(total), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.fuel), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.commissionLocal), styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.hvan), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.discountLocal), styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.misc), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.net), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.cash), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatValue(row.short), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    ],
    [
      { content: 'Special', styles: { valign: 'middle', halign: 'center', fillColor: [245, 245, 245] } },
      { content: formatValue(row.specialSale), styles: { valign: 'middle', halign: 'center', fillColor: [245, 245, 245] } },
      { content: formatValue(row.commissionSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [245, 245, 245] } },
      { content: formatValue(row.discountSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [245, 245, 245] } },
    ]
  ];
}),

  styles: {
    fontSize: 8,
    cellPadding: 3,
    valign: 'middle',
    halign: 'center',
    textColor: [0, 0, 0],
  },
  headStyles: {
    fillColor: [200, 200, 200],
    textColor: [0, 0, 0],
    fontStyle: 'bold'
  },
  columnStyles: {
    0: { cellWidth: 59 },
    1: { cellWidth: 64 },
    2: { cellWidth: 64 },
    3: { cellWidth: 64 },
    4: { cellWidth: 64 },
    5: { cellWidth: 64 },
    6: { cellWidth: 64 },
    7: { cellWidth: 64 },
    8: { cellWidth: 64 },
    9: { cellWidth: 64 },
    10: { cellWidth: 64 },
    11: { cellWidth: 64 }, theme:'grid',
  }
});


// 🧮 Grand Totals (2-row style with rowspan-like display)
autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 10,
  body: [
    [
      { content: 'Grand', rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [220, 220, 220] } },
      { content: 'Local', styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.localSale), styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.total), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.fuel), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.commissionLocal), styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.hvan), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.discountLocal), styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.misc), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.net), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.cash), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: formatNumber(grandTotals.short), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    ],
    [
      { content: 'Special', styles: { valign: 'middle', halign: 'center', fillColor: [248,248,248] } },
      { content: formatNumber(grandTotals.specialSale), styles: { valign: 'middle', halign: 'center', fillColor: [248,248,248]  } },
      { content: formatNumber(grandTotals.commissionSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [248,248,248]  } },
      { content: formatNumber(grandTotals.discountSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [248,248,248]  } },
    ]
  ],
  styles: {
    fontSize: 8,
    cellPadding: 3,
    valign: 'middle',
    halign: 'center',
    fontStyle: 'bold',
    textColor: [0, 0, 0],
  },
  columnStyles: {
    0: { cellWidth: 59 },  // Grand
    1: { cellWidth: 64 },  // Local / Special
    2: { cellWidth: 64 },  // Sale
    3: { cellWidth: 64 },  // Total
    4: { cellWidth: 64 },  // Fuel
    5: { cellWidth: 64 },  // Commission
    6: { cellWidth: 64 },  // H.Van
    7: { cellWidth: 64 },  // Discount
    8: { cellWidth: 64 },  // Misc
    9: { cellWidth: 64 },  // Net
    10: { cellWidth: 64 }, // Cash
    11: { cellWidth: 64 }, // Short
  }
});



  // Save file
  doc.save('Sales Agents.pdf');
};


  return (
    <div style={{ padding: '20px', width: '90vw', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* 🔹 Title */}
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '30px' }}>Global Trading Company</h1>

      {/* 🔹 Summary Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        {/* 🔸 Total Agents (Left) */}
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
  Total Agents: {agentData.length > 0 ? agentData.length : '—'}
</div>


        {/* 🔸 Total Sales (Center) */}
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
  Total Sales: {grandTotal.total > 0 ? grandTotal.total.toLocaleString() : '—'}
</div>


        {/* 🔸 Month & Year Picker (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', transform: 'translateX(-20px)' }}>
          {/* Month Picker */}
          {/* Month Picker */}
<select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(Number(e.target.value))}
  style={{ fontSize: '14px', padding: '4px' }}
>
            {Array.from({ length: 12 }, (_, i) => {
              const monthNum = i + 1;
              const monthName = new Date(0, i).toLocaleString('default', { month: 'long' });
              return (
                <option key={monthNum} value={monthNum}>
                  {monthName}
                </option>
              );
            })}
          </select>

          {/* Year Picker */}
<select
  value={selectedYear}
  onChange={(e) => setSelectedYear(Number(e.target.value))}
  style={{ fontSize: '14px', padding: '4px', marginLeft: '8px' }}
>

            {Array.from({ length: 5 }, (_, i) => {
              const baseYear = new Date().getFullYear();
              const year = baseYear - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 🔹 Main Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}
          border="1"
        >
          <thead>
            {/* 🔸 Header Group Row */}
            <tr style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
              <th rowSpan="2" style={{ width: '120px' }}>Name</th>
              <th colSpan="3">Sales Details</th>
              <th colSpan="5">Expenses</th>
              <th rowSpan="2" style={{ width: '100px' }}>Net</th>
              <th rowSpan="2" style={{ width: '100px' }}>Cash</th>
              <th rowSpan="2" style={{ width: '100px' }}>Short</th>
            </tr>

            {/* 🔸 Sub Header Row */}
            <tr style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
              <th style={{ width: '80px' }}>From</th>
              <th style={{ width: '90px' }}>Sale</th>
              <th style={{ width: '90px' }}>Total</th>

              <th style={{ width: '100px' }}>Commission</th>
              <th style={{ width: '90px' }}>Fuel</th>
              <th style={{ width: '100px' }}>Discount</th>
              <th style={{ width: '90px' }}>H.Van</th>
              <th style={{ width: '90px' }}>Misc.</th>
            </tr>
          </thead>

         <tbody>
  {agentData.map((agent, idx) => (
    <React.Fragment key={idx}>
      <tr>
        <td rowSpan="2">{agent.name || '—'}</td>
        <td>Local</td>
        <td>{formatValue(agent.localSale)}</td>
        <td rowSpan="2">{formatValue(agent.total)}</td>
        <td>{formatValue(agent.commissionLocal)}</td>
        <td rowSpan="2">{formatValue(agent.fuel)}</td>
        <td>{formatValue(agent.discountLocal)}</td>
        <td rowSpan="2">{formatValue(agent.hvan)}</td>
        <td rowSpan="2">{formatValue(agent.misc)}</td>
        <td rowSpan="2">{formatValue(agent.net)}</td>
        <td rowSpan="2">{formatValue(agent.cash)}</td>
        <td rowSpan="2">{formatValue(agent.short)}</td>
      </tr>
      <tr>
        <td>Special</td>
        <td>{formatValue(agent.specialSale)}</td>
        <td>{formatValue(agent.commissionSpecial)}</td>
        <td>{formatValue(agent.discountSpecial)}</td>
      </tr>
    </React.Fragment>
  ))}
</tbody>


        </table>
      </div>

      {/* 🔹 Grand Totals Table */}
      <div style={{ marginTop: '2rem', width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
          border="1"
        >
          <thead style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
            <tr>
              <th colSpan="12">Grand Totals</th>
            </tr>
            <tr>
              <th style={{ width: '80px' }}>From</th>
              <th style={{ width: '90px' }}>Sale</th>
              <th style={{ width: '90px' }}>Total</th>

              <th style={{ width: '100px' }}>Commission</th>
              <th style={{ width: '90px' }}>Fuel</th>
              <th style={{ width: '100px' }}>Discount</th>
              <th style={{ width: '90px' }}>H.Van</th>
              <th style={{ width: '90px' }}>Misc.</th>

              <th style={{ width: '100px' }}>Net</th>
              <th style={{ width: '100px' }}>Cash</th>
              <th style={{ width: '100px' }}>Short</th>
            </tr>
          </thead>

          <tbody>
  <tr>
    <td>Local</td>
    <td>{formatValue(grandTotals.localSale)}</td>
    <td rowSpan="2">{formatValue(grandTotals.total)}</td>
    <td>{formatValue(grandTotals.commissionLocal)}</td>
    <td rowSpan="2">{formatValue(grandTotals.fuel)}</td>
    <td>{formatValue(grandTotals.discountLocal)}</td>
    <td rowSpan="2">{formatValue(grandTotals.hvan)}</td>
    <td rowSpan="2">{formatValue(grandTotals.misc)}</td>
    <td rowSpan="2">{formatValue(grandTotals.net)}</td>
    <td rowSpan="2">{formatValue(grandTotals.cash)}</td>
    <td rowSpan="2">{formatValue(grandTotals.short)}</td>
  </tr>
  <tr>
    <td>Special</td>
    <td>{formatValue(grandTotals.specialSale)}</td>
    <td>{formatValue(grandTotals.commissionSpecial)}</td>
    <td>{formatValue(grandTotals.discountSpecial)}</td>
  </tr>
</tbody>

        </table>
       

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
  <button
    onClick={handleExportPDF}
    style={{
      backgroundColor: '#28a745',
      color: 'white',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    }}
  >
    Export PDF
  </button>
</div>

    </div>
  );
};

export default SalesAgents;
