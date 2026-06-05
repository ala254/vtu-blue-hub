// Static catalog of providers/plans. Safe for client.
import mtnLogo from "@/assets/networks/mtn.asset.json";
import gloLogo from "@/assets/networks/glo.asset.json";
import airtelLogo from "@/assets/networks/airtel.asset.json";
import nineMobileLogo from "@/assets/networks/9mobile.asset.json";

export const NETWORKS = [
  { id: "mtn", label: "MTN", logo: mtnLogo.url },
  { id: "glo", label: "Glo", logo: gloLogo.url },
  { id: "airtel", label: "Airtel", logo: airtelLogo.url },
  { id: "9mobile", label: "9mobile", logo: nineMobileLogo.url },
] as const;

export const DATA_PLANS: Record<string, { id: string; label: string; price: number }[]> = {
  mtn: [
    { id: "mtn-500mb", label: "500MB · 30 days", price: 350 },
    { id: "mtn-1gb", label: "1GB · 30 days", price: 480 },
    { id: "mtn-2gb", label: "2GB · 30 days", price: 960 },
    { id: "mtn-5gb", label: "5GB · 30 days", price: 2400 },
  ],
  glo: [
    { id: "glo-1gb", label: "1GB · 14 days", price: 470 },
    { id: "glo-2gb", label: "2.5GB · 30 days", price: 940 },
  ],
  airtel: [
    { id: "airtel-1gb", label: "1GB · 7 days", price: 490 },
    { id: "airtel-2gb", label: "2GB · 30 days", price: 980 },
  ],
  "9mobile": [
    { id: "9m-1gb", label: "1GB · 30 days", price: 500 },
    { id: "9m-2gb", label: "2GB · 30 days", price: 1000 },
  ],
};

export const DISCOS = [
  { id: "ikeja-electric", label: "Ikeja Electric" },
  { id: "eko-electric", label: "Eko Electric" },
  { id: "abuja-electric", label: "Abuja Electric" },
  { id: "kano-electric", label: "Kano Electric" },
  { id: "ph-electric", label: "PH Electric" },
  { id: "ibadan-electric", label: "Ibadan Electric" },
  { id: "kaduna-electric", label: "Kaduna Electric" },
  { id: "jos-electric", label: "Jos Electric" },
  { id: "enugu-electric", label: "Enugu Electric" },
];

export const CABLE_PROVIDERS = [
  {
    id: "dstv",
    label: "DStv",
    plans: [
      { id: "dstv-padi", label: "Padi", price: 4400 },
      { id: "dstv-yanga", label: "Yanga", price: 6000 },
      { id: "dstv-confam", label: "Confam", price: 11000 },
      { id: "dstv-compact", label: "Compact", price: 19000 },
    ],
  },
  {
    id: "gotv",
    label: "GOtv",
    plans: [
      { id: "gotv-smallie", label: "Smallie", price: 1575 },
      { id: "gotv-jinja", label: "Jinja", price: 3950 },
      { id: "gotv-jolli", label: "Jolli", price: 5800 },
      { id: "gotv-max", label: "Max", price: 8500 },
    ],
  },
  {
    id: "startimes",
    label: "StarTimes",
    plans: [
      { id: "star-nova", label: "Nova", price: 1700 },
      { id: "star-basic", label: "Basic", price: 3300 },
      { id: "star-smart", label: "Smart", price: 4200 },
    ],
  },
];

export const EXAM_PINS = [
  { id: "waec", label: "WAEC", price: 3500 },
  { id: "neco", label: "NECO", price: 1200 },
  { id: "nabteb", label: "NABTEB", price: 850 },
  { id: "jamb", label: "JAMB", price: 6200 },
];

export const BETTING_PROVIDERS = [
  { id: "bet9ja", label: "Bet9ja" },
  { id: "sportybet", label: "SportyBet" },
  { id: "betking", label: "BetKing" },
  { id: "1xbet", label: "1xBet" },
  { id: "nairabet", label: "NairaBet" },
];

export const formatNaira = (n: number) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
