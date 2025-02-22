import XLSX from "xlsx";

import studentSorter from "../common/studentSorter.js";
import teacherSorter from "../common/teacherSorter.js";

import fs from "node:fs";
import path from "node:path";

const sensitiveDIR = new URL("../sensitive", import.meta.url);
const files = fs
  .readdirSync(sensitiveDIR)
  .filter((file) => file.endsWith(".xlsx"));

const readXLSX = (file) =>
  new Promise(async (resolve, reject) => {
    const filePath = path.join(sensitiveDIR.pathname, file);
    const sheetName = file.replace(".xlsx", "");

    const workbook = XLSX.readFile(filePath);
    if (!workbook.SheetNames.includes(sheetName))
      reject(
        `Format tidak sesuai. Nama sheet harus sama dengan nama file ! File: ${file}`
      );

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    const isTeacher = sheetName === "GURU";
    const sSorter = !isTeacher ? await studentSorter(sheetName, reject) : null;

    const cleanData = data.map(isTeacher ? teacherSorter(reject) : sSorter);

    const sorted = cleanData.sort((a, b) => a.name.localeCompare(b.name));

    resolve(sorted);
  });

export default async function readXLSXes() {
  try {
    let penampung = [];

    for (const file of files) {
      const data = await readXLSX(file);

      penampung = [...penampung, data];
    }

    return penampung;
  } catch (e) {
    console.log(e);
    process.exit();
  }
}
