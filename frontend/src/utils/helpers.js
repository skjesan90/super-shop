// ============================================
// Utility Functions - Smart Super Shop ERP
// ============================================
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ─── Format Currency ──────────────────────────
export const formatCurrency = (amount, currency = '৳') => `${currency}${Number(amount || 0).toLocaleString()}`

// ─── Format Date ──────────────────────────────
export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Generate SKU ─────────────────────────────
export const generateSKU = (name, category) => {
  const prefix = category?.slice(0, 3).toUpperCase() || 'PRD'
  const rand = Math.floor(Math.random() * 900 + 100)
  return `${prefix}-${rand}`
}

// ─── PDF Invoice Generator ────────────────────
export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
  const w = doc.internal.pageSize.getWidth()

  // Header
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, w, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SMART SUPER SHOP', w / 2, 12, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Gulshan-2, Dhaka | Tel: 01711-100200 | www.supershop.com', w / 2, 20, { align: 'center' })

  // Invoice info
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TAX INVOICE', 10, 38)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Invoice No: ${invoice.id}`, 10, 45)
  doc.text(`Date: ${invoice.date}`, 10, 50)
  doc.text(`Customer: ${invoice.customer}`, 10, 55)
  doc.text(`Payment: ${invoice.paymentMethod}`, w - 10, 45, { align: 'right' })

  // Items table
  autoTable(doc, {
    startY: 62,
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: invoice.items.map(i => [i.name, i.qty, `৳${i.sellingPrice}`, `৳${(i.sellingPrice * i.qty).toLocaleString()}`]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 10, right: 10 },
  })

  const finalY = doc.lastAutoTable.finalY + 5

  // Totals
  const totals = [
    ['Subtotal', `৳${invoice.subtotal.toLocaleString()}`],
    ...(invoice.discountAmt > 0 ? [[`Discount`, `-৳${invoice.discountAmt.toFixed(0)}`]] : []),
    [`VAT (5%)`, `৳${invoice.vatAmt.toFixed(0)}`],
    ['TOTAL', `৳${invoice.total.toFixed(0)}`],
  ]

  let y = finalY
  doc.setFontSize(8)
  totals.forEach(([label, val], i) => {
    const isBold = i === totals.length - 1
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    if (isBold) {
      doc.setFillColor(37, 99, 235)
      doc.rect(10, y - 4, w - 20, 8, 'F')
      doc.setTextColor(255)
    } else {
      doc.setTextColor(71, 85, 105)
    }
    doc.text(label, w - 50, y, { align: 'left' })
    doc.text(val, w - 10, y, { align: 'right' })
    y += 8
  })

  // Footer
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for shopping with Smart Super Shop!', w / 2, y + 10, { align: 'center' })
  doc.text('For support: support@supershop.com', w / 2, y + 15, { align: 'center' })

  doc.save(`${invoice.id}.pdf`)
}

// ─── Export to Excel ──────────────────────────
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

// ─── Export Orders to Excel ───────────────────
export const exportOrdersToExcel = (orders) => {
  const data = orders.map(o => ({
    'Order ID': o.id, 'Customer': o.customer, 'Amount (৳)': o.amount,
    'Items': o.items, 'Payment': o.paymentMethod, 'Status': o.status, 'Date': o.date,
  }))
  exportToExcel(data, 'Sales_Report')
}

// ─── Export Products to Excel ─────────────────
export const exportProductsToExcel = (products) => {
  const data = products.map(p => ({
    'Product Name': p.name, 'SKU': p.sku, 'Category': p.category, 'Brand': p.brand,
    'Buying Price': p.buyingPrice, 'Selling Price': p.sellingPrice,
    'Stock': p.quantity, 'Unit': p.unit, 'Expiry': p.expiryDate || '—',
  }))
  exportToExcel(data, 'Products_Inventory')
}

// ─── Barcode Scanner Simulation ───────────────
export const lookupByBarcode = (barcode, products) => {
  return products.find(p => p.barcode === barcode.trim()) || null
}

// ─── Calculate Profit Margin ──────────────────
export const profitMargin = (buyPrice, sellPrice) => {
  if (!buyPrice || !sellPrice) return 0
  return (((sellPrice - buyPrice) / sellPrice) * 100).toFixed(1)
}
