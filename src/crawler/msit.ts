import { chromium } from "playwright";
import { formatToISO, isAfterJune, parseDate } from "../utils/dateUtils";

interface Post {
  title: string;
  department: string;
  contact: string;
  manager: string;
  date: string; // ISO
  url: string;
  nttSeqNo: string;
  category: string;
}

const BASE_URL =
  "https://www.msit.go.kr/bbs/list.do?sCode=user&mId=311&mPid=121";

export const DETAIL_URL = (nttSeqNo: string) =>
  `https://www.msit.go.kr/bbs/view.do?sCode=user&mId=311&mPid=121&pageIndex=&bbsSeqNo=100&nttSeqNo=${nttSeqNo}&searchOpt=ALL&searchTxt=`;

export const crawlMSITPosts = async (): Promise<Post[]> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: Post[] = [];

  console.log("🔍 MSIT 크롤링 시작...");

  for (let pageIndex = 1; pageIndex <= 2; pageIndex++) {
    const url = `${BASE_URL}&pageIndex=${pageIndex}`;
    console.log(`📄 페이지 ${pageIndex} 접근 중: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const postsOnPage = await page
      .locator("#result > div.board_list > div.toggle")
      .evaluateAll((toggles, pageNum) => {
        console.log(
          `📋 페이지 ${pageNum}에서 찾은 toggle 요소 수:`,
          toggles.length
        );
        return toggles.map((toggle, index) => {
          const title =
            toggle.querySelector("p.title")?.textContent?.trim() || "";
          const date = toggle.querySelector(".date")?.textContent?.trim() || "";
          const department =
            toggle.querySelector("#td_CHRG_DEPT_NM_0")?.textContent?.trim() ||
            "";
          const manager =
            toggle.querySelector("#td_NTCR_0")?.textContent?.trim() || "";
          const contact =
            toggle.querySelector("#td_TELNO_0")?.textContent?.trim() || "";

          const onclick =
            toggle.querySelector("a")?.getAttribute("onclick") || "";
          const match = onclick.match(/fn_detail\((\d+)\)/);
          const nttSeqNo = match ? match[1] : "";

          const postData = {
            title,
            date,
            department,
            manager,
            contact,
            nttSeqNo,
          };
          console.log(`📝 포스트 ${index + 1}:`, postData);

          return postData;
        });
      }, pageIndex);

    console.log(
      `🔍 페이지 ${pageIndex}에서 파싱된 포스트 수:`,
      postsOnPage.length
    );

    for (const post of postsOnPage) {
      console.log("📅 날짜 파싱 중:", `"${post.date}"`);
      const parsed = parseDate(post.date);
      console.log("📅 파싱된 날짜:", parsed);

      const isAfterJuneResult = isAfterJune(parsed);
      console.log("✅ 6월 이후 여부:", isAfterJuneResult);

      if (isAfterJuneResult) {
        const finalPost = {
          ...post,
          url: post.nttSeqNo ? DETAIL_URL(post.nttSeqNo) : "",
          date: formatToISO(parsed),
          category: "과기부",
        };
        console.log("✅ 추가된 포스트:", finalPost);
        results.push(finalPost);
      } else {
        console.log("❌ 6월 이전 포스트로 제외됨");
      }
    }
  }

  await browser.close();
  console.log(`🎉 MSIT 크롤링 완료. 총 ${results.length}개 포스트 수집됨`);
  return results;
};
