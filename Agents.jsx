// Agents.jsx - Step 5: Add buttons & structured layout for Local/Special rows

import React, { useState, useRef, useEffect } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Agent = () => {

  
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Persistent map of all daily agent snapshots
  const [dailyAgents, setDailyAgents] = usePersistentState('Daily Agents', {});

  // ──────────────────────────────────────────────────────────────────────────
  
// 🔽 Extract unique agent names from saved records
const agentNameOptions = Array.from(
  new Set(Object.values(dailyAgents).map(record => record.agentDetails?.name?.trim()))
).filter(Boolean);


  const formatDateDMY = (isoDate) => {
  const [yyyy, mm, dd] = isoDate.split('-');
  return `${dd}-${mm}-${yyyy}`;
};

const todayISO = new Date().toISOString().split('T')[0]; // gives yyyy-mm-dd

const [agentDetails, setAgentDetails] = useState({
  name: '',
  sector: '',
  dcno: '',
  date: formatDateDMY(todayISO)  // ensures initial date is dd-mm-yyyy
});

const [showPreviousSearch, setShowPreviousSearch] = useState(false);
const [selectedViewAgent, setSelectedViewAgent] = useState('');
const [selectedViewDate, setSelectedViewDate] = useState('');
const [viewMode, setViewMode] = useState(false); // makes fields readonly


const handleAddAgent = () => {
  const trimmedName = agentDetails.name.trim();
  const formattedDate = agentDetails.date;

  if (!trimmedName) {
    alert("Please enter an agent name before saving.");
    return;
  }

  const agentRecord = {
    agentDetails: {
      ...agentDetails,
      date: formattedDate
    },
    localRows,
    specialRows,
    readingInfo,
    finance,
    commissionPercent,
    commissionFinalized
  };

  const key = `${trimmedName}__${formattedDate}`;

  // ✅ Save daily agent record
  setDailyAgents(prev => ({
    ...prev,
    [key]: agentRecord
  }));

  // ✅ Save summary to Monthly Agents
  try {
    const [dd, mm, yyyy] = formattedDate.split('-');
    const dayIndex = parseInt(dd, 10) - 1;
    const monthKey = `${mm}-${yyyy.slice(-2)}`;
    const mrKey = `M.R ${trimmedName} ${monthKey}`;
    const STORAGE_KEY = 'Monthly Agents';

    const allMonthly = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const base = allMonthly[mrKey] || {
      name: trimmedName,
      sector: agentDetails.sector,
      month: monthKey,
      commissionLocalPercent: commissionPercent.commissionLocal,
      commissionSpecialPercent: commissionPercent.commissionSpecial,
      records: {}
    };

    base.records[dayIndex] = {
      summary: {
        localSale: localSubtotal.amount,
        specialSale: specialSubtotal.amount,
        total: finance.totalSale,
        fuel: finance.fuel,
        discountLocal: localSubtotal.discount,
        discountSpecial: specialSubtotal.discount,
        commissionLocalValue: finance.commissionLocal,
        commissionSpecialValue: finance.commissionSpecial,
        hvan: finance.hvan,
        misc: finance.misc,
        net: finance.netSale,
        cash: finance.cash,
        short: finance.short,
        previousShort: finance.previousShort || 0,
        otherExpense: finance.otherExpense || 0 // ✅ Direct link, no addition
      }
    };

    allMonthly[mrKey] = base;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMonthly));
  } catch (err) {
    console.error('Monthly data save failed:', err);
  }

  alert(`Agent record saved for ${trimmedName} on ${formattedDate}`);

  // ✅ Reset the form after saving
  setAgentDetails({
    name: '',
    sector: '',
    dcNumber: '',
    date: new Date().toLocaleDateString('en-GB').split('/').join('-') // dd-mm-yyyy
  });
  setLocalRows([]);
  setSpecialRows([]);
  setReadingInfo({
    from: '',
    to: '',
    difference: 0,
    rate: 0,
    litre: 0
  });
  setFinance({
    totalSale: 0,
    commissionLocal: 0,
    commissionSpecial: 0,
    fuel: 0,
    discountLocal: 0,
    discountSpecial: 0,
    hvan: 0,
    misc: 0,
    netSale: 0,
    cash: 0,
    previousShort: 0,
    short: 0,
    otherExpense: 0
  });
  setCommissionPercent({ commissionLocal: 0, commissionSpecial: 0 });
  setCommissionFinalized(false);

  // Optional: Scroll to top
  window.scrollTo(0, 0);
};

  // ──────────────────────────────────────────────────────────────────────────

const formatNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('en-PK');
};


const parseNumber = (val) => val.replace(/,/g, '');
const removeCommas = (val) => val.replace(/,/g, '');

const formatDateYMD = (dmyDate) => {
  const [dd, mm, yyyy] = dmyDate.split('-');
  return `${yyyy}-${mm}-${dd}`;
};


const [editingCell, setEditingCell] = useState({ section: null, index: null, field: null });

// 🔹 Define read-only finance fields (these will show 0 when empty)
const readonlyFields = ['fuel', 'netSale', 'short', 'totalShortage'];

// 🔹 Handle Enter Key for Commission Calculation
const handleCommissionEnter = (e, key) => {
  if (e.key === 'Enter') {
    const percent = parseFloat(removeCommas(e.target.value)) || 0;

    const baseSale = key === 'commissionLocal'
      ? parseFloat(localSubtotal.amount) || 0
      : parseFloat(specialSubtotal.amount) || 0;

    const discount = key === 'commissionLocal'
      ? parseFloat(localSubtotal.discount) || 0
      : parseFloat(specialSubtotal.discount) || 0;

    const result = ((baseSale - discount) * percent) / 100;

    setFinance(prev => ({
      ...prev,
      [key]: result.toFixed(0)
    }));

    setCommissionPercent(prev => ({
      ...prev,
      [key]: percent
    }));

    setCommissionFinalized(prev => ({
      ...prev,
      [key]: true
    }));

    setEditingCell({ section: null, field: null });
  }
};

