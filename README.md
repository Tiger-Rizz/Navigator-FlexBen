# Navigator Flex: private medical insurance prototype

An AI-native flexible benefits experience inside Navigator for a UK PMI benefit. Fictional employer (Meridian Group) and scheme. See `CLAUDE.md` for the brief and `DECISIONS.md` for every judgement call.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000: the demo room; Navigator home is /home, tour A at /home?tour=1
npm test         # pricing, claims, rules and AI-layer tests
npm run build
```

## Environment variables

| Name | Required | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Turns on live AI answers. Without it the app runs on scripted answers and shows a "Demo mode" badge. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-5-5`. |
| `DEMO_PASSCODE` | No | If set, visitors enter this passcode once (remembered for 7 days). |

Every price and tax figure comes from `lib/engine`, never from the model. The guided tour always uses the scripted AI, so it works without a key.
