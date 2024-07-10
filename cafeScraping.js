const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { headers } = require('next/headers');
const { isAwaitExpression } = require('typescript');

(async()=> {
    const browser = await puppeteer.launch({ headless: false });
    try{
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        // prot: "3306",ポート番号は以前は必要だったらしいけど今はいらない（書くとエラーになる）
        database: "cafe_db",
        user: "root",
        password: "root",
    })
    console.log("mysqlに接続");
    console.log("ページにアクセス");

    const page = await browser.newPage();
    await page.goto('https://www.clubjt.jp/place/spot/pref-13/');
    await Promise.all([
        // page,waitForNavigation({waitUntil:`load`}),
        page.click("button.jtoc-adult-auth-modal__button-yes"),
        page.click(`a.tile-2col-link`),
    ])
     await Promise.all([
        page.waitForNavigation({waitUntil:`load`}),
        page.click(`a.tile-2col-link`),
     ])

    //  const listSelector = "some selector";
    //puppeteerにおけるデータの取得は様々やり方があるので都度調べる必要がありそう。
    //下記はxpathでデータを取得してそこからecaluateで文字を持ってきてる（備忘録）

    let i = 1;
    const spotNames = [];
    const tobaccoDetails = [];

    const itemsElems = await page.$$(".search-spot-item");
    while(i < itemsElems.length){
        const elem = itemsElems[i];
        const smokingIcon = await elem.$(".search-spot-link .search-spot-body .cafe");
        if(smokingIcon != null){
            const spotNameElem = await elem.$(".search-spot-link .search-spot-body .search-spot-name");
            const spotNameText = await spotNameElem.evaluate(el => el.textContent);
            spotNames.push(spotNameText);

            const tobaccoDetailElem1 = await elem.$(".search-spot-link .search-spot-tag .tobacco");
            let tobaccoDetailText = await tobaccoDetailElem1.evaluate(el => el.textContent);
            tobaccoDetailText += ",";
            const tobaccoDetailElem2 = await elem.$(".search-spot-link .search-spot-tag .tag");
            tobaccoDetailText += await tobaccoDetailElem2.evaluate(el => el.textContent);
            tobaccoDetails.push(tobaccoDetailText);
        }
        i = i+1;
    }

    console.log(spotNames);
    console.log(tobaccoDetails);
    
    console.log("while文及びブレイク文は正常に動作");
} catch(error) {
    console.error("Error",error);
} finally {
    await browser.close();
}
})();