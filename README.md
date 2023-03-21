# TRIOS scraper

This is a scraper for the TRIOS website and gives you the way to get the researchers' data from TypeScript in a structured way.

## Usage

```TS
import { getResearcher, searchResearcher } from 'trios-scraper';

searchResearcher("山田 太郎")
  .then((researchers) => researchers.find((researcher) => researcher))
  .then((researcher) => researcher?.id)
  .then((id) => (id ? getResearcher(id) : null))
  .then((researcher) => researcher?.取得学位)
  .then(console.log);

// [
//   { date: '2000-02', degree: '薬学博士', school: '筑波大学' }
// ]
```
