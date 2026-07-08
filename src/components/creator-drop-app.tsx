"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Gem,
  ImageIcon,
  Loader2,
  LockKeyhole,
  Radio,
  ReceiptText,
  Share2,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Wallet,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { isAddress } from "viem";
import { supportedChains } from "@/lib/wagmi";

const storageKey = "base-drop-pass-claim";
const dropSupply = 300;
const baseClaimed = 187;
const defaultCreatorAddress = process.env.NEXT_PUBLIC_DROP_CREATOR_ADDRESS;

type StoredClaim = {
  claimed: boolean;
  edition: number;
  date: string;
  hash?: `0x${string}`;
};

const dropHighlights = [
  ["Edition", "Open Run 01"],
  ["Supply", "300 passes"],
  ["Signal", "0 ETH claim"],
];

const perks = [
  {
    title: "Collector pass",
    copy: "A clean receipt card made for sharing after the claim.",
    icon: TicketCheck,
  },
  {
    title: "Creator note",
    copy: "A compact drop page for updates, artwork, and early supporters.",
    icon: ReceiptText,
  },
  {
    title: "Base ready",
    copy: "Wallet connect, network switch, explorer link, and mobile layout.",
    icon: ShieldCheck,
  },
];

function readStored(): StoredClaim {
  if (typeof window === "undefined") {
    return { claimed: false, edition: baseClaimed + 1, date: "" };
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    return value
      ? JSON.parse(value)
      : { claimed: false, edition: baseClaimed + 1, date: "" };
  } catch {
    return { claimed: false, edition: baseClaimed + 1, date: "" };
  }
}

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function chainName(chainId?: number) {
  if (chainId === base.id) return "Base";
  if (chainId === baseSepolia.id) return "Base Sepolia";
  return "Unsupported";
}

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export function CreatorDropApp() {
  const [stored, setStored] = useState<StoredClaim>(() => readStored());
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [collectorName, setCollectorName] = useState("Base collector");

  const { address, connector, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    sendTransaction,
    data: hash,
    isPending: isSending,
    error,
  } = useSendTransaction();

  const isSupported = supportedChains.some((chain) => chain.id === chainId);
  const primaryConnector = connectors[0];
  const activeHash = hash ?? stored.hash;
  const creatorAddress =
    defaultCreatorAddress && isAddress(defaultCreatorAddress)
      ? defaultCreatorAddress
      : address;
  const claimedCount = stored.claimed ? baseClaimed + 1 : baseClaimed;
  const progress = Math.round((claimedCount / dropSupply) * 100);
  const edition = stored.edition || baseClaimed + 1;

  const explorerUrl = useMemo(() => {
    if (!activeHash) return "";
    const root =
      chainId === baseSepolia.id
        ? "https://sepolia.basescan.org"
        : "https://basescan.org";
    return `${root}/tx/${activeHash}`;
  }, [activeHash, chainId]);

  function saveClaim(nextHash?: `0x${string}`) {
    const next = {
      claimed: true,
      edition,
      date: todayLabel(),
      hash: nextHash,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setStored(next);
  }

  function claimDrop(event?: FormEvent) {
    event?.preventDefault();

    if (!isConnected) {
      if (primaryConnector) connect({ connector: primaryConnector });
      return;
    }

    if (!isSupported) {
      switchChain({ chainId: base.id });
      return;
    }

    if (!creatorAddress || !isAddress(creatorAddress)) {
      saveClaim();
      return;
    }

    sendTransaction(
      {
        to: creatorAddress,
        value: BigInt(0),
      },
      {
        onSuccess: (nextHash) => saveClaim(nextHash),
      },
    );
  }

  async function copyReceipt() {
    const text = `I claimed Creator Drop Pass #${edition} on Base Drop Pass.`;
    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function shareReceipt() {
    const text = `I claimed Creator Drop Pass #${edition} on Base.`;

    if (navigator.share) {
      await navigator.share({
        title: "Base Drop Pass",
        text,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setShared(true);
    window.setTimeout(() => setShared(false), 1200);
  }

  const buttonLabel = !isConnected
    ? "Connect wallet"
    : !isSupported
      ? "Switch to Base"
      : stored.claimed
        ? "Claimed"
        : "Claim drop pass";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1e8] text-[#171310]">
      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,#f7f1e8_0%,#fffaf1_46%,#dde8ff_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(23,19,16,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(23,19,16,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-7 lg:px-10">
          <header className="flex items-center justify-between gap-3 border-b border-[#171310]/12 pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-[#171310] text-[#fffaf1] shadow-[0_12px_30px_rgba(23,19,16,0.18)]">
                <Gem className="size-5 text-[#ffb23f]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold uppercase tracking-[0.16em]">
                  Base Drop Pass
                </p>
                <p className="truncate text-xs text-[#6d6256]">
                  Limited creator claim
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#171310]/12 bg-white/55 px-3 py-2 text-xs font-semibold text-[#4d453e] backdrop-blur">
              <Radio className="size-3.5 text-[#0052ff]" />
              {chainName(chainId)}
            </div>
          </header>

          <div className="grid flex-1 items-center gap-5 py-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:py-9">
            <section className="order-2 lg:order-1">
              <div className="mx-auto max-w-[590px]">
                <div className="mb-4 flex items-center justify-between gap-3 rounded-full border border-[#171310]/12 bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4d453e] backdrop-blur">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="size-4 text-[#ff5a3d]" />
                    Creator drop
                  </span>
                  <span>{claimedCount}/{dropSupply}</span>
                </div>

                <h1 className="font-[var(--font-display)] text-[3.15rem] font-black leading-[0.92] tracking-normal text-[#171310] sm:text-7xl lg:text-8xl">
                  Claim the studio pass.
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-[#5f554c] sm:text-lg">
                  A limited creator drop for Base collectors. Connect, claim a
                  zero-value onchain signal, and keep a shareable pass receipt.
                </p>

                <form
                  onSubmit={claimDrop}
                  className="mt-5 overflow-hidden rounded-[1.6rem] border border-[#171310]/14 bg-[#fffaf1] shadow-[0_24px_80px_rgba(23,19,16,0.14)]"
                >
                  <div className="grid grid-cols-[1fr_auto] items-stretch">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0052ff]">
                            Drop 01
                          </p>
                          <h2 className="mt-1 text-2xl font-black">
                            Studio Signal Pass
                          </h2>
                        </div>
                        <div className="grid size-12 place-items-center rounded-full bg-[#ff5a3d] text-white">
                          <ImageIcon className="size-5" />
                        </div>
                      </div>

                      <label className="mt-5 block">
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d6256]">
                          Collector name
                        </span>
                        <input
                          value={collectorName}
                          onChange={(event) => setCollectorName(event.target.value)}
                          className="mt-2 h-12 w-full rounded-2xl border border-[#171310]/12 bg-white px-4 text-sm font-semibold text-[#171310] outline-none transition focus:border-[#0052ff] focus:ring-4 focus:ring-[#0052ff]/12"
                          placeholder="Base collector"
                        />
                      </label>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[#6d6256]">
                          <span>Mint progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#171310]/10">
                          <div
                            className="h-full rounded-full bg-[#0052ff]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isConnecting || isSwitching || isSending || stored.claimed}
                        className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#171310] px-5 text-sm font-black text-[#fffaf1] shadow-[0_18px_40px_rgba(23,19,16,0.24)] transition hover:bg-[#2b241f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isConnecting || isSwitching || isSending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : stored.claimed ? (
                          <CheckCircle2 className="size-4 text-[#39b67f]" />
                        ) : !isConnected ? (
                          <Wallet className="size-4" />
                        ) : !isSupported ? (
                          <ShieldCheck className="size-4" />
                        ) : (
                          <TicketCheck className="size-4" />
                        )}
                        {buttonLabel}
                      </button>
                    </div>

                    <div className="relative hidden w-12 border-l border-dashed border-[#171310]/25 bg-[#ffcf5a] sm:block">
                      <div className="absolute -left-3 top-8 size-6 rounded-full bg-[#f7f1e8]" />
                      <div className="absolute -left-3 bottom-8 size-6 rounded-full bg-[#f7f1e8]" />
                    </div>
                  </div>
                </form>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {dropHighlights.map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#171310]/10 bg-white/55 px-3 py-3 backdrop-blur"
                    >
                      <p className="text-sm font-black">{value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#74675c]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="order-1 lg:order-2">
              <div className="mx-auto grid max-w-[560px] gap-4">
                <div className="relative overflow-hidden rounded-[2rem] border border-[#171310]/14 bg-[#171310] p-4 text-[#fffaf1] shadow-[0_28px_100px_rgba(23,19,16,0.24)]">
                  <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(90deg,#ff5a3d,#ffcf5a,#0052ff)] opacity-90" />
                  <div className="relative grid min-h-[430px] content-between rounded-[1.45rem] border border-white/16 bg-[#171310] p-5">
                    <div>
                      <div className="mb-8 flex items-center justify-between">
                        <span className="rounded-full border border-white/16 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/72">
                          Base Gallery
                        </span>
                        <LockKeyhole className="size-5 text-[#ffcf5a]" />
                      </div>

                      <p className="font-[var(--font-display)] text-[4.6rem] font-black leading-[0.82] tracking-normal sm:text-[5.5rem]">
                        Studio
                        <br />
                        Signal
                      </p>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">
                          Claimer
                        </p>
                        <p className="mt-1 truncate text-lg font-black">
                          {collectorName || "Base collector"}
                        </p>
                      </div>
                      <div className="grid size-20 place-items-center rounded-3xl bg-[#fffaf1] text-[#171310]">
                        <span className="font-[var(--font-display)] text-3xl font-black">
                          #{edition}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {perks.map((perk) => (
                    <div
                      key={perk.title}
                      className="rounded-[1.25rem] border border-[#171310]/10 bg-white/65 p-4 backdrop-blur"
                    >
                      <perk.icon className="mb-3 size-5 text-[#0052ff]" />
                      <p className="text-sm font-black">{perk.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#6d6256]">
                        {perk.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="border-t border-[#171310]/12 bg-[#fffaf1] px-4 py-6 sm:px-7 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-[1.5rem] border border-[#171310]/12 bg-[#f7f1e8] p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-[#ff5a3d]" />
              <h2 className="text-lg font-black">Claim receipt</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ["Status", stored.claimed ? "Claimed" : "Ready"],
                ["Edition", `#${edition} of ${dropSupply}`],
                ["Wallet", shortAddress(address) || "Not connected"],
                ["Date", stored.date || todayLabel()],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-[#171310]/10 bg-white px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[#6d6256]">{label}</p>
                  <p className="text-sm font-black">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {isConnected ? (
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#171310]/12 bg-white px-4 text-sm font-black"
                >
                  <Wallet className="size-4" />
                  {shortAddress(address)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => primaryConnector && connect({ connector: primaryConnector })}
                  disabled={!primaryConnector || isConnecting}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#171310]/12 bg-white px-4 text-sm font-black disabled:opacity-60"
                >
                  <Wallet className="size-4" />
                  Connect wallet
                </button>
              )}

              <button
                type="button"
                onClick={copyReceipt}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0052ff] px-4 text-sm font-black text-white"
              >
                <Copy className="size-4" />
                {copied ? "Copied" : "Copy receipt"}
              </button>
            </div>

            {activeHash && explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-between rounded-2xl border border-[#39b67f]/30 bg-[#e9f8ef] px-4 py-3 text-sm font-black text-[#17633e]"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  View claim on Basescan
                </span>
                <ArrowUpRight className="size-4" />
              </a>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-[#ff5a3d]/30 bg-[#fff0eb] px-4 py-3 text-sm font-semibold text-[#9d2e1a]">
                {error.message}
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-[#171310]/12 bg-[#171310] p-5 text-[#fffaf1]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffcf5a]">
                  Share card
                </p>
                <h2 className="mt-1 text-2xl font-black">Creator Drop Pass</h2>
              </div>
              <BadgeCheck className="size-7 text-[#39b67f]" />
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-white/14 bg-white/8 p-4">
              <p className="font-[var(--font-display)] text-4xl font-black leading-none">
                {collectorName || "Base collector"}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Claimed Studio Signal Pass #{edition}. This receipt is designed
                for Base App sharing after the wallet action completes.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Claim", "Keep", "Share"].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-white/8 px-3 py-3 text-center"
                  >
                    <p className="text-xs font-bold text-[#ffcf5a]">{index + 1}</p>
                    <p className="mt-1 text-sm font-black">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={shareReceipt}
              className="mt-4 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#ffcf5a] px-4 text-sm font-black text-[#171310]"
            >
              <Share2 className="size-4" />
              {shared ? "Copied share text" : "Share pass"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
