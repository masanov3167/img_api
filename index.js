const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3010;

app.use(express.json());

app.post("/generate-images", async (req, res) => {
  try {
    const { titles } = req.body;
    if (!Array.isArray(titles) || titles.length !== 5) {
      return res.status(400).json({ error: "titles must be an array of 5 elements" });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
      <html>
      <head>
        <style>
          body { display: flex; flex-wrap: wrap; gap: 20px; padding: 20px; background: #f3f4f6; }
          .box { width: 300px; height: 200px; display: flex; align-items: center; justify-content: center;
                 font-size: 20px; font-weight: bold; color: white; border-radius: 10px; text-align: center;
                 box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .box:nth-child(1) { background: linear-gradient(135deg, #FF6B6B, #FF8E8E); }
          .box:nth-child(2) { background: linear-gradient(135deg, #4ECDC4, #6EDFD4); }
          .box:nth-child(3) { background: linear-gradient(135deg, #45B7D1, #65C7E1); }
          .box:nth-child(4) { background: linear-gradient(135deg, #96CEB4, #B6DEC4); }
          .box:nth-child(5) { background: linear-gradient(135deg, #FFEEAD, #FFF1BD); }
        </style>
      </head>
      <body>
        ${titles.map((title) => `<div class="box">${title}</div>`).join("")}
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const imagePaths = [];

    const boxes = await page.$$(".box");
    for (let i = 0; i < boxes.length; i++) {
      const imagePath = path.join(__dirname, `image-${Date.now()}-${i}.png`);
      await boxes[i].screenshot({ path: imagePath });
      imagePaths.push(imagePath);
    }

    await browser.close();

    res.json({ message: "Images generated", images: imagePaths });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
