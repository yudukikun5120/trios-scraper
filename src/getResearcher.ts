import fetch from "node-fetch";
import { parse } from "node-html-parser";

interface Researcher {
  [key: string]: string;
}

type Duration = { start: number | string | null; end: number | string | null };

interface ResearcherFields {
  研究分野: (fields: string[]) => string[];
  研究キーワード: (s: string[]) => string[];
  研究課題: (s: string[][]) => {
    title: string;
    duration: Duration;
    researcher: string;
    organization: string;
    budget: string;
  }[];
  職歴: (s: string[][]) => {
    duration: Duration;
    position: string;
  }[];
  学歴: (s: string[][]) => {
    duration: Duration;
    school: string;
    degree: string;
  }[];
  取得学位: (s: string[][]) => {
    date: string;
    degree: string;
    school: string;
  }[];
  所属学協会: (s: string[][]) => {
    duration: Duration;
    association: string;
  }[];
  受賞: (s: string[][]) => {
    date: string;
    award: string;
    category: string;
  }[];
  担当授業科目: (s: string[][]) => {
    duration: Duration;
    course: string;
    organization: string;
  }[];
  学協会等委員: (s: string[][]) => {
    duration: Duration;
    association: string;
    position: string;
  }[];
}

const annotateResearcherFields: ResearcherFields = {
  研究分野: (s: string[]) => s.flat(),
  研究キーワード: (s: string[]) => s.flat(),
  研究課題: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      title: s[0],
      duration: durationToObj(s[1]),
      researcher: s[2],
      organization: s[3],
      budget: s[4],
    })),
  職歴: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      duration: durationToObj(s[0]),
      position: s[1],
    })),
  学歴: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      duration: durationToObj(s[0]),
      school: s[1],
      degree: s[2],
    })),
  取得学位: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      date: s[0],
      degree: s[1],
      school: s[2],
    })),
  所属学協会: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      duration: durationToObj(s[0]),
      association: s[1],
    })),
  受賞: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      date: s[0],
      award: s[1],
      category: s[2],
    })),
  担当授業科目: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      duration: durationToObj(s[0]),
      course: s[1],
      organization: s[2],
    })),
  学協会等委員: (s: string[][]) =>
    s.filter(hasValidContent).map((s) => ({
      duration: durationToObj(s[0]),
      association: s[1],
      position: s[2],
    })),
};

const fetchHTML = (url: string) => fetch(url).then((res) => res.text());

const hasValidContent = (s: string[]) => s.find((s) => s) !== "さらに表示...";

const durationToObj = (s: string) => {
  const delimiter = "--";

  if (s.startsWith(delimiter)) return { start: null, end: s.slice(3) };

  const [start, end] = s
    .split(` ${delimiter} `)
    .map((s) => (typeof s === "number" ? parseInt(s) : s));
  return { start: start || null, end: end || null };
};

function parseDL(dlElement: HTMLElement): Researcher {
  const dtElements = dlElement.getElementsByTagName("dt");

  const data = Array.from(dtElements).reduce((acc, curr) => {
    const key = curr.textContent;
    if (!key) return acc;
    let value: any = curr.nextElementSibling?.textContent?.trim();
    const tableElement = curr.nextElementSibling?.querySelector("table");

    if (tableElement) {
      value = tableToObject(tableElement);
      if (key in annotateResearcherFields)
        value = annotateResearcherFields[key as keyof ResearcherFields](value);
    }

    if (key && value) acc[key] = value;

    return acc;
  }, {} as Researcher);
  return data;
}

const parseHTML = (html: string) => {
  const researcher_info = parse(html).querySelector(
    "#researcher-information dl"
  );
  if (!researcher_info) throw new Error("No researcher information found");

  return parseDL(researcher_info as unknown as HTMLElement);
};

function tableToObject(table: HTMLTableElement) {
  const rows = table.querySelectorAll("tbody tr");
  return Array.from(rows).map((row) =>
    Array.from(row.querySelectorAll("td")).map((td) => td.textContent?.trim())
  );
}

const getResearcher = (id: string) =>
  fetchHTML(`https://trios.tsukuba.ac.jp/researcher/${id}`).then(parseHTML);

export { getResearcher };
