// Editorial and community examples for the detail mock. These are not published news or user posts.
import type { Locale } from '../lib/market-data'

type Copy = Record<Locale, string>
interface AssetContent {
  description: Copy
  themes: Record<Locale, string[]>
  headlines: Record<Locale, string[]>
}

export const assetContent: Record<string, AssetContent> = {
  SMSN: {
    description: {
      ko: '반도체, 스마트폰, 가전 등 다양한 전자제품을 만드는 삼성전자와 연결된 토큰 시장을 살펴봅니다. 표시 가격은 SMSN/USDC 계약의 참고가격이며, 삼성전자 보통주 1주 가격을 의미하지 않습니다.',
      en: 'Explore the token market linked to Samsung Electronics, spanning semiconductors, smartphones and consumer electronics. This is a reference price for the SMSN/USDC contract, not the price of one Samsung common share.',
    },
    themes: { ko: ['반도체', '메모리', '스마트폰', 'AI'], en: ['Semiconductors', 'Memory', 'Smartphones', 'AI'] },
    headlines: {
      ko: ['메모리 반도체를 볼 때 함께 확인할 시장 지표', '환율이 원화 참고가격에 반영되는 방식', '정규장 이후 토큰 가격을 읽는 방법'],
      en: ['Market indicators to follow alongside memory chips', 'How exchange rates affect a KRW reference price', 'Reading token prices outside exchange hours'],
    },
  },
  NVDA: {
    description: {
      ko: '엔비디아는 GPU와 AI 컴퓨팅 플랫폼을 개발하는 기업입니다. 데이터센터, 게이밍, 자율주행 등 다양한 분야에 기술을 제공합니다. 이 화면은 NVDA/USDC 토큰 시장의 참고가격을 보여줍니다.',
      en: 'NVIDIA develops GPUs and AI computing platforms for data centers, gaming and autonomous systems. This page shows a reference price from the NVDA/USDC token market.',
    },
    themes: { ko: ['AI', '반도체', '데이터센터', '자율주행', '클라우드'], en: ['AI', 'Semiconductors', 'Data centers', 'Autonomous driving', 'Cloud'] },
    headlines: {
      ko: ['AI 인프라와 반도체, 함께 살펴볼 지표', '데이터센터 투자 흐름을 이해하는 세 가지 관점', '토큰 참고가격과 거래소 주가의 차이'],
      en: ['Indicators to watch across AI infrastructure and chips', 'Three perspectives on data center investment', 'Token reference prices and exchange-listed shares'],
    },
  },
  BTC: {
    description: {
      ko: '비트코인은 공개된 네트워크에서 거래되는 디지털 자산입니다. 이 화면은 BTC/USDC 시장의 예시 가격을 USD로 환산해 보여주며, 특정 거래소의 실시간 체결가를 제공하지 않습니다.',
      en: 'Bitcoin is a digital asset traded on a public network. This page converts a sample BTC/USDC price into USD; it is not a live execution price from an exchange.',
    },
    themes: { ko: ['디지털 자산', '유동성', '달러', '금리'], en: ['Digital assets', 'Liquidity', 'US dollar', 'Rates'] },
    headlines: {
      ko: ['비트코인과 글로벌 유동성을 함께 보는 법', '24시간 시장에서 가격 변화의 기준 잡기', 'USDC 표시 가격과 달러 환산 가격의 차이'],
      en: ['Following Bitcoin alongside global liquidity', 'Choosing a baseline in a 24-hour market', 'USDC quotes and USD display prices'],
    },
  },
  GOLD: {
    description: {
      ko: '금은 원자재이자 가치 저장 수단으로 살펴보는 자산입니다. 이 화면은 GOLD/USDC 합성 계약의 예시 참고가격입니다. 제공 거래소와 계약 단위는 확인 전이며, 현물 1온스 가격으로 해석하지 않습니다.',
      en: 'Gold is followed as a commodity and store of value. This page uses a synthetic GOLD/USDC contract example. Its venue and contract unit are unverified; the value is not a spot price per ounce.',
    },
    themes: { ko: ['원자재', '실질금리', '달러', '인플레이션'], en: ['Commodities', 'Real yields', 'US dollar', 'Inflation'] },
    headlines: {
      ko: ['금과 실질금리를 함께 살펴보는 이유', '달러 흐름과 원자재 가격의 관계 읽기', '금 토큰의 가격과 계약 단위 확인하기'],
      en: ['Why follow gold alongside real yields?', 'Reading the dollar and commodity prices together', 'Checking a gold token’s price and contract unit'],
    },
  },
}

