import { useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../config/Config";

/* ─── number-to-words (INR-aware) ────*/
const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
  "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
  "Seventeen","Eighteen","Nineteen"];
const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

function toWords(n) {
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "");
  if (n < 1000) return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + toWords(n%100) : "");
  if (n < 100000) return toWords(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + toWords(n%1000) : "");
  if (n < 10000000) return toWords(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " " + toWords(n%100000) : "");
  return toWords(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " " + toWords(n%10000000) : "");
}

function amountInWords(amount) {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let words = "INR " + toWords(rupees);
  if (paise > 0) words += " and " + toWords(paise) + " paise";
  return words + " Only";
}

/* ─── helpers ──── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" }) : "";

const fmtFull = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "";

const fmtDateTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" }) +
    " at " + date.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12: false });
};

const cur = (v) =>
  (v || v === 0)
    ? new Intl.NumberFormat("en-IN", { minimumFractionDigits:2, maximumFractionDigits:2 }).format(v)
    : "0.00";

/* ─── CSS (single-copy, full page) ───── */
const PRINT_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@page {
  margin: 0;
  size: A4;
}

html, body {
  height: 100%;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  color: #000;
  background: #fff;
  padding: 0;
  margin: 0;
}

@media print {
  body { background: #fff; padding: 0; margin: 0; }
  .page { margin: 0; width: 210mm; height: 297mm; padding: 6mm 8mm; }
}

/* ── page now locked to true A4 size and never shrinks to fit content ── */
.page {
  width: 210mm;
  height: 297mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #fff;
  padding: 8mm 10mm;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* ── outer border wrapping entire document — now stretches to fill the page ── */
.doc-border {
  border: 1px solid #000;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ── copy type banner ── */
.copy-type-bar {
  text-align: center;
  padding: 3px 0;
  background: #f0f0f0;
  border-bottom: 1px solid #000;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  flex: none;
}

/* ── title bar ── */
.title-bar {
  border-bottom: 1px solid #000;
  flex: none;
}

.header-grid {
  display: grid;
  grid-template-columns: 130px 1fr 130px;
  align-items: center;
  padding: 6px 10px 4px 10px;
}
.header-logo {
  display: flex;
  align-items: center;
}
.header-logo img {
  max-width: 100px;
  max-height: 90px;
  object-fit: contain;
}
.header-center {
  text-align: center;
}
.header-center .doc-title {
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.header-center .doc-subtitle {
  font-size: 10px;
  margin-top: 1px;
}

/* ── top section: company + challan meta ── */
.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #000;
  flex: none;
}
.company-block {
  padding: 8px 10px;
  border-right: 1px solid #000;
}
.company-block .company-name {
  font-size: 12px;
  font-weight: bold;
}
.company-block p {
  font-size: 10px;
  line-height: 1.6;
  margin-top: 1px;
}

/* challan meta right side — 2-col inner grid */
.meta-right {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.meta-cell {
  padding: 4px 8px;
  border-bottom: 1px solid #000;
  font-size: 10px;
  vertical-align: top;
  min-height: 22px;
}
.meta-cell:nth-child(odd) {
  border-right: 1px solid #000;
}
.meta-cell .lbl {
  color: #000;
  font-size: 10px;
}
.meta-cell .val {
  font-weight: bold;
  font-size: 11px;
}
.meta-right .meta-cell.last {
  border-bottom: none;
}

/* ── dispatch / party strip ── */
.dispatch-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #000;
  flex: none;
}
.dispatch-block {
  padding: 6px 10px;
  border-right: 1px solid #000;
  font-size: 10px;
  line-height: 1.6;
}
.dispatch-block:last-child {
  border-right: none;
}
.dispatch-block .block-lbl {
  font-size: 10px;
}
.dispatch-block .block-name {
  font-size: 11px;
  font-weight: bold;
  margin-top: 1px;
}
.dispatch-block .block-detail {
  margin-top: 2px;
}

/* ── items table wrapper — this is the piece that grows to fill the leftover
   page height, pushing totals/signature/footer down to the bottom of the page ── */
.items-table-wrap {
  flex: 1 1 auto;
  border-bottom: 1px solid #000;
  overflow: hidden;
}

/* ── items table ── */
.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
}
.items-table th {
  border: 1px solid #000;
  padding: 5px 6px;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  background: #fff;
}
.items-table td {
  border: 1px solid #000;
  padding: 4px 6px;
  vertical-align: top;
}
.items-table .td-sl { text-align: center; width: 4%; }
.items-table .td-desc { width: 36%; }
.items-table .td-hsn { text-align: center; width: 10%; }
.items-table .td-qty { text-align: center; width: 13%; }
.items-table .td-rate { text-align: right; width: 10%; }
.items-table .td-per { text-align: center; width: 7%; }
.items-table .td-amt { text-align: right; width: 14%; }

.items-table .desc-main { font-weight: bold; }
.items-table .desc-sub { font-style: italic; font-size: 10px; color: #333; }

.spacer-row td { height: 18px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none; }
.spacer-row td:first-child { border-right: 1px solid #000; }

/* ── total row ── */
.total-row td {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  font-weight: bold;
  padding: 5px 6px;
}

/* ── bottom section ── */
.bottom-section {
  border-top: 1px solid #000;
  display: grid;
  grid-template-columns: 1fr auto;
  flex: none;
}
.words-block {
  padding: 5px 10px;
  border-right: 1px solid #000;
  font-size: 10px;
}
.words-block .words-lbl { font-size: 10px; }
.words-block .words-val { font-style: italic; font-size: 10.5px; margin-top: 2px; }
.grand-total-block {
  padding: 5px 12px;
  text-align: right;
  min-width: 160px;
}
.grand-total-block .gt-lbl { font-size: 10px; }
.grand-total-block .gt-val { font-size: 13px; font-weight: bold; }
.grand-total-block .gt-note { font-size: 9px; font-style: italic; }

/* ── receiver section ── */
.receiver-section {
  border-top: 1px solid #000;
  padding: 6px 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  min-height: 50px;
  flex: none;
}
.receiver-left {
 
  padding-right: 10px;
}
.receiver-right {
  padding-left: 10px;
}
.receiver-section .sec-lbl {
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 3px;
}
.receiver-section .sig-line {
  border-bottom: 1px solid #000;
  margin-top: 36px;
  width: 80%;
}
.receiver-section .sig-caption {
  font-size: 9px;
  margin-top: 3px;
  color: #333;
}


/* ── pan + signature ── */
.pan-sig-section {
  display: flex;
  justify-content: flex-end; 
  padding: 6px 0;
  flex: none;
}
.sig-block {
  padding: 6px 10px;
  font-size: 10px;
  text-align: right;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding-left: 20px;
  width: 50%; 
}
.sig-block .sig-company { font-weight: bold; font-size: 11px; }
.sig-block .sig-label { margin-top: 30px; }

/* ── footer ── */
.doc-footer {
  border-top: 1px solid #000;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 4px 8px;
  font-size: 10px;
  flex: none;
}
.doc-footer .footer-left { text-align: left; font-size: 9.5px; }
.doc-footer .footer-center { text-align: center; font-size: 10px; }
.doc-footer .footer-right { text-align: right; font-size: 9.5px; }
`;

/* ─── CSS additions for the combined "BOTH" layout ──────────────────── */
/* Each copy prints full-size on its own page: page 1 = Original,
   page 2 = Duplicate. */
const BOTH_CSS = `
@media print {
  .page-break {
    page-break-after: always;
    break-after: page;
  }
}
`;

/* ─── single-copy HTML builder (returns full .page markup) ──────────── */
function buildCopyHTML(data, copyLabel) {
  const grand = data.items?.reduce((s, i) => s + (i.taxable_value || 0), 0) || 0;
  const totalQty = data.items?.reduce((s, i) => s + (i.dispatch_qty || 0), 0) || 0;

  const itemRows = (data.items || []).map((item, i) => `
    <tr>
      <td class="td-sl">${i + 1}</td>
      <td class="td-desc">
        <div class="desc-main">${item.part_name || ""}${item.part_no ? "/" + item.part_no : ""}</div>
        ${item.nature_of_processing ? `<div class="desc-sub">For ${item.nature_of_processing}</div>` : ""}
        ${item.weight_kg ? `<div class="desc-sub">${item.weight_kg} Kg</div>` : ""}
      </td>
      <td class="td-hsn">${item.hsn_code || ""}</td>
      <td class="td-qty">${item.dispatch_qty != null ? item.dispatch_qty + " nos" + (item.weight_kg ? `<br/>(${item.weight_kg} kgs)` : "") : ""}</td>
      <td class="td-rate">${item.unit_price != null ? cur(item.unit_price) : ""}</td>
      <td class="td-per">${item.unit || ""}</td>
      <td class="td-amt">${item.taxable_value != null ? cur(item.taxable_value) : ""}</td>
    </tr>`).join("");

  const spacerCount = Math.max(0, 10 - (data.items?.length || 0));
  const spacerRows = Array(spacerCount).fill(`
    <tr class="spacer-row">
      <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    </tr>`).join("");

  // Field mappings matched to actual API response structure
  const vehicleNo = data.transport?.vehicle_no || "";

  // Fixed: Get duration from job_work.duration_of_process_days
  const durationDays = data.job_work?.duration_of_process_days;
  const duration = durationDays !== undefined && durationDays !== null && durationDays > 0
    ? durationDays + " days"
    : data.challan_meta?.duration_of_process || "";

  const dispatchThrough =
  data.transport?.dispatch_through ||
  data.dispatch_through ||
  data.job_work?.dispatch_through ||
  data.challan_meta?.dispatch_through ||
  "";

  const buyerOrderNo = data.customer_po_number || data.challan_meta?.buyer_order_no || "";
  const dcDateTime = data.dc_date ? fmtDateTime(data.dc_date) : "";
  const companyPAN = data.challan_meta?.company_pan || "AAJFS0232P1";

  return `
<div class="page">
<div class="doc-border">

  <!-- Copy Type Banner -->
  <div class="copy-type-bar">${copyLabel}</div>

  <!-- Title Bar with Logo -->
  <div class="title-bar">
    <div class="header-grid">
      <div class="header-logo">
        <img src="/suyash-logo-first.png" alt="Company Logo" />
      </div>
      <div class="header-center">
        <div class="doc-title">Delivery Challan</div>
        <div class="doc-subtitle">Delivery Challan</div>
      </div>
      <div></div>
    </div>
  </div>

  <!-- Top: Company | Challan Meta -->
  <div class="top-section">
    <div class="company-block">
      <div class="company-name">${data.company_name || ""}</div>
      <p>
        ${data.company_address?.line1 || ""}<br/>
        ${data.company_address?.line2 || ""}<br/>
        ${data.company_address?.city || ""}${data.company_address?.pincode ? "-" + data.company_address.pincode : ""}<br/>
        ${data.company_gstin ? "GSTIN/UIN: " + data.company_gstin : ""}<br/>
        ${data.company_address?.state ? "State Name&nbsp;:&nbsp;" + data.company_address.state + (data.company_address?.state_code ? ", Code&nbsp;:&nbsp;" + data.company_address.state_code : "") : ""}<br/>
        E-Mail : stores@suyashents.in<br/>
        Mobile : 8459620176, 8459863689
      </p>
      <p style="margin-top:8px">Dispatch To</p>
      <p style="font-weight:bold;font-size:11px">${data.customer_name || ""}</p>
      ${data.ship_to?.line1 ? `<p>${data.ship_to.line1}${data.ship_to.line2 ? ", " + data.ship_to.line2 : ""}</p>` : ""}
      ${data.ship_to?.city ? `<p>${data.ship_to.city}${data.ship_to.pincode ? "-" + data.ship_to.pincode : ""}</p>` : ""}
      ${data.ship_to?.state ? `<p>State Name&nbsp;&nbsp;:&nbsp;${data.ship_to.state}${data.ship_to.state_code ? ", Code&nbsp;:&nbsp;" + data.ship_to.state_code : ""}</p>` : ""}
    </div>

    <div class="meta-right">
      <div class="meta-cell">
        <div class="lbl">Challan No.</div>
        <div class="val">${data.dc_number || ""}</div>
      </div>
      <div class="meta-cell">
        <div class="lbl">e-Way Bill No.</div>
        <div class="val">${data.eway_bill?.eway_bill_number || ""}</div>
      </div>

      <div class="meta-cell">
        <div class="lbl">Dated</div>
        <div class="val">${fmtFull(data.dc_date)}</div>
      </div>
      <div class="meta-cell">
        <div class="lbl">Mode/Terms of Payment</div>
        <div class="val">${data.challan_meta?.payment_terms || ""}</div>
      </div>

      <div class="meta-cell">
        <div class="lbl">Reference No. &amp; Date.</div>
        <div class="val">${data.so_number || ""}</div>
      </div>
      <div class="meta-cell">
        <div class="lbl">Other References</div>
        <div class="val">${data.challan_meta?.other_references || ""}</div>
      </div>

      <div class="meta-cell">
        <div class="lbl">Buyer's Order No.</div>
        <div class="val">${buyerOrderNo}</div>
      </div>
      <div class="meta-cell">
        <div class="lbl">Dated</div>
        <div class="val">${data.challan_meta?.buyer_order_date ? fmt(data.challan_meta.buyer_order_date) : ""}</div>
      </div>

      <div class="meta-cell">
        <div class="lbl">Dispatch Doc No.</div>
        <div class="val">${data.challan_meta?.dispatch_doc_no || ""}</div>
      </div>
      <div class="meta-cell"></div>

      <!-- Dispatched through removed -->
      <div class="meta-cell">
        <div class="lbl">Destination</div>
        <div class="val">${data.ship_to?.city || data.billing_address?.city || ""}</div>
      </div>
      <div class="meta-cell">
        <div class="lbl">Motor Vehicle No.</div>
        <div class="val">${vehicleNo}</div>
      </div>

      <div class="meta-cell last">
        <div class="lbl">Duration of Process</div>
        <div class="val">${duration}</div>
      </div>
      <div class="meta-cell last">
  <div class="lbl">Dispatch Through</div>
  <div class="val">${dispatchThrough}</div>
</div>
    </div>
  </div>

  <!-- Items Table (now wrapped so it grows to fill the leftover page height) -->
  <div class="items-table-wrap">
    <table class="items-table">
      <thead>
        <tr>
          <th class="td-sl">Sl<br/>No.</th>
          <th class="td-desc">Description of Goods</th>
          <th class="td-hsn">HSN/SAC</th>
          <th class="td-qty">Quantity</th>
          <th class="td-rate">Rate</th>
          <th class="td-per">per</th>
          <th class="td-amt">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${spacerRows}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td class="td-sl"></td>
          <td class="td-desc"></td>
          <td class="td-hsn"></td>
          <td class="td-qty" style="font-weight:bold;text-align:center">${totalQty ? cur(totalQty).replace(".00","") + " nos" : ""}</td>
          <td class="td-rate"></td>
          <td class="td-per" style="text-align:left;font-weight:bold">Total</td>
          <td class="td-amt" style="font-weight:bold">Rs. ${cur(grand)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Amount in Words + Grand Total -->
  <div class="bottom-section">
    <div class="words-block">
      <div class="words-lbl">Amount Chargeable (in words)</div>
      <div class="words-val">${amountInWords(grand)}</div>
    </div>
    <div class="grand-total-block">
      <div class="gt-val">Rs. ${cur(grand)}</div>
      <div class="gt-note">E. &amp; O.E</div>
    </div>
  </div>

  <!-- Receiver Details -->
  <div class="receiver-section">
    <div class="receiver-left">
      <div class="sec-lbl">Receiver's Details</div>
      <div class="sig-line"></div>
      <div class="sig-caption">Receiver's Signature &amp; Stamp with Date</div>
    </div>
    <div class="receiver-right">
      <div class="sec-lbl">Received in good condition</div>
      <div style="font-size:10px;margin-top:4px;color:#555;">Name: ______________________________</div>
      <div style="font-size:10px;margin-top:4px;color:#555;">Date: ______________________________</div>
    </div>
  </div>

  <!-- PAN + Signature -->
 <!-- Signature -->
<div class="pan-sig-section">
  <div class="sig-block">
    <div class="sig-company">${data.company_name ? "for " + data.company_name : ""}</div>
    <div class="sig-label">Authorised Signatory</div>
  </div>
</div>

  <!-- Footer -->
  <div class="doc-footer">
    <div class="footer-left">PAN: ${companyPAN}</div>
    <div class="footer-center">${data.company_address?.city ? "SUBJECT TO " + data.company_address.city.toUpperCase() + " JURISDICTION" : ""}</div>
    <div class="footer-right">Page 1 of 1</div>
  </div>

</div><!-- /doc-border -->
</div><!-- /page -->`;
}

/* ─── full HTML wrapper (single copy) ───────────────────────────────── */
function buildHTML(data, copyLabel) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delivery Challan - ${data.dc_number || ""} (${copyLabel})</title>
  <style>${PRINT_CSS}</style>
</head>
<body>
${buildCopyHTML(data, copyLabel)}
</body>
</html>`;
}

/* ─── full HTML wrapper (BOTH copies, two full-size pages) ───────────── */
function buildBothHTML(data) {
  const originalHTML  = buildCopyHTML(data, "ORIGINAL FOR RECIPIENT");
  const duplicateHTML = buildCopyHTML(data, "DUPLICATE FOR TRANSPORTER");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delivery Challan - ${data.dc_number || ""} (Original + Duplicate)</title>
  <style>${PRINT_CSS}${BOTH_CSS}</style>
</head>
<body>
  <div class="page-break">
    ${originalHTML}
  </div>
  ${duplicateHTML}
</body>
</html>`;
}

/* ─── component ──────────────────────────────────────────────────────── */
/**
 * Props:
 *   open            – boolean
 *   onClose         – () => void
 *   deliveryChallan – { _id, ... }
 *   copyType        – "ORIGINAL FOR RECIPIENT" | "DUPLICATE FOR TRANSPORTER" | "BOTH"
 */
const PrintDeliveryChallan = ({ open, onClose, deliveryChallan, copyType }) => {

  useEffect(() => {
    if (!open || !deliveryChallan?._id) return;

    let cancelled = false;

    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/api/delivery-challans/${deliveryChallan._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cancelled) return;

        const data = res.data.data;
        const isBoth = copyType === "BOTH";
        const label = copyType || "ORIGINAL FOR RECIPIENT";
        const html = isBoth ? buildBothHTML(data) : buildHTML(data, label);

        const w = window.open("", "_blank");
        if (!w) {
          alert("Please allow popups to print.");
          onClose?.();
          return;
        }

        w.document.write(html);
        w.document.close();

        w.onload = () => {
          setTimeout(() => {
            w.focus();
            w.print();
            w.onafterprint = () => {
              w.close();
              onClose?.();
            };
          }, 400);
        };

      } catch (err) {
        console.error("Error fetching delivery challan:", err);
        alert("Failed to load delivery challan data.");
        onClose?.();
      }
    };

    run();
    return () => { cancelled = true; };
  }, [open, deliveryChallan, copyType]);

  return null;
};

export default PrintDeliveryChallan;