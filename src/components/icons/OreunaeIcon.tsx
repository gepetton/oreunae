import * as React from "react";

/** Authored paths; no runtime icon-library dependency. */
const iconMeta = {
  "oil-barrel": {
    "label": "원유 배럴",
    "category": "energy"
  },
  "oil-pumpjack": {
    "label": "원유 생산",
    "category": "energy"
  },
  "natural-gas": {
    "label": "천연가스",
    "category": "energy"
  },
  "gold-bars": {
    "label": "금",
    "category": "gold"
  },
  "silver-ingot": {
    "label": "은",
    "category": "silver"
  },
  "copper-coil": {
    "label": "구리",
    "category": "copper"
  },
  "agriculture": {
    "label": "농산물",
    "category": "agriculture"
  },
  "energy-inventory": {
    "label": "에너지 재고",
    "category": "energy"
  },
  "market-index": {
    "label": "주가지수",
    "category": "indices"
  },
  "global-index": {
    "label": "글로벌 지수",
    "category": "indices"
  },
  "sector-index": {
    "label": "섹터 지수",
    "category": "indices"
  },
  "index-basket": {
    "label": "지수 구성",
    "category": "indices"
  },
  "treasury": {
    "label": "국채",
    "category": "rates"
  },
  "bond-certificate": {
    "label": "채권",
    "category": "rates"
  },
  "policy-rate": {
    "label": "정책금리",
    "category": "rates"
  },
  "short-rate": {
    "label": "단기자금금리",
    "category": "rates"
  },
  "real-yield": {
    "label": "실질금리",
    "category": "rates"
  },
  "yield-curve": {
    "label": "수익률 곡선",
    "category": "rates"
  },
  "credit-spread": {
    "label": "신용 스프레드",
    "category": "sentiment"
  },
  "dollar-index": {
    "label": "달러 지수",
    "category": "fx"
  },
  "fx-exchange": {
    "label": "환율",
    "category": "fx"
  },
  "fx-reserves": {
    "label": "외환보유액",
    "category": "fx"
  },
  "volatility": {
    "label": "변동성",
    "category": "sentiment"
  },
  "sentiment": {
    "label": "공포 · 탐욕",
    "category": "sentiment"
  },
  "valuation": {
    "label": "밸류에이션",
    "category": "sentiment"
  },
  "liquidity": {
    "label": "유동성",
    "category": "fx"
  },
  "market-pulse": {
    "label": "시장 상태",
    "category": "indices"
  },
  "cpi-basket": {
    "label": "소비자물가",
    "category": "inflation"
  },
  "pce-wallet": {
    "label": "개인소비물가",
    "category": "inflation"
  },
  "producer-price": {
    "label": "생산자물가",
    "category": "inflation"
  },
  "retail-sales": {
    "label": "소매판매",
    "category": "inflation"
  },
  "housing": {
    "label": "주택",
    "category": "inflation"
  },
  "employment": {
    "label": "고용 · 실업률",
    "category": "employment"
  },
  "job-openings": {
    "label": "구인 · 채용",
    "category": "employment"
  },
  "wages": {
    "label": "임금",
    "category": "employment"
  },
  "jobless-claims": {
    "label": "실업수당 청구",
    "category": "employment"
  },
  "gdp": {
    "label": "국내총생산",
    "category": "growth"
  },
  "industrial-production": {
    "label": "산업생산",
    "category": "growth"
  },
  "pmi": {
    "label": "구매관리지수",
    "category": "growth"
  },
  "trade-balance": {
    "label": "무역수지",
    "category": "growth"
  },
  "calendar": {
    "label": "경제 일정",
    "category": "utility"
  },
  "watchlist": {
    "label": "관심목록",
    "category": "utility"
  },
  "language": {
    "label": "언어",
    "category": "utility"
  },
  "search": {
    "label": "검색",
    "category": "utility"
  },
  "info": {
    "label": "정보",
    "category": "utility"
  },
  "chevron-right": {
    "label": "상세 이동",
    "category": "utility"
  },
  "chevron-down": {
    "label": "펼치기",
    "category": "utility"
  },
  "chevron-up": {
    "label": "접기",
    "category": "utility"
  },
  "close": {
    "label": "닫기",
    "category": "utility"
  },
  "refresh": {
    "label": "새로고침",
    "category": "utility"
  },
  "share": {
    "label": "공유",
    "category": "utility"
  },
  "alert": {
    "label": "알림",
    "category": "utility"
  },
  "nav-markets": {
    "label": "주요 지표 탭",
    "category": "utility"
  },
  "nav-domestic": {
    "label": "국내 자산 탭",
    "category": "utility"
  },
  "nav-global": {
    "label": "해외 자산 탭",
    "category": "utility"
  },
  "nav-preipo": {
    "label": "상장 전 자산 탭",
    "category": "utility"
  },
  "nav-crypto": {
    "label": "디지털 자산 탭",
    "category": "utility"
  },
  "arrow-up-right": {
    "label": "상승 방향",
    "category": "utility"
  },
  "arrow-down-right": {
    "label": "하락 방향",
    "category": "utility"
  },
  "minus": {
    "label": "변화 없음",
    "category": "utility"
  }
} as const;

