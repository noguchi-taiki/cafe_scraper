const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { createConnection } = require('mysql2');

(async()=> {
    const browser = await puppeteer.launch({ headless: false });
    try{
    console.log("mysqlに接続");
    console.log("ページにアクセス");

    const page = await browser.newPage();
    await page.goto('https://www.clubjt.jp/place/spot/pref-13/');
    await Promise.all([
        page.waitForSelector(`a.tile-2col-link`),
        page.click("button.jtoc-adult-auth-modal__button-yes"),
        page.click(`a.tile-2col-link`),
    ])
     await Promise.all([
        page.waitForSelector(`a.tile-2col-link`),
        page.click(`a.tile-2col-link`),
     ])

    //  const listSelector = "some selector";
    //puppeteerにおけるデータの取得は様々やり方があるので都度調べる必要がありそう。
    //下記はxpathでデータを取得してそこからecaluateで文字を持ってきてる（いつぞやの備忘録）

    let i = 1;
    const names = [];
    const details = [];
    const addresses = [];

    const itemsElems = await page.$$(".search-spot-item");
    while(i < itemsElems.length){
        const elem = itemsElems[i];
        const smokingIcon = await elem.$(".search-spot-link .search-spot-body .cafe");
        if(smokingIcon != null){
            const spotNameElem = await elem.$(".search-spot-link .search-spot-body .search-spot-name");
            const spotNameText = await spotNameElem.evaluate(el => el.textContent);
            names.push(spotNameText);

            const tobaccoDetailElem1 = await elem.$(".search-spot-link .search-spot-tag .tobacco");
            let tobaccoDetailText = await tobaccoDetailElem1.evaluate(el => el.textContent);
            tobaccoDetailText += ",";
            const tobaccoDetailElem2 = await elem.$(".search-spot-link .search-spot-tag .tag");
            tobaccoDetailText += await tobaccoDetailElem2.evaluate(el => el.textContent);
            details.push(tobaccoDetailText);

            const addresElem = await elem.$(".search-spot-link .search-spot-body .search-spot-shopinfo");
            let addressText = await addresElem.evaluate(el => el.textContent);
            addressText = addressText.replace(/\n/g,"");
            addressText = addressText.replace(/ /g,"");
            addresses.push(addressText);
        }
        i = i+1;
    }
    console.log("while文及びbreake文は正常に動作");

    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        // prot: "3306",非推奨らしいので書かない
        database: "cafe_db",
        user: "root",
        password: "root",
    })
    i=0;
    while(i < names.length){
        let sql = `insert into tokyo values("${addresses[i]}","${names[i]}","${details[i]}");`
        const reslt = connection.query(sql);
        i++;
    }
    connection.end();
    
//今回のようにDBに1種類しかqueryを飛ばさないものならこの書き方でもいいけど
//今後複数回DBのqueryを使うwebアプリの時はDB.js(DB.ts)のように、
//コンポーネントとして分けてその場でsql文を引数として渡す方が良いっぽい

} catch(error) {
    console.error("Error",error);
} finally {
    await browser.close();
}
})();