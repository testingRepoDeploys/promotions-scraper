const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const PORT = process.env.PORT || 5500;

const startScraper = async (pageNumber) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    `https://www.lcwaikiki.ma/discount-all-products/?page=${pageNumber}`
  );

  const elements = await page.$$(".list-content-product-item");
  let num = 0;
  let items = [];
  for (const element of elements) {
    num++;
    const title = await page.evaluate(
      (el) => el.querySelector("div.product-full-name").textContent,
      element
    );
    const originalPrice = await page.evaluate(
      (el) => el.querySelector("div.product-list-price").textContent,
      element
    );
    const newPrice = await page.evaluate(
      (el) => el.querySelector("div.product-sale-price").textContent,
      element
    );
    // console.log(
    //   `TITLE : ${title}, ORIGINAL PRICE : ${originalPrice}, NEW PRICE : ${newPrice}`
    // );
    items.push({ title, originalPrice, newPrice });
  }
  //   console.log(`${num} products found.`);
  //   console.log(items);

  await browser.close();

  return { numberOfItems: num, products: items };
};

app.get("/scrape/waikiki/:pageNumber", (req, res) => {
  startScraper(req.params.pageNumber).then((response) => {
    res.json(response);
  });
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