export type OreunaeIconName = keyof typeof iconMeta;
export type OreunaeIconCategory = (typeof iconMeta)[OreunaeIconName]["category"];

const paths: Record<OreunaeIconName, React.ReactNode> = {
  "oil-barrel": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5.5 5.2H18.5V18.7C18.5 20.1 15.6 21 12 21S5.5 20.1 5.5 18.7Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("ellipse", {"key": "1", "cx": 12, "cy": 5.2, "rx": 6.5, "ry": 2.2}),
    React.createElement("path", {"key": "2", "d": "M5.5 5.2V18.8C5.5 20.1 8.4 21 12 21S18.5 20.1 18.5 18.8V5.2"}),
    React.createElement("path", {"key": "3", "d": "M5.5 8.5C8.2 10.1 15.8 10.1 18.5 8.5M5.5 16.5C8.2 18.1 15.8 18.1 18.5 16.5"}),
    React.createElement("path", {"key": "4", "d": "M12 10.8C11.3 12 10.3 13 10.3 14A1.7 1.7 0 0 0 13.7 14C13.7 13 12.7 12 12 10.8Z", "fill": "currentColor", "stroke": "none"})),
  "oil-pumpjack": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 20H21M7 20L10 10L14 20M6 7L18 4L21 6L18.5 8.5L6 10ZM18.5 8.5V15M16.5 15H20.5M5 10V17M3 17H7"}),
    React.createElement("circle", {"key": "1", "cx": 10.5, "cy": 8, "r": 1, "fill": "currentColor", "stroke": "none"})),
  "natural-gas": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M12.5 2.5C15 7 20 9.3 20 14.2A8 8 0 0 1 4 14.2C4 10.8 6.2 8.3 8.5 6.3C8 9 8.5 10.7 10 11C11.8 8.3 13 5.3 12.5 2.5Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M12.5 2.5C15 7 20 9.3 20 14.2A8 8 0 0 1 4 14.2C4 10.8 6.2 8.3 8.5 6.3C8 9 8.5 10.7 10 11C11.8 8.3 13 5.3 12.5 2.5Z"}),
    React.createElement("path", {"key": "2", "d": "M12.2 12.7C11.6 15 9.5 16 9.5 17.9A2.7 2.7 0 0 0 14.9 17.9C14.9 16.2 13.4 14.6 12.2 12.7Z"})),
  "gold-bars": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M9 3.5H15L17 9H7ZM4 12.5H10L12 19.5H2ZM14 12.5H20L22 19.5H12Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M9 3.5H15L17 9H7ZM4 12.5H10L12 19.5H2ZM14 12.5H20L22 19.5H12ZM8 6.5H16M3 16.5H11M13 16.5H21"})),
  "silver-ingot": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 5.5H19L22 16.5L19.5 19.5H4.5L2 16.5Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M5 5.5H19L22 16.5L19.5 19.5H4.5L2 16.5ZM6.5 8.5H17.5L19.5 15.5H4.5ZM2 16.5H22"})),
  "copper-coil": React.createElement(React.Fragment, null,
    React.createElement("ellipse", {"key": "0", "cx": 9, "cy": 12, "rx": 5, "ry": 9}),
    React.createElement("ellipse", {"key": "1", "cx": 9, "cy": 12, "rx": 2.1, "ry": 5.7}),
    React.createElement("path", {"key": "2", "d": "M9 3H15C21 3 22 21 15 21H9M13 6H18.5M14 10H20M14 15H20M13 18H18.5"})),
  "agriculture": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M12 21V4M12 9C8 9 5.8 6.5 6.5 3.5C10.2 3.5 12 6.2 12 9ZM12 14C8 14 5.8 11.5 6.5 8.5C10.2 8.5 12 11.2 12 14ZM12 18.5C15.8 18.5 18.2 16 17.5 13C13.8 13 12 15.7 12 18.5ZM12 12.5C15.8 12.5 18.2 10 17.5 7C13.8 7 12 9.7 12 12.5Z"})),
  "energy-inventory": React.createElement(React.Fragment, null,
    React.createElement("ellipse", {"key": "0", "cx": 12, "cy": 5, "rx": 7, "ry": 2.5}),
    React.createElement("path", {"key": "1", "d": "M5 5V19C5 20.4 8.1 21.5 12 21.5S19 20.4 19 19V5M5 10C8 12 16 12 19 10M9 16H15"})),
  "market-index": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 17L9 12L13 14L19 6V20H5Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M3 4V21H21M6 16L10 11L14 13.5L20 5.5"})),
  "global-index": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 12, "cy": 12, "r": 9}),
    React.createElement("ellipse", {"key": "1", "cx": 12, "cy": 12, "rx": 4, "ry": 9}),
    React.createElement("path", {"key": "2", "d": "M4 8H20M4 16H20M3 12H21"})),
  "sector-index": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 3, "y": 3, "width": 7, "height": 7, "rx": 1.5}),
    React.createElement("rect", {"key": "1", "x": 14, "y": 3, "width": 7, "height": 7, "rx": 1.5}),
    React.createElement("rect", {"key": "2", "x": 3, "y": 14, "width": 7, "height": 7, "rx": 1.5}),
    React.createElement("rect", {"key": "3", "x": 14, "y": 14, "width": 7, "height": 7, "rx": 1.5, "fill": "currentColor", "fillOpacity": ".12"})),
  "index-basket": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 5, "y": 2.5, "width": 14, "height": 19, "rx": 2}),
    React.createElement("path", {"key": "1", "d": "M9 7H15M9 11H15M9 15H15M9 18H12"}),
    React.createElement("circle", {"key": "2", "cx": 7.3, "cy": 7, "r": 0.65, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "3", "cx": 7.3, "cy": 11, "r": 0.65, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "4", "cx": 7.3, "cy": 15, "r": 0.65, "fill": "currentColor", "stroke": "none"})),
  "treasury": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 8L12 3L21 8Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M3 8L12 3L21 8ZM3 21H21M4 18.5H20M6 11V16M10 11V16M14 11V16M18 11V16"})),
  "bond-certificate": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M6 2.5H14L19 7.5V21.5H5V3.5Q5 2.5 6 2.5ZM14 2.5V7.5H19M8 11H15M8 14.5H15M8 18H12"}),
    React.createElement("path", {"key": "1", "d": "M14 2.5L19 7.5H14Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"})),
  "policy-rate": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M4 9A8.5 8.5 0 0 1 19 6M19 3V6H16M20 15A8.5 8.5 0 0 1 5 18M5 21V18H8M8 16L16 8"}),
    React.createElement("circle", {"key": "1", "cx": 8.3, "cy": 8.3, "r": 1.5}),
    React.createElement("circle", {"key": "2", "cx": 15.7, "cy": 15.7, "r": 1.5})),
  "short-rate": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 11, "cy": 11, "r": 8}),
    React.createElement("path", {"key": "1", "d": "M11 6V11L15 13M16.5 19.5H22M19.5 17V22"})),
  "real-yield": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 21H21"}),
    React.createElement("rect", {"key": "1", "x": 5, "y": 11, "width": 3, "height": 7, "rx": 0.7}),
    React.createElement("rect", {"key": "2", "x": 11, "y": 5, "width": 3, "height": 13, "rx": 0.7}),
    React.createElement("rect", {"key": "3", "x": 17, "y": 8, "width": 3, "height": 10, "rx": 0.7}),
    React.createElement("path", {"key": "4", "d": "M5 7L8 4M5 4H8V7"})),
  "yield-curve": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 4V21H21M6 17C9 10 13 9 21 8"}),
    React.createElement("path", {"key": "1", "d": "M6 17L21 13", "strokeDasharray": "1 3", "opacity": ".4"})),
  "credit-spread": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 7C6 5 8 9 11 7S16 5 18 6M3 17C6 15 8 19 11 17S16 15 18 16M21 5V18M19 5H23M19 18H23"})),
  "dollar-index": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M16.8 5.3C14.6 3 6.5 3.4 6.5 7.5C6.5 13 17.5 9.6 17.5 15.8C17.5 20.3 9.5 21 6 18M12 2V22"}),
    React.createElement("path", {"key": "1", "d": "M18 4H21M18 7H20", "opacity": ".3"})),
  "fx-exchange": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 7H20M16 3L20 7L16 11M21 17H4M8 13L4 17L8 21"})),
  "fx-reserves": React.createElement(React.Fragment, null,
    React.createElement("ellipse", {"key": "0", "cx": 9, "cy": 5, "rx": 6, "ry": 2.5}),
    React.createElement("path", {"key": "1", "d": "M3 5V14C3 16.1 8.2 17.1 11.5 16M3 9C5 10.5 8.3 11.1 12 10"}),
    React.createElement("ellipse", {"key": "2", "cx": 16, "cy": 13.5, "rx": 5, "ry": 2.3}),
    React.createElement("path", {"key": "3", "d": "M11 13.5V19C11 22 21 22 21 19V13.5M11 17C13.5 18.5 18.5 18.5 21 17"})),
  "volatility": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M4 10V15M8 6V19M12 9V16M16 3V21M20 7V17"})),
  "sentiment": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M4.6 19A9 9 0 1 1 19.4 19M3 12H5.5M5.6 5.6L7.4 7.4M12 3V5.5M18.4 5.6L16.6 7.4M21 12H18.5M12 12L16.5 8"}),
    React.createElement("circle", {"key": "1", "cx": 12, "cy": 12, "r": 1.4, "fill": "currentColor", "stroke": "none"})),
  "valuation": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M7 18L18 7"}),
    React.createElement("rect", {"key": "1", "x": 4, "y": 4, "width": 6, "height": 6, "rx": 1.5}),
    React.createElement("rect", {"key": "2", "x": 14, "y": 14, "width": 6, "height": 6, "rx": 1.5}),
    React.createElement("path", {"key": "3", "d": "M6 7H8M16 17H18"})),
  "liquidity": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M4 7H20V21H4ZM4 11H20M8 3V7M16 3V7M9 15H15M13 13L15 15L13 17"})),
  "market-pulse": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M8 4A8 8 0 0 0 4 17M16 20A8 8 0 0 0 20 7M2.5 17H6V13.5M21.5 7H18V10.5M5 12H9L11 7L14 17L16 12H19"})),
  "cpi-basket": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 9H21L18.5 21H5.5Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M2 9H22M3 9L5.5 21H18.5L21 9M7 9L10 3M17 9L14 3M9 13V17M15 13V17"})),
  "pce-wallet": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 3, "y": 6, "width": 18, "height": 15, "rx": 2}),
    React.createElement("path", {"key": "1", "d": "M3 8V5Q3 3 5 3H18V6M21 11H16A3 3 0 0 0 16 17H21Z"}),
    React.createElement("circle", {"key": "2", "cx": 16.3, "cy": 14, "r": 0.9, "fill": "currentColor", "stroke": "none"})),
  "producer-price": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 21V11L8 8V12L13 8V21ZM16 7V3H20V11M13 21H21V12H17M6 16H9M6 18.5H9M17 16H19"})),
  "retail-sales": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 4.5, "y": 7, "width": 15, "height": 14, "rx": 2}),
    React.createElement("path", {"key": "1", "d": "M8 7V5A4 4 0 0 1 16 5V7M8 12H16M8 16H14"})),
  "housing": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 11L12 4L19 11V21H5Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M2.5 11L12 2.5L21.5 11M5 9V21H19V9M10 21V14H14V21"})),
  "employment": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 9, "cy": 7, "r": 3.5}),
    React.createElement("path", {"key": "1", "d": "M2.5 21V18A6.5 6.5 0 0 1 15.5 18V21M16 4A3 3 0 0 1 16 10M18.5 13A6 6 0 0 1 21.5 18V21"})),
  "job-openings": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M9 5V2.5H15V5"}),
    React.createElement("rect", {"key": "1", "x": 3, "y": 5, "width": 18, "height": 13, "rx": 2}),
    React.createElement("path", {"key": "2", "d": "M3 10C8 13 16 13 21 10M10 11V13H14V11M16 21H22M19 18V23"})),
  "wages": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 3, "y": 3, "width": 16, "height": 12, "rx": 1.5}),
    React.createElement("path", {"key": "1", "d": "M6 7H12M6 10H10"}),
    React.createElement("circle", {"key": "2", "cx": 16.5, "cy": 17, "r": 4.5}),
    React.createElement("path", {"key": "3", "d": "M14.8 17H18.2M16.5 14.8V19.2"})),
  "jobless-claims": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M6 2.5H14L19 7.5V21.5H5V3.5Q5 2.5 6 2.5ZM14 2.5V7.5H19M8 11H15M8 16L10 18L15 13"})),
  "gdp": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 13H8V21H3ZM9.5 8H14.5V21H9.5ZM16 3H21V21H16Z", "fill": "currentColor", "fillOpacity": ".12", "stroke": "none"}),
    React.createElement("path", {"key": "1", "d": "M2 21H22M3 21V13H8V21M9.5 21V8H14.5V21M16 21V3H21V21"})),
  "industrial-production": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 21V11L9 7V11L15 7V21ZM17 21V3H21V21H3M6 15V17M11 15V17M17 8H21"})),
  "pmi": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 5, "y": 4, "width": 15, "height": 18, "rx": 2}),
    React.createElement("rect", {"key": "1", "x": 9, "y": 2, "width": 7, "height": 4, "rx": 1}),
    React.createElement("path", {"key": "2", "d": "M8 18V14M12 18V10M16 18V12"})),
  "trade-balance": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 6H21M17 2L21 6L17 10M21 18H3M7 14L3 18L7 22M6 9V15M10 9V15M14 9V15M18 9V15"})),
  "calendar": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 3, "y": 5, "width": 18, "height": 17, "rx": 2.5}),
    React.createElement("path", {"key": "1", "d": "M3 10H21M7 2V7M17 2V7"}),
    React.createElement("circle", {"key": "2", "cx": 7, "cy": 14, "r": 0.9, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "3", "cx": 12, "cy": 14, "r": 0.9, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "4", "cx": 17, "cy": 14, "r": 0.9, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "5", "cx": 7, "cy": 18, "r": 0.9, "fill": "currentColor", "stroke": "none"}),
    React.createElement("circle", {"key": "6", "cx": 12, "cy": 18, "r": 0.9, "fill": "currentColor", "stroke": "none"})),
  "watchlist": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M12 2.5L15 8.6L21.8 9.6L16.9 14.4L18.1 21.2L12 18L5.9 21.2L7.1 14.4L2.2 9.6L9 8.6Z"})),
  "language": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3 5H14M8.5 2V5M12 5C11.5 11 7.5 14.5 3 16M5 8C6.7 12 9.8 14.5 13 16M13 22L17.5 11L22 22M15 18H20"})),
  "search": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 10, "cy": 10, "r": 6.5}),
    React.createElement("path", {"key": "1", "d": "M15 15L21 21"})),
  "info": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 12, "cy": 12, "r": 9}),
    React.createElement("path", {"key": "1", "d": "M12 11V17"}),
    React.createElement("circle", {"key": "2", "cx": 12, "cy": 7.5, "r": 1, "fill": "currentColor", "stroke": "none"})),
  "chevron-right": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M9 5L16 12L9 19"})),
  "chevron-down": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 9L12 16L19 9"})),
  "chevron-up": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 15L12 8L19 15"})),
  "close": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 5L19 19M19 5L5 19"})),
  "refresh": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M3.5 9A9 9 0 0 1 19 5.5M19 2V6H15M20.5 15A9 9 0 0 1 5 18.5M5 22V18H9"})),
  "share": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M12 15V2M7.5 6.5L12 2L16.5 6.5M7 10H4V22H20V10H17"})),
  "alert": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 10A7 7 0 0 1 19 10V16L21 19H3L5 16ZM9 22H15"})),
  "nav-markets": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M4 20V15M9 20V11M14 20V14M19 20V9M3 10L8 5L13 8L20 2.5"})),
  "nav-domestic": React.createElement(React.Fragment, null,
    React.createElement("rect", {"key": "0", "x": 4, "y": 3, "width": 11, "height": 18, "rx": 1}),
    React.createElement("path", {"key": "1", "d": "M15 9H20V21H2M8 7H11M8 11H11M8 15H11M8 19H11M17.5 12V18"})),
  "nav-global": React.createElement(React.Fragment, null,
    React.createElement("circle", {"key": "0", "cx": 12, "cy": 12, "r": 9}),
    React.createElement("ellipse", {"key": "1", "cx": 12, "cy": 12, "rx": 4, "ry": 9}),
    React.createElement("path", {"key": "2", "d": "M4 8H20M4 16H20"})),
  "nav-preipo": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M7 19H4V4H18V9M8 4V2M14 4V2M4 8H18M7 11H10M7 14H9"}),
    React.createElement("circle", {"key": "1", "cx": 16.5, "cy": 16.5, "r": 5}),
    React.createElement("path", {"key": "2", "d": "M16.5 13.5V16.5L18.5 17.5"})),
  "nav-crypto": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M9 3L16 7V15L9 19L2 15V7ZM16 7L22 10.5V18.5L15 22L9 19"}),
    React.createElement("path", {"key": "1", "d": "M9 7L12.5 9V13L9 15L5.5 13V9Z"})),
  "arrow-up-right": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 19L19 5M7 5H19V17"})),
  "arrow-down-right": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 5L19 19M7 19H19V7"})),
  "minus": React.createElement(React.Fragment, null,
    React.createElement("path", {"key": "0", "d": "M5 12H19"}))
};

