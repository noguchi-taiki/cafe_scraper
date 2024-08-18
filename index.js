const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');
const { createConnection } = require('mysql2/promise');
const { getLatLng } = require('./community-geocoder/src/api.js');

(async()=> {

    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        // prot: "3306",非推奨らしいので書かない
        database: "cafe_db",
        user: "root",
        password: "root",
    })


    const browser = await puppeteer.launch({ 
        headless: true,
        // args: [
        //     '--disable-features=IsolateOrigins,site-per-process',
        //     '--disable-web-security',
        //     '--disable-features=SameSiteByDefaultCookies'
        //   ]
     });
    
    try{
    // console.log("mysqlに接続");
    // console.log("ページにアクセス");

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().includes('cookie') || request.url().includes('cookie')) {
        request.abort(); // クッキー関連のリクエストを中止
      } else {
        request.continue();
      }
    });

    await page.goto('https://www.clubjt.jp/place/spot/pref-13/');

    let citys = await page.$$eval('a.tile-2col-link',list => {return list.map(data => data.href)});

    await Promise.all([
        page.waitForNavigation({ waitUntil:'load'}),
        page.waitForSelector('button.jtoc-adult-auth-modal__button-yes'),
        page.click("button.jtoc-adult-auth-modal__button-yes"),
        page.waitForSelector(`a.tile-2col-link`),
        page.click(`a.tile-2col-link`),
    ])

    await page.waitForSelector('a.tile-2col-link');
    let links = await page.$$eval('a.tile-2col-link',list => {return list.map(data => data.href)});
    let linksName = await page.$$eval('tile-2col-word',list => {return list.map(data => data.textContent)});
    // console.log(linksName.length);
    // console.log(links.length);


     await Promise.all([
        // page.waitForSelector(`a.tile-2col-link`),
        // page.click(`a.tile-2col-link`),
        page.waitForNavigation({ waitUntil:'load'}),
        page.goto(links[0]),
     ])

    //  const listSelector = "some selector";
    //puppeteerにおけるデータの取得は様々やり方があるので都度調べる必要がありそう。
    //（いつぞやの備忘録）



let k = 0;
while(k<citys.length){
    let nextPage = await page.$('a.btn-small-normal');
    let j=0;
    while(j<links.length){
    // while(j<3){
    if(j>=1&&nextPage==null){
        await Promise.all([
            page.goto(links[j]),
            page.waitForNavigation({ waitUntil:'load'}),
        ])}
        // console.log(j+1 +' ページ目に移動しました。');

    let i = 0;
    let itemsElems = await page.$$(".search-spot-item");
    let names = [];
    let details = [];
    let addresses = [];
    let LngLat = [];

    while(i < itemsElems.length){
        let elem = itemsElems[i];

        let smokingIcon = await elem.$(".search-spot-link .search-spot-body .cafe");
        if(smokingIcon != null){
            let spotNameElem = await elem.$(".search-spot-link .search-spot-body .search-spot-name");
            let spotNameText = await spotNameElem.evaluate(el => el.textContent);
            names.push(spotNameText);

            let tobaccoDetailElem1 = await elem.$(".search-spot-link .search-spot-tag .tobacco");
            let tobaccoDetailText = await tobaccoDetailElem1.evaluate(el => el.textContent);
            tobaccoDetailText += ",";
            const tobaccoDetailElem2 = await elem.$(".search-spot-link .search-spot-tag .tag");
            tobaccoDetailText += await tobaccoDetailElem2.evaluate(el => el.textContent);
            details.push(tobaccoDetailText);

            let addresElem = await elem.$(".search-spot-link .search-spot-body .search-spot-shopinfo");
            let addressText = await addresElem.evaluate(el => el.textContent);
            addressText = addressText.replace(/\n/g,"");
            addressText = addressText.replace(/ /g,"");
            addresses.push(addressText);
        }
        i = i+1;
    }
    i=0;
    while(i < names.length){
        await new Promise((resolve, reject) => {
            getLatLng(addresses[i], result => {
                LngLat[i] = `${result.lng} ${result.lat}`;
                resolve();
            }, error => {
                console.error("Error getting lat/lng", error);
                reject(error);
            });
        });
        // let sql = `insert into tokyo values("${addresses[i]}","${names[i]}","${details[i]}",ST_PointFromText("POINT(${LngLat[i]})"));`
        // const reslt = await connection.query(sql);
        if(LngLat!=null){console.log(names[i]+" のデータ群を格納した")}else{console.log('names[i]+" のデータ群を格納したが経度緯度がnull。')};

        i++;
    };
    nextPage = await page.$('a.btn-small-normal');
    if(nextPage!=null){
        let nowPageELem = await page.$('span.btn-small-high-txt');
        let nowpageNum = await nowPageELem.evaluate(el => el.textContent);
        let nextPagesArray = await page.$$eval('a.btn-small-normal',(nextPagesArray => {return nextPagesArray.map(nextPagesArray=>nextPagesArray.href)}));
        let nextPagesnum = await page.$$eval('a.btn-small-normal',(nextPagesArray => {return nextPagesArray.map(nextPagesArray=>nextPagesArray.textContent)}));
        for(let i=0;i<nextPagesnum.length;i++){nextPagesnum[i] =  Number(nextPagesnum[i]);}
        nowpageNum = Number(nowpageNum);
        if(nextPagesnum.indexOf(nowpageNum+1) != -1){
            tmp = nextPagesnum.indexOf(nowpageNum+1);
            Promise.all([
                await page.goto(nextPagesArray[tmp]),
                page.waitForNavigation({ waitUntil:'load'}),
                itemsElems = await page.$$(".search-spot-item"),
            ])
            names = [];
            details = [];
            addresses = [];
        // } else {console.log('not difind next page');nextPage=null;j++;await page.goto(citys[0]);}
        } else {nextPage=null;j++;await page.goto(citys[0]);}

    // } else {console.log('not difind next page');nextPage=null;j++;await page.goto(citys[0]);}
    } else {nextPage=null;j++;await page.goto(citys[0]);}
} await page.goto(citys[k]);k++;}


    // j++;await page.goto(citys[0]);}

    connection.end();
    
//今回のようにDBに1種類しかqueryを飛ばさないものならこの書き方でもいいけど
//今後複数回DBのqueryを使うwebアプリの時はDB.js(DB.ts)のように、
//コンポーネントとして分けてその場でsql文を引数として渡す方が良いっぽい

} catch(error) {
    console.error("Error",error);
} finally {
    console.log('すべての処理が終了しました。')
    await browser.close();
}
})();