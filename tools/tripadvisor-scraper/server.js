// server.js
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Simple in-memory cache to avoid opening puppeteer every time
const cache = new Map(); // key -> { ts, data }
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

async function scrapeTripAdvisorReviews(url, maxReviews = 10) {
  const cacheKey = `${url}::${maxReviews}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // small wait to let content render
    await page.waitForTimeout(1500);

    const reviews = await page.evaluate((max) => {
      const out = [];
      // Try to find review nodes by common selectors
      const selectors = [
        '[data-test-target="reviews-tab"] .review-container',
        ".reviewSelector",
        ".Yibkl",
        "[data-reviewid]",
      ];

      let nodes = [];
      for (const s of selectors) {
        const found = Array.from(document.querySelectorAll(s));
        if (found.length) {
          nodes = found;
          break;
        }
      }

      if (!nodes.length) {
        // fallback heuristics: find article-like nodes containing "Reviewed" or a rating bubble
        nodes = Array.from(document.querySelectorAll("div"))
          .filter((d) => {
            try {
              return (
                /Reviewed|Review/.test(d.innerText || "") ||
                d.querySelector('[aria-label*="bubble"]')
              );
            } catch (e) {
              return false;
            }
          })
          .slice(0, max * 3);
      }

      for (const n of nodes.slice(0, max)) {
        const titleEl =
          n.querySelector(".quote, .title, .reviewTitle") ||
          n.querySelector("h3, h2");
        const textEl =
          n.querySelector(".partial_entry, .entry, .reviewText") ||
          n.querySelector("p");
        const ratingEl = n.querySelector(
          '[class*="ui_bubble_rating"], [aria-label*="bubble"]'
        );
        const authorEl =
          n.querySelector(".info_text, .username, .member_info") ||
          n.querySelector('a[href*="/Profile/"]');
        const dateEl = n.querySelector(
          '.ratingDate, .date, [class*="EventDate__event_date"]'
        );

        let rating = null;
        if (ratingEl) {
          const cls =
            ratingEl.getAttribute("class") ||
            ratingEl.getAttribute("aria-label") ||
            "";
          const m = cls.match(/bubble_(\d+)/);
          if (m) rating = parseInt(m[1], 10) / 10;
          else if (ratingEl.getAttribute("aria-label")) {
            const text = ratingEl.getAttribute("aria-label");
            const mm = text.match(/(\d+(?:\.\d+)?)/);
            if (mm) rating = parseFloat(mm[1]);
          }
        }

        out.push({
          title: titleEl ? titleEl.innerText.trim() : null,
          text: textEl ? textEl.innerText.trim() : null,
          rating: rating,
          author: authorEl ? authorEl.innerText.trim() : null,
          date: dateEl ? dateEl.innerText.trim() : null,
        });
      }

      return out;
    }, maxReviews);

    cache.set(cacheKey, { ts: Date.now(), data: reviews });
    return reviews;
  } finally {
    await browser.close();
  }
}

app.get("/reviews", async (req, res) => {
  try {
    const url = req.query.url;
    const max = Math.min(50, parseInt(req.query.max || "10", 10));
    if (!url)
      return res
        .status(400)
        .json({ ok: false, error: "Missing url query parameter" });

    const reviews = await scrapeTripAdvisorReviews(url, max);
    res.json({ ok: true, source: url, count: reviews.length, reviews });
  } catch (err) {
    console.error("Scrape error", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () =>
  console.log(`TripAdvisor scraper listening on http://localhost:${PORT}`)
);