const oilContent: AssetContent = {
  description: { ko: '원유는 에너지 비용과 물가 흐름을 함께 살펴볼 때 사용하는 주요 원자재입니다. 이 화면은 배럴당 달러로 표시한 현물 지표의 합성 예시이며, 원유 선물 계약 가격이 아닙니다.', en: 'Crude oil provides context for energy costs and inflation. This screen shows a synthetic spot indicator in dollars per barrel, not the price of an oil futures contract.' },
  themes: { ko: ['에너지', '원자재', '물가', '달러'], en: ['Energy', 'Commodities', 'Inflation', 'US dollar'] },
  headlines: { ko: ['유가와 물가를 함께 읽는 방법', 'WTI와 브렌트 지표의 차이 살펴보기', '현물 지표와 선물 계약을 구분하는 이유'], en: ['Reading oil alongside inflation', 'Comparing WTI and Brent indicators', 'Distinguishing spot indicators from futures contracts'] },
}
const yieldContent: AssetContent = {
  description: { ko: '미국 국채 수익률은 해당 만기의 금리 수준을 살펴보는 지표입니다. 값은 %, 변화는 bp로 표시하며 수익률 상승을 채권 가격 상승으로 해석하지 않습니다. 제공된 값과 이력은 합성 예시입니다.', en: 'US Treasury yields describe interest-rate levels at a given maturity. Values use percent and changes use basis points; rising yields do not mean rising bond prices. Values and history here are synthetic examples.' },
  themes: { ko: ['금리', '국채', '수익률 곡선', '통화정책'], en: ['Rates', 'Treasuries', 'Yield curve', 'Monetary policy'] },
  headlines: { ko: ['국채 수익률과 채권 가격의 관계', '2년물과 10년물을 함께 살펴보는 법', '%와 bp를 구분해 금리 변화 읽기'], en: ['Treasury yields and bond prices', 'Reading 2-year and 10-year yields together', 'Understanding percent and basis-point changes'] },
}
const preIpoContent: AssetContent = {
  description: { ko: '비상장 기업과 연계된 Pre-IPO 무기한선물 계약을 살펴보는 예시 화면입니다. 원본 USDT 계약 가격에 고정 예시 환율을 적용합니다. 실제 주식이나 공모가가 아니며 주식 소유권을 제공하지 않습니다.', en: 'Explore an example Pre-IPO perpetual contract linked to a private company. Native USDT contract prices use a fixed sample conversion rate. This is not a share or an official IPO price and provides no share ownership.' },
  themes: { ko: ['Pre-IPO', 'AI', '무기한선물', '계약 단위'], en: ['Pre-IPO', 'AI', 'Perpetuals', 'Contract units'] },
  headlines: { ko: ['Pre-IPO 계약과 실제 주식의 차이', '계약 단위와 환산 기준을 확인하는 방법', 'AI 기업의 참고가격을 읽을 때 볼 것들'], en: ['Pre-IPO contracts versus company shares', 'Checking contract units and conversions', 'Context for reading AI company reference prices'] },
}
assetContent.WTI = oilContent
assetContent.BRENT = oilContent
assetContent.DUBAI = oilContent
assetContent.NATGAS = {
  description: {
    ko: 'Henry Hub 천연가스 현물을 USD/MMBtu(백만 Btu당 미국 달러)로 살펴보는 예시 화면입니다. 가격과 이력은 합성 데이터이며 실제 현물 시세나 선물 계약 가격이 아닙니다.',
    en: 'An example of Henry Hub natural gas spot prices in USD/MMBtu (US dollars per million Btu). Prices and history are synthetic, not actual spot quotes or futures contract prices.',
  },
  themes: { ko: ['천연가스', '에너지', 'Henry Hub'], en: ['Natural gas', 'Energy', 'Henry Hub'] },
  headlines: {
    ko: ['천연가스의 MMBtu 단위 이해하기', '현물 가격과 선물 계약을 구분하는 법', '원유와 천연가스를 함께 살펴보는 이유'],
    en: ['Understanding the MMBtu unit', 'Distinguishing spot prices from futures contracts', 'Following crude oil and natural gas together'],
  },
}
assetContent.US10Y = yieldContent
assetContent.US2Y = yieldContent
assetContent.US30Y = yieldContent
for (const symbol of ['US3M', 'US6M', 'US1Y', 'US5Y', 'US20Y']) assetContent[symbol] = yieldContent
assetContent.OPENAI = preIpoContent
assetContent.ANTHROPIC = preIpoContent
assetContent.CPI = {
  description: { ko: '미국 소비자물가 전년동월비는 물가가 1년 전과 비교해 얼마나 변했는지 살펴보는 지표입니다. 이 화면은 상승률(%)의 합성 예시이며, 이전 예시와의 차이는 %p로 표시합니다.', en: 'US CPI year-over-year measures consumer-price changes relative to a year earlier. This screen shows a synthetic inflation rate in percent, with differences between examples in percentage points.' },
  themes: { ko: ['물가', '미국 경제', '금리', '소비'], en: ['Inflation', 'US economy', 'Rates', 'Consumption'] },
  headlines: { ko: ['물가지수 수준과 상승률 구분하기', '전년동월비와 전월비를 함께 보는 이유', '%와 %p, 물가 변화 표현의 차이'], en: ['Price-index levels versus inflation rates', 'Year-over-year and month-over-month changes', 'Percent versus percentage-point changes'] },
}
assetContent.COREPCE = {
  ...assetContent.CPI,
  description: {
    ko: '근원 PCE의 전년 동월 대비 변화율을 보여주는 화면 예시입니다. 현재 값과 이력은 합성 데이터이며 실제 발표값이 아닙니다. 이전 예시와의 차이는 %p로 표시하고 관측기간·발표시각·출처는 미제공으로 유지합니다.',
    en: 'An interface example of year-over-year core PCE inflation. The current value and history are synthetic, not actual releases. Differences between examples use percentage points; observation periods, release times and sources are not provided.',
  },
}
assetContent.BOK = {
  description: { ko: '한국은행 기준금리는 국내 통화정책의 방향을 살펴보는 정책금리입니다. 이 화면은 금리(%)와 변화(bp)의 합성 예시이며, 실제 금리 결정이나 발표 일정을 의미하지 않습니다.', en: 'The Bank of Korea policy rate provides context for Korean monetary policy. This screen uses synthetic rate and basis-point examples, not actual decisions or release schedules.' },
  themes: { ko: ['한국 경제', '기준금리', '통화정책', '원화'], en: ['Korean economy', 'Policy rate', 'Monetary policy', 'KRW'] },
  headlines: { ko: ['기준금리와 시장금리 구분하기', '금리 변화를 bp로 표시하는 이유', '한국과 미국의 금리 지표 함께 보기'], en: ['Policy rates versus market interest rates', 'Why rate changes use basis points', 'Reading Korean and US rate indicators together'] },
}

