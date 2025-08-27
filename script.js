const students = [ /* ... list names ... */ ];
const points = { "שחרית":25,"סדר א":25,"מנחה":10,"סדר ב":20,"סדר ג":20 };
function isElul() { return new Date().getMonth() === 7; }
let currentDate = new Date();
let data = JSON.parse(localStorage.getItem("attendanceData")|| "{}");
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function formatDate(d) {
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}
function initDatePicker() {
  const dp = document.getElementById("date-picker");
  const today = formatDate(currentDate);
  dp.innerHTML = `<button onclick="setDate(0)">היום – ${today}</button>
                  <button onclick="setDate(-1)">אתמול</button>
                  <input type="date" onchange="pickDate(this.value)">`;
}
function setDate(offset) {
  currentDate = new Date(Date.now() + offset*864e5);
  initDatePicker(); loadPresence();
}
function pickDate(val) { currentDate = new Date(val); initDatePicker(); loadPresence(); }
function loadPresence() {
  const session = document.getElementById("session").value;
  const form = document.getElementById("attendance-form");
  form.innerHTML = `<h3>${session} – ${formatDate(currentDate)}</h3>`;
  students.forEach(name => {
    form.innerHTML += `<label><input type="checkbox" id="${name}" ${getAttendance(currentDate, session, name)?.present? "checked": ""}>${name}</label><br>`;
  });
  form.classList.add("active");
  form.onsubmit = e => { e.preventDefault(); saveAttendance(session); };
}
function keyDate(d,s) { return `${formatDate(d)}_${s}`; }
function getAttendance(d,s,n) {
  return (data[keyDate(d,s)]||{})[n];
}
function saveAttendance(session) {
  const key = keyDate(currentDate, session);
  if (!data[key]) data[key] = {};
  students.forEach(n => {
    const pres = document.getElementById(n).checked;
    let pts = pres ? (points[session] + ((isElul() && (session==="סדר ב"||session==="סדר ג"))?5:0)) : 0;
    if (session==="מנחה" && isElul()) pts = 0;
    data[key][n] = { present: pres, pts };
  });
  localStorage.setItem("attendanceData", JSON.stringify(data));
  alert("נשמר בהצלחה!");
  renderAll();
}
function computeTotals(periodDays) {
  const totals = {};
  students.forEach(n => totals[n] = 0);
  const today = new Date(currentDate);
  for (const key in data) {
    const [d,s] = key.split("_");
    const dateParts = d.split("/");
    const dt = new Date(dateParts[2], dateParts[1]-1, dateParts[0]);
    if ((today - dt)/864e5 <= periodDays) {
      Object.entries(data[key]).forEach(([n,v]) => totals[n]+=v.pts);
    }
  }
  return totals;
}
function renderTable(containerId, totals, searchVal="") {
  const container = document.getElementById(containerId);
  const arr = Object.entries(totals).filter(([n]) => n.includes(searchVal));
  arr.sort((a,b)=>b[1]-a[1]);
  let html = `<table id="${containerId}"><tr><th onclick="sortTable('${containerId}',0)">שם</th><th onclick="sortTable('${containerId}',1)">ניקוד</th></tr>`;
  arr.forEach(([n,p]) => html += `<tr><td>${n}</td><td>${p}</td></tr>`);
  html += `</table>`;
  container.innerHTML = html;
}
function renderAll() {
  renderDaily();
  renderWeekly();
  renderMonthly();
}
function renderDaily() {
  const t = {};
  Object.entries(data[`: ${formatDate(currentDate)}_${document.getElementById("session").value}`] || {}).forEach(([n,v])=>t[n]=v.pts);
  renderTable("dailyTableContainer", t, document.getElementById("searchDaily").value);
}
function renderWeekly() {
  renderTable("weeklyTableContainer", computeTotals(7), document.getElementById("searchWeekly").value);
}
function renderMonthly() {
  renderTable("monthlyTableContainer", computeTotals(30), document.getElementById("searchMonthly").value);
}
function sortTable(id,col) { /* ... impl ... */ }
function exportTable(tableId, filename) {
  const rows=document.querySelectorAll(`#${tableId} tr`);
  let csv="";
  rows.forEach(r=>{const cols=r.querySelectorAll("td, th"); csv+=Array.from(cols).map(c=>c.innerText).join(",")+"\n";});
  const blob=new Blob([csv],{type:"text/csv"}), a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=filename; a.click();
}
function exportPDF(tableId) {
  html2pdf().from(document.getElementById(tableId)).save();
}
window.onload = () => { initDatePicker(); renderAll(); };
