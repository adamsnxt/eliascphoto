import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "EliasCPhoto",
    short_name: "EliasCPhoto",
    description: "Panel de administración de EliasCPhoto",
    start_url: "/",
    display: "standalone",
    background_color: "#fff2e6",
    theme_color: "#f08000",
    icons: [
      {
        src: "/logo/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
