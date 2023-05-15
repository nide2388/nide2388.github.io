/*google試算表轉出的Json API連結，自訂指令loadfile*/
let url = 'https://script.google.com/macros/s/AKfycbw95PeR5Kp05FW7_7X_pvAzuszYplfoW1iAmP4dNEszCbPURFmjUUophmbWSMHgOqV3/exec';
let loadfile = (type, url) => fetch(url).then(r => r[type]());
/*data，後面await loadfile才會用到，設定全域，避免重複loadfile*/
let data; 

/*async搭配await，下拉選單的獨立函式，會在讀取前就先預先造成null錯誤*/
async function load() {
  data = await loadfile('json', url);
  let select1 = document.getElementById("縣市");
  /*依照分頁數建立縣市下拉選項，分頁名就是縣市名*/
  for (let i = 0; i < data.length; i++) {
      let option = document.createElement("option");
      option.text = Object.keys(data[i]);
      select1.add(option);
  }
  let select2 = document.getElementById("鄉鎮");
  /*下拉選單更新時觸發，測試之後可以放在load()內而不用獨立*/
  select1.addEventListener("change", async function() {
    /*修正鄉鎮選單沒建立時，執行清空會造成錯誤*/
    if (!select2) {
      return;
      }
    select2.innerHTML = "";
    /*selectedIndex出來是一個數字，0：臺灣、1：新北市....*/
    let cityName = select1.options[select1.selectedIndex].text;
    /*data[1]['新北市']，才能列出新北市的鄉鎮，所以才要取得selected的字串*/
    //let sheetName =  data[select1.selectedIndex][cityName];
    let sheetName =  data.find(item => Object.keys(item)[0] === cityName)[cityName];
    /*鄉鎮下拉選項*/
    for (let i = 0; i < sheetName.length; i++) {
    let option = document.createElement("option");
    if(i==0) option.text = '全部';
    else option.text = sheetName[i][0];
    select2.add(option);
    }

    /*/////////左側下拉選單↑/////////資料表格呈現↓//////////*/

    /*資料表頭*/
    let tableHeader = document.getElementById("表頭");
    tableHeader.innerHTML = "";

    let firstRow = sheetName[0];
    let headerRow = document.createElement("tr");
    
    for (let i = 0; i < firstRow.length; i++) {
      let headerCell = document.createElement("th");
      headerCell.textContent = firstRow[i];
      let buttonCell = document.createElement("button");
      if(i!=0){
        buttonCell.id= 'b'+i;
        buttonCell.textContent = '▲';
        headerCell.appendChild(buttonCell);
      }
      headerRow.appendChild(headerCell);


    }
    tableHeader.appendChild(headerRow);

    /*button監視*/
    let buttons = document.querySelectorAll("button[id^='b']");
    let order =false;
    buttons.forEach(button => {
      button.addEventListener("click", event => {
      let num = parseInt(button.id.replace("b", ""));
      //console.log(`按下了 ${num}`);
      sort(num, order);
      order = !order;
      });
    });
    /*資料表內容*/
    let tableBody=document.getElementById("內容");
    tableBody.innerHTML = "";
    
    
    for(let i=1; i < sheetName.length; i++) {
      let contentTable = sheetName[i];
      let contentRow = document.createElement("tr");
      for(let j=0 ; j < contentTable.length; j++) {
        let contentBox = document.createElement("td");
        let contentCell = document.createElement("div");
        contentCell.textContent = contentTable[j];
        contentBox.appendChild(contentCell);
        contentRow.appendChild(contentBox);
      }
      tableBody.appendChild(contentRow);
    }
})

/*縣鎮選擇*/
select2.addEventListener("change", async function() {
  let tableBody=document.getElementById("內容");
  tableBody.innerHTML = "";
  if(select2.selectedIndex==0)  select1.dispatchEvent(new Event('change'));
  else{
    let cityName = select1.options[select1.selectedIndex].text;
    let sheetName =  data[select1.selectedIndex][cityName][select2.selectedIndex];
    let contentRow = document.createElement("tr");
    for(let i=0; i < sheetName.length; i++){
      let contentBox = document.createElement("td");
      let contentCell = document.createElement("div");
      contentCell.textContent = sheetName[i];
      contentBox.appendChild(contentCell);
      contentRow.appendChild(contentBox);
    }
    tableBody.appendChild(contentRow);
  }
})



/*初始刷新選單*/
select1.dispatchEvent(new Event('change'));
}load();




/*排序功能*/
function sort(num, order){
  let tableBody = document.getElementById("內容");
  let rows = Array.from(tableBody.getElementsByTagName("tr"));
  rows.sort((rowA, rowB) => {
    let valueA = parseInt(rowA.getElementsByTagName("td")[num].textContent);
    let valueB = parseInt(rowB.getElementsByTagName("td")[num].textContent);
    if (valueA < valueB && order === false) return -1;
    if (valueA < valueB && order === true) return 1;
    else if (valueA > valueB && order === false) return 1;
    else if (valueA > valueB && order === true) return -1;
    else return 0;
  });
  for (let i = 0; i < rows.length; i++) {
    tableBody.appendChild(rows[i]);
  }
}

