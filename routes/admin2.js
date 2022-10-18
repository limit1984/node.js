const express = require("express");
const router = express.Router();

router.use((req,res,next)=>{
    res.locals.my = 123;
    next();
})

//重複require會自動變成設定參照
console.log('admin2:', express.shinder);

router.get("/:action?/:id?",(req,res)=>{
    const {params ,url,baseUrl,originalUrl} = req;

    res.json({params,url,baseUrl,originalUrl,my:res.locals.my})
});

module.exports = router;