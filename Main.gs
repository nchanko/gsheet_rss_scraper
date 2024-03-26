function scrapeRSS() {
  // Replace 'SPREADSHEET_ID' with the actual ID of your Google Sheet.
  var spreadsheetId = 'SPREADSHEET_ID';

  // Replace 'SHEET_NAME' with the name of the sheet where you want to save the data.
  var sheetName = 'feed_lists';

  // Get the Google Sheet
  var sheet = SpreadsheetApp.openById(spreadsheetId);

  // Read feed URLs and feed names from the "feed_lists" sheet (assuming URLs are in column B and names are in column A)
  var feedListSheet = sheet.getSheetByName('feed_lists');
  var rssFeedUrls = feedListSheet.getRange('B:B').getValues().flat().filter(Boolean);
  var feedNames = feedListSheet.getRange('A:A').getValues().flat().filter(Boolean);

  // Exit if there are no feed URLs
  if (rssFeedUrls.length === 0) {
    console.error('No feed URLs found in the "feed_lists" sheet.');
    return;
  }

  // Get the target sheet for scraping
  var targetSheet = sheet.getSheetByName(sheetName);

  // Write headers only if the target sheet is empty
  if (targetSheet.getLastRow() === 0) {
    targetSheet.getRange(1, 1, 1, 5).setValues([['Title', 'Link', 'Description', 'PubDate', 'NameOfNews']]);
  }

  // Loop through each RSS feed URL
  rssFeedUrls.forEach(function (rssFeedUrl, index) {
    try {
      // URL decode the feed URL
      var decodedUrl = decodeURIComponent(rssFeedUrl);

      // Fetch the RSS feed
      var xml = UrlFetchApp.fetch(decodedUrl).getContentText();
      var document = XmlService.parse(xml);
      var root = document.getRootElement();
      var entries = root.getChildren('channel')[0].getChildren('item');

      // Get existing titles from the target sheet
      var existingTitles = targetSheet.getRange(2, 1, targetSheet.getLastRow(), 1).getValues().flat();

      // Filter out entries with titles already in the sheet
      var newEntries = entries.filter(function (entry) {
        return existingTitles.indexOf(entry.getChild('title').getText()) === -1;
      });

      // Append new data to the target sheet
      if (newEntries.length > 0) {
        var newData = newEntries.map(function (entry) {
          return [
            entry.getChild('title').getText(),
            entry.getChild('link').getText(),
            parseDescription(entry.getChild('description').getText()), //
            formatDate(entry.getChild('pubDate').getText()),
            feedNames[index] // Add feed name to the newData array
          ];
        });

        targetSheet.getRange(targetSheet.getLastRow() + 1, 1, newData.length, 5).setValues(newData);
      }
    } catch (e) {
      // Log or handle the error, e.g., Logger.log(e);
      console.error('Error fetching RSS feed:', rssFeedUrl, e);
    }
  });
}

// Function to parse the description and extract text content
function parseDescription(description) {
  var regexResult = description.match(/<p>(.*?)<\/p>/);
  return regexResult ? regexResult[1] : description;
}

// Function to format date into dd/mm/yyyy
function formatDate(dateString) {
  var date = new Date(dateString);
  return Utilities.formatDate(date, 'GMT', 'dd/MM/yyyy');
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('Pull New Data', 'scrapeRSS')
    .addItem('Archive','archiveDataByMonth')
    .addToUi();
}
