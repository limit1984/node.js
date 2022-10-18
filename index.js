require("dotenv").config();
const { query } = require("express");
const express = require("express")
const session = require("express-session")
const MysqlStore = require("express-mysql-session")(session);
const moment = require('moment-timezone')
const db = require(__dirname + "/modules/db_connect2")
const sessionStore = new MysqlStore({}, db);
const cors = require("cors")
const axios = require("axios")

express.shinder = '您好';
// const multer = require('multer');
// const upload = multer({dest: 'tmp_uploads/'});
const upload = require(__dirname + "/modules/upload-img")
const fs = require("fs").promises;

const app = express();

app.set('view engine', 'ejs');



// top-level middleware

const corsOptions = {
    Credentias: true ,

}

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "sadfd32153453215ZDKWss22",
    store: sessionStore,
    cookie: {
        maxAge: 1_200_000
    }
}));

// 將 body-parser 設定成頂層 middleware，放在所有路由之前。
// 其包含兩種解析功能： urlencoded 和 json 。
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use((req,res,next)=>{

//自己定義的 tamplate helper functions

    res.locals.toDateString=(d)=>moment(d).format("YYYY-MM-DD");
    res.locals.toDatetimeString = (d)=>moment(d).format("YYYY-MM-DD HH:mm:ss");

    res.locals.title = "小新的網站";
    res.locals.session = req.session;
    next();
})


//routes 路由器

app.get("/", function (req, res) {
    // res.send("<h2>倪好</h2>")
    res.render("main", { name: "shinder" })
})



// 設定/abc的路由，local:埠號/abc即能顯示內容
app.get("/abc", function (req, res) {
    res.send("<h2>abc倪好</h2>")
})


// 設定/sales.json的路由，local:埠號/sales.json即能顯示內容
// 將data下的sales.json的值傳進views/sales-json.ejs
app.get("/sales.json", (req, res) => {
    const sales = require(__dirname + "/data/sales");
    console.log(sales);
    // res.send("<h2>abc倪好</h2>")
    res.render("sales-json", { sales })
})

// JSON會自動轉成物件
app.get("/json-text", (req, res) => {
    // res.send({name:"小新1",age:30})
    res.json({ name: "小新2", age: 30 })
})

// http://localhost:3001/try-qs?a[]=1&b=3 會自動傳a:[1],b:3的值進去
app.get("/try-qs", (req, res) => {
    res.json(req.query);
});

// 用post方法傳值，僅能用postman測試--------------------------------
app.post("/try-post", (req, res) => {
    res.json(req.body);
});
// 連到時/try-post-form跑出get的表單，傳送後顯示method=post的json格式
app.get("/try-post-form", (req, res) => {
    res.render("try-post-form");
});
app.post("/try-post-form", (req, res) => {
    res.render("try-post-form", req.body);
});
//----------------------------------------------------------------

//正規表示法
app.get(/^\/m\/09\d{2}\-?\d{3}\-?\d{3}$/, (req, res) => {

    let u = req.url.slice(3);
    u = u.split('?')[0]; //去掉query string
    u = u.split('-').join('');
    res.json({ mobile: u });
});

//--------------------路由模組化-----------------

app.use("/admin2", require(__dirname + "/routes/admin2"));

//--------------------middleware----------------

const myMiddle = (req, res, next) => {
    res.locals = { ...res.locals, shinder: "哈囉" };
    res.locals.derrrr = 567;
    // res.myPersonal = {...res.locals,shinder : "哈囉"}; //不建議
    next();
}

app.get("/try-middle", [myMiddle], (req, res) => {
    res.json(res.locals);
})

//--------------------Session--------------------
app.get("/try-session", (req, res) => {
    req.session.aaa ||= 0; //預設值
    req.session.aaa++;
    res.json(req.session);
})

app.get("/try-date", (req, res) => {
    const now = new Date;
    const m = moment();

    res.send({
        t1: now,
        t2: now.toString(),
        t3: now.toDateString(),
        t4: now.toLocaleString(),
        m: m.format("YYYY-MM-DD HH:mm:ss"),
    })
})

app.get("/try-moment", (req, res) => {
    const fm = "YYYY-MM-DD-dddd HH:mm:ss";
    const fd = "dddd"
    const m = moment("06/10/22", "DD/MM/YY");
    res.json({
        m,
        m1: m.format(fm),
        m2: m.tz("Europe/London").format(fm),
        m3: m.tz("Europe/London").format(fd)
    })
})

// CRUD
//R
app.get("/try-db", async (req, res) => {
    const [rows] = await db.query("SELECT * FROM address_book LIMIT 5");
    res.json(rows);
});

//C
app.get("/try-db-add", async (req, res) => {
    const name = "林克";
    const email = "link@gmail.com";
    const mobile = "0918555666";
    const birthday = "1998-10-27";
    const address = "宜蘭縣";
    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,now())";

    const [result] = await db.query(sql,[name,email,mobile,birthday,address]);
    res.json(result);

    //直接取值
    // const [{ insertId }] = await db.query(sql, [name, email, mobile, birthday, address]);
    // res.json(insertId);
})

//C的另一用法，不建議
app.get("/try-db-add2", async (req, res) => {
    const name = "林克";
    const email = "link@gmail.com";
    const mobile = "0918555666";
    const birthday = "1998-10-27";
    const address = "宜蘭縣";
    const sql = "INSERT INTO `address_book` SET ? ";

    const [result] = await db.query(sql,[{name,email,mobile,birthday,address,created_at: new Date()}]);
    res.json(result);

})

app.use("/ab",require(__dirname +"/routes/address-book"));

app.get("/fake-login",(req,res)=>{
    req.session.admin = {
        id : 12,
        account : "shinder",
        nickname : "小新"
    };

    res.redirect("/");
});
app.get("/logout",(req,res)=>{
    delete req.session.admin;

    res.redirect("/");
});

//假網站
app.get("/yahoo",async (req,res)=>{
    const response = await axios.get("http://tw.yahoo.com/");
    res.send(response.data)
});


//----------------------------------------------

// 條件愈寬鬆的就放在後面
app.get('/my-params1/:action/:id', (req, res) => {
    res.json(req.params);
});

// ---------------------------------------------------------------

//上傳圖片用
app.post('/try-upload', upload.single('avatar'), async (req, res) => {
    res.json(req.file);
    // if(req.file && req.file.originalname){
    //     await fs.rename(req.file.path,`public/imgs/${req.file.originalname}`);
    //     res.json(req.file);
    // } else {
    //     res.json({msg:"沒有上傳檔案"});
    // }
});

app.post('/try-upload2', upload.array('photos'), async (req, res) => {
    res.json(req.files);
});


//----------------------------------------------------------------
// 使用靜態內容時，抓資料夾(localhost:埠/a.html)
// 將public設為根目錄
app.use(express.static('public'));

// 引用專案裡安裝的bootstrap
app.use(express.static('./node_modules/bootstrap/dist'));

// 同一個路由設定下先跑的優先權較高
// app.get("/a.html",function (req,res){
//     res.send("<h2>假的，你業障重</h2>")
// })

// 404，當路由未正確時顯示(放在所有路由的後面)
app.use((req, res) => {
    // res.type("text/plain"); //純文字
    // res.status(404).send("<h2>404,找不到你要的網頁</h2>")
    res.status(404).render("404")
})

const port = process.env.SERVER_PORT || 3002;
app.listen(port, function () {
    console.log(`server started, port: ${port}`)
})