const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');


(async()=> {
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        // prot: "3306",ポート番号は以前は必要だったらしいけど今はいらない（書くとエラーになる）
        database: "cafe_db",
        user: "root",
        password: "root",
    })

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.clubjt.jp/map');
    console.log("https://www.clubjt.jp/map");

    const cafeUrls = await page.evaluate(()=>{
        const links = Array.from(document.querySelectorAll('a[href*="cafe"]'));
        console.log(links);
        console.log("りんくん");
        return links.map(links => links.href);
    });

    for(const url of cafeUrls){
        const urlObj = new URL(url);
        console.log(urlObj);
        console.log("urlObjの表示");
        const latitude = urlObj.searchParams.get('lat');
        console.log(latitude);
        console.log("latの表示");
        const longitude = urlObj.searchParams.get('lng');
        console.log(longitude);
        console.log("longの表示");
        
        if(latitude && longitude){
            await connection.query(
                'INSERT INTO cafes (url, latitude, longitude) VALUES (?, ?, ?)',
                [url, parseFloat(latitude), parseFloat(longitude)]
            );
        }
    }
    await browser.close();
    await connection.end();
    console.log("データが取得された");
})();