const capitalizeName = (str) => {
  return str
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase()); // capitalizes each word
};


useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      .no-print {
        display: none !important;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background: white !important;
        margin: 0 !important;
        color: black !important;
        font-family: Arial, sans-serif !important;
      }

      #pdf-content {
        width: 100% !important;
        padding: 20px !important;
        margin: 0 auto !important;
        box-sizing: border-box;
      }

      h2, h3 {
        color: black !important;
        text-align: center !important;
      }

      table, th, td {
        color: black !important;
        border-color: black !important;
      }

      input, span {
        color: black !important;
      }
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);




  const contentRef = useRef();

const handleExportPDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 🔹 Format date
  const formatDate = (dateInput) => {
    if (typeof dateInput === 'string') {
      const parts = dateInput.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          const [year, month, day] = parts;
          return `${day}-${month}-${year}`;
        }
        return dateInput;
      }
    }
    const d = new Date(dateInput);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const formattedDate = formatDate(agentDetails.date);
  const name = agentDetails.name || 'N/A';
  const sector = agentDetails.sector || 'N/A';
  const dcno = agentDetails.dcno || 'N/A';

  // 🔹 Heading
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Global Trading Company', pageWidth / 2, 22, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Delivery Challan', pageWidth / 2, 34, { align: 'center' });

  // 🔹 D.C# only at top
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`D.C#: ${dcno}`, 14, 53);

  let serial = 1;
  let cursorY = 54;

  // 🔹 Local Section Title
  autoTable(doc, {
    startY: cursorY,
    head: [['Local Items']],
    body: [],
    theme: 'plain',
    headStyles: {
      fontSize: 11,
      halign: 'center',
      fontStyle: 'bold',
      textColor: 0,
      fillColor: [255, 255, 255] // ✅ Removes gray background
    },
  });

  // ✅ Agent Info shown below Local Items
  const infoY = doc.lastAutoTable.finalY + 4;
  doc.setFont(undefined, 'normal'); // ✅ No bold
  doc.text(`Name: ${name}`, 14, infoY);
  doc.text(`Sector: ${sector}`, 45, infoY);
  doc.text(`Date: ${formattedDate}`, pageWidth - 42, infoY);

  // 🔸 Local Table
  autoTable(doc, {
    startY: infoY + 2,
    head: [['S#', 'Item', 'Qty', 'Price', 'Disc/pc', 'Disc', 'Amount']],
    body: localRows.map((row) => [
      serial++,
      row.item || '',
      formatNumber(row.qty),
      formatNumber(row.price),
      formatNumber(row.discountPc),
      formatNumber((row.qty * row.discountPc) || 0),
      formatNumber((row.qty * row.price) || 0)
    ]),
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 }
    }
  });

  // 🔸 Subtotal Local
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY,  // 👈 this removes extra gap
    body: [[
      '', 'Sub Total',
      formatNumber(localSubtotal.qty),
      formatNumber(localSubtotal.price),
      '',
      formatNumber(localSubtotal.discount),
      formatNumber(localSubtotal.amount)
    ]],
    styles: { fontSize: 9, fontStyle: 'bold' },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 }
    }
  });

  // 🔹 Special Section Title
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [['Special Items']],
    body: [],
    theme: 'plain',
    headStyles: {
      fontSize: 11,
      halign: 'center',
      fontStyle: 'bold',
      textColor: 0,
      fillColor: [255, 255, 255] // ✅ Removes gray background
    },
  });

  // 🔸 Special Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 1,
    head: [['S#', 'Item', 'Qty', 'Price', 'Disc/pc', 'Disc', 'Amount']],
    body: specialRows.map((row) => [
      serial++,
      row.item || '',
      formatNumber(row.qty),
      formatNumber(row.price),
      formatNumber(row.discountPc),
      formatNumber((row.qty * row.discountPc) || 0),
      formatNumber((row.qty * row.price) || 0)
    ]),
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 }
    }
  });

  // 🔸 Subtotal Special
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY, // 👈 this is the key line
    body: [[
      '', 'Sub Total',
      formatNumber(specialSubtotal.qty),
      formatNumber(specialSubtotal.price),
      '',
      formatNumber(specialSubtotal.discount),
      formatNumber(specialSubtotal.amount)
    ]],
    styles: { fontSize: 9, fontStyle: 'bold' },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 }
    }
  });

  // 🔹 Reading Info and Finance Table side-by-side
  const readingInfoTable = [
    ['Reading Out', readingInfo.readingOut || ''],
    ['Reading In', readingInfo.readingIn || ''],
    ['Total KM', readingInfo.totalKm || ''],
    ['Rate / KM', readingInfo.ratePerKm || ''],
    ['Total Litre', readingInfo.totalLitre || ''],
    ['Rate / Litre', readingInfo.ratePerLitre || '']
  ];

  const financeTable = [
    ['Total Sale', formatNumber(finance.totalSale)],
    ['Commission. L', formatNumber(finance.commissionLocal)],
    ['Commission. S', formatNumber(finance.commissionSpecial)],
    ['Fuel', formatNumber(finance.fuel)],
    ['Total Discount', formatNumber(finance.totalDiscount)],
    ['Misc', formatNumber(finance.misc)],
    ['H.Van', formatNumber(finance.hvan)],
    ['Net Sale', formatNumber(finance.netSale)],
    ['Cash Received', formatNumber(finance.cash)],
    ['Current Short', formatNumber(finance.short)],
    ['Previous Short', formatNumber(finance.previousShort)],
    ['Total Shortage', formatNumber(finance.totalShortage)],
  ];

  

  const yStart = doc.lastAutoTable.finalY + 10;

  // 🆕 STEP 1: Draw Reading Info Table
