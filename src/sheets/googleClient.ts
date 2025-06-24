import "dotenv/config";
import { google } from "googleapis";

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);
const sheetId = process.env.GOOGLE_SHEET_ID;

if (!serviceAccountEmail || !privateKey || !sheetId) {
  throw new Error("Missing Google Sheets environment variables");
}

const auth = new google.auth.JWT({
  email: serviceAccountEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export const appendRowsToSheet = async (rows: string[][], range = "A1") => {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: rows,
    },
  });
};

export const getLastNttSeqNo = async (): Promise<string | null> => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "crawling!C2:C1000", // C열 = nttSeqNo
  });

  const urls = res.data.values?.map((row) => row[0]) ?? [];
  const seqNumbers = urls
    .map((url) => {
      const match = url?.match(/nttSeqNo=(\d+)/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  return seqNumbers[0] || null; // 최신값은 가장 위에 있다고 가정
};
