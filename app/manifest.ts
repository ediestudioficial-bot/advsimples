import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ADV Simples",
    short_name: "ADV Simples",
    description: "Você advoga. A gente organiza.",
    start_url: "/hoje",
    display: "standalone",
    background_color: "#08111f",
    theme_color: "#08111f",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