autoTable(doc, {
  startY: yStart,
  body: readingInfoTable,
  styles: { fontSize: 9 },
  margin: { left: 14 },
  tableWidth: 60
});

const readingTableY = doc.lastAutoTable.finalY; // ✅ Y position after reading info table

// 🆕 STEP 2: Draw Finance Table (to the right)
autoTable(doc, {
  startY: yStart,
  body: financeTable,
  styles: { fontSize: 9 },
  margin: { left: 130 },
  tableWidth: 65
});

const financeTableY = doc.lastAutoTable.finalY;

// 🆕 STEP 3: Draw Other Expense Table below Reading Info
autoTable(doc, {
  startY: readingTableY + 6,
  head: [['Other Expense']],
  body: [[formatNumber(finance.otherExpense || 0)]],
  styles: { fontSize: 9 },
  bodyStyles: { halign: 'right' }, // ✅ Only apply right alignment to value
  headStyles: {
    fillColor: [240, 240, 240],
    textColor: 0,
    fontStyle: 'bold',
    halign: 'left' // ✅ Keep heading centered
  },
  margin: { left: 14 },
  tableWidth: 60
});

 

  const filename = `DC# ${name} ${formattedDate}.pdf`;
  doc.save(filename);
};

  
  // 🔹 Local and Special Rows State
  const [localRows, setLocalRows] = useState([{ item: '', qty: '', price: '', discountPc: '' }]);
  const [specialRows, setSpecialRows] = useState([{ item: '', qty: '', price: '', discountPc: '' }]);

const [finance, setFinance] = useState({
  totalSale: 0,
  commissionLocal: '',
  commissionSpecial: '',
  fuel: 0,
  totalDiscount: 0,
  misc: '',
  hvan: '',
  netSale: 0,
  cash: '',
  short: 0,
  previousShort: '',
  totalShortage: 0,
  otherExpense: '',
});


// 🆕 Commission percentage entry tracking
const [commissionPercent, setCommissionPercent] = useState({
  commissionLocal: '',
  commissionSpecial: ''
});

// 🆕 Lock after Enter
const [commissionFinalized, setCommissionFinalized] = useState({
  commissionLocal: false,
  commissionSpecial: false
});


const inputStyle = {
  width: '100%',
  textAlign: 'center',
  border: 'none',
  outline: 'none',
  fontSize: '15px',
  backgroundColor: 'transparent',
  display: 'block',
  margin: '0 auto',
};
  
  const handleAddRow = (type) => {
    const newRow = { item: '', qty: '', price: '', discountPc: '' };
    if (type === 'local') setLocalRows([...localRows, newRow]);
    else setSpecialRows([...specialRows, newRow]);
  };


  const handleDeleteRow = (type, index) => {
    if (type === 'local') {
      const updated = [...localRows];
      updated.splice(index, 1);
      setLocalRows(updated);
    } else {
      const updated = [...specialRows];
      updated.splice(index, 1);
      setSpecialRows(updated);
    }
  };

// 🔸 Local Subtotals
const localSubtotal = {
  qty: localRows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0),
  price: localRows.reduce((sum, row) => sum + (parseFloat(row.price) || 0), 0),
  discount: localRows.reduce((sum, row) => sum + ((parseFloat(row.qty) || 0) * (parseFloat(row.discountPc) || 0)), 0),
  amount: localRows.reduce((sum, row) => sum + ((parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0)), 0)
};

// 🔹 Special Subtotals
const specialSubtotal = {
  qty: specialRows.reduce((sum, row) => sum + (parseFloat(row.qty) || 0), 0),
  price: specialRows.reduce((sum, row) => sum + (parseFloat(row.price) || 0), 0),
  discount: specialRows.reduce((sum, row) => sum + ((parseFloat(row.qty) || 0) * (parseFloat(row.discountPc) || 0)), 0),
  amount: specialRows.reduce((sum, row) => sum + ((parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0)), 0)
};


// 🧮 Final Calculations

const totalSale = parseFloat(localSubtotal.amount) + parseFloat(specialSubtotal.amount);
const totalDiscount = parseFloat(localSubtotal.discount) + parseFloat(specialSubtotal.discount);
const totalShortage = parseFloat(finance.short || 0) + parseFloat(finance.previousShort || 0);

const netSale =
  totalSale -
  parseFloat(finance.commissionLocal || 0) -
  parseFloat(finance.commissionSpecial || 0) -
  parseFloat(finance.fuel || 0) -
  totalDiscount -
  parseFloat(finance.misc || 0) -
  parseFloat(finance.hvan || 0);

const short = netSale - parseFloat(finance.cash || 0);