const indexContent: AssetContent = {
  description: { ko: '시장 지수는 가격 흐름을 하나의 수치로 살펴보는 지표입니다. 이 화면의 값과 경로는 화면 구성을 위한 합성 데이터입니다. 포인트(pt) 단위로 표시하고 실제 관측시각이나 시장 데이터 출처를 제공하지 않습니다.', en: 'Market indices summarize price movements in a single figure. Values, paths and comparisons here are synthetic interface examples. They use points (pt); actual observation times and market-data sources are not provided.' },
  themes: { ko: ['시장 지수', '글로벌 시장', '비교 기준'], en: ['Market indices', 'Global markets', 'Comparisons'] },
  headlines: { ko: ['지수의 포인트와 변화율 구분하기', '서로 다른 지수를 비교할 때 볼 것들', '지수의 기준 시각과 출처 확인하기'], en: ['Index points versus percentage changes', 'Context for comparing different indices', 'Checking index timestamps and sources'] },
}
assetContent.SPX = indexContent
assetContent.NDX = indexContent
assetContent.DJI = indexContent
assetContent.RUT = indexContent
assetContent.DXY = indexContent
assetContent.KOSPI = indexContent
assetContent.VIX = {
  description: { ko: 'VIX는 S&P 500 옵션을 통해 향후 30일의 기대 변동성을 살펴보는 지수입니다. 높은 변동성은 주가 상승·하락 방향을 확정하지 않습니다. 이 화면의 값과 이력은 실제 Cboe 데이터가 아닌 합성 예시입니다.', en: 'VIX describes 30-day expected volatility implied by S&P 500 options. Higher volatility does not determine the direction of stock prices. Values and history here are synthetic examples, not observed Cboe data.' },
  themes: { ko: ['기대 변동성', '미국 주식', '옵션', '시장 위험'], en: ['Expected volatility', 'US equities', 'Options', 'Market risk'] },
  headlines: { ko: ['변동성과 주가 방향을 구분하는 이유', 'VIX와 공포·탐욕지수는 어떻게 다른가', '기대 변동성의 관측 기간 살펴보기'], en: ['Distinguishing volatility from price direction', 'VIX and Fear & Greed measure different things', 'Understanding the expected-volatility horizon'] },
}
assetContent.BUFFETT = {
  description: { ko: '버핏지수는 주식시장 전체 시가총액과 경제 규모를 비교하는 가치평가 지표입니다. 이 예시에서는 미국 주식시장 시가총액 ÷ 명목 GDP × 100의 비율(%)을 뜻합니다. 수치는 합성 데이터이며 실제 입력값으로 계산한 결과가 아닙니다.', en: 'The Buffett ratio compares total equity market capitalization with the size of the economy. This example represents US equity market capitalization divided by nominal GDP, multiplied by 100. Values are synthetic and are not calculated from actual inputs.' },
  themes: { ko: ['시장 가치평가', '시가총액', '명목 GDP', '장기 비교'], en: ['Market valuation', 'Market capitalization', 'Nominal GDP', 'Long-term context'] },
  headlines: { ko: ['주식시장 시가총액과 GDP를 비교하는 이유', '버핏지수의 분자와 분모 확인하기', '비율 변화와 퍼센트포인트 구분하기'], en: ['Comparing market capitalization with GDP', 'Checking the numerator and denominator', 'Ratios versus percentage-point changes'] },
}
assetContent['FEAR-GREED'] = {
  description: { ko: '미국 주식시장 공포·탐욕지수의 0~100점 척도를 보여주는 목업입니다. 낮을수록 공포, 높을수록 탐욕을 나타내며 암호화폐 심리지수와 구분합니다. 현재 점수와 이력은 CNN에서 수집한 값이 아닌 합성 예시입니다.', en: 'A mock of the 0–100 US stock-market Fear & Greed scale. Lower scores indicate fear and higher scores indicate greed; it is distinct from crypto sentiment. The sample score and its history are synthetic, not collected from CNN.' },
  themes: { ko: ['미국 주식', '시장 심리', '공포와 탐욕', '0~100점'], en: ['US equities', 'Market sentiment', 'Fear and greed', '0–100 score'] },
  headlines: { ko: ['시장 심리와 실제 가격을 함께 읽기', '주식과 암호화폐 심리지수를 구분하기', '점수 차이와 변화율은 무엇이 다른가'], en: ['Reading sentiment alongside prices', 'Stock sentiment versus crypto sentiment', 'Score-point differences versus percentages'] },
}

