/*google試算表轉出的Json API連結，自訂指令loadfile*/
let url = 'https://script.google.com/macros/s/AKfycbw95PeR5Kp05FW7_7X_pvAzuszYplfoW1iAmP4dNEszCbPURFmjUUophmbWSMHgOqV3/exec';
let loadfile = (type, url) => fetch(url).then(r => r[type]());

async function load() {
  /*await表示會暫停async函式執行，避免在讀取完成前就先預先執行造成null錯誤*/
  let data = await loadfile('json', url);
  /*data[分頁第N頁]['分頁名'][第N行][第N欄]*/
  
  /*建立縣市下拉選項，分頁名就是縣市名*/
  let select1 = document.getElementById("縣市");
  for (let i = 0; i < data.length; i++) {
    /*如果let option放在for迴圈之上，會造成只有同一個option只是一直被修改內容*/
    let option = document.createElement("option");  
    option.text = Object.keys(data[i]);
    select1.add(option);
  }
  
  /*縣市選單變換時觸發鄉鎮下拉選項更新*/
  let select2 = document.getElementById("鄉鎮");
  select1.addEventListener("change", async function() {
    /*修正鄉鎮選單沒建立時，執行清空會造成錯誤*/
    if (!select2) return;
    select2.innerHTML = "";
  
    /*selectedIndex出來是一個數字，雖然[分頁第N頁]和['分頁名']是一對一
    但還是要輸入data[1]['台北市']，才能列出台北市底下的鄉鎮，所以才要取得cityName字串*/
    let cityName = select1.options[select1.selectedIndex].text;
    //let sheetName =  data.find(item => Object.keys(item)[0] === cityName)[cityName];
    let sheetName =  data[select1.selectedIndex][cityName];
    
    /*鄉鎮下拉選項*/
    for (let i = 0; i < sheetName.length; i++) {
      let option = document.createElement("option");
      if(i==0) option.text = '全部';
      else option.text = sheetName[i][0];
      select2.add(option);
    }

    /******↑左側下拉選單↑*****↓資料表格呈現↓******/

    /*資料表頭，同鄉鎮選項會清空、更新->縣市>功能測試表*/
    let tableHeader = document.getElementById("表頭");
    tableHeader.innerHTML = "";
    
    /*沿用sheetName->選定好的select2(分頁)內的鄉鎮資料，[0]就是首行的表頭*/
    let firstRow = sheetName[0];
    let headerRow = document.createElement("tr");
    
    /*增加表頭欄位*/
    for (let i = 0; i < firstRow.length; i++) {
      let headerCell = document.createElement("th");
      headerCell.textContent = firstRow[i];
      /*除了區域別,其他都加上按鈕,按鈕屬性各自是b1(戶數),b2(人數),b3...*/
      if(i!=0){
        let buttonCell = document.createElement("button");
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
    
    /*沿用sheetName->選定好的select2(分頁)內的鄉鎮資料，[1]第二行開始是鄉鎮內容*/
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



/*刷新鄉鎮初始空白選單*/
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