useEffect(() => {
  const totalSale = parseFloat(localSubtotal.amount) + parseFloat(specialSubtotal.amount);
  const totalDiscount = parseFloat(localSubtotal.discount) + parseFloat(specialSubtotal.discount);
  const commissionLocal = parseFloat(finance.commissionLocal || 0);
  const commissionSpecial = parseFloat(finance.commissionSpecial || 0);
  const misc = parseFloat(finance.misc || 0);
  const hvan = parseFloat(finance.hvan || 0);
  const fuel = parseFloat(finance.fuel || 0);
  const cash = parseFloat(finance.cash || 0);
  const previousShort = parseFloat(finance.previousShort || 0);

  const netSale = totalSale - commissionLocal - commissionSpecial - fuel - totalDiscount - misc - hvan;
  const short = netSale - cash;
  const totalShortage = short + previousShort;

  const newValues = {
    totalSale,
    totalDiscount,
    netSale,
    short,
    totalShortage
  };

  const changed = Object.keys(newValues).some(
    key => parseFloat(finance[key] || 0) !== newValues[key]
  );

  if (changed) {
    setFinance((prev) => ({
      ...prev,
      ...newValues
    }));
  }
}, [
  localSubtotal.amount,
  localSubtotal.discount,
  specialSubtotal.amount,
  specialSubtotal.discount,
  finance.commissionLocal,
  finance.commissionSpecial,
  finance.fuel,
  finance.misc,
  finance.hvan,
  finance.cash,
  finance.previousShort
]);



const [readingInfo, setReadingInfo] = useState({
  readingOut: '',
  readingIn: '',
  totalKm: '',
  ratePerKm: '',
  totalLitre: '',
  ratePerLitre: ''
});

useEffect(() => {
  const rate = parseFloat(readingInfo.ratePerLitre?.toString().replace(/,/g, '')) || 0;
  const total = parseFloat(readingInfo.totalLitre?.toString().replace(/,/g, '')) || 0;
  const fuelValue = rate * total;

  setFinance((prev) => ({
    ...prev,
    fuel: isNaN(fuelValue) ? 0 : parseFloat(fuelValue.toFixed(0))
  }));
}, [readingInfo.ratePerLitre, readingInfo.totalLitre]);

useEffect(() => {
  const percentLocal = parseFloat(commissionPercent.commissionLocal) || 0;
  const percentSpecial = parseFloat(commissionPercent.commissionSpecial) || 0;

  const localBase = parseFloat(localSubtotal.amount || 0) - parseFloat(localSubtotal.discount || 0);
  const specialBase = parseFloat(specialSubtotal.amount || 0) - parseFloat(specialSubtotal.discount || 0);

  const calculatedLocal = (localBase * percentLocal) / 100;
  const calculatedSpecial = (specialBase * percentSpecial) / 100;

  setFinance(prev => ({
    ...prev,
    commissionLocal: percentLocal ? calculatedLocal.toFixed(0) : '',
    commissionSpecial: percentSpecial ? calculatedSpecial.toFixed(0) : ''
  }));
}, [
  commissionPercent,
  localSubtotal.amount,
  localSubtotal.discount,
  specialSubtotal.amount,
  specialSubtotal.discount
]);

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  
useEffect(() => {
  if (!selectedViewAgent || !selectedViewDate) return;

  const formattedDate = selectedViewDate;

  const key = `${selectedViewAgent.trim()}__${formattedDate}`;
  const record = dailyAgents[key];

  if (record) {
    // Avoid infinite loop by checking if the values are already set
    if (!deepEqual(agentDetails, record.agentDetails)) {
      setAgentDetails(record.agentDetails || {});
    }

    if (!deepEqual(localRows, record.localRows)) {
      setLocalRows(record.localRows || []);
    }

    if (!deepEqual(specialRows, record.specialRows)) {
      setSpecialRows(record.specialRows || []);
    }

    if (!deepEqual(readingInfo, record.readingInfo)) {
      setReadingInfo(record.readingInfo || {});
    }

    if (!deepEqual(finance, record.finance)) {
      setFinance(record.finance || {});
    }

    if (!deepEqual(commissionPercent, record.commissionPercent)) {
      setCommissionPercent(record.commissionPercent || {});
    }

    // Only set finalized if different
    setCommissionFinalized({ commissionLocal: true, commissionSpecial: true });
    setViewMode(true);
  } else {
    setViewMode(false);
  }
}, [selectedViewAgent, selectedViewDate]);



  return (
  <>
  
    <div id="pdf-content" ref={contentRef} 

      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '110%',
        minWidth: '1200px',
        overflowX: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <h1 style={{ fontSize: '38px', marginBottom: '10px' }}>Agents</h1>

{/* 🔘 Previous Record Toggle */}
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-20px' }}>
  <div></div> {/* Placeholder to push button to right */}
  <div>
    {!showPreviousSearch && (
      <button
        onClick={() => setShowPreviousSearch(true)}
       style={{
      padding: '6px 14px',
      fontSize: '14px',
      backgroundColor: '#4b6cb7',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '10px'
    }}
      >
        Previous Record
      </button>
    )}
  </div>
</div>
{showPreviousSearch && (
  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px'
  }}>
    {/* 🔽 Agent Name Dropdown */}
    <input
      list="prev-agent-list"
      placeholder="Search agent name"
      value={selectedViewAgent}
      onChange={(e) => setSelectedViewAgent(capitalizeName(e.target.value))}
      style={{ padding: '6px', width: '200px' }}
    />
    <datalist id="prev-agent-list">
      {agentNameOptions.map((name, idx) => (
        <option key={idx} value={name} />
      ))}
    </datalist>

    {/* 📅 Date Picker */}
    <input
  type="date"
  value={formatDateYMD(selectedViewDate)} // ✅ always shows yyyy-mm-dd
  onChange={(e) => setSelectedViewDate(formatDateDMY(e.target.value))} // ✅ stores as dd-mm-yyyy

      style={{ padding: '6px', width: '150px' }}
    />

    {/* 🚪 Exit Button */}
    <button
      onClick={() => {
  setSelectedViewAgent('');
  setSelectedViewDate('');
  setShowPreviousSearch(false);
  setViewMode(false);

  // ✅ Reset agent info
  setAgentDetails({
    name: '',
    sector: '',
    dcno: '',
    date: ''
  });

  // ✅ Reset rows
  setLocalRows([
    { item: '', qty: '', price: '', discountPc: '', discountRs: '', total: '' }
  ]);

  setSpecialRows([
    { item: '', qty: '', price: '', discountPc: '', discountRs: '', total: '' }
  ]);

  // ✅ Reset finance cleanly
  setFinance({
    totalSale: '',
    commissionLocal: '',
    commissionSpecial: '',
    fuel: '',
    hvan: '',
    misc: '',
    discountLocal: '',
    discountSpecial: '',
    net: '',
    cash: '',
    short: '',
    previousShort: '',
    totalShortage: ''
  });

  // ✅ Reset reading
  setReadingInfo({
  readingOut: '',
  readingIn: '',
  totalKm: '',
  ratePerKm: '',
  totalLitre: '',
  ratePerLitre: ''
});

  // ✅ Reset commission logic
  setCommissionPercent({
    commissionLocal: '',
    commissionSpecial: ''
  });

  setCommissionFinalized({
    commissionLocal: false,
    commissionSpecial: false
  });

  // ✅ Reset cell editing state
  setEditingCell({ section: null, field: null });
}}


      style={{
        padding: '6px 12px',
        background: '#c82333',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      Exit
    </button>
  </div>
)}
{/* 🔒 Make entire form readonly when viewing previous record */}
<fieldset disabled={viewMode} style={{ border: 'none', padding: 0, margin: 0 }}>

      <h2 style={{ textAlign: 'center', marginBottom: '6px', fontSize: '28px' }}>
  Global Trading Company
</h2>

{/* 🔻 Delivery Challan Subheading */}
<h3 style={{
  textAlign: 'center',
  marginBottom: '30px',
  fontSize: '22px',
  color: '#ffffff',
  letterSpacing: '1px'
}}>
  Delivery Challan
</h3>


      {/* 🔷 Top Control Row: D.C#, Name, Sector, Date, and Add Buttons */}
<div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    marginTop: '20px'
  }}
