export interface ReelData {
  id: string;
  video: string;
  productId: string;
}

// Videos: free Mixkit CDN — luxury/fashion theme matching Zyvora's aesthetic
// Source: https://mixkit.co/free-stock-video/fashion/ (Mixkit Free License)
export const reelsData: ReelData[] = [
  {
    id: "1",
    // Woman modeling a short black dress — elegant studio shoot
    video: "https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-short-black-dress-805-large.mp4",
    productId: "69ef568d1fe995b9891d84a0",
  },
  {
    id: "2",
    // Fashion model in front of multiple mirrors — luxury boutique feel
    video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-front-of-multiple-mirrors-809-large.mp4",
    productId: "69ef3d79d195ddfcce732e74",
  },
  {
    id: "3",
    // Makeup artist applying eyelid makeup in softly lit studio — beauty/luxury
    video: "https://assets.mixkit.co/videos/preview/mixkit-a-young-model-with-her-eyes-shut-gets-her-eyelid-52055-large.mp4",
    productId: "69ec90facceb4fd35b914f4c",
  },
  {
    id: "4",
    // Model posing for fashion photographer in creative studio
    video: "https://assets.mixkit.co/videos/preview/mixkit-model-turns-to-pose-as-a-photographer-takes-photos-in-50641-large.mp4",
    productId: "69ec89a88c35ffb1cf68eef0",
  },
];