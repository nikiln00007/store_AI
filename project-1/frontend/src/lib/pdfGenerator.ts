import { Invoice, PurchaseOrder } from '../types/index.js';

export const downloadInvoicePDF = (invoice: Invoice, shopName = 'Sharma Kirana & General Store') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download or print the invoice.');
    return;
  }

  const dateStr = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const timeStr = invoice.createdAt ? new Date(invoice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${invoice.invoiceNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; color: #1F2521; margin: 0; padding: 40px; background: #fff; }
        .invoice-box { max-width: 800px; margin: auto; border: 2px solid #E49280; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #E49280; padding-bottom: 20px; margin-bottom: 20px; }
        .shop-title { font-size: 26px; font-weight: 800; color: #E07A5F; margin: 0; }
        .shop-subtitle { font-size: 13px; color: #666; margin-top: 4px; }
        .invoice-meta { text-align: right; font-size: 14px; }
        .meta-tag { font-weight: 700; color: #2E7D32; }
        .customer-info { background: #FAF9F6; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #E07A5F; color: white; text-align: left; padding: 12px; font-size: 14px; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .total-section { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; border-top: 2px solid #333; padding-top: 20px; }
        .qr-box { text-align: center; border: 1px solid #ccc; padding: 10px; border-radius: 8px; background: #FAF9F6; width: 160px; }
        .qr-placeholder { width: 120px; height: 120px; background: #fff; margin: auto; border: 2px solid #2E7D32; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #2E7D32; border-radius: 4px; }
        .amounts { width: 300px; }
        .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
        .grand-total { font-size: 20px; font-weight: 800; color: #2E7D32; border-top: 1px solid #ccc; padding-top: 10px; }
        .footer { text-align: center; margin-top: 40px; font-size: 15px; font-weight: 600; color: #E07A5F; border-top: 1px dashed #ccc; padding-top: 20px; }
        @media print { body { padding: 0; } .invoice-box { border: none; box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <h1 class="shop-title">🌿 ${shopName}</h1>
            <div class="shop-subtitle">India's Smartest Autonomous Kirana & Superstore</div>
            <div class="shop-subtitle">Shop No. 4, MG Road, Andheri West, Mumbai | GSTIN: 27AABCU9603R1ZM</div>
          </div>
          <div class="invoice-meta">
            <div style="font-size: 18px; font-weight: 800; color: #333;">TAX INVOICE</div>
            <div>No: <span class="meta-tag">${invoice.invoiceNumber}</span></div>
            <div>Date: ${dateStr} ${timeStr}</div>
            <div>Mode: <span style="font-weight:700; color: #E07A5F;">${invoice.paymentMethod}</span></div>
          </div>
        </div>

        <div class="customer-info">
          <div>
            <strong>Customer:</strong> ${invoice.customerName || 'Walking Customer'}<br>
            <strong>Phone:</strong> ${invoice.customerPhone || 'N/A'}
          </div>
          <div style="text-align: right;">
            <strong>Status:</strong> <span style="color: ${invoice.status === 'Paid' ? '#2E7D32' : '#D97706'}; font-weight:bold;">${invoice.status.toUpperCase()}</span><br>
            <strong>UPI ID:</strong> sharma.kirana@okaxis
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Rate (₹)</th>
              <th>GST</th>
              <th style="text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <strong>${it.name}</strong>
                </td>
                <td>${it.qty} ${it.unit}</td>
                <td>₹${it.price}</td>
                <td>${it.gstRate}%</td>
                <td style="text-align: right; font-weight: 600;">₹${it.total.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="qr-box">
            <div class="qr-placeholder">
              📱 SCAN TO PAY<br>₹${invoice.grandTotal.toLocaleString('en-IN')}<br>BHIM / GPay / PhonePe
            </div>
            <div style="font-size: 11px; margin-top: 6px; color: #555;">UPI: sharma.kirana@okaxis</div>
          </div>

          <div class="amounts">
            <div class="amount-row">
              <span>Subtotal:</span>
              <span>₹${invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="amount-row">
              <span>GST Amount:</span>
              <span>₹${invoice.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            ${invoice.discount > 0 ? `
            <div class="amount-row" style="color: #D97706;">
              <span>Discount:</span>
              <span>- ₹${invoice.discount.toLocaleString('en-IN')}</span>
            </div>` : ''}
            <div class="amount-row grand-total">
              <span>Grand Total:</span>
              <span>₹${invoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>
            ${invoice.totalProfit ? `
            <div style="font-size: 11px; color: #2E7D32; text-align: right; margin-top: 4px;">
              ⚡ Shop Profit: ₹${invoice.totalProfit.toLocaleString('en-IN')}
            </div>` : ''}
          </div>
        </div>

        <div class="footer">
          🙏 Thank you for shopping with us! Visit again! 🙏<br>
          <span style="font-size: 12px; font-weight: 400; color: #666;">This is a computer-generated tax invoice verified by Store AI Assistant.</span>
        </div>
      </div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const downloadPurchaseOrderPDF = (po: PurchaseOrder) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const dateStr = po.orderDate ? new Date(po.orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order - ${po.poNumber}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; color: #1F2521; margin: 0; padding: 40px; background: #fff; }
        .po-box { max-width: 800px; margin: auto; border: 2px solid #2E7D32; padding: 30px; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px dashed #2E7D32; padding-bottom: 20px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #2E7D32; color: white; text-align: left; padding: 12px; font-size: 14px; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="po-box">
        <div class="header">
          <div>
            <h1 style="color: #2E7D32; margin: 0;">📦 PURCHASE ORDER</h1>
            <div style="font-weight: 700; margin-top: 4px;">Sharma Kirana & General Store</div>
            <div style="font-size: 13px;">Mumbai | Phone: +91 98201 23456</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800;">${po.poNumber}</div>
            <div>Date: ${dateStr}</div>
            <div>Status: <strong style="color: #E07A5F;">${po.status}</strong></div>
          </div>
        </div>
        <div style="background: #F0F7F1; padding: 15px; border-radius: 8px;">
          <strong>To Supplier:</strong> ${po.supplierName}<br>
          <strong>Contact:</strong> ${po.supplierPhone || po.supplierWhatsapp || 'N/A'}<br>
          <strong>Notes:</strong> ${po.notes || 'Urgent delivery requested.'}
        </div>
        <table>
          <thead><tr><th>#</th><th>Item Name</th><th>Req. Qty</th><th>Est. Rate</th><th>Total (₹)</th></tr></thead>
          <tbody>
            ${po.items.map((it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.name}</strong></td>
                <td>${it.qty} ${it.unit}</td>
                <td>₹${it.estimatedPrice}</td>
                <td>₹${it.total.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; font-size: 20px; font-weight: 800; color: #2E7D32;">
          Total Est. Value: ₹${po.totalAmount.toLocaleString('en-IN')}
        </div>
      </div>
      <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
