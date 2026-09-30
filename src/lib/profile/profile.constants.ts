import { FontWeight } from "@maximedrn/react-to-svg";
import {
  siAnsible,
  siC,
  siCaddy,
  siCloudflare,
  siCplusplus,
  siDocker,
  siEffect,
  siEthereum,
  siNestjs,
  siNextdotjs,
  siNginx,
  siNumpy,
  siNuxt,
  siOpencv,
  siPandas,
  siPython,
  siPytorch,
  siReact,
  siRust,
  siSelenium,
  siSolana,
  siSolidity,
  siTensorflow,
  siTypescript,
} from "simple-icons";

const ProfileCopy = {
  about:
    "I am a Master’s student in Computer Science, specializing in Artificial Intelligence and Computer Graphics in France. My work spans web application development, computer vision, and decentralized technologies, with a particular interest in smart contracts, DeFi, and distributed systems.",
  availability: "5–6 months · From February 2027 · Worldwide",
  availabilityLabel: "Looking for an internship in AI, Web3 or DeFi",
  email: "me@maximedrn.com",
  eyebrow: "@maximedrn",
  linkedin: "linkedin.com/in/maximedrean",
  name: "Maxime Dréan",
  role: "AI & full-stack developer, exploring Web3",
  sectionStack: "My toolbox",
} as const;

const ProfileStack = [
  {
    detail: "Typed interfaces & services",
    name: "Web & applications",
    tools: [
      { icon: siTypescript, name: "TypeScript" },
      { icon: siEffect, name: "Effect TS" },
      { icon: siReact, name: "React" },
      { icon: siNextdotjs, name: "Next.js" },
      { icon: siNuxt, name: "Nuxt.js" },
      { icon: siNestjs, name: "NestJS" },
    ],
  },
  {
    detail: "Models, training & vision",
    name: "AI & machine learning",
    tools: [
      { icon: siPython, name: "Python" },
      { icon: siPandas, name: "Pandas" },
      { icon: siNumpy, name: "NumPy" },
      { icon: siOpencv, name: "OpenCV" },
      { icon: siPytorch, name: "PyTorch" },
      { icon: siTensorflow, name: "TensorFlow" },
    ],
  },
  {
    detail: "Performance & smart contracts",
    name: "Systems & Web3",
    tools: [
      { icon: siC, name: "C" },
      { icon: siCplusplus, name: "C++" },
      { icon: siRust, name: "Rust" },
      { icon: siSolidity, name: "Solidity" },
      { icon: siEthereum, name: "Ethereum" },
      { icon: siSolana, name: "Solana" },
    ],
  },
  {
    detail: "Containers & automation",
    name: "Infrastructure",
    tools: [
      { icon: siDocker, name: "Docker" },
      { icon: siAnsible, name: "Ansible" },
      { icon: siSelenium, name: "Selenium" },
      { icon: siNginx, name: "Nginx" },
      { icon: siCaddy, name: "Caddy" },
      { icon: siCloudflare, name: "Cloudflare" },
    ],
  },
] as const;

const ProfileAssets = {
  alt: `Maxime Dréan — ${ProfileCopy.role}. ${ProfileCopy.about} ${ProfileCopy.availabilityLabel}: ${ProfileCopy.availability}. Toolbox: ${ProfileStack.flatMap((group) => group.tools.map((tool) => tool.name)).join(", ")}.`,
  directory: "assets",
  fontDirectory: "assets/fonts",
  fontMono: "IBM Plex Mono",
  fontSans: "IBM Plex Sans",
  output: "assets/profile.svg",
  readme: "README.md",
  source: "assets/avatar.jpg",
} as const;

const ProfileFonts = [
  {
    file: "IBMPlexSans-Regular.ttf",
    name: ProfileAssets.fontSans,
    weight: FontWeight._400,
  },
  {
    file: "IBMPlexSans-Bold.ttf",
    name: ProfileAssets.fontSans,
    weight: FontWeight._700,
  },
  {
    file: "IBMPlexMono-Regular.ttf",
    name: ProfileAssets.fontMono,
    weight: FontWeight._400,
  },
] as const;

const ProfileErrors = {
  createDirectory: "Failed to create the output directory.",
  readFont: (file: string): string => `Failed to read a profile font: ${file}.`,
  writeReadme: "Failed to write the profile README.",
  writeSvg: "Failed to write the profile SVG.",
} as const;
const ProfileViewport = { width: 840 } as const;

export {
  ProfileAssets,
  ProfileCopy,
  ProfileErrors,
  ProfileFonts,
  ProfileStack,
  ProfileViewport,
};