>
  {/* 🔹 Left: D.C#, Name, Sector */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <label style={{ fontSize: '16px' }}>
      <strong>D.C#:</strong>
      <input
        type="number"
        value={agentDetails.dcno}
        onChange={(e) => setAgentDetails((prev) => ({ ...prev, dcno: e.target.value }))}
        style={{ marginLeft: '15px', padding: '4px 6px', width: '120px' }}
      />
    </label>

    <div style={{ display: 'flex', gap: '40px' }}>
      <label style={{ fontSize: '16px' }}>
  <strong>Name:</strong>
  <input
    list="agent-name-list"
    type="text"
    value={agentDetails.name}
    onChange={(e) => {
      const rawName = e.target.value;
      const formattedName = capitalizeName(rawName);
      setAgentDetails((prev) => ({ ...prev, name: formattedName }));

      const matchKey = Object.keys(dailyAgents).find(key =>
        key.startsWith(`${formattedName}__`)
      );

      if (matchKey) {
        const prevData = dailyAgents[matchKey];
       if (prevData?.commissionPercent) {
  setCommissionPercent(prevData.commissionPercent);

  // Don't calculate commission yet — let live calculation handle it
  setCommissionFinalized({
    commissionLocal: false,
    commissionSpecial: false
  });
}

      }
    }}
    style={{ marginLeft: '8px', padding: '4px 6px', width: '180px' }}
  />
  <datalist id="agent-name-list">
    {agentNameOptions.map((name, idx) => (
      <option key={idx} value={name} />
    ))}
  </datalist>
</label>


      <label style={{ fontSize: '16px' }}>
        <strong>Sector:</strong>
        <input
          type="text"
          value={agentDetails.sector}
          onChange={(e) => setAgentDetails((prev) => ({ ...prev, sector: e.target.value }))}
          style={{ marginLeft: '8px', padding: '4px 6px', width: '180px' }}
        />
      </label>
    </div>
  </div>

  {/* 🔸 Right: Date & Add Buttons */}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
    <label style={{ fontSize: '16px' }}>
      <strong>Date:</strong>
      <input
        type="date"
        value={formatDateYMD(agentDetails.date)}
        onChange={(e) => {
  const formatted = formatDateDMY(e.target.value); // ⬅️ converts yyyy-mm-dd → dd-mm-yyyy
  setAgentDetails((prev) => ({ ...prev, date: formatted }));
}}

        style={{ marginLeft: '8px', padding: '4px 6px', width: '140px' }}
      />
    </label>

    {/* 🔘 Add Buttons Side-by-Side */}
    <div style={{ display: 'flex', gap: '10px' }} >
      <button
      
        onClick={() => handleAddRow('local')}
        style={{
        marginRight: '12px',
        padding: '5px 12px',
        fontSize: '15px',
        height: '31px',
        cursor: 'pointer',
        backgroundColor:'#03A6A1'
      }}
      >
        + Add Local
      </button>
      <button 
      
        onClick={() => handleAddRow('special')}
        style={{
        marginRight: '12px',
        padding: '4px 12px',
        fontSize: '15px',
        height: '31px',
        cursor: 'pointer',
        backgroundColor:'#03A6A1'
      }}
      >
        + Add Special
      </button>
    </div>
  </div>
</div>


      {/* 🧾 Table */}
      <table
        border="1"
        width="100%"
        cellPadding="10"
        style={{ borderCollapse: 'collapse', textAlign: 'center', fontSize: '16px', marginTop: '10px' }}
      >
        <thead style={{ backgroundColor: '#d9d9d9', color: 'black' }}>
          <tr>
            <th style={{ width: '55px' }}>Serial No.</th>
            <th style={{ width: '150px' }}>Items</th>
            <th style={{ width: '80px' }}>Quantity</th>
            <th style={{ width: '80px' }}>Price</th>
            <th style={{ width: '80px' }}>Disc/pc</th>
            <th style={{ width: '80px' }}>Discount</th>
            <th style={{ width: '80px' }}>Amount</th>
            <th style={{ width: '22px' }}>🗑</th>
          </tr>
        </thead>

        <tbody>
          <tr style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold', color: 'black' }}>
            <td colSpan="8">Local</td>
          </tr>

          {localRows.map((row, idx) => (
            <tr key={`local-${idx}`}>
              <td>{idx + 1}</td>
             
             {/*Local Item*/}
             <td
  onClick={() => setEditingCell({ section: 'local', index: idx, field: 'item' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'local' && editingCell.index === idx && editingCell.field === 'item' ? (
    <input
      type="text"
      autoFocus
      value={row.item || ''}
      onChange={(e) => {
        const value = e.target.value;
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
        const updated = [...localRows];
        updated[idx].item = capitalized;
        setLocalRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.item || '—'}
    </span>
  )}
</td>


{/* Local Quantity */}

<td
  onClick={() => setEditingCell({ section: 'local', index: idx, field: 'qty' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'local' && editingCell.index === idx && editingCell.field === 'qty' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.qty)}
      onChange={(e) => {
        const updated = [...localRows];
        const raw = parseNumber(e.target.value);
        updated[idx].qty = raw;
        setLocalRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.qty ? formatNumber(row.qty) : '—'}
    </span>
  )}
</td>

{/* Local Price */}

<td
  onClick={() => setEditingCell({ section: 'local', index: idx, field: 'price' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'local' && editingCell.index === idx && editingCell.field === 'price' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.price)}
      onChange={(e) => {
        const updated = [...localRows];
        updated[idx].price = parseNumber(e.target.value);
        setLocalRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.price ? formatNumber(row.price) : '—'}
    </span>
  )}
</td>

{/* Local Discount per piece */}
<td
  onClick={() => setEditingCell({ section: 'local', index: idx, field: 'discountPc' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'local' && editingCell.index === idx && editingCell.field === 'discountPc' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.discountPc)}
      onChange={(e) => {
        const updated = [...localRows];
        updated[idx].discountPc = parseNumber(e.target.value);
        setLocalRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.discountPc ? formatNumber(row.discountPc) : '—'}
    </span>
  )}
</td>


               {/* Discount local */}
<td>
  {row.qty && row.discountPc
    ? (parseFloat(row.qty) * parseFloat(row.discountPc)).toLocaleString('en-PK')
    : row.qty || row.discountPc
    ? '0'
    : '—'}
</td>


              {/* Amount local */}
<td>
  {row.qty && row.price
    ? (parseFloat(row.qty) * parseFloat(row.price)).toLocaleString('en-PK')
    : row.qty || row.price
    ? '0'
    : '—'}
</td>


              <td style={{ textAlign: 'center' }}>
  <button
    onClick={() => handleDeleteRow('local', idx)}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }}
    title="Delete Local Row"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      fill="red"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
  </button>
</td>

            </tr>
          ))}

{/* SubTotal Local */}
          <tr style={{ fontWeight: 'bold' }}>
  <td colSpan="2" style={{ textAlign: 'right', paddingRight: '6px' }}>Sub Total:</td>
  <td>{localSubtotal.qty.toLocaleString('en-PK')}</td>
  <td>{localSubtotal.price.toLocaleString('en-PK')}</td>
  <td></td>
  <td>{localSubtotal.discount.toLocaleString('en-PK')}</td>
  <td>{localSubtotal.amount.toLocaleString('en-PK')}</td>
  <td></td>
</tr>


{/* Special */}
          <tr style={{ backgroundColor: '#d9d9d9', fontWeight: 'bold', color: 'black' }}>
            <td colSpan="8">Special</td>
          </tr>

          {specialRows.map((row, idx) => (
            <tr key={`special-${idx}`}>
              <td>{localRows.length + idx + 1}</td>

              {/* Special item */}
              <td
  // When user clicks, enable editing for this specific cell
  onClick={() => setEditingCell({ section: 'special', index: idx, field: 'item' })}
  style={{ cursor: 'pointer' }}
>
  {/* Show input if this is the currently editing cell */}
  {editingCell.section === 'special' && editingCell.index === idx && editingCell.field === 'item' ? (
    <input
      type="text"
      autoFocus
      value={row.item || ''}
      onChange={(e) => {
        // Capitalize first letter as user types
        const value = e.target.value;
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);

        // Update the special row value
        const updated = [...specialRows];
        updated[idx].item = capitalized;
        setSpecialRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })} // Exit editing on blur
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white' // Text color for dark background
      }}
    />
  ) : (
    // Show value or dash if empty (non-editing mode)
    <span style={{ color: 'white' }}>
      {row.item || '—'}
    </span>
  )}
</td>

{/* Special quantity */}

              <td
  onClick={() => setEditingCell({ section: 'special', index: idx, field: 'qty' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'special' && editingCell.index === idx && editingCell.field === 'qty' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.qty)}
      onChange={(e) => {
        const updated = [...specialRows];
        updated[idx].qty = parseNumber(e.target.value);
        setSpecialRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.qty ? formatNumber(row.qty) : '—'}
    </span>
  )}
</td>
{/* Special Price */}


              <td
  onClick={() => setEditingCell({ section: 'special', index: idx, field: 'price' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'special' && editingCell.index === idx && editingCell.field === 'price' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.price)}
      onChange={(e) => {
        const updated = [...specialRows];
        updated[idx].price = parseNumber(e.target.value);
        setSpecialRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.price ? formatNumber(row.price) : '—'}
    </span>
  )}
</td>

{/* Special Disount/pc */}

              <td
  onClick={() => setEditingCell({ section: 'special', index: idx, field: 'discountPc' })}
  style={{ cursor: 'pointer' }}
>
  {editingCell.section === 'special' && editingCell.index === idx && editingCell.field === 'discountPc' ? (
    <input
      type="text"
      autoFocus
      value={formatNumber(row.discountPc)}
      onChange={(e) => {
        const updated = [...specialRows];
        updated[idx].discountPc = parseNumber(e.target.value);
        setSpecialRows(updated);
      }}
      onBlur={() => setEditingCell({ section: null, index: null, field: null })}
      style={{
        width: '100%',
        textAlign: 'center',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'transparent',
        color: 'white'
      }}
    />
  ) : (
    <span style={{ color: 'white' }}>
      {row.discountPc ? formatNumber(row.discountPc) : '—'}
    </span>
  )}
</td>

              {/* Special discount */}
<td>
  {row.qty && row.discountPc
    ? (parseFloat(row.qty) * parseFloat(row.discountPc)).toLocaleString('en-PK')
    : row.qty || row.discountPc
    ? '0'
    : '—'}
</td>

            {/* Special Amount*/}
              <td>
  {row.qty && row.price
    ? (parseFloat(row.qty) * parseFloat(row.price)).toLocaleString('en-PK')
    : row.qty || row.price
    ? '0'
    : '—'}
</td>

             {/* Special Bin*/}
              <td style={{ textAlign: 'center' }}>
  <button
    onClick={() => handleDeleteRow('special', idx)}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }}
    title="Delete Special Row"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      fill="red"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
  </button>
