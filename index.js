const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const {marked} = require("marked");

const app = express();
const port = 3010;
const domain = "https://img-api.masanov.uz";

app.use(express.json()); // body-parser o'rniga
app.use(express.urlencoded({ extended: true })); // Form data uchun
app.use("/public", express.static(path.join(__dirname, "public")));
app.post("/generate-images", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();    
    const title = req.body?.title ?? "Bu title"
    const content = req.body?.content ?? `Bu content`;
    const next = req?.body?.next ?? false;
    const isCodeImg = req.body?.is_code_img ?? false;

    const markedContent = marked(content);
    const replacedContent = markedContent
    .replaceAll("{close_img_here}", `<img src="http://localhost:${port}/public/bg/close.svg" alt="Flex" width="30px" height="30px">`)
    .replaceAll("{correct_img_here}", ` <img src="http://localhost:${port}/public/bg/correct.svg" alt="Flex" width="30px" height="30px">`)


const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <style>
        .box,.text-container,body{display:flex}@font-face{font-family:Mont;src:url('http://localhost:${port}/public/font/mont.ttf') format('truetype');font-weight:600;font-style:normal}body{background:#005051;justify-content:center;align-items:center;height:100vh;margin:0;font-family:Mont,sans-serif}.box{width:500px;height:625px;position:relative;font-size:20px;background-color:#005051;flex-direction:column}h1{text-align:center;margin-top:14px}.white{color:#fff}.yellow{color:#ff9000}.text-container{flex-grow:1;justify-content:center;align-items:center;text-align:center;padding:0 20px;margin-bottom:80px}.text-content{color:#fff;word-wrap:break-word;overflow-wrap:break-word;hyphens:auto;max-width:100%;line-height:100%;font-family:Mont,sans-serif!important;font-size:40px}.top-right-svg{position:absolute;top:20px;right:25px;width:20px;height:30px}.bottom-left-svg{position:absolute;bottom:20px;left:25px;gap:15px;display:flex}.bottom-right-svg{position:absolute;bottom:10px;right:25px}
    </style>
</head>

<body>
    <div class="box">
        <img src="http://localhost:${port}/public/bg/save.svg" alt="Top Right Design" class="top-right-svg">

        <h1 class="white" style="position: absolute; top:0; width: 85%; left:6%; right: 6%;">${title}</h1>
        ${isCodeImg ? `<div style="padding: 20px; margin:auto; max-height: 80%; box-sizing: border-box;">
            <img src="http://localhost:${port}/public/bg/code.png" alt="Flex"
                style="width: auto; height: auto; max-width: 100%; max-height: 100%;">
        </div>` :  replacedContent}
        <div class="bottom-left-svg">
            <img src="http://localhost:${port}/public/bg/like.svg" alt="Bottom Left Design" width="30px" height="32px">
            <img src="http://localhost:${port}/public/bg/comment.svg" alt="Bottom Left Design" width="30px" height="32px">
            <img src="http://localhost:${port}/public/bg/share.svg" alt="Bottom Left Design" width="30px" height="32px">
        </div>
        <div class="bottom-right-svg">
           <img src="http://localhost:${port}/public/bg/${next? "next":"ws"}.svg" width="${next? "60px":"200px"}" height="${next?"30px":"40px"}" style="${next? "margin-right: -10px;" :""}"/>
        </div>
    </div>
</body>

</html>`

    await page.setContent(html, { waitUntil: "networkidle0" });

    const imagePaths = [];

    const boxes = await page.$$(".box");
    for (let i = 0; i < boxes.length; i++) {
      const imagePath = path.join(__dirname, "public", `image-${Date.now()}-${i}.png`);
      await boxes[i].screenshot({ path: imagePath });
      imagePaths.push(imagePath);
    }

    await browser.close();
    const files = fs.readdirSync("public");
    const resp = files.map(i => {
      if (i !== "bg" && i !== "font"){
        return `${domain}/public/${i}`
      }
    })
        
    res.json({ message: "Images generated", images: resp.filter(i => i) });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
