export const departmentMap: Record<string, string> = {
  "전기전자컴퓨터공학과": "EC",
  "AI학과": "AI",
  "반도체공학과": "SE",
  "물리광과학과": "PS",
  "화학과": "CH",
  "수리과학과": "MM",
  "신소재공학과": "MA",
  "기계로봇공학과": "MC",
  "환경에너지공학과": "EV",
  "생명과학과": "BS",
  "도전탐색과정": "GS",
};

export const reverseDepartmentMap: Record<string, string> = Object.fromEntries(
  Object.entries(departmentMap).map(([name, code]) => [code, name])
);