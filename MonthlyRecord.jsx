import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MonthlyRecord() {
  const [selectedName, setSelectedName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 01 to 12
    const year = today.getFullYear();
    return `${month}-${year}`; // initial value e.g. '07-2025'
  });

  const [allMonthlyData, setAllMonthlyData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('Monthly Agents')) || {};
    } catch {
      return {};
    }
  });

  const currentKey = selectedName
  ? `M.R ${selectedName} ${selectedMonth.slice(0, 2)}-${selectedMonth.slice(-2)}`
  : null;


  const currentData = currentKey ? allMonthlyData[currentKey] : null;
  const localCommissionPercent = currentData?.commissionLocalPercent || 0;
const specialCommissionPercent = currentData?.commissionSpecialPercent || 0;


  const dailyRecords = Array.from({ length: 31 }, (_, i) => {
    const dayData = currentData?.records?.[i]?.summary || {};
   return {
  localSale: Number(dayData.localSale || 0),
  specialSale: Number(dayData.specialSale || 0),
  fuel: Number(dayData.fuel || 0),
  commissionLocal: Number(dayData.commissionLocalValue || 0),
  commissionSpecial: Number(dayData.commissionSpecialValue || 0),
  hvan: Number(dayData.hvan || 0),
  misc: Number(dayData.misc || 0),
  discountLocal: Number(dayData.discountLocal || 0),
  discountSpecial: Number(dayData.discountSpecial || 0),
  net: Number(dayData.net || 0),
  cash: Number(dayData.cash || 0),
  short: Number(dayData.short || 0),
  otherExpense: Number(dayData.otherExpense || 0)
};

  });

  const totals = dailyRecords.reduce(
    (acc, day) => {
      acc.localSale += day.localSale;
      acc.specialSale += day.specialSale;
      acc.fuel += day.fuel;
      acc.commissionLocal += day.commissionLocal;
      acc.commissionSpecial += day.commissionSpecial;
      acc.hvan += day.hvan;
      acc.misc += day.misc;
      acc.discountLocal += day.discountLocal;
      acc.discountSpecial += day.discountSpecial;
      acc.net += day.net;
      acc.cash += day.cash;
      acc.short += day.short;
      acc.otherExpense += day.otherExpense || 0;
      return acc;
    },
    {
      localSale: 0,
      specialSale: 0,
      fuel: 0,
      commissionLocal: 0,
      commissionSpecial: 0,
      hvan: 0,
      misc: 0,
      discountLocal: 0,
      discountSpecial: 0,
      net: 0,
      cash: 0,
      short: 0,
      otherExpense: 0   
    }
  );

  const totalSale = totals.localSale + totals.specialSale;
  const totalCommission = totals.commissionLocal + totals.commissionSpecial;
  const previousShortage = Object.values(currentData?.records || {}).reduce((sum, record) => {
  return sum + Number(record?.summary?.previousShort || 0);
}, 0);

const otherExpense = totals.otherExpense;


const totalExpense = totalCommission + totals.hvan + otherExpense;

  const formatNumber = (value) => {
    if (value === '' || isNaN(value)) return '';
    return Number(value).toLocaleString();
  };

  const unformatNumber = (value) => {
    return value.replace(/,/g, '');
  };

  const formatMonthYear = (mmYYYY) => {
    const [mm, yyyy] = mmYYYY.split('-');
    const monthName = new Date(`${yyyy}-${mm}-01`).toLocaleString('default', { month: 'long' });
    const shortYear = yyyy.slice(2);
    return `${monthName} ${shortYear}`;
  };