</td>


            </tr>
          ))}
             
             {/* Special Subtotal */}

          <tr style={{ fontWeight: 'bold' }}>
  <td colSpan="2" style={{ textAlign: 'right', paddingRight: '6px' }}>Sub Total:</td>
  <td>{specialSubtotal.qty.toLocaleString('en-PK')}</td>
  <td>{specialSubtotal.price.toLocaleString('en-PK')}</td>
  <td></td>
  <td>{specialSubtotal.discount.toLocaleString('en-PK')}</td>
  <td>{specialSubtotal.amount.toLocaleString('en-PK')}</td>
  <td></td>
</tr>

        </tbody>
      </table>

<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', gap: '20px' }}>

  {/* 📘 Reading Info Table + Other Expense (stacked vertically) */}
  <div>
    <table
      border="1"
      cellPadding="8"
      style={{
        width: '320px',
        borderCollapse: 'collapse',
        fontSize: '16px',
        background: 'transparent',
        color: 'white',
        height: '50px'
      }}
    >
      <thead style={{ backgroundColor: '#d9d9d9', color: '#000' }}>
        <tr></tr>
      </thead>
      <tbody>
        {[
          ['Reading Out', 'readingOut'],
          ['Reading In', 'readingIn'],
          ['Total KM', 'totalKm'],
          ['Rate / KM', 'ratePerKm'],
          ['Total Litre', 'totalLitre'],
          ['Rate / Litre', 'ratePerLitre']
        ].map(([label, key], idx) => (
          <tr key={idx} style={{ height: '40px' }}>
            <td style={{ width: '180px', paddingLeft: '6px' }}>{label}</td>
            <td style={{ width: '150px', textAlign: 'center' }}>
              <input
                type="text"
                value={readingInfo[key]}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  setReadingInfo((prev) => ({ ...prev, [key]: raw }));
                }}
                onBlur={(e) => {
                  const raw = parseFloat(e.target.value);
                  if (!isNaN(raw)) {
                    setReadingInfo((prev) => ({
                      ...prev,
                      [key]: raw % 1 === 0
                        ? raw.toLocaleString('en-PK', { maximumFractionDigits: 0 })
                        : raw.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }));
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  backgroundColor: 'transparent',
                  color: 'white'
                }}
                placeholder="—"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* 🔻 Other Expense Table (just below Reading Info) */}
    <table
      border="1"
      cellPadding="8"
      style={{
        width: '320px',
        borderCollapse: 'collapse',
        fontSize: '16px',
        background: 'transparent',
        color: 'white',
        marginTop: '10px'
      }}
    >
      <thead style={{ backgroundColor: '#d9d9d9', color: '#000' }}>
        <tr>
          <th colSpan="2" style={{ textAlign: 'center' }}>Other Expense</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ width: '180px', paddingLeft: '6px' }}>Other Expense</td>
          <td style={{ textAlign: 'center' }}>
            <input
              type="text"
              value={finance.otherExpense === '' ? '' : formatNumber(finance.otherExpense)}
              onChange={(e) =>
                setFinance((prev) => ({
                  ...prev,
                  otherExpense: parseNumber(e.target.value)
                }))
              }
              placeholder="—"
              style={{
                width: '100%',
                textAlign: 'center',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                backgroundColor: 'transparent',
                color: 'white'
              }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* 🧾 Finance Summary Table (unchanged) */}
  <table
    border="1"
    cellPadding="8"
    style={{
      width: '320px',
      borderCollapse: 'collapse',
      fontSize: '16px',
      background: 'transparent',
      height: '10px',
      color: 'white'
    }}
  >
  <thead style={{ backgroundColor: '#d9d9d9', color: '#000' }}>
    <tr></tr>
  </thead>
  <tbody>
    {[
      ['Total Sale', formatNumber(finance.totalSale)],
      ['Commission. L', 'commissionLocal'],
      ['Commission. S', 'commissionSpecial'],
      ['Fuel', 'fuel'],
      ['Total Discount', formatNumber(finance.totalDiscount)],
      ['Misc', 'misc'],
      ['H.Van', 'hvan'],
      ['Net Sale', formatNumber(finance.netSale)],
      ['Cash Received', 'cash'],
      ['Current Short', formatNumber(finance.short)],
      ['Previous Short', 'previousShort'],
      ['Total Shortage', formatNumber(finance.totalShortage)]
    ].map(([label, keyOrValue], idx) => (
      <tr key={idx} style={{ height: '40px' }}>
        <td style={{ width: '180px', paddingLeft: '6px' }}>{label}</td>
        <td style={{ width: '140px', textAlign: 'center' }}>
          {/* Commission Special & Local with Enter key logic */}
          {keyOrValue === 'commissionLocal' || keyOrValue === 'commissionSpecial' ? (
            commissionFinalized[keyOrValue] ? (
              <span 
                onClick={() => {
                  setCommissionFinalized((prev) => ({ ...prev, [keyOrValue]: false }));
                  setCommissionPercent((prev) => ({ ...prev, [keyOrValue]: '' }));
                }}
                style={{ cursor: 'pointer' }}
              >
                {finance[keyOrValue] === '' || isNaN(finance[keyOrValue])
  ? '0'
  : formatNumber(finance[keyOrValue])}
{commissionPercent[keyOrValue] ? ` (${commissionPercent[keyOrValue]}%)` : ''}

              </span>
            ) : (
              <input
  type="text"
  value={commissionPercent[keyOrValue]}
  onChange={(e) =>
    setCommissionPercent((prev) => ({
      ...prev,
      [keyOrValue]: e.target.value
    }))
  }
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    let percent = parseFloat(removeCommas(e.target.value));
    if (isNaN(percent)) {
      // fallback to already existing value in state
      percent = parseFloat(commissionPercent[keyOrValue]) || 0;
    }

    const base =
      keyOrValue === 'commissionLocal'
        ? localSubtotal.amount - localSubtotal.discount
        : specialSubtotal.amount - specialSubtotal.discount;

    const result = (base * percent) / 100;

    setFinance((prev) => ({
      ...prev,
      [keyOrValue]: parseFloat(result.toFixed(0))
    }));

    setCommissionPercent((prev) => ({
      ...prev,
      [keyOrValue]: percent
    }));

    setCommissionFinalized((prev) => ({
      ...prev,
      [keyOrValue]: true
    }));

    setEditingCell({ section: null, field: null });
  }
}}


                placeholder="—"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  opacity: 3
                }}
              />
            )
          ) : typeof keyOrValue === 'string' && finance.hasOwnProperty(keyOrValue) ? (
  // 🟡 STEP 3a: If key is in readonlyFields (like 'fuel', 'netSale', etc.), show plain text only
  readonlyFields.includes(keyOrValue) ? (
    <span style={{ cursor: 'default' }}>
      {formatNumber(finance[keyOrValue] || 0)}
    </span>
  ) : (
    // 🟢 STEP 3b: For editable fields (like misc, hvan, cash)
    editingCell.section === 'finance' && editingCell.field === keyOrValue ? (
      <input
        type="text"
        value={finance[keyOrValue] === '' ? '' : formatNumber(finance[keyOrValue])}
        onChange={(e) =>
          setFinance((prev) => ({
            ...prev,
            [keyOrValue]: parseNumber(e.target.value)
          }))
        }
        onBlur={() => setEditingCell({ section: null, field: null })}
        placeholder="—"
        autoFocus  // ✅ This line makes it focus on first click
        style={{
          width: '100%',
          textAlign: 'center',
          border: 'none',
          outline: 'none',
          fontSize: '15px',
          backgroundColor: 'transparent',
          color: '#fff',
          opacity: 3
        }}
      />
    ) : (
      <span
        onClick={() =>
          setEditingCell({ section: 'finance', field: keyOrValue })
        }
        style={{ cursor: 'pointer' }}
      >
        {finance[keyOrValue] === '' || finance[keyOrValue] === undefined
          ? <span style={{ color: '#fff' }}>—</span>
          : formatNumber(finance[keyOrValue])}
      </span>
    )
  )
) : (
  // 🔵 STEP 3c: If it's already a hardcoded formatted value (like Total Sale)
  keyOrValue
)
}
        </td>
      </tr>
    ))}
  </tbody>
</table>





</div>

</fieldset>
    </div>

   
    {/* 📤 Add Agent & Export PDF Buttons */}

      <div style={{
        textAlign: 'right',
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
      }} >
        <button
          onClick={handleAddAgent}
          style={{
    padding: '8px 16px',
    fontSize: '16.5px',
    backgroundColor: '#df2424',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    height: '40px'
  }}
        >
          Add Agent
        </button>

        <button
          onClick={handleExportPDF}
          style={{
      padding: '8px 16px',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      height: '40px'
    }}
        >
          Export PDF
        </button>
      </div>
  </>
);


};

export default Agent;