const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3010;

app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));


app.get("/generate-images", async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const title = req.query?.title ?? "Bu title"
    const content = req.query?.content ?? `Bu content`;
    const next = req?.query?.next ?? false;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        @font-face {
            font-family: 'Mont';
            src: url('http://localhost:3010/public/font/mont.ttf') format('truetype');
            font-weight: 600;
            font-style: normal;
        }

        body {
            background: #005051;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: 'Mont', sans-serif;
        }

        .box {
            width: 500px;
            height: 625px;
            position: relative;
            font-size: 20px;
            background-color: #005051;
            display: flex;
            flex-direction: column;
        }

        h1 {
            color: #FF9000;
            text-align: center;
        }

        .text-container {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 0 20px;
            margin-bottom: 80px;
        }

        .text-content {
            color: white;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            max-width: 100%;
            line-height: 100%;
            font-family: 'Mont', sans-serif !important;
            font-size: 35px;
        }

        .top-right-svg {
            position: absolute;
            top: 20px;
            right: 25px;
            width: 20px;
            height: 30px;
        }

        .bottom-left-svg {
            position: absolute;
            bottom: 20px;
            left: 25px;
            gap: 15px;
            display: flex;
        }

        .bottom-right-svg {
            position: absolute;
            bottom: 10px;
            right: 25px;
        }
    </style>
</head>

<body>
    <div class="box">
        <img src="http://localhost:3010/public/bg/save.svg" alt="Top Right Design" class="top-right-svg">

        <h1>${title}</h1>

        <div class="text-container">
            <h3 class="text-content">
                ${content}
            </h3>
        </div>

        <div class="bottom-left-svg">
            <img src="http://localhost:3010/public/bg/like.svg" alt="Bottom Left Design" width="30px" height="32px">
            <img src="http://localhost:3010/public/bg/comment.svg" alt="Bottom Left Design" width="30px" height="32px">
            <img src="http://localhost:3010/public/bg/share.svg" alt="Bottom Left Design" width="30px" height="32px">
        </div>
        <div class="bottom-right-svg">
        <img src="http://localhost:3010/public/bg/${next? "next":"ws"}.svg" width="${next? "60px":"200px"}" height="${next?"30px":"40px"}" style="${next? "margin-right: -10px;" :""}"/>
        
        </div>
    </div>
</body>

</html>`;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

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
        return `https://931f-188-113-253-10.ngrok-free.app/public/${i}`
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