const handleExportPDF = () => {
  const doc = new jsPDF('landscape', 'pt', 'a4');
  doc.scaleFactor = 2;

  const pageWidth = doc.internal.pageSize.getWidth();

  const formatNumber = (value) => {
    if (value === '' || isNaN(value)) return '';
    return Number(value).toLocaleString();
  };

  // 🗓️ Format Date Header
  const formatMonthYear = (mmYYYY) => {
    const [mm, yyyy] = mmYYYY.split('-');
    const monthName = new Date(`${yyyy}-${mm}-01`).toLocaleString('default', { month: 'long' });
    return `${monthName} ${yyyy}`;
  };

  // 🔸 HEADER
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Global Trading Company', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Monthly Summary', pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${selectedName || 'N/A'}`, 46, 90);
  doc.text(`Sector: ${currentData?.sector || 'N/A'}`, 190, 90);
  doc.text(`Month: ${formatMonthYear(selectedMonth)}`, 720, 90);

  let currentY = 100;

// 🔹 SALES TABLE (Clean layout, centered content)
autoTable(doc, {
  startY: currentY,
  head: [[
    'Date', 'Type', 'Sale', 'Total', 'Fuel',
    'Commission', 'H.Van', 'Discount', 'Misc', 'Net', 'Cash', 'Short'
  ]],
  body: dailyRecords.flatMap((day, i) => {
    const date = `${i + 1}`;
    const total = day.localSale + day.specialSale;

    // Skip empty rows
    if (total === 0 && Object.values(day).every(v => v === 0)) return [];

    return [
      [
  { content: date, rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [224,224,224] } },
  { content: 'Local', styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.localSale), styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(total), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.fuel), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.commissionLocal), styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.hvan), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.discountLocal), styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.misc), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.net), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.cash), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  { content: formatNumber(day.short), rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
],

      [
  { content: 'Special', styles: { valign: 'middle', halign: 'center', fillColor: [245,245,245] } },
  { content: formatNumber(day.specialSale), styles: { valign: 'middle', halign: 'center', fillColor: [245,245,245] } },
  { content: formatNumber(day.commissionSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [245,245,245] } },
  { content: formatNumber(day.discountSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [245,245,245] } },
]

    ];
  }),
  styles: {
  fontSize: 7.5,         // 🔽 Smaller font
  cellPadding: 2.5,      // 🔽 Less padding
  valign: 'middle',
  halign: 'center',
  textColor: [0, 0, 0]
}
,
  headStyles: {
    fillColor: [220, 220, 220], // Light gray
    textColor: [0, 0, 0],
    fontStyle: 'bold'
  },
  columnStyles: {
    0: { cellWidth: 52 },  // Total
    1: { cellWidth: 65 },  // Local / Special
    2: { cellWidth: 65 },  // Sale
    3: { cellWidth: 65 },  // Total
    4: { cellWidth: 65 },  // Fuel
    5: { cellWidth: 65 },  // Commission
    6: { cellWidth: 65 },  // H.Van
    7: { cellWidth: 65 },  // Discount
    8: { cellWidth: 65 },  // Misc
    9: { cellWidth: 65 },  // Net
    10: { cellWidth: 65 }, // Cash
    11: { cellWidth: 65 }, // Short
  },
  theme: 'grid',
  // 🔶 This hook adds border to every first row (i.e., 'Local')
 didDrawCell: function (data) {
  const { doc, table, cell, row, column } = data;

  const isLocalRow = row.index % 2 === 0; // Only Local rows (every even row)
  const isNotHeader = row.section === 'body'; // Skip header

  const isFirstColumn = column.index === 0;

  if (isLocalRow && isNotHeader && isFirstColumn) {
    const x = cell.x;
    const y = cell.y;

    // ✅ Total width from column 0 to 11
    const totalWidth = table.columns
      .slice(0, 12)
      .reduce((sum, col) => sum + col.width, 0);

    // ✅ Total height = Local + Special row height
    const height =
      row.height +
      (table.body[row.index + 1] ? table.body[row.index + 1].height : 0);

    // Draw the rectangle
    doc.setDrawColor(0);     // Border color: black
    doc.setLineWidth(0.6);   // Thickness
    doc.rect(x, y, totalWidth, height);
  }
}

});


// 🔸 TOTAL ROW for Sales Table (like on-screen)
autoTable(doc, {
  startY: doc.lastAutoTable.finalY + 8,
  body: [
    [
      { content: 'Total', rowSpan: 2, styles: { valign: 'middle', halign: 'center',fillColor: [224,224,224] } },                      // Label
      { content: 'Local', styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },                                    // Local label
      { content: formatNumber(totals.localSale), styles: { valign: 'middle', fillColor: [240, 240, 240], halign: 'center' } },           // Local Sale
      { content: formatNumber(totalSale), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },      // Total Sale
      { content: formatNumber(totals.fuel), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },    // Fuel
      { content: formatNumber(totals.commissionLocal), styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },     // Commission Local
      { content: formatNumber(totals.hvan), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },    // H.Van
      { content: formatNumber(totals.discountLocal), styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },       // Discount Local
      { content: formatNumber(totals.misc), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },    // Misc
      { content: formatNumber(totals.net), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },     // Net
      { content: formatNumber(totals.cash), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },    // Cash
      { content: formatNumber(totals.short), rowSpan: 2, styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },   // Short
    ],
    [
      { content: 'Special', styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },                                  // Special label
      { content: formatNumber(totals.specialSale), styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },         // Special Sale
      { content: formatNumber(totals.commissionSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },   // Commission Special
      { content: formatNumber(totals.discountSpecial), styles: { valign: 'middle', halign: 'center', fillColor: [240, 240, 240] } },     // Discount Special
    ]
  ],
  styles: {
  fontSize: 7.5,         // 🔽 Smaller font
  cellPadding: 2.5,      // 🔽 Less padding
  valign: 'middle',
  halign: 'center',
  textColor: [0, 0, 0]
}
,
  headStyles: { fillColor: [230, 230, 230] }, // 🔷 Light gray background (optional)
  columnStyles: {
    0: { cellWidth: 52 },  // Total
    1: { cellWidth: 65 },  // Local / Special
    2: { cellWidth: 65 },  // Sale
    3: { cellWidth: 65 },  // Total
    4: { cellWidth: 65 },  // Fuel
    5: { cellWidth: 65 },  // Commission
    6: { cellWidth: 65 },  // H.Van
    7: { cellWidth: 65 },  // Discount
    8: { cellWidth: 65 },  // Misc
    9: { cellWidth: 65 },  // Net
    10: { cellWidth: 65 }, // Cash
    11: { cellWidth: 65 }, // Short
  },
});



  // 🔹 Commission Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Commission', '%', 'Total Sale', 'Amount']],
    body: [
      ['Local', `${localCommissionPercent}%`, formatNumber(totals.localSale), formatNumber(totals.commissionLocal)],
      ['Special', `${specialCommissionPercent}%`, formatNumber(totals.specialSale), formatNumber(totals.commissionSpecial)],
    ],
    styles: {
  fontSize: 7.5,         // 🔽 Smaller font
  cellPadding: 2.5,      // 🔽 Less padding
  valign: 'middle',
  halign: 'center',
  textColor: [0, 0, 0]
}
,
    headStyles: {fontSize: 10, textColor: [0, 0, 0], fillColor: [230, 230, 230] },
    columnStyles: {
      0: { cellWidth: 190 },
      1: { cellWidth: 187 },
      2: { cellWidth: 200 },
      3: { cellWidth: 190 },
    }
  });

  const tablesY = doc.lastAutoTable.finalY + 8;

// 🔹 Expenses Table (Left side)
autoTable(doc, {
startY: tablesY,
  head: [['Expenses', 'Amount']],
  body: [
    ['Total Commission', formatNumber(totalCommission)],
    ['Hire Van Rent', formatNumber(totals.hvan)],
    ['Other Expense', formatNumber(otherExpense)],
    ['Total', formatNumber(totalCommission + totals.hvan + otherExpense)],
  ],
  styles: {
    fontSize: 7.5,
    cellPadding: 2.5,
    valign: 'middle',
    halign: 'center',
    textColor: [0, 0, 0],
  },
  headStyles: {
    fontSize: 10,
    fillColor: [230, 230, 230],
    textColor: [0, 0, 0],
  },
  columnStyles: {
    0: { cellWidth: 190 },
    1: { cellWidth: 187 },
  },
  margin: { left: 40 }, // 📍 Align to left
});

// 🔹 Recovery Table (Right side)
autoTable(doc, {
startY: tablesY,
  head: [['Recovery', 'Amount']],
  body: [
    ['This Month', formatNumber(totals.short)],
    ['Previous Shortage', formatNumber(previousShortage)],
    ['Total Short', formatNumber(totals.short + previousShortage)],
  ],
  styles: {
    fontSize: 7.5,
    cellPadding: 2.5,
    valign: 'middle',
    halign: 'center',
    textColor: [0, 0, 0],
  },
  headStyles: {
    fontSize: 10,
    fillColor: [230, 230, 230],
    textColor: [0, 0, 0],
  },
  columnStyles: {
    0: { cellWidth: 195 },
    1: { cellWidth: 193 },
  },
  margin: { left: 420 }, // 📍 Shift to right
});


  // 💾 Save
  const filename = `Monthly Report ${selectedName} ${selectedMonth}.pdf`;
  doc.save(filename);
};

// 🔹 Save mapped totals to 'All Agents' localStorage
React.useEffect(() => {
  if (!selectedName || !selectedMonth || !currentData) return;

  try {
    const monthKey = selectedMonth; // e.g. '07-2025'
    const STORAGE_KEY = 'All Agents';

    // Read current All Agents object
    const allAgents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const agentEntry = {
      name: selectedName,
      localSale: totals.localSale,
      specialSale: totals.specialSale,
      total: totalSale,
      commissionLocal: totals.commissionLocal,
      commissionSpecial: totals.commissionSpecial,
      fuel: totals.fuel,
      discountLocal: totals.discountLocal,
      discountSpecial: totals.discountSpecial,
      hvan: totals.hvan,
      misc: totals.misc,
      net: totals.net,
      cash: totals.cash,
      short: totals.short + previousShortage
    };

    // Upsert logic
    if (!allAgents[monthKey]) {
      allAgents[monthKey] = [agentEntry];
    } else {
      const index = allAgents[monthKey].findIndex(a => a.name === selectedName);
      if (index >= 0) {
        allAgents[monthKey][index] = agentEntry; // update existing
      } else {
        allAgents[monthKey].push(agentEntry); // insert new
      }
    }

    // Save back
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAgents));
  } catch (err) {
    console.error('❌ Failed to save All Agents:', err);
  }
}, [selectedName, selectedMonth, totals, previousShortage]);


  return (
    
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minWidth: '1300px' }}>
      <h1 style={{ marginBottom: '50px', fontSize: '26px' }}>Monthly Record of Agents</h1>
      <h2 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '40px' }}>
  Global Trading Company
</h2>

<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
  <div>
    <strong>Name:</strong>
    <select
  value={selectedName}
  onChange={e => setSelectedName(e.target.value)}
  style={{ fontSize: '14.5px', padding: '4px 10px', minWidth: '110px', marginLeft: '8px' }}
>

      <option value="">-- Select Agent --</option>
      {Array.from(
  new Set(Object.keys(allMonthlyData).map(key => key.split(' ')[1]))
).map(name => (
  <option key={name} value={name}>{name}</option>
))}

    </select>
  </div>
  <div><strong>Sector:</strong> {currentData?.sector || '___________'}</div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <strong>Date:</strong>

  {/* Month Dropdown */}
<select
  value={selectedMonth.slice(0, 2)}
  onChange={e => {
    const newMonth = e.target.value;
    const year = selectedMonth.slice(-4);
    setSelectedMonth(`${newMonth}-${year}`);
  }}
  style={{ fontSize: '14.5px', padding: '4px 10px', minWidth: '110px' }}
>

    {Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const monthName = new Date(`2024-${month}-01`).toLocaleString('default', { month: 'long' });
      return <option key={month} value={month}>{monthName}</option>;
    })}
  </select>

  {/* Year Dropdown */}
  <select
  value={selectedMonth.slice(-4)}
  onChange={e => {
    const newYear = e.target.value;
    const month = selectedMonth.slice(0, 2);
    setSelectedMonth(`${month}-${newYear}`);
  }}
  style={{ fontSize: '14.5px', padding: '4px 10px', minWidth: '110px' }}
>

    {Array.from({ length: 5 }, (_, i) => {
  const currentYear = new Date().getFullYear();
  const year = currentYear - 2 + i;
  return <option key={year} value={year}>{year}</option>;
})}

  </select>
</div>

</div>


       {/* --- 📘 Sales Table Layout --- */}
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '40px', tableLayout: 'fixed' // 👈 This locks column widths
 }}>
        <colgroup>
          <col style={{ width: '60px' }} />     {/* Dated */}
          <col style={{ width: '80px' }} />     {/* From */}
          <col style={{ width: '100px' }} />    {/* Sale */}
          <col style={{ width: '100px' }} />    {/* Total */}
          <col style={{ width: '80px' }} />     {/* Fuel */}
          <col style={{ width: '100px' }} />    {/* Commission */}
          <col style={{ width: '90px' }} />     {/* H.Van */}
          <col style={{ width: '100px' }} />    {/* Discount */}
          <col style={{ width: '90px' }} />     {/* Misc */}
          <col style={{ width: '90px' }} />     {/* Net */}
          <col style={{ width: '90px' }} />     {/* Cash */}
          <col style={{ width: '90px' }} />     {/* Short */}
        </colgroup>

        <thead>
          <tr style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
            <th rowSpan="2">Dated</th>
            <th colSpan="3">Sales Details</th>
            <th colSpan="5">Expense</th>
            <th rowSpan="2">Net</th>
            <th rowSpan="2">Cash</th>
            <th rowSpan="2">Short</th>
          </tr>
          <tr style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
            <th>From</th>
            <th>Sale</th>
            <th>Total</th>
            <th>Fuel</th>
            <th>Commission</th>
            <th>H.Van</th>
            <th>Discount</th>
            <th>Misc.</th>
          </tr>
        </thead>
        <tbody>
          {/* 🔁 Loop for Days 1 to 31 */}
{dailyRecords.map((day, index) => {
  const hasAnyData =
    Object.values(day).some(value => Number(value) !== 0);

  return (
    <React.Fragment key={index}>
      <tr>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>{index + 1}</td>
        <td style={{ paddingLeft: '3px' }}>Local</td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.localSale || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber((day.localSale || 0) + (day.specialSale || 0)) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.fuel || 0) : ''}
        </td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.commissionLocal || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.hvan || 0) : ''}
        </td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.discountLocal || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.misc || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.net || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.cash || 0) : ''}
        </td>
        <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.short || 0) : ''}
        </td>
      </tr>
      <tr>
        <td style={{ paddingLeft: '2px' }}>Special</td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.specialSale || 0) : ''}
        </td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.commissionSpecial || 0) : ''}
        </td>
        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
          {hasAnyData ? formatNumber(day.discountSpecial || 0) : ''}
        </td>
      </tr>
    </React.Fragment>
  );
})}



          {/* 🔻 Total Row */}
          <tr style={{ fontWeight: 'bold', backgroundColor: '#d9d9d9', color:'black' }}>
  <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Total</td>
  <td style={{ paddingLeft: '3px' }}>Local</td>
  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.localSale)}
  </td> {/* Total Local Sale */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totalSale)}
  </td> {/* Total Sale */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.fuel)}
  </td> {/* Total Fuel */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.commissionLocal)}
  </td> {/* Total Commission Local */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.hvan)}
  </td> {/* Total H.Van */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.discountLocal)}
  </td> {/* Total Discount Local */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.misc)}
  </td> {/* Total Misc */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.net)}
  </td> {/* Total Net */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.cash)}
  </td> {/* Total Cash */}

  <td style={{ textAlign: 'center', verticalAlign: 'middle' }} rowSpan="2">
    {formatNumber(totals.short)}
  </td> {/* Total Short */}
</tr>

<tr style={{ fontWeight: 'bold', backgroundColor: '#d9d9d9', color:'black' }}>
  <td style={{ paddingLeft: '2px' }}>Special</td>
  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.specialSale)}
  </td>
  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.commissionSpecial)}
  </td>
  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {formatNumber(totals.discountSpecial)}
  </td>
</tr>
        </tbody>
      </table>


      {/* --- 📘 Commission Table --- */}
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '40px', tableLayout: 'fixed'
 }}>
        <thead>
          <tr style={{ backgroundColor: '#d9d9d9', color:'black' }}>
            <th colSpan="2">Commission</th>
            <th>%</th>
            <th colSpan="2">Total Sale</th>
            <th colSpan="2">Amount</th>
          </tr>
        </thead>
        <tbody> 

          {/* local commission */}
          <tr>
 <td style={{ textAlign: 'center', verticalAlign: 'middle', fontSize: '17px', }} colSpan="2">Local</td>
<td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
  {localCommissionPercent}%
</td>
  <td colSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {totals.localSale}
  </td>
  <td colSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {totals.commissionLocal}
  </td>
</tr>
              {/* special commission */}
          <tr>
  <td style={{ textAlign: 'center', verticalAlign: 'middle', fontSize: '17px', }}  colSpan="2">Special</td>
<td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
  {specialCommissionPercent}%
</td>
  <td colSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {totals.specialSale}
  </td>
  <td colSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
    {totals.commissionSpecial}
  </td>
</tr>

        </tbody>
      </table>

      {/* --- 📘 Expense Payable Table --- */}
<table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '40px', tableLayout: 'fixed' }}>
  {/* 🔧 Set column widths here */}
  <colgroup>
    <col style={{ width: '310px' }} />  {/* Expense col 1 */}
    <col style={{ width: '218px' }} />  {/* Expense col 2 */}
    <col style={{ width: '80px' }} />  {/* Description 1 */}
    <col style={{ width: '80px' }} />  {/* Description 2 */}
    <col style={{ width: '80px' }} />  {/* Description 3 */}
    <col style={{ width: '80px' }} />  {/* Description 4 */}
    <col style={{ width: '100px' }} />  {/* Result */}
  </colgroup>

  <thead>
    <tr style={{ backgroundColor: '#d9d9d9', color:'black' }}>
      <th colSpan="2">Expense Payable</th>
      <th colSpan="5">Description</th>
      <th>Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td
  colSpan="2"
  rowSpan="4"
  style={{
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: '23px',       // 👈 Increase this as needed
    fontWeight: 'bold',     // Optional: for emphasis
    lineHeight: '1.4',
    padding: '10px'
  }}
>
  Expenses
</td>

      <td colSpan="5">Total Commission</td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {formatNumber(totalCommission)}
      </td>
    </tr>
    <tr>
      <td colSpan="5">Hire Van Rent</td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {formatNumber(totals.hvan)}
      </td>
    </tr>
    <tr>
      <td colSpan="5">Other Expense</td>
<td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
  {formatNumber(otherExpense)}
</td>

    </tr>
    <tr>
      <td colSpan="5"><strong>Total</strong></td>
      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        {formatNumber(totalExpense)}
      </td>
    </tr>
  </tbody>
</table>


      {/* --- 📘 Recovery Table --- */}
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
<colgroup>
 <col style={{ width: '310px' }} />  {/* Recovery col 1 */}
    <col style={{ width: '218px' }} />  {/* Recovery col 2 */}
    <col style={{ width: '10px' }} />  {/* Description col 1 */}
    <col style={{ width: '80px' }} />  {/* Description col 2 */}
    <col style={{ width: '80px' }} />  {/* Description col 3 */}
    <col style={{ width: '80px' }} />  {/* Description col 4 */}
    <col style={{ width: '80px' }} />  {/* Description col 5 */}
    <col style={{ width: '80px' }} />  {/* Description col 6 */}
    <col style={{ width: '10px' }} />  {/* Result */}
</colgroup>

        <thead>
          <tr style={{ backgroundColor: '#d9d9d9', color:'black' }}>
            <th colSpan="2">Recovery Details</th>
            <th colSpan="7">Description</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
  <tr>
    <td
  style={{
    textAlign: 'center',
    verticalAlign: 'middle',
    fontSize: '23px',       // 👈 Adjust font size as needed
    fontWeight: 'bold',
    lineHeight: '1.5',      // 👈 Helps with vertical spacing
    padding: '10px'         // 👈 Optional: add more spacing
  }}
  colSpan="2"
  rowSpan="3"
>
  Recovery
</td>

    <td colSpan="7">This Month</td>
    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
      {formatNumber(totals.short)}
    </td>
  </tr>
  <tr>
    <td colSpan="7">Previous Shortage</td>
    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
      {formatNumber(previousShortage)}
    </td>
  </tr>
  <tr>
    <td colSpan="7"><strong>Total Shortage</strong></td>
    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
      {formatNumber(totals.short + previousShortage)}
    </td>
  </tr>
</tbody>

      </table>
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
}