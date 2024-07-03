const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { headers } = require('next/headers');

(async()=> {
    try{
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        // prot: "3306",ポート番号は以前は必要だったらしいけど今はいらない（書くとエラーになる）
        database: "cafe_db",
        user: "root",
        password: "root",
    })
    console.log("mysqlに接続");

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.clubjt.jp/place/spot/pref-13/');
    await Promise.all([
        // page,waitForNavigation({waitUntil:`load`}),
        page.click("button.jtoc-adult-auth-modal__button-yes"),
        page.click(`a.tile-2col-link`),
    ])
    console.log("ページにアクセス");
     await Promise.all([
        page.waitForNavigation({waitUntil:`load`}),
        page.click(`a.tile-2col-link`),
     ])

     const elementHandle = await page.waitForSelector("div.search-spot > div.search-spot-item > search-spot-link > search-spot-body > search-spot-icon smoking > search-spot-name");
     const data = await page.evaluate(element => element.textContent, elementHandle);
     console.log(data);

    // while(true){

    // }
    
    await browser.close();
    await connection.end();

} catch(error) {
    console.error("Error",error);
}
})();