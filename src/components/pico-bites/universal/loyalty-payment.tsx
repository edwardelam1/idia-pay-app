/**
 * Universal `pico.loyalty.*` + `pico.payment.*` catalog.
 * Amounts/limits/tender types come from blueprint config; every list-shaped
 * bite falls back to <SterileState/>. No mock rows.
 */
import { useState } from "react";
import { Star, Gift, CreditCard, DollarSign, Wallet, Landmark, Coins, ReceiptText, ArrowLeftRight } from "lucide-react";
import type { PicoBiteProps } from "@/lib/idia/pico-bite";
import { GateOverlay, SterileState } from "./_shared";

type LP = PicoBiteProps<Record<string, unknown>, unknown>;

export const LoyaltyScanPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "scan_loyalty" })} className="relative w-full h-20 bg-amber-950/20 border border-amber-900/50 hover:bg-amber-900/30 text-amber-300 flex items-center justify-center gap-3">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Star size={20} /><span className="text-xs font-bold uppercase tracking-widest">Scan Loyalty</span>
  </button>
);

export const RewardRedeemPicoBite: React.FC<LP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const rewards = (config?.rewards as Array<{ id: string; label: string; cost: number }>) || [];
  if (rewards.length === 0) return <SterileState label="NO REWARDS AVAILABLE" icon={<Gift size={20} />} />;
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 divide-y divide-slate-900">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      {rewards.map((r) => (
        <button key={r.id} onClick={() => onAction(telemetryTag, { action: "redeem_reward", id: r.id })} className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-900">
          <span className="text-sm text-slate-200">{r.label}</span><span className="text-xs text-amber-400 font-mono">{r.cost} pts</span>
        </button>
      ))}
    </div>
  );
};

export const PointsBalancePicoBite: React.FC<LP> = ({ config }) => {
  const pts = (config?.points as number) ?? null;
  return (
    <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-950 border border-slate-800">
      <span className="text-[10px] uppercase text-slate-500 tracking-widest flex items-center gap-1"><Star size={12} /> Points</span>
      <span className="text-lg font-mono text-amber-400">{pts === null ? "--" : pts.toLocaleString()}</span>
    </div>
  );
};

export const GiftCardSwipePicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "swipe_gift" })} className="relative w-full h-20 bg-pink-950/20 border border-pink-900/50 hover:bg-pink-900/30 text-pink-300 flex items-center justify-center gap-3">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Gift size={20} /><span className="text-xs font-bold uppercase tracking-widest">Swipe Gift Card</span>
  </button>
);

export const CashTenderPicoBite: React.FC<LP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const quick = (config?.quickAmounts as number[]) || [];
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest flex items-center gap-1"><DollarSign size={12} /> Cash Tender</div>
      <div className="grid grid-cols-4 gap-2">
        {quick.length === 0 ? <span className="col-span-4 text-[10px] uppercase text-slate-600">Awaiting amounts</span> :
          quick.map((v) => (<button key={v} onClick={() => onAction(telemetryTag, { action: "tender_cash", amount: v })} className="h-10 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-sm font-mono">${v}</button>))}
      </div>
      <button onClick={() => onAction(telemetryTag, { action: "tender_custom" })} className="h-9 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase">Custom</button>
    </div>
  );
};

export const CardTenderPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "tender_card" })} className="relative w-full h-20 bg-blue-950/30 border border-blue-900/50 hover:bg-blue-900/50 text-blue-300 flex items-center justify-center gap-3">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <CreditCard size={20} /><span className="text-xs font-bold uppercase tracking-widest">Card Tender</span>
  </button>
);

export const WalletTenderPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "tender_wallet" })} className="relative w-full h-20 bg-purple-950/30 border border-purple-900/50 hover:bg-purple-900/50 text-purple-300 flex items-center justify-center gap-3">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Wallet size={20} /><span className="text-xs font-bold uppercase tracking-widest">Wallet / USDC</span>
  </button>
);

export const SplitCheckPicoBite: React.FC<LP> = ({ telemetryTag, onAction, gateSatisfied, gateReason }) => {
  const [n, setN] = useState(2);
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-1"><ArrowLeftRight size={12} /> Split Check</div>
      <div className="flex items-center gap-2">
        <button onClick={() => setN((v) => Math.max(2, v - 1))} className="w-9 h-9 bg-slate-800 text-white">−</button>
        <span className="flex-1 text-center text-2xl font-mono text-white">{n}</span>
        <button onClick={() => setN((v) => Math.min(20, v + 1))} className="w-9 h-9 bg-slate-800 text-white">+</button>
      </div>
      <button onClick={() => onAction(telemetryTag, { action: "split_check", n })} className="h-9 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold uppercase">Split</button>
    </div>
  );
};

export const TipPromptPicoBite: React.FC<LP> = ({ telemetryTag, config, onAction, gateSatisfied, gateReason }) => {
  const percents = (config?.presets as number[]) || [15, 18, 20, 25];
  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 p-3 flex flex-col gap-2">
      <GateOverlay satisfied={gateSatisfied} reason={gateReason} />
      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Add Tip</div>
      <div className="grid grid-cols-4 gap-2">
        {percents.map((p) => (<button key={p} onClick={() => onAction(telemetryTag, { action: "tip_percent", pct: p })} className="h-11 bg-slate-800 hover:bg-slate-700 text-white font-mono">{p}%</button>))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onAction(telemetryTag, { action: "tip_custom" })} className="h-9 bg-slate-800 text-white text-xs font-bold uppercase">Custom</button>
        <button onClick={() => onAction(telemetryTag, { action: "tip_none" })} className="h-9 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold uppercase">No Tip</button>
      </div>
    </div>
  );
};

export const RefundInitPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "init_refund" })} className="relative w-full h-14 bg-red-950/30 border border-red-900/50 hover:bg-red-900/40 text-red-300 flex items-center justify-center gap-2">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <ReceiptText size={16} /><span className="text-xs font-bold uppercase tracking-widest">Initiate Refund</span>
  </button>
);

export const SettlementBatchPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "close_batch" })} className="relative w-full h-14 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-100 flex items-center justify-center gap-2">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Landmark size={16} /><span className="text-xs font-bold uppercase tracking-widest">Close Settlement Batch</span>
  </button>
);

export const CryptoPayPicoBite: React.FC<LP> = (p) => (
  <button onClick={() => p.onAction(p.telemetryTag, { action: "crypto_pay" })} className="relative w-full h-20 bg-orange-950/30 border border-orange-900/50 hover:bg-orange-900/50 text-orange-300 flex items-center justify-center gap-3">
    <GateOverlay satisfied={p.gateSatisfied} reason={p.gateReason} />
    <Coins size={20} /><span className="text-xs font-bold uppercase tracking-widest">Pay w/ Crypto</span>
  </button>
);
