function archiveDataByMonth() {
    const originalSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    //Replace SHEET_NAME with the name of the sheet where you want to save the data.
    const originalSheet = originalSpreadsheet.getSheetByName('feed_lists');
    const dataRange = originalSheet.getDataRange();
    const data = dataRange.getValues();
    const dateColumnIndex = 3; // Assuming date is in column D
    const currentMonthYear = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MMM yyyy");
    
    let rowsByMonthYear = {};
    let folderId = 'FOLDER_ID'; // Folder ID where new files will be created
    let folder = DriveApp.getFolderById(folderId);
  
    // Aggregate rows by month-year, excluding the current month
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const dateValue = row[dateColumnIndex];
      if (!(dateValue instanceof Date)) continue;
  
      const monthYear = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), "MMM yyyy");
      //This skip archiving current month
      //if (monthYear === currentMonthYear) continue; // Skip rows from the current month
  
      if (!rowsByMonthYear[monthYear]) {
        rowsByMonthYear[monthYear] = [];
      }
      rowsByMonthYear[monthYear].push(row);
    }
  
    Object.keys(rowsByMonthYear).forEach(monthYear => {
      // Check if a file for this month-year already exists
      let files = folder.getFilesByName('Archive_' + monthYear);
      let file;
      if (files.hasNext()) {
        file = files.next();
      } else {
        // Create a new Google Sheets file for this month-year
        file = SpreadsheetApp.create('Archive_' + monthYear);
        DriveApp.getFileById(file.getId()).moveTo(folder);
      }
      
      let spreadsheet = SpreadsheetApp.openById(file.getId());
      let sheet = spreadsheet.getSheets()[0] || spreadsheet.insertSheet();
      if (sheet.getLastRow() === 0) { // If the sheet is empty, append headers
        sheet.appendRow(data[0]);
      }
  
      // Use setValues to append all rows for this month-year in bulk
      const startRow = sheet.getLastRow() + 1;
      const numRows = rowsByMonthYear[monthYear].length;
      const numColumns = data[0].length;
      sheet.getRange(startRow, 1, numRows, numColumns).setValues(rowsByMonthYear[monthYear]);
    });
  
    // Optional: Clear the original sheet's data, preserving the header row
    // Comment out or modify this line based on your need to retain original data
    originalSheet.deleteRows(2, originalSheet.getLastRow() - 1);
  
    Logger.log('Data archived to new files by month successfully.');
  }
  