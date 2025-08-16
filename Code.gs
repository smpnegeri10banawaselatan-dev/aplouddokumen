const SPREADSHEET_ID = '1rBpgzeqovr4_f7TDolSdqMffcfQJMN2aoVjaVH-NuZ8';  // Ganti sesuai ID spreadsheet-mu
const FOLDER_ID = '1NhyI9OpNAFJXONbSPZMPEXs6VPIMttZz';  // Folder Drive untuk simpan file

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Upload Dokumen Pendukung');
}

// Ambil data dari sheet "aploud" kolom A–E
function getMasterData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('aploud');
  if (!sheet) return [];

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  return data.map(row => ({
    namaSatuan: row[0],      // Kolom A
    jenjang: row[1],         // Kolom B
    status: row[2],          // Kolom C
    kecamatan: row[3],       // Kolom D
    dokumenLink: row[4] || ""// Kolom E
  }));
}

// Upload file, simpan di folder sesuai nama satuan pendidikan dan simpan link ke spreadsheet
function uploadFileForRow(rowData) {
  try {
    const parentFolder = DriveApp.getFolderById(FOLDER_ID);
    const folders = parentFolder.getFoldersByName(rowData.namaSatuan);
    let targetFolder;

    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = parentFolder.createFolder(rowData.namaSatuan);
    }

    const blob = Utilities.newBlob(Utilities.base64Decode(rowData.base64), rowData.mimeType, rowData.namaSatuan);
    const file = targetFolder.createFile(blob);
    const fileUrl = file.getUrl();

    // Simpan URL ke kolom E (Dokumen Pendukung)
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('aploud');
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues(); // kolom A

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === rowData.namaSatuan) {
        sheet.getRange(i + 2, 5).setValue(fileUrl);
        break;
      }
    }

    return { success: true, fileUrl: fileUrl };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
