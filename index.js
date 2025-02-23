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
    const content = req.query?.content ?? ` Do’stlar agar postni
            foydali deb hisoblasangiz
            saqlab oling va yaqinlar 
            bilan ulashing!`

    const htmlContent = `<html lang="en">
<head>
    <style>
        @font-face {
            font-family: 'Mont';
            src: url('http://localhost:3010/public/font/mont.ttf') format('truetype');
            font-weight: 600;
            font-style: normal;
        }
        body { 
            background: #f3f4f6; 
        }

        .box { 
            width: 500px; 
            height: 625px; /* min-height o'rniga height */
            position: relative;
            font-size: 20px; 
            font-weight: 600; 
            font-family: 'Mont', sans-serif; /* Custom shrift */
            overflow: hidden; 
            margin: 20px 0;
            padding: 0 10px;
        }

        .box img {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover; /* Div ichida to'liq joylashadi */
            top: 0;
            left: 0;
            z-index: -1;
        }

        h1 {
            color: #FF9000;
            display: block;
            margin-top: -1px;
            text-align: center;
        }
        span{
            display: block;
            text-align: center;
            margin-top: 30px;
            color: white;
        }
    </style>
</head>
<body>
    <div class="box">
        <img src="http://localhost:3010/public/bg/bg_next.png" alt="Background">
        <h1>${title}</h1>
        <span>
           ${content}
        </span>
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
