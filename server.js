// server.js (프로젝트 루트)
const express = require('express');
const cors    = require('cors');
// Node 18+ 에서는 fetch가 글로벌로 제공됩니다.

const app = express();
app.use(cors());

// 포털에서 제공된 "Decoding" 키(끝에 ==)를 그대로 넣으세요
const SERVICE_KEY = 'C8OGFE3ZOq4kZ+FybwXxKJ6b2ZeK0OtIt4TdeWi6a/7m6RgwM3+SnUG5dH4rV42t2bXXoLzAMweqh1aS7P3QOw==';

app.get('/water', async (req, res) => {
  const { pageNo = '1', numOfRows = '5', startYear, endYear } = req.query;

  const base = 'https://apis.data.go.kr/1480523/LvlhPpnWatUsageService/getLvlhPpnWatUsageList';
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo,
    numOfRows,
    resultType: 'json',
    ...(startYear ? { startYear } : {}),
    ...(endYear   ? { endYear   } : {}),
  });
  const url = `${base}?${params}`;

  console.log('▶ Fetching:', url);
  try {
    const apiRes = await fetch(url);
    const text   = await apiRes.text();

    if (!apiRes.ok) {
      // 원본 XML 오류 메시지 확인용
      console.error(text);
      return res.status(apiRes.status).send(text);
    }

    const json = JSON.parse(text);
    const items = json.getLvlhPpnWatUsageList?.body?.items || [];
    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.toString());
  }
});

app.listen(4000, () =>
  console.log('🚀 Proxy server running at http://localhost:4000')
);
