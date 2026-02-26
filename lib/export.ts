import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      "Thời gian": item.label,
      "Thu nhập (VND)": item.income,
      "Chi tiêu (VND)": item.expense,
      "Số dư (VND)": item.income - item.expense,
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string, title: string) => {
  const doc = new jsPDF();

  // Thêm tiêu đề (sử dụng font mặc định, lưu ý tiếng Việt có thể bị lỗi nếu không nhúng font)
  // Để đơn giản nhất, ta sẽ dùng các ký tự không dấu hoặc chấp nhận font mặc định
  doc.setFontSize(18);
  doc.text("BAO CAO THU CHI - MONEYMATE", 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Thoi gian: ${title}`, 14, 30);
  doc.text(`Ngay xuat: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 38);

  const tableColumn = ["Thoi gian", "Thu nhap (VND)", "Chi tieu (VND)", "So du (VND)"];
  const tableRows = data.map((item) => [
    item.label,
    new Intl.NumberFormat("vi-VN").format(item.income),
    new Intl.NumberFormat("vi-VN").format(item.expense),
    new Intl.NumberFormat("vi-VN").format(item.income - item.expense),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] }, // Màu emerald-600
  });

  doc.save(`${fileName}.pdf`);
};
