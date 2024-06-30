const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

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
    

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.clubjt.jp/map');
    console.log("ページにアクセス");

    const cafeUrls = await page.evaluate(()=>{
        const links = Array.from(document.querySelectorAll('a[href*="cafe"]'));
        return links.map(links => links.href);
    });

    console.log(cafeUrls);

    for(const url of cafeUrls){
        const urlObj = new URL(url);
        const latitude = urlObj.searchParams.get('lat');
        const longitude = urlObj.searchParams.get('lng');

        console.log("URL:",url);
        
        if(latitude && longitude){
            try{
                const query = "insert into cafes (url,latitude,longitude) values(?,?,?);"
                const values = [url,parseFloat(latitude),parseFloat(longitude)];
                const [result] = await connection.query(query,values);
            }catch(queryError){
                console.error(queryError);
            }
        }
    }
    await browser.close();
    await connection.end();
    console.log("データが取得された");
} catch(error) {
    console.error("Error",error);
}
})();