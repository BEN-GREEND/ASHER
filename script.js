const students = [
  "אלעזר ויספיש", "אבי דחבש", "אבי תומרקין", "אבישי יזדי", "אהרון הס", "ברוך רוזנטלר",
  "איציק שמעה", "אלחנן רייך", "אלעזר ריגר", "דוד הלברשטט", "דודי ברינבוים", "דודי זכריה",
  "דניאל חורש", "יהודה כהן", "יודי יגאלי", "יוסי וינטר", "יוסף קרביץ", "ינאי טוג",
  "יצחקוב יוסף חיים", "יצחקוב בן ציון", "ישי פרידלר", "ישראל טרופ", "מוישי ציגרמן",
  "מיכאל בויאר", "משה חיים", "משה יונה", "נחי ינקוביץ", "נפתלי הלברשטט", "פיני גולדברג",
  "קובי גנץ", "שוקי רוט", "שמואל מובשוביץ", "שמעון שלזינגר", "שראל אדמוני"
];

const points = {
  "שחרית": 25,
  "סדר א": 25,
  "מנחה": 10,
  "סדר ב": 20,
  "סדר ג": 20
};

function isElulMonth() {
  const today = new Date();
  return today.getMonth() === 7; // אוגוסט -> אלול (בהנחה שזה מתוזמן מול לוח שנה עברי)
}

function loadList() {
  const day = document.getElementById("day").value;
  const session = document.getElementById("session").value;

  document.getElementById("attendance-form").classList.remove("hidden");
  document.getElementById("list-title").textContent = `${session} - ${day}`;

  const listContainer = document.getElementById("students-list");
  listContainer.innerHTML = "";

  students.forEach(name => {
    const div = document.createElement("div");
    div.className = "student";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = name;
    checkbox.name = name;

    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = name;

    div.appendChild(checkbox);
    div.appendChild(label);
    listContainer.appendChild(div);
  });

  document.getElementById("attendance-form").onsubmit = function(e) {
    e.preventDefault();
    saveAttendance(day, session);
  };
}

function saveAttendance(day, session) {
  const dateKey = `${day}_${session}_${new Date().toLocaleDateString()}`;
  const data = {};

  students.forEach(name => {
    const checked = document.getElementById(name).checked;
    data[name] = {
      present: checked,
      points: calculatePoints(session, checked)
    };
  });

  localStorage.setItem(dateKey, JSON.stringify(data));
  alert("✅ נוכחות נשמרה בהצלחה!");
}

function calculatePoints(session, wasPresent) {
  if (!wasPresent) return 0;

  if (isElulMonth()) {
    if (session === "מנחה") return 0;
    if (session === "סדר ב" || session === "סדר ג") return points[session] + 5;
  }
  return points[session];
}
