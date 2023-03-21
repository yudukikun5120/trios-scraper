import fetch from "node-fetch";
import { parse } from "node-html-parser";
import { URLSearchParams } from "url";

const fetchHTML = (url: string) => fetch(url).then((res) => res.text());

const parseHTML = (html: string) => {
  const doc = parse(html);
  const rows = Array.from(doc.querySelectorAll("table.table tr")).slice(1);

  const results = rows.map((row) => {
    const name = row.querySelector("td:nth-child(1)")?.text;
    const affiliation = row.querySelector("td:nth-child(2)")?.text;
    const official_title = row.querySelector("td:nth-child(3)")?.text;
    const research_fields = row
      .querySelector("td:nth-child(4)")
      ?.text.split(", ");
    const id = row
      .querySelector("td:nth-child(1) a")
      ?.getAttribute("href")
      ?.split("/")
      .pop();

    return {
      name,
      official_title,
      affiliation,
      id,
      research_fields,
    };
  });

  return results;
};

const constructURL = (
  name: string,
  department_id: string,
  position_id: string,
  society: string,
  keyword: string
) => {
  const url = new URL("https://trios.tsukuba.ac.jp/ja/researchers/search");
  const params = new URLSearchParams({
    name,
    department_id,
    position_id,
    society,
    keyword,
  });
  url.search = params.toString();
  return url.toString();
};

const searchResearcher = (
  name: string = "",
  department_id: string = "",
  position_id: string = "",
  society: string = "",
  keyword: string = ""
) =>
  fetchHTML(
    constructURL(name, department_id, position_id, society, keyword)
  ).then(parseHTML);

export { searchResearcher };
