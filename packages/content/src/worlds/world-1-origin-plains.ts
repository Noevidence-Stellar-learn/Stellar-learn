import type { World } from '../curriculum/types'

export const world1: World = {
  id: 'world-1-origin-plains',
  slug: 'origin-plains',
  title: 'The Origin Plains',
  subtitle: 'Where every journey begins',
  description:
    'Awaken in the Origin Plains and learn the ancient foundations of blockchain — the magic that powers the entire Stellar realm.',
  theme: 'forest',
  order: 1,
  xpReward: 500,
  bossName: 'The Doubt Wraith',
  bossDescription:
    'A creature of confusion and misinformation. Defeat it by proving you understand the fundamentals.',
  quests: [
    {
      id: 'q1-1-what-is-blockchain',
      worldId: 'world-1-origin-plains',
      slug: 'what-is-blockchain',
      title: 'What is Blockchain?',
      description: 'Discover the ancient ledger magic that powers the digital realm.',
      type: 'lesson',
      order: 1,
      xpReward: 50,
      estimatedMinutes: 5,
      content: [
        {
          type: 'text',
          content:
            '## The Magic Ledger\n\nImagine a magical book that thousands of wizards all share. When anyone writes in it, *every wizard gets the same update instantly* — and no single wizard can erase or change what was written. That magic book is called a **blockchain**.',
        },
        {
          type: 'callout',
          variant: 'info',
          content:
            '**Blockchain** = a chain of records (blocks) shared across many computers (nodes) so no single person controls it.',
        },
        {
          type: 'text',
          content:
            '## Why Does This Matter?\n\nTraditional banking requires you to *trust* a bank to keep your records. Blockchain removes the need for that trust — the math does the trusting for you. This is called being **trustless** (trust the code, not the company).',
        },
        {
          type: 'callout',
          variant: 'tip',
          content:
            '**Key idea:** Blockchains are *decentralized* — no single company, government, or person controls them.',
        },
        {
          type: 'text',
          content:
            '## How Blocks Are Chained\n\nEach block contains:\n- A list of recent transactions\n- A fingerprint of the previous block (called a **hash**)\n- A timestamp\n\nBecause each block references the one before it, changing any old block would break all the blocks after it — making tampering obvious and impossible.',
        },
      ],
    },
    {
      id: 'q1-2-what-is-stellar',
      worldId: 'world-1-origin-plains',
      slug: 'what-is-stellar',
      title: 'Enter the Stellar Realm',
      description: 'Learn what makes Stellar unique among all blockchains.',
      type: 'lesson',
      order: 2,
      xpReward: 50,
      estimatedMinutes: 6,
      content: [
        {
          type: 'text',
          content:
            '## The Stellar Realm\n\nNot all blockchains are built the same. Some (like Ethereum) are built for general purpose applications. **Stellar** was built with one clear mission: **move money cheaply, quickly, and across borders**.',
        },
        {
          type: 'callout',
          variant: 'info',
          content:
            'Stellar can settle a transaction in **3–5 seconds** and it costs less than **$0.00001** per transaction.',
        },
        {
          type: 'text',
          content:
            '## Who Created Stellar?\n\nStellar was founded in 2014 by **Jed McCaleb** (co-founder of Ripple) and **Joyce Kim**. It\'s maintained by the **Stellar Development Foundation (SDF)**, a non-profit organization.\n\n## Who Uses Stellar?\n\n- Governments building **CBDCs** (Central Bank Digital Currencies)\n- Companies sending **international payroll**\n- Fintech apps offering **instant remittances**\n- Developers issuing **stablecoins** (like USDC)',
        },
        {
          type: 'callout',
          variant: 'tip',
          content:
            'USDC — one of the world\'s largest stablecoins — runs on Stellar. Billions of dollars flow through Stellar daily.',
        },
      ],
    },
    {
      id: 'q1-3-what-is-xlm',
      worldId: 'world-1-origin-plains',
      slug: 'what-is-xlm',
      title: 'The Realm\'s Currency: XLM',
      description: 'Discover Lumens — the lifeblood of the Stellar network.',
      type: 'lesson',
      order: 3,
      xpReward: 50,
      estimatedMinutes: 5,
      content: [
        {
          type: 'text',
          content:
            '## Lumens (XLM)\n\nEvery realm has a currency. In Stellar, it\'s **XLM** (also called *Lumens*).\n\nXLM has three jobs:\n1. **Pay transaction fees** — tiny fractions of XLM per transaction\n2. **Minimum account balance** — each account must hold at least 1 XLM to exist\n3. **Bridge currency** — when converting between two assets, XLM can act as the bridge',
        },
        {
          type: 'callout',
          variant: 'info',
          content:
            'The minimum account reserve is **1 XLM** (2 base reserves × 0.5 XLM). Think of it as a security deposit to keep spam accounts off the network.',
        },
        {
          type: 'text',
          content:
            '## XLM vs. Bitcoin\n\n| | XLM | Bitcoin |\n|---|---|---|\n| Speed | ~5 seconds | ~10 minutes |\n| Fee | ~$0.00001 | ~$1–$50 |\n| Purpose | Payments | Store of value |\n| Energy | Minimal | Enormous (mining) |',
        },
      ],
    },
    {
      id: 'q1-4-how-scp-works',
      worldId: 'world-1-origin-plains',
      slug: 'stellar-consensus-protocol',
      title: 'The Council of Agreement',
      description: 'How does Stellar decide what\'s true? Meet the Stellar Consensus Protocol.',
      type: 'lesson',
      order: 4,
      xpReward: 50,
      estimatedMinutes: 7,
      content: [
        {
          type: 'text',
          content:
            '## The Problem: Who\'s Right?\n\nIf thousands of computers all share the ledger, how do they agree on what happened? This is the **consensus problem**.\n\n**Bitcoin\'s answer:** Whoever does the most computational work wins (Proof of Work — slow and energy-hungry).\n\n**Stellar\'s answer:** A council of trusted nodes vote. Called the **Stellar Consensus Protocol (SCP)**.',
        },
        {
          type: 'callout',
          variant: 'info',
          content:
            '**SCP** uses *Federated Byzantine Agreement* — nodes form overlapping trust circles ("quorum slices") and reach agreement through voting rounds. No mining required.',
        },
        {
          type: 'text',
          content:
            '## The Council Analogy\n\nImagine 1,000 wizards in different guilds. Each guild trusts certain other guilds. When a transaction happens:\n1. Your guild votes on it\n2. They check with the guilds they trust\n3. When enough overlapping guilds agree → the transaction is confirmed\n\nThis happens in **~5 seconds**, using almost **no energy**.',
        },
      ],
    },
    {
      id: 'q1-5-world1-quiz',
      worldId: 'world-1-origin-plains',
      slug: 'origin-plains-quiz',
      title: 'Quiz: Test Your Knowledge',
      description: 'Answer 5 questions to prove you\'ve mastered the fundamentals.',
      type: 'quiz',
      order: 5,
      xpReward: 100,
      estimatedMinutes: 5,
      content: [
        {
          id: 'q1',
          question: 'What makes a blockchain "trustless"?',
          options: [
            { id: 'a', text: 'You don\'t need to trust anyone — math and code guarantee the rules', isCorrect: true },
            { id: 'b', text: 'The government guarantees it', isCorrect: false },
            { id: 'c', text: 'Only verified users can participate', isCorrect: false },
            { id: 'd', text: 'Transactions require manual approval', isCorrect: false },
          ],
          explanation: 'Trustless means the protocol\'s rules are enforced by code and cryptography — no human or organization needs to be trusted.',
        },
        {
          id: 'q2',
          question: 'What is XLM used for on Stellar? (Select all that apply)',
          options: [
            { id: 'a', text: 'Paying transaction fees', isCorrect: true },
            { id: 'b', text: 'Minimum account balance', isCorrect: true },
            { id: 'c', text: 'Buying NFTs exclusively', isCorrect: false },
            { id: 'd', text: 'Acting as a bridge currency in swaps', isCorrect: true },
          ],
          explanation: 'XLM serves three roles: fees, minimum balance (reserve), and bridging between assets during path payments.',
        },
        {
          id: 'q3',
          question: 'How long does a Stellar transaction take to finalize?',
          options: [
            { id: 'a', text: '~10 minutes', isCorrect: false },
            { id: 'b', text: '~5 seconds', isCorrect: true },
            { id: 'c', text: '~1 hour', isCorrect: false },
            { id: 'd', text: '~30 seconds', isCorrect: false },
          ],
          explanation: 'Stellar achieves finality in 3–5 seconds thanks to the Stellar Consensus Protocol, which doesn\'t rely on slow mining.',
        },
        {
          id: 'q4',
          question: 'What does SCP stand for?',
          options: [
            { id: 'a', text: 'Secure Chain Protocol', isCorrect: false },
            { id: 'b', text: 'Stellar Consensus Protocol', isCorrect: true },
            { id: 'c', text: 'Stellar Computing Program', isCorrect: false },
            { id: 'd', text: 'Synchronized Consensus Proof', isCorrect: false },
          ],
          explanation: 'SCP — Stellar Consensus Protocol — is the algorithm that lets Stellar nodes agree on the ledger state without mining.',
        },
        {
          id: 'q5',
          question: 'Which organization maintains the Stellar network?',
          options: [
            { id: 'a', text: 'Google', isCorrect: false },
            { id: 'b', text: 'The Stellar Development Foundation (SDF)', isCorrect: true },
            { id: 'c', text: 'The US Federal Reserve', isCorrect: false },
            { id: 'd', text: 'Jed McCaleb personally', isCorrect: false },
          ],
          explanation: 'The Stellar Development Foundation (SDF) is a non-profit that maintains Stellar\'s core software and ecosystem.',
        },
      ],
    },
  ],
}
