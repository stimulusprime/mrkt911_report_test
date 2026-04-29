window.REPORT_DATA = {
  periods: ["2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"],
  labels: {
    "2025-04": "Квітень 2025",
    "2025-05": "Травень 2025",
    "2025-06": "Червень 2025",
    "2025-07": "Липень 2025",
    "2025-08": "Серпень 2025",
    "2025-09": "Вересень 2025",
    "2025-10": "Жовтень 2025",
    "2025-11": "Листопад 2025",
    "2025-12": "Грудень 2025",
    "2026-01": "Січень",
    "2026-02": "Лютий",
    "2026-03": "Березень"
  },
  dynamics: {
    periods: ["2026-01", "2026-02", "2026-03"],
    revenueMln: [101, 135, 123.6],
    marginMln: [14, 27.2, 23],
    channelsMln: {
      partner: [55.37, 60.51, 52.31],
      btl: [11.09, 35.09, 21.21],
      ppc: [21.93, 29.34, 39.97],
      direct: [12.52, 10.54, 10.06],
      smm: [0.1, 0.09, 0.08]
    },
    ppc: {
      revenueMln: [21.93, 29.34, 39.97],
      sessionsK: [251.7, 305.0, 420.8],
      ordersK: [43.7, 57.7, 81.3]
    },
    email: {
      massK: [4736, 4474, 4791],
      triggerK: [3422, 3302, 4694],
      activeBaseK: [251, 240, 218]
    },
    smm: {
      viewsK: {
        instagram: [82, 165, 130.5],
        tiktok: [0, 261, 356],
        facebook: [0, 34.1, 45.2],
        youtube: [0, 10.1, 18.6],
        threads: [0, 10.7, 13.9]
      },
      marchSubsGrowthPct: [2.16, 0.77, 0.73, 0.62]
    },
    monobank: {
      revenueMln: [23.64, 28.38, 37.61],
      marginMln: [6.15, 7.38, 9.78],
      txK: [59.5, 72.0, 98.5]
    },
    promo: {
      emailAndOtherK: [31.4, 29.3, 45.0],
      partnerK: [60.4, 59.4, 20.1],
      btlK: [22.3, 64.9, 42.4]
    }
  },
  historical: {
    sourceIndexByPeriod: {
      "2025-04": { source: "PPTX", slideCount: 2, firstSlides: [265, 266] },
      "2025-05": { source: "PPTX", slideCount: 2, firstSlides: [265, 266] },
      "2025-06": { source: "PPTX", slideCount: 2, firstSlides: [265, 266] },
      "2025-07": { source: "PPTX", slideCount: 2, firstSlides: [265, 266] },
      "2025-08": { source: "PPTX", slideCount: 2, firstSlides: [265, 266] },
      "2025-09": { source: "PPTX+PDF+HTML", slideCount: 3, firstSlides: [186, 265, 266] },
      "2025-10": { source: "PPTX+PDF+HTML", slideCount: 6, firstSlides: [50, 98, 181, 186, 265, 266] },
      "2025-11": { source: "PPTX+PDF+HTML", slideCount: 6, firstSlides: [50, 98, 181, 186, 265, 266] },
      "2025-12": { source: "PPTX+PDF+HTML", slideCount: 4, firstSlides: [3, 50, 98, 181] },
      "2026-01": { source: "HTML", slideCount: 0, firstSlides: [] },
      "2026-02": { source: "HTML", slideCount: 0, firstSlides: [] },
      "2026-03": { source: "HTML", slideCount: 0, firstSlides: [] }
    },
    sourceCoverage: [
      { period: "2025-04", source: "PDF", hasStructuredMetrics: false },
      { period: "2025-05", source: "PDF", hasStructuredMetrics: false },
      { period: "2025-06", source: "PDF", hasStructuredMetrics: false },
      { period: "2025-07", source: "PDF", hasStructuredMetrics: false },
      { period: "2025-08", source: "PDF", hasStructuredMetrics: false },
      { period: "2025-09", source: "PDF+HTML", hasStructuredMetrics: true },
      { period: "2025-10", source: "PDF+HTML", hasStructuredMetrics: true },
      { period: "2025-11", source: "PDF+HTML", hasStructuredMetrics: true },
      { period: "2025-12", source: "PDF+HTML", hasStructuredMetrics: true },
      { period: "2026-01", source: "HTML", hasStructuredMetrics: true },
      { period: "2026-02", source: "HTML", hasStructuredMetrics: true },
      { period: "2026-03", source: "HTML", hasStructuredMetrics: true }
    ],
    instagramViewsByMonth: [
      { period: "2025-09", views: 240149 },
      { period: "2025-10", views: 415854 },
      { period: "2025-11", views: 222423 },
      { period: "2025-12", views: 314561 },
      { period: "2026-01", views: 82139 },
      { period: "2026-02", views: 165100 },
      { period: "2026-03", views: 130542 }
    ],
    ppcByMonth: [
      {
        period: "2025-12",
        sessions: 276483,
        sharePct: 4.44,
        orders: 44740,
        convPct: 16.2,
        revenueUah: 24366028,
        avgCheckUah: 545
      },
      {
        period: "2026-01",
        sessions: 251714,
        sharePct: 4.7,
        orders: 43735,
        convPct: 17.4,
        revenueUah: 21934375,
        avgCheckUah: 502
      },
      {
        period: "2026-02",
        sessions: 305044,
        sharePct: 5.76,
        orders: 57702,
        convPct: 18.9,
        revenueUah: 29343834,
        avgCheckUah: 509
      },
      {
        period: "2026-03",
        sessions: 420764,
        sharePct: 6.86,
        orders: 81313,
        convPct: 19.3,
        revenueUah: 39965997,
        avgCheckUah: 492
      }
    ]
  }
};
