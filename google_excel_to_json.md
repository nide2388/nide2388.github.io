https://script.google.com/macros/s/AKfycbw95PeR5Kp05FW7_7X_pvAzuszYplfoW1iAmP4dNEszCbPURFmjUUophmbWSMHgOqV3/exec

透過https://script.google.com/

1.var ss = SpreadsheetApp.openById("[文件id]");
https://docs.google.com/spreadsheets/d/1QVglZhseu6-EymRQKTi6jXYK-t5xQVE_rUGApigAr1E/edit#gid=0
就是d/之後到/edit之前這段

2.依照項目在var data = [values[0], values[1], values[2], values[3], values[4]];這段增加values，只擷取5欄

3.部屬>新增部屬作業>(左上角齒輪)網頁應用程式>所有人存取>取得連結

function doGet() {
  var ss = SpreadsheetApp.openById("1QVglZhseu6-EymRQKTi6jXYK-t5xQVE_rUGApigAr1E");
  var sheets = ss.getSheets();
  var jsonArr = [];

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var dataArr = [];

    for (var j = 1; j < rows.length; j++) {
      var values = rows[j];
      var data = [values[0], values[1], values[2], values[3], values[4]];
      dataArr.push(data);
    }

    var sheetData = {};
    sheetData[sheetName] = [headers].concat(dataArr);
    jsonArr.push(sheetData);
  }

  var jsonString = JSON.stringify(jsonArr);
  var output = ContentService.createTextOutput(jsonString);
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}