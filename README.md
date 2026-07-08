# Base Creator Drop

Una app pequeña en Base para creator drops. La experiencia no intenta ser enorme: conectar wallet, opening a compact creator pass, y guardar un drop pass.

## Prueba pública

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a0080cbef4989446dc30c45` |
| Builder Wallet | `0xEe6501C6d317beA3f69103749B61e1B493fF859b` |
| Builder Code | `bc_096de5rw` |
| Live Demo | https://base-creator-drop.vercel.app |
| GitHub Repository | https://github.com/tenyear0007/base-creator-drop-base-dapp |
| Network | Base |
| Deployment | Vercel |

## Desarrollo local

```bash
npm install
npm run dev
```

Hecho con Next.js UI plus wagmi/viem for wallet and Base chain behavior.

Regla básica: Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.
