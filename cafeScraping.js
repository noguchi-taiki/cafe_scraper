const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { headers } = require('next/headers');

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

    //  const listSelector = "some selector";
    //puppeteerにおけるデータの取得は様々やり方があるので都度調べる必要がありそう。
    //下記はxpathでデータを取得してそこからecaluateで文字を持ってきてる（備忘録）

    let i = 1;
    // const xpath = `/html/body/div[2]/main/div[5]/div[${i}]/a/div[1]/div[2]`;
    // const elem = await page.waitForSelector(`::-p-xpath(${xpath})`);//$x()はバージョンの関係で使えない
    // const text = await elem.evaluate(el => el.textContent);
    // console.log(text);

    while(true){
        const xpath = `/html/body/div[2]/main/div[5]/div[${i}]/a/div[1]/div[2]`;
        const iconXpsath = `/html/body/div[2]/main/div[5]/div[${i}]/a/div[1]/div[1]`;
        const iconElem = await page.$(`::-p-xpath(${iconXpsath})`);
        console.log(iconElem);
        const elem = await page.$(`::-p-xpath(${xpath})`);
        if(elem == null){break;}
        const text = await elem.evaluate(el => el.textContent);
        console.log(text);
        console.log(i);
        i = i+1;
    }
    console.log("while文及びブレイク文は正常に動作");
} catch(error) {
    console.error("Error",error);
} finally {
    await browser.close();
}
})();