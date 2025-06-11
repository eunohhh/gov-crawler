import { crawlMSITPosts } from "./crawler/msit";
import { appendRowsToSheet, getLastNttSeqNo } from "./sheets/googleClient";

(async () => {
  const posts = await crawlMSITPosts();
  const lastNttSeqNo = await getLastNttSeqNo();

  const newPosts = lastNttSeqNo
    ? posts.filter(
        (post) => Number.parseInt(post.nttSeqNo) > Number.parseInt(lastNttSeqNo)
      )
    : posts;

  if (newPosts.length === 0) {
    console.log("🟡 No new posts found.");
    return;
  }

  const rows = newPosts.map((post) => [
    post.date,
    post.title,
    post.url,
    post.category,
  ]);

  await appendRowsToSheet(rows, "crawling!A2");
  console.log(`✅ ${rows.length} new rows appended.`);
})();