assetContent.CORECPI = {
  ...assetContent.CPI,
  description: { ko: '식품과 에너지를 제외한 미국 소비자물가 전년동월비의 합성 예시입니다. 실제 발표 수치가 아니며 이전 예시와의 차이는 퍼센트포인트로 표시합니다.', en: 'A synthetic example of US consumer price inflation excluding food and energy, year over year. These are not actual releases; differences from the previous example are in percentage points.' },
}

// Additional synthetic preview assets; candidate status does not assert a listed contract.
Object.assign(assetContent, {
  "000660": {
    "description": {
      "ko": "SK하이닉스를 화면 구성 검토용 후보로 추가했습니다. 가격과 이력은 임의로 만든 원화 예시입니다. 종목코드는 회사 식별용이며 연계 토큰·거래쌍·계약 단위는 미확인입니다.",
      "en": "SK hynix is an interface-preview candidate. Prices and history are invented KRW examples. The stock code identifies the company; linked tokens, pairs and contract units are unverified."
    },
    "themes": {
      "ko": [
        "국내 주식",
        "검토 후보",
        "원화"
      ],
      "en": [
        "Korean equities",
        "Candidate",
        "KRW"
      ]
    },
    "headlines": {
      "ko": [
        "SK하이닉스와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside SK hynix",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "005380": {
    "description": {
      "ko": "현대자동차를 화면 구성 검토용 후보로 추가했습니다. 가격과 이력은 임의로 만든 원화 예시입니다. 종목코드는 회사 식별용이며 연계 토큰·거래쌍·계약 단위는 미확인입니다.",
      "en": "Hyundai Motor is an interface-preview candidate. Prices and history are invented KRW examples. The stock code identifies the company; linked tokens, pairs and contract units are unverified."
    },
    "themes": {
      "ko": [
        "국내 주식",
        "검토 후보",
        "원화"
      ],
      "en": [
        "Korean equities",
        "Candidate",
        "KRW"
      ]
    },
    "headlines": {
      "ko": [
        "현대자동차와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Hyundai Motor",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "035420": {
    "description": {
      "ko": "NAVER를 화면 구성 검토용 후보로 추가했습니다. 가격과 이력은 임의로 만든 원화 예시입니다. 종목코드는 회사 식별용이며 연계 토큰·거래쌍·계약 단위는 미확인입니다.",
      "en": "NAVER is an interface-preview candidate. Prices and history are invented KRW examples. The stock code identifies the company; linked tokens, pairs and contract units are unverified."
    },
    "themes": {
      "ko": [
        "국내 주식",
        "검토 후보",
        "원화"
      ],
      "en": [
        "Korean equities",
        "Candidate",
        "KRW"
      ]
    },
    "headlines": {
      "ko": [
        "NAVER와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside NAVER",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "AAPL": {
    "description": {
      "ko": "애플 연계 상품의 화면 구성을 살펴보는 합성 예시입니다. AAPL/USDC는 예시 거래쌍이며 실제 거래소 주가·체결가가 아닙니다. 현재 제공처와 계약 단위는 검증하지 않았습니다.",
      "en": "A synthetic interface example for a product linked to Apple. AAPL/USDC is a sample pair, not an exchange share price or execution. The current venue and contract unit are unverified."
    },
    "themes": {
      "ko": [
        "미국 주식",
        "토큰 참고가격",
        "달러"
      ],
      "en": [
        "US equities",
        "Token reference",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "애플와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Apple",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "TSLA": {
    "description": {
      "ko": "테슬라 연계 상품의 화면 구성을 살펴보는 합성 예시입니다. TSLA/USDC는 예시 거래쌍이며 실제 거래소 주가·체결가가 아닙니다. 현재 제공처와 계약 단위는 검증하지 않았습니다.",
      "en": "A synthetic interface example for a product linked to Tesla. TSLA/USDC is a sample pair, not an exchange share price or execution. The current venue and contract unit are unverified."
    },
    "themes": {
      "ko": [
        "미국 주식",
        "토큰 참고가격",
        "달러"
      ],
      "en": [
        "US equities",
        "Token reference",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "테슬라와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Tesla",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "MSFT": {
    "description": {
      "ko": "마이크로소프트 연계 상품의 화면 구성을 살펴보는 합성 예시입니다. MSFT/USDC는 예시 거래쌍이며 실제 거래소 주가·체결가가 아닙니다. 현재 제공처와 계약 단위는 검증하지 않았습니다.",
      "en": "A synthetic interface example for a product linked to Microsoft. MSFT/USDC is a sample pair, not an exchange share price or execution. The current venue and contract unit are unverified."
    },
    "themes": {
      "ko": [
        "미국 주식",
        "토큰 참고가격",
        "달러"
      ],
      "en": [
        "US equities",
        "Token reference",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "마이크로소프트와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Microsoft",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "AMZN": {
    "description": {
      "ko": "아마존 연계 상품의 화면 구성을 살펴보는 합성 예시입니다. AMZN/USDC는 예시 거래쌍이며 실제 거래소 주가·체결가가 아닙니다. 현재 제공처와 계약 단위는 검증하지 않았습니다.",
      "en": "A synthetic interface example for a product linked to Amazon. AMZN/USDC is a sample pair, not an exchange share price or execution. The current venue and contract unit are unverified."
    },
    "themes": {
      "ko": [
        "미국 주식",
        "토큰 참고가격",
        "달러"
      ],
      "en": [
        "US equities",
        "Token reference",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "아마존와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Amazon",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "ETH": {
    "description": {
      "ko": "이더리움(ETH)의 합성 가격과 이력을 보여주는 예시 화면입니다. 예시 ETH/USDC 값을 USD로 환산하며 특정 거래소의 실시간 가격을 제공하지 않습니다.",
      "en": "Synthetic prices and history for Ethereum (ETH). Sample ETH/USDC values are converted into USD and do not represent live exchange prices."
    },
    "themes": {
      "ko": [
        "디지털 자산",
        "유동성",
        "달러"
      ],
      "en": [
        "Digital assets",
        "Liquidity",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "이더리움와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Ethereum",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "SOL": {
    "description": {
      "ko": "솔라나(SOL)의 합성 가격과 이력을 보여주는 예시 화면입니다. 예시 SOL/USDC 값을 USD로 환산하며 특정 거래소의 실시간 가격을 제공하지 않습니다.",
      "en": "Synthetic prices and history for Solana (SOL). Sample SOL/USDC values are converted into USD and do not represent live exchange prices."
    },
    "themes": {
      "ko": [
        "디지털 자산",
        "유동성",
        "달러"
      ],
      "en": [
        "Digital assets",
        "Liquidity",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "솔라나와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside Solana",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "XRP": {
    "description": {
      "ko": "엑스알피(XRP)의 합성 가격과 이력을 보여주는 예시 화면입니다. 예시 XRP/USDC 값을 USD로 환산하며 특정 거래소의 실시간 가격을 제공하지 않습니다.",
      "en": "Synthetic prices and history for XRP (XRP). Sample XRP/USDC values are converted into USD and do not represent live exchange prices."
    },
    "themes": {
      "ko": [
        "디지털 자산",
        "유동성",
        "달러"
      ],
      "en": [
        "Digital assets",
        "Liquidity",
        "USD"
      ]
    },
    "headlines": {
      "ko": [
        "엑스알피와 함께 살펴볼 시장 지표",
        "가격의 출처와 표시 통화 확인하기",
        "예시 차트의 변동 흐름 읽기"
      ],
      "en": [
        "Market context alongside XRP",
        "Checking price sources and display currency",
        "Reading changes in a sample chart"
      ]
    }
  },
  "SPACEX": {
    "description": {
      "ko": "화면 구성을 위해 추가한 검토 후보입니다. 가격과 차트는 임의로 만든 예시이며, 연계 토큰·거래쌍·계약 단위·상장 여부와 IPO 일정은 확인되지 않았습니다. 실제 주가나 공모가가 아닙니다.",
      "en": "A candidate added to preview the interface. Prices and charts are invented examples. Linked tokens, trading pairs, contract units, listing status and IPO timing are unverified. These are not actual share prices or IPO prices."
    },
    "themes": {
      "ko": [
        "검토 후보",
        "기업 연계 자산",
        "예시 데이터"
      ],
      "en": [
        "Candidate",
        "Company-linked assets",
        "Sample data"
      ]
    },
    "headlines": {
      "ko": [
        "상장 일정과 검토 후보를 구분하기",
        "기업 연계 상품의 계약 조건 확인하기",
        "예시 가격과 기업가치를 구분하는 이유"
      ],
      "en": [
        "Candidates versus confirmed IPO schedules",
        "Checking terms of company-linked products",
        "Sample prices versus company valuations"
      ]
    }
  },
  "DATABRICKS": {
    "description": {
      "ko": "화면 구성을 위해 추가한 검토 후보입니다. 가격과 차트는 임의로 만든 예시이며, 연계 토큰·거래쌍·계약 단위·상장 여부와 IPO 일정은 확인되지 않았습니다. 실제 주가나 공모가가 아닙니다.",
      "en": "A candidate added to preview the interface. Prices and charts are invented examples. Linked tokens, trading pairs, contract units, listing status and IPO timing are unverified. These are not actual share prices or IPO prices."
    },
    "themes": {
      "ko": [
        "검토 후보",
        "기업 연계 자산",
        "예시 데이터"
      ],
      "en": [
        "Candidate",
        "Company-linked assets",
        "Sample data"
      ]
    },
    "headlines": {
      "ko": [
        "상장 일정과 검토 후보를 구분하기",
        "기업 연계 상품의 계약 조건 확인하기",
        "예시 가격과 기업가치를 구분하는 이유"
      ],
      "en": [
        "Candidates versus confirmed IPO schedules",
        "Checking terms of company-linked products",
        "Sample prices versus company valuations"
      ]
    }
  },
  "PCE": {
    "description": {
      "ko": "미국 개인소비지출 물가의 전년동월비를 나타내는 합성 예시입니다. 값은 %, 이전 예시와의 차이는 %p이며 실제 발표값·관측기간·출처는 미제공입니다.",
      "en": "Synthetic year-over-year US PCE inflation. Values use percent and differences use percentage points. Actual releases, observation periods and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "미국 PCE의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of US PCE",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "KRCPI": {
    "description": {
      "ko": "한국 소비자물가의 전년동월비를 나타내는 합성 예시입니다. 값은 %, 이전 예시와의 차이는 %p이며 실제 발표값·관측기간·출처는 미제공입니다.",
      "en": "Synthetic year-over-year Korean CPI inflation. Values use percent and differences use percentage points. Actual releases, observation periods and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "한국 CPI의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of Korea CPI",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "UNRATE": {
    "description": {
      "ko": "미국 실업률의 합성 예시입니다. 경제활동인구 중 실업자의 비율을 %로 표시하며 이전 예시와의 차이는 %p입니다. 실제 발표값·계절조정 조건·발표일은 확인하지 않았습니다.",
      "en": "A synthetic US unemployment rate: unemployed people as a percentage of the labor force. Differences use percentage points. Actual releases, seasonal-adjustment conditions and dates are unverified."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "미국 실업률의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of US unemployment",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "WAGE": {
    "description": {
      "ko": "미국 평균 시간당 임금의 전년동월비 합성 예시입니다. 시간당 달러 금액이 아닌 임금 상승률(%)이며 이전 예시와의 차이는 %p입니다. 실제 발표값·출처는 미제공입니다.",
      "en": "Synthetic year-over-year growth in US average hourly earnings. This is a growth rate in percent, not dollars per hour; differences use percentage points. Actual releases and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "미국 시간당 임금의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of US hourly earnings",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "LFPR": {
    "description": {
      "ko": "미국 경제활동참가율의 합성 예시입니다. 민간 비제도권 16세 이상 인구 중 경제활동인구의 비율을 %로 표시하며 변화는 %p입니다. 실제 발표값·관측기간·출처는 미제공입니다.",
      "en": "A synthetic US labor-force participation rate: the labor force as a percentage of the civilian noninstitutional population aged 16 and over. Differences use percentage points. Actual releases, observation periods and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "미국 경제활동참가율의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of US participation",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "EFFR": {
    "description": {
      "ko": "실효 연방기금금리(EFFR)의 합성 예시입니다. 연준 목표금리 범위와 구분하며 값은 %, 변화는 bp입니다. 실제 관측값·기준일·출처는 미제공입니다.",
      "en": "A synthetic effective federal funds rate (EFFR), distinct from the Fed target range. Values use percent and changes use basis points. Actual observations, reference dates and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "실효 연방기금금리의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of Effective Fed funds",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  },
  "SOFR": {
    "description": {
      "ko": "담보부 익일금리(SOFR)의 합성 예시입니다. 미국 국채 담보 익일 자금시장의 금리를 나타내며 값은 %, 변화는 bp입니다. 실제 관측값·기준일·출처는 미제공입니다.",
      "en": "A synthetic secured overnight financing rate (SOFR) for overnight borrowing secured by US Treasuries. Values use percent and changes use basis points. Actual observations, reference dates and sources are not provided."
    },
    "themes": {
      "ko": [
        "경제지표",
        "발표 추이",
        "단위와 기준일"
      ],
      "en": [
        "Economic data",
        "Release trend",
        "Units and reference dates"
      ]
    },
    "headlines": {
      "ko": [
        "담보부 익일금리의 단위와 의미",
        "현재 값과 이전 발표값 함께 읽기",
        "발표 주기와 기준일을 확인하는 이유"
      ],
      "en": [
        "Units and meaning of SOFR",
        "Reading current and previous observations",
        "Checking release frequency and reference dates"
      ]
    }
  }
})
