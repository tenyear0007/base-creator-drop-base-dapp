# Base Drop Pass

## Base.dev fields

App Name:
Base Drop Pass

Tagline:
Claim limited creator drops

Description:
Claim a limited creator pass on Base, record a zero-value onchain signal, and share a polished collectible receipt.

Domain:
Use the production Vercel domain after deployment.

Category:
Creator / Collectibles / Social

## What the app does

Base Drop Pass is a mobile-first creator drop page. A fan connects a wallet, claims a limited Studio Signal Pass, records the action with a 0 ETH Base transaction, and receives a shareable receipt card.

## Review notes

- Standard Next.js web app.
- Supports Base and Base Sepolia through wagmi/viem.
- The claim action uses a zero-value transaction, so there is no payment or token sale promise.
- The included contract in `contracts/BaseCreatorDrop.sol` is a reference path for a future indexed claim event.
- Mobile screenshots are generated at `1284 x 2778px` for Base.dev.

## Asset files

- App icon: `base-submission/app-icon.jpg`
- Thumbnail: `base-submission/app-thumbnail.jpg`
- Screenshots:
  - `base-submission/screenshot-1.png`
  - `base-submission/screenshot-2.png`
  - `base-submission/screenshot-3.png`

## Environment variables

Optional:

`NEXT_PUBLIC_DROP_CREATOR_ADDRESS=0xYourBaseCreatorWallet`

If this is not set, the app can still preview and records the zero-value claim to the connected wallet address.