export interface OreunaeIconProps extends Omit<React.SVGProps<SVGSVGElement>, "children" | "name"> {
  name: OreunaeIconName;
  size?: number | string;
  label?: string;
}

/** When the adjacent text names the icon, leave label unset: decorative SVG. */
export function OreunaeIcon({
  name, size = 24, label, color = "currentColor", strokeWidth = 1.75, ...props
}: OreunaeIconProps) {
  const accessibleName = label ?? props["aria-label"];
  return React.createElement("svg", {
    ...props,
    xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24",
    width: size, height: size, fill: "none", stroke: "currentColor",
    color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    focusable: false,
    role: accessibleName ? "img" : undefined,
    "aria-label": accessibleName,
    "aria-hidden": accessibleName ? undefined : true,
  }, paths[name]);
}

export interface OreunaeBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  name: OreunaeIconName;
  size?: number;
  glyphSize?: number;
  label?: string;
  theme?: "light" | "dark";
}

/** Import oreunae-icons.css once. Inherit your app's [data-theme] or .dark. */
export function OreunaeBadge({
  name, size = 28, glyphSize = 18, label, theme,
  className = "", style, ...props
}: OreunaeBadgeProps) {
  return React.createElement("span", {
    ...props,
    className: `oreunae-icon-badge ${className}`.trim(),
    "data-category": iconMeta[name].category,
    "data-oreunae-theme": theme,
    style: { width: size, height: size, borderRadius: Math.round(size * 0.31), ...style },
  }, React.createElement(OreunaeIcon, { name, size: glyphSize, label }));
}
