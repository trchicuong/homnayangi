const tenDanhMuc = {
  "com": "Cơm",
  "bun": "Bún",
  "pho": "Phở",
  "mi": "Mì",
  "lau": "Lẩu",
  "nuong": "Nướng",
  "an-vat": "Ăn vặt",
  "nuoc": "Nước uống",
  "sup": "Súp",
  "chay": "Đồ chay",
  "trang-mieng": "Tráng miệng",
  "do-kho": "Đồ khô",
  "do-chien": "Đồ chiên"
};

function getMonDaThem() {
  return JSON.parse(localStorage.getItem("monDaThem") || "{}");
}

function getDanhSachMon() {
  const loai = document.getElementById("category").value;
  const daThem = getMonDaThem();

  if (loai === "all") {
    return Object.values(daThem).flat();
  }

  return daThem[loai] || [];
}

function themMon() {
  const tenMon = document.getElementById("monMoi").value.trim();
  const loai = document.getElementById("category").value;

  if (!tenMon) {
    Swal.fire("Nhập tên món trước đã!", "", "info");
    return;
  }

  if (loai === "all") {
    Swal.fire("Hãy chọn loại món cụ thể!", "", "warning");
    return;
  }

  const daThem = getMonDaThem();
  daThem[loai] = daThem[loai] || [];

  if (daThem[loai].includes(tenMon)) {
    Swal.fire("Món này đã có rồi!", "", "info");
    return;
  }

  daThem[loai].push(tenMon);
  localStorage.setItem("monDaThem", JSON.stringify(daThem));

  Swal.fire("Đã thêm món!", tenMon, "success");
  document.getElementById("monMoi").value = "";
}

function randomMonAn() {
  const danhSach = getDanhSachMon();
  if (danhSach.length === 0) {
    Swal.fire("Không có món nào!", "", "warning");
    return;
  }

  const mon = danhSach[Math.floor(Math.random() * danhSach.length)];

  if (typeof confetti === "function") confetti();

  if ("speechSynthesis" in window) {
    const msg = new SpeechSynthesisUtterance(mon);
    msg.lang = "vi-VN";
    window.speechSynthesis.speak(msg);
  }

  Swal.fire({
    title: "Món hôm nay là... 🍽️",
    text: mon,
    icon: "success",
    showCancelButton: true,
    cancelButtonColor: "#d33",
    confirmButtonColor: "#3085d6",
    denyButtonColor: "#4caf50",
    confirmButtonText: "Món khác đi!",
    cancelButtonText: "Cấm cãi!",
    showDenyButton: true,
    denyButtonText: "🗺️ Tìm quán gần tôi",
    heightAuto: false
  }).then(result => {
    if (result.isConfirmed) {
      randomMonAn();
    } else if (result.isDenied) {
      timQuanGanDay(mon);
    }
  });

}

function timQuanGanDay(monAn) {
  // Hiện thông báo đang tìm
  Swal.fire({
    title: "🔍 Đang tìm quán gần bạn...",
    text: "Vui lòng chờ trong giây lát",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  if (!navigator.geolocation) {
    Swal.close();
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(monAn)}`);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      Swal.close();
      const { latitude, longitude } = pos.coords;
      const url = `https://www.google.com/maps/search/${encodeURIComponent(monAn)}+near+${latitude},${longitude}`;
      window.open(url);
    },
    () => {
      Swal.close();
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(monAn)}`);
    },
    {
      timeout: 8000
    }
  );
}

function hienDanhSachDaThem() {
  const daThem = getMonDaThem();

  if (Object.keys(daThem).length === 0) {
    Swal.fire("Chưa có món nào được thêm!", "", "info");
    return;
  }

  let html = "";

  for (const [loai, danhSach] of Object.entries(daThem)) {
    if (danhSach.length === 0) continue;

    const tenHienThi = tenDanhMuc[loai] || loai;
    html += `<h3 style="margin-bottom:6px;color:#e91e63;">${tenHienThi}</h3><ul>`;

    danhSach.forEach((mon, i) => {
      html += `
        <li style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          margin-bottom: 6px;
          background: #fefefe;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          font-size: 16px;
        ">
          <span>🍽️ ${mon}</span>
          <button onclick="xoaMon('${loai}', ${i})" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: 0.2s ease;
            width: 30%;
          " onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
            ❌ Xóa
          </button>
        </li>`;
    });

    html += `</ul></div>`;
  }

  Swal.fire({
    title: '📋 Món đã thêm',
    html: `<div style="max-height: 400px; overflow-y: auto;">${html}</div>`,
    width: 600,
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: 'Đóng'
  });
}

function xoaMon(loai, index) {
  const daThem = getMonDaThem();
  if (!daThem[loai]) return;

  const tenMon = daThem[loai][index];
  daThem[loai].splice(index, 1);

  if (daThem[loai].length === 0) delete daThem[loai];

  localStorage.setItem("monDaThem", JSON.stringify(daThem));

  Swal.fire({
    icon: 'success',
    title: `Đã xóa món: ${tenMon}`,
    timer: 1000,
    showConfirmButton: false
  });

  setTimeout(hienDanhSachDaThem, 300);
}

// Load hiệu ứng confetti
(function loadConfetti() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
  script.onload = () => console.log("Confetti loaded");
  document.body.appendChild(script);
})();